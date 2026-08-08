import { useAuth } from "@/features/auth"
import { useSwitchAccountTypeMutation } from "@/store/api/authApi"
import { useGetUserProfileHaveAccountTypeQuery, useGetUserProfileQuery } from "@/store/api/userApi"
import { useCallback } from "react"
import toast from "react-hot-toast"
import { useLanguage } from "@/shared/context/LanguageContext"

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
  const { data: profileWithAccountType, refetch: refetchAccountType } = useGetUserProfileHaveAccountTypeQuery()

  const profile = profileResponse?.data ?? profileResponse
  const profileWithAccountTypeData = profileWithAccountType?.data ?? profileWithAccountType
  const isRoleResolved = !!user

  // isTeacherProfile determines if the account has teacher privileges
  const isTeacherProfile = isRoleResolved ? profile?.isTeacher : false
  const backendAccountType = profileWithAccountTypeData?.accountType
  const currentRole = backendAccountType || (isTeacherProfile ? "Teacher" : "Student")

  const switchRole = useCallback(async (newRole) => {
    if (newRole === currentRole) {
      return true
    }

    if (newRole === "Teacher" && !isTeacherProfile) {
      console.warn("User is not authorized to switch to Teacher role.")
      toast.error(t.header?.noPermissionTeacher || "Bạn không có quyền chuyển sang vai trò Giảng viên!")
      return false
    }

    const currentRefreshToken = localStorage.getItem("refreshToken")
    if (currentRefreshToken) {
      try {
        await switchAccountType({
          accountTypeToSwitchTo: newRole,
          refreshToken: currentRefreshToken
        }).unwrap()

        await refetchAccountType()
        toast.success(t.header?.switchRoleSuccess || "Chuyển vai trò thành công!")
        return true
      } catch (error) {
        console.error(error);
        toast.error(t.header?.switchRoleFail || "Chuyển vai trò thất bại!")
        return false
      }
    } else {
      console.error("No refresh token available to switch role.")
      toast.error(t.header?.switchRoleFail || "Chuyển vai trò thất bại!")
      return false
    }
  }, [isTeacherProfile, switchAccountType, currentRole, t, refetchAccountType])
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