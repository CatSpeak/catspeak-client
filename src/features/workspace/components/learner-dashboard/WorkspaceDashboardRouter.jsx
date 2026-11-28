import React, { lazy, Suspense } from "react"
import { useRoleOverride } from "@/features/courses/components/RoleSwitcher"
import { LoadingSpinner } from "@/shared/components/ui/indicators"
import LearnerDashboardPage from "./LearnerDashboardPage"

// Lazy load Teacher dashboard to avoid bundling teacher dependencies when in student mode
const WorkspaceDashboardPage = lazy(
  () => import("@/features/courses/components/WorkspaceDashboardPage"),
)

const WorkspaceDashboardRouter = () => {
  const { isTeacher, isRoleResolved, isLoading, error, retry } =
    useRoleOverride()

  if (isLoading) {
    return (
      <div className="flex min-h-[360px] items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  // R1-1: a failed role lookup must be retryable instead of rendering the
  // Student dashboard for an unverified account (fail-closed).
  if (!isRoleResolved || error) {
    return (
      <div
        role="alert"
        className="flex min-h-[360px] flex-col items-center justify-center gap-3 px-4 text-center"
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

  // If user is actively in Teacher role, render Teacher Workspace Dashboard
  if (isTeacher) {
    return (
      <Suspense
        fallback={
          <div className="flex min-h-[360px] items-center justify-center">
            <LoadingSpinner />
          </div>
        }
      >
        <WorkspaceDashboardPage />
      </Suspense>
    )
  }

  // Otherwise, render Student Learning Dashboard
  return <LearnerDashboardPage />
}

export default WorkspaceDashboardRouter
