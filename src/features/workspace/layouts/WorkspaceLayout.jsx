import React from "react"
import { Outlet, useLocation } from "react-router-dom"
import { useRoleOverride } from "@/features/courses/components/RoleSwitcher"
import { PageNotFound } from "@/shared/pages"
import { LoadingSpinner } from "@/shared/components/ui/indicators"

const TEACHER_ONLY_PREFIXES = [
  "/workspace/dashboard",
  "/workspace/courses",
  "/workspace/classes",
  "/workspace/analytics",
  "/workspace/teaching-tasks",
  "/workspace/schedule",
  "/workspace/vouchers",
]

const WorkspaceLayout = () => {
  const { isTeacher, isRoleResolved, isLoading } = useRoleOverride()
  const location = useLocation()

  const isTeacherOnlyPath = TEACHER_ONLY_PREFIXES.some((prefix) =>
    location.pathname.startsWith(prefix),
  )

  if (isTeacherOnlyPath) {
    if (isLoading || !isRoleResolved) {
      return (
        <div className="flex min-h-[240px] items-center justify-center">
          <LoadingSpinner />
        </div>
      )
    }
    if (!isTeacher) {
      return <PageNotFound />
    }
  }

  return (
    <div className="flex-1 h-full overflow-y-auto flex flex-col bg-primaryBg relative">
      <div className="mx-auto w-full min-w-0 p-4 sm:p-6 flex-1 flex flex-col">
        <Outlet />
      </div>
    </div>
  )
}

export default WorkspaceLayout