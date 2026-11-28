import { useAuth } from "@/features/auth"
import {
  useGetProfileQuery,
  useSwitchAccountTypeMutation,
} from "@/store/api/authApi"
import { useGetUserProfileQuery } from "@/store/api/userApi"
import { useCallback } from "react"
import toast from "react-hot-toast"
import { useLanguage } from "@/shared/context/LanguageContext"

// Hook to check and manage role based on the backend account type carried in the
// auth user (from the login/switch response), while preserving useGetUserProfileQuery
// to detect teacher capability (isTeacher) and maintain global caching/loading states.
// Dark mode compatible: dark:
export const useRoleOverride = () => {
  const { t } = useLanguage()
  const { user, isAuthenticated, token, refreshToken } = useAuth()
  const [switchAccountType, { isLoading: isSwitching }] =
    useSwitchAccountTypeMutation()

  // ISS-78: hydrate the account from `/Account/profile` when a token exists but
  // the cached user is missing. Shares the RTK Query cache with AuthVisibilitySync
  // and ProfileDropdown, so at most one HTTP request is made.
  const {
    data: accountProfileResponse,
    isLoading: isAccountProfileLoading,
    isFetching: isAccountProfileFetching,
    isUninitialized: isAccountProfileUninitialized,
    error: accountProfileError,
    refetch: refetchAccountProfile,
  } = useGetProfileQuery(undefined, {
    skip: !isAuthenticated || Boolean(user),
  })

  const {
    data: profileResponse,
    isLoading: isProfileLoading,
    isFetching: isProfileFetching,
    error: profileError,
    refetch: refetchProfile,
  } = useGetUserProfileQuery(undefined, { skip: !isAuthenticated })

  const profile = profileResponse?.data ?? profileResponse
  const hydratedAccount = accountProfileResponse?.data ?? accountProfileResponse ?? null
  const effectiveUser = user || (isAuthenticated ? hydratedAccount : null)
  const isHydratingAccount = Boolean(
    isAuthenticated &&
      !effectiveUser &&
      (isAccountProfileLoading ||
        isAccountProfileFetching ||
        // R1-1: on the very first render RTK Query is neither loading nor
        // fetching yet (`isUninitialized`), so keep the fail-closed spinner
        // instead of letting guards redirect/404 before hydration starts.
        (isAccountProfileUninitialized && !accountProfileError)),
  )
  const isRoleResolved = Boolean(isAuthenticated && effectiveUser)

  // isTeacherProfile determines if the account has teacher privileges
  const isTeacherProfile = isRoleResolved ? Boolean(profile?.isTeacher) : false
  const currentRole = effectiveUser?.accountType || "Student"

  const switchRole = useCallback(
    async (newRole) => {
      if (newRole === currentRole) {
        return true
      }

      if (newRole === "Teacher" && !isTeacherProfile) {
        console.warn("User is not authorized to switch to Teacher role.")
        toast.error(
          t.header?.noPermissionTeacher ||
            "Bạn không có quyền chuyển sang vai trò Giảng viên!",
        )
        return false
      }

      if (!refreshToken || !token) {
        console.error("Missing auth token/refresh token to switch role.")
        toast.error(
          t.header?.sessionExpired ||
            "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại để chuyển vai trò!",
        )
        return false
      }

      try {
        await switchAccountType({
          accountTypeToSwitchTo: newRole,
          refreshToken,
        }).unwrap()

        toast.success(
          t.header?.switchRoleSuccess || "Chuyển vai trò thành công!",
        )
        return true
      } catch (error) {
        console.error(error)
        const status = error?.status ?? error?.originalStatus
        if (status === 401) {
          toast.error(
            t.header?.sessionExpired ||
              "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại để chuyển vai trò!",
          )
        } else {
          toast.error(t.header?.switchRoleFail || "Chuyển vai trò thất bại!")
        }
        return false
      }
    },
    [
      isTeacherProfile,
      switchAccountType,
      currentRole,
      t,
      token,
      refreshToken,
    ],
  )

  const retry = useCallback(() => {
    if (!user && isAuthenticated) refetchAccountProfile()
    if (isAuthenticated) refetchProfile()
  }, [user, isAuthenticated, refetchAccountProfile, refetchProfile])

  const isTeacher = isRoleResolved ? currentRole === "Teacher" : null
  const isStudent = isRoleResolved ? currentRole === "Student" : null

  return {
    isTeacher,
    isStudent,
    activeRole: isRoleResolved ? currentRole : null,
    isRoleResolved,
    isLoading: isAuthenticated ? isProfileLoading || isHydratingAccount : false,
    isFetching: isAuthenticated ? isProfileFetching || isHydratingAccount : false,
    error: accountProfileError || profileError || null,
    retry,
    isTeacherProfile,
    isSwitching,
    switchRole,
  }
}

// RoleSwitcher component is disabled as per user request. This file now only exports the hook.
export default useRoleOverride
