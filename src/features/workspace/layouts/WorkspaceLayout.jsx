import React from "react"
import { Outlet, useLocation, useNavigate } from "react-router-dom"
import { useEffect } from "react"
import { useRoleOverride } from "@/features/courses/components/RoleSwitcher"

const WorkspaceLayout = () => {
  const { isStudent, isRoleResolved, isLoading } = useRoleOverride()
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    if (!isRoleResolved || isLoading) return;

    const path = location.pathname;

    if (isStudent) {
      if (path.startsWith('/workspace/courses/class/')) {
        navigate(path.replace('/workspace/courses/class/', '/workspace/learning/class/') + location.search, { replace: true });
        return;
      }
      if (path.startsWith('/workspace/courses/details/')) {
        navigate(path.replace('/workspace/courses/details/', '/workspace/learning/details/') + location.search, { replace: true });
        return;
      }
      // Teacher-only routes fallback
      const teacherRoutes = ["/workspace/courses", "/workspace/classes", "/workspace/schedule", "/workspace/teaching-tasks", "/workspace/analytics"]
      if (teacherRoutes.some(route => path.includes(route))) {
        navigate("/workspace/learning", { replace: true })
      }
    }
  }, [isStudent, isRoleResolved, isLoading, location.pathname, location.search, navigate])

  return (
    <div className="flex-1 h-full overflow-y-auto flex flex-col bg-primaryBg relative">
      <div className="mx-auto w-full min-w-0 p-4 sm:p-6 flex-1 flex flex-col">
        <Outlet />
      </div>
    </div>
  )
}

export default WorkspaceLayout
