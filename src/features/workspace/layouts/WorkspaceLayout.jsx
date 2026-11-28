import React from "react"
import { Outlet, useLocation } from "react-router-dom"
import { useRoleOverride } from "@/features/courses/components/RoleSwitcher"
import { PageNotFound } from "@/shared/pages"
import { LoadingSpinner } from "@/shared/components/ui/indicators"

const TEACHER_ONLY_PREFIXES = [
  "/workspace/courses",
  "/workspace/classes",
  "/workspace/analytics",
  "/workspace/teaching-tasks",
  "/workspace/schedule",
  "/workspace/vouchers",
  "/workspace/materials",
  "/workspace/events",
]

const WorkspaceLayout = () => {
  const { isTeacher, isRoleResolved, isLoading, error, retry } =
    useRoleOverride()
  const location = useLocation()

  const isTeacherOnlyPath = TEACHER_ONLY_PREFIXES.some((prefix) =>
    location.pathname.startsWith(prefix),
  )

  if (isTeacherOnlyPath) {
    if (isLoading) {
      return (
        <div className="flex min-h-[240px] items-center justify-center">
          <LoadingSpinner />
        </div>
      )
    }
    if (!isRoleResolved && error) {
      return (
        <div
          role="alert"
          className="flex min-h-[240px] flex-col items-center justify-center gap-3 px-4 text-center"
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
    // Fail-closed: an unresolved role never grants access to teacher routes.
    if (!isRoleResolved || !isTeacher) {
      return <PageNotFound />
    }
  }

  return (
    <div className="flex-1 h-full overflow-y-auto flex flex-col bg-primaryBg dark:bg-[#0F0F0F] relative">
      <div className="mx-auto w-full min-w-0 flex-1 flex flex-col">
        <Outlet />
      </div>
    </div>
  )
}

export default WorkspaceLayout
