import React from "react"
import { Navigate, useLocation } from "react-router-dom"
import { useRoleOverride } from "@/features/courses/components/RoleSwitcher"
import { LoadingSpinner } from "@/shared/components/ui/indicators"
import { PageNotFound } from "@/shared/pages"

/**
 * RoleGuard protects routes based on active user role (e.g. "Teacher", "Student").
 * If the user's active role is not in `allowedRoles`, redirects to `fallbackPath`
 * (default) or renders a unified 404 when `fallbackMode="notFound"` (ISS-16).
 * Fail-closed (ISS-78): an unresolved role is never treated as an allowed role.
 */
const RoleGuard = ({
  allowedRoles = [],
  fallbackPath = "/workspace/profile",
  fallbackMode = "redirect",
  children,
}) => {
  const { activeRole, isLoading, isRoleResolved, error, retry } =
    useRoleOverride()
  const location = useLocation()

  if (isLoading) {
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

  if (!isRoleResolved && error) {
    return (
      <div
        role="alert"
        className="flex min-h-[300px] w-full flex-col items-center justify-center gap-3 px-4 text-center"
      >
        <p className="text-sm font-medium text-slate-600 dark:text-neutral-300">
          Không thể tải vai trò tài khoản. Vui lòng thử lại.
        </p>
        <button
          type="button"
          onClick={retry}
          className="rounded-full border border-[#990011] px-4 py-2 text-sm font-semibold text-[#990011] transition-colors hover:bg-red-50 dark:border-[#FF6B6B] dark:text-[#FF6B6B] dark:hover:bg-red-950/30"
        >
          Thử lại
        </button>
      </div>
    )
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(activeRole)) {
    if (fallbackMode === "notFound") {
      return <PageNotFound />
    }
    return <Navigate to={fallbackPath} state={{ from: location }} replace />
  }

  return children
}

export default RoleGuard
