import { useAuth } from "@/features/auth"
import { useGetUserProfileQuery } from "@/store/api/userApi"
import { useCallback, useEffect, useState } from "react"

const ROLE_STORAGE_KEY = "catspeak_active_role"
const ROLE_CHANGE_EVENT = "catspeak_role_changed"

// Hook to check and manage role based on backend user accountType from login response,
// while preserving useGetUserProfileQuery to maintain global caching and loading states.
export const useRoleOverride = () => {
  const { user } = useAuth()
  const {
    isLoading: isProfileLoading,
    isFetching: isProfileFetching,
    error: profileError,
    refetch: refetchProfile,
  } = useGetUserProfileQuery(undefined, { skip: !user })

  const accountType = user?.accountType
  const isRoleResolved = !!user

  // isTeacherProfile determines if the account has teacher privileges
  const isTeacherProfile = isRoleResolved ? accountType === "Teacher" : false

  const [activeRole, setActiveRole] = useState(() => {
    return localStorage.getItem(ROLE_STORAGE_KEY) || null
  })

  // Sync state when profile loads
  useEffect(() => {
    if (isRoleResolved) {
      const storedRole = localStorage.getItem(ROLE_STORAGE_KEY)
      if (!isTeacherProfile) {
        if (storedRole !== "Student") {
          localStorage.setItem(ROLE_STORAGE_KEY, "Student")
          window.dispatchEvent(new Event(ROLE_CHANGE_EVENT))
        }
      } else if (!storedRole) {
        localStorage.setItem(ROLE_STORAGE_KEY, "Teacher")
        window.dispatchEvent(new Event(ROLE_CHANGE_EVENT))
      }
    }
  }, [isRoleResolved, isTeacherProfile])

  // Listen to role changes from other components
  useEffect(() => {
    const handleRoleChange = () => {
      setActiveRole(localStorage.getItem(ROLE_STORAGE_KEY))
    }

    // Initial sync
    handleRoleChange()

    window.addEventListener(ROLE_CHANGE_EVENT, handleRoleChange)
    return () => {
      window.removeEventListener(ROLE_CHANGE_EVENT, handleRoleChange)
    }
  }, [])

  const switchRole = useCallback((newRole) => {
    if (newRole === "Teacher" && !isTeacherProfile) {
      console.warn("User is not authorized to switch to Teacher role.")
      return
    }
    localStorage.setItem(ROLE_STORAGE_KEY, newRole)
    window.dispatchEvent(new Event(ROLE_CHANGE_EVENT))
  }, [isTeacherProfile])

  const currentRole = activeRole || (isTeacherProfile ? "Teacher" : "Student")
  const isTeacher = isRoleResolved ? currentRole === "Teacher" : null
  const isStudent = isRoleResolved ? currentRole === "Student" : null

  return {
    isTeacher,
    isStudent,
    activeRole: isRoleResolved ? currentRole : null,
    isRoleResolved,
    isLoading: isProfileLoading || !isRoleResolved,
    isFetching: isProfileFetching || !isRoleResolved,
    error: profileError || null,
    retry: () => {
      refetchProfile()
    },
    isTeacherProfile,
    switchRole,
  }
}

// RoleSwitcher component is disabled as per user request. This file now only exports the hook.
export default useRoleOverride