import React, { lazy, Suspense } from "react"
import { useRoleOverride } from "@/features/courses/components/RoleSwitcher"
import { LoadingSpinner } from "@/shared/components/ui/indicators"
import LearnerDashboardPage from "./LearnerDashboardPage"

// Lazy load Teacher dashboard to avoid bundling teacher dependencies when in student mode
const WorkspaceDashboardPage = lazy(
  () => import("@/features/courses/components/WorkspaceDashboardPage"),
)

const WorkspaceDashboardRouter = () => {
  const { isTeacher, isRoleResolved, isLoading } = useRoleOverride()

  if (isLoading || !isRoleResolved) {
    return (
      <div className="flex min-h-[360px] items-center justify-center">
        <LoadingSpinner />
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
