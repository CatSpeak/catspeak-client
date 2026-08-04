import { useAuth } from "@/features/auth"
import { useSwitchAccountTypeMutation } from "@/store/api/authApi"
import { useGetUserProfileQuery } from "@/store/api/userApi"
import { useCallback, useEffect, useState } from "react"
import toast from "react-hot-toast"
import { useLanguage } from "@/shared/context/LanguageContext"

const ROLE_STORAGE_KEY = "catspeak_active_role"
const ROLE_CHANGE_EVENT = "catspeak_role_changed"

// Hook to check and manage role based on backend user accountType from login response,
// while preserving useGetUserProfileQuery to maintain global caching and loading states.
export const useRoleOverride = () => {
  const { t } = useLanguage()
  const { user } = useAuth()
  const [switchAccountType] = useSwitchAccountTypeMutation()
  const {
    data: profileResponse,
    isLoading: isProfileLoading,
    isFetching: isProfileFetching,
    error: profileError,
    refetch: refetchProfile,
  } = useGetUserProfileQuery()

  const profile = profileResponse?.data ?? profileResponse
  const isRoleResolved = !!user

  // isTeacherProfile determines if the account has teacher privileges
  const isTeacherProfile = isRoleResolved ? profile?.isTeacher : false

  const [activeRole, setActiveRole] = useState(() => {
    return localStorage.getItem(ROLE_STORAGE_KEY) || null
  })
  const currentRole = activeRole || (isTeacherProfile ? "Teacher" : "Student")

  // Sync state when profile loads
  useEffect(() => {
    if (isRoleResolved && profile !== undefined) {
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
  }, [isRoleResolved, isTeacherProfile, profile])

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

  const switchRole = useCallback(async (newRole) => {
    if (newRole === currentRole) {
      return
    }

    if (newRole === "Teacher" && !isTeacherProfile) {
      console.warn("User is not authorized to switch to Teacher role.")
      toast.error(t.header?.noPermissionTeacher || "Bạn không có quyền chuyển sang vai trò Giảng viên!")
      return
    }

    const currentRefreshToken = localStorage.getItem("refreshToken")
    if (currentRefreshToken) {
      try {
        await switchAccountType({
          accountTypeToSwitchTo: newRole,
          refreshToken: currentRefreshToken
        }).unwrap()

        localStorage.setItem(ROLE_STORAGE_KEY, newRole)
        window.dispatchEvent(new Event(ROLE_CHANGE_EVENT))
        toast.success(t.header?.switchRoleSuccess || "Chuyển vai trò thành công!")
      } catch (error) {
        console.error(error);
        toast.error(t.header?.switchRoleFail || "Chuyển vai trò thất bại!")
      }
    } else {
      console.error("No refresh token available to switch role.")
      toast.error(t.header?.switchRoleFail || "Chuyển vai trò thất bại!")
      return
    }
  }, [isTeacherProfile, switchAccountType, currentRole, t])
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