import { useGetUserProfileQuery } from "@/store/api/userApi"

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

  // Determine if the user is a teacher based on the backend profile field
  const isTeacher = isRoleResolved ? profile.isTeacher : null
  const isStudent = isRoleResolved ? !isTeacher : null

  return {
    isTeacher,
    isStudent,
    activeRole: isRoleResolved ? (isTeacher ? "Teacher" : "Student") : null,
    isRoleResolved,
    isLoading,
    isFetching,
    error,
    retry: refetch,
  }
}

// RoleSwitcher component is disabled as per user request. This file now only exports the hook.
export default useRoleOverride
