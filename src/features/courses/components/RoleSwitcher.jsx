import { useState, useEffect, useCallback } from "react"
import { useGetUserProfileQuery } from "@/store/api/userApi"

const ROLE_STORAGE_KEY = "catspeak_active_role"
const ROLE_CHANGE_EVENT = "catspeak_role_changed"

// Hook to check and manage role based on backend user profile field isTeacher
export const useRoleOverride = () => {
  const {
    data: profileResponse,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useGetUserProfileQuery()

  const profile = profileResponse?.data ?? profileResponse
  const isRoleResolved = typeof profile?.isTeacher === "boolean"
  const isTeacherProfile = isRoleResolved ? profile.isTeacher : false

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

  const isTeacher = activeRole === "Teacher"
  const isStudent = activeRole === "Student"

  return {
    isTeacher,
    isStudent,
    activeRole,
    isRoleResolved,
    isLoading,
    isFetching,
    error,
    retry: refetch,
    switchRole,
    isTeacherProfile
  }
}

// RoleSwitcher component is disabled as per user request. This file now only exports the hook.
export default useRoleOverride
