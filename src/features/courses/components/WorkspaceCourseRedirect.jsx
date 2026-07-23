import { Navigate } from "react-router-dom"

import { useRoleOverride } from "./RoleSwitcher"

const WorkspaceCourseRedirect = () => {
  const { isStudent } = useRoleOverride()

  return <Navigate to={isStudent ? "learning" : "courses"} replace />
}

export default WorkspaceCourseRedirect
