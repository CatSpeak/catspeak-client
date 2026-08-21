import React from "react"
import { Navigate, useLocation } from "react-router-dom"
import { useRoleOverride } from "@/features/courses/components/RoleSwitcher"
import { LoadingSpinner } from "@/shared/components/ui/indicators"

/**
 * RoleGuard protects routes based on active user role (e.g. "Teacher", "Student").
 * If the user's active role is not in `allowedRoles`, redirects to `fallbackPath`.
 */
const RoleGuard = ({
  allowedRoles = [],
  fallbackPath = "/workspace/profile",
  children,
}) => {
  const { activeRole, isLoading, isRoleResolved } = useRoleOverride()
  const location = useLocation()

  if (isLoading || !isRoleResolved) {
    return (
      <div
        role="status"
        aria-live="polite"
        className="flex min-h-[300px] w-full items-center justify-center"
      >
        <LoadingSpinner />
      </div>
    )
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(activeRole)) {
    return <Navigate to={fallbackPath} state={{ from: location }} replace />
  }

  return children
}

export default RoleGuard
