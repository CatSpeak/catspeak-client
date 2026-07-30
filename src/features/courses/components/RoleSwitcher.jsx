import { useAuth } from "@/features/auth"
import { useGetUserProfileQuery } from "@/store/api/userApi"

// Hook to check and manage role based on backend user accountType from login response,
// while preserving useGetUserProfileQuery to maintain global caching and loading states.
export const useRoleOverride = () => {
  const { user } = useAuth()

  const {
    isLoading: isProfileLoading,
    isFetching: isProfileFetching,
    error: profileError,
    refetch: refetchProfile,
  } = useGetUserProfileQuery()

  const accountType = user?.accountType
  const isRoleResolved = !!user

  // Determine if the user is a teacher based on the accountType field
  const isTeacher = isRoleResolved ? accountType === "Teacher" : null
  const isStudent = isRoleResolved ? !isTeacher : null

  return {
    isTeacher,
    isStudent,
    activeRole: isRoleResolved ? (isTeacher ? "Teacher" : "Student") : null,
    isRoleResolved,
    isLoading: isProfileLoading || !isRoleResolved,
    isFetching: isProfileFetching || !isRoleResolved,
    error: profileError || null,
    retry: () => {
      refetchProfile()
    },
  }
}

// RoleSwitcher component is disabled as per user request. This file now only exports the hook.
export default useRoleOverride