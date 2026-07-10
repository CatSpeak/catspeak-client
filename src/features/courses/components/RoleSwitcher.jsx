import React from "react"
import { useGetUserProfileQuery } from "@/store/api/userApi"

// Hook to check and manage role based on backend user profile field isTeacher
export const useRoleOverride = () => {
  const { data: profileResponse, isLoading, error } = useGetUserProfileQuery()
  const profile = profileResponse?.data || profileResponse || {}

  // Determine if the user is a teacher based on the backend profile field
  const isTeacher = !!profile.isTeacher
  const isStudent = !isTeacher

  return {
    isStudent,
    activeRole: isTeacher ? "Teacher" : "Student",
    isLoading,
    error
  }
}

// RoleSwitcher component is disabled as per user request. This file now only exports the hook.
export default useRoleOverride
