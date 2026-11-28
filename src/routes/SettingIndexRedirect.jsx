import { Navigate } from "react-router-dom"
import { useAuth } from "@/features/auth"
import { useRoleOverride } from "@/features/courses/components/RoleSwitcher"
import { LoadingSpinner } from "@/shared/components/ui/indicators"

const SettingIndexRedirect = () => {
  const { isAuthenticated } = useAuth()
  const { isTeacher, isLoading, isRoleResolved, error, retry } =
    useRoleOverride()

  if (!isAuthenticated) {
    return <Navigate to="system" replace />
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[300px] w-full items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  // R1-1: a failed `/Account/profile` lookup must offer a retry instead of an
  // endless spinner (fail-closed: never redirect to a role we could not verify).
  if (!isRoleResolved || error) {
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
  if (isTeacher === true) return <Navigate to="instructor" replace />
  return <Navigate to="account" replace />
}

export default SettingIndexRedirect
