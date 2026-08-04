import React from "react"
import { Outlet, useLocation, useNavigate } from "react-router-dom"
import { useEffect } from "react"
import { useRoleOverride } from "@/features/courses/components/RoleSwitcher"

const WorkspaceLayout = () => {
  const { isStudent, isTeacher, isRoleResolved } = useRoleOverride()
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    if (isRoleResolved && isStudent) {
      // Teacher-only routes based on the features specified
      const teacherRoutes = ["/workspace/courses", "/workspace/classes", "/workspace/schedule", "/workspace/teaching-tasks", "/workspace/analytics"]

      const isTeacherRoute = teacherRoutes.some(route => location.pathname.includes(route))

      if (isTeacherRoute) {
        navigate("/workspace/learning", { replace: true })
      }
    } else if (isRoleResolved && isTeacher) {
      if (location.pathname.includes("/workspace/learning")) {
        navigate("/workspace/courses", { replace: true })
      }
    }
  }, [isStudent, isTeacher, isRoleResolved, location.pathname, navigate])

  return (
    <div className="flex-1 h-full overflow-y-auto flex flex-col bg-[#f3f3f3] relative">
      <div className="mx-auto w-full min-w-0 p-4 sm:p-6 flex-1 flex flex-col">
        <Outlet />
      </div>
    </div>
  )
}

export default WorkspaceLayout
