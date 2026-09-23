import { Navigate } from "react-router-dom"
import { useRoleOverride } from "@/features/courses/components/RoleSwitcher"
import { LoadingSpinner } from "@/shared/components/ui/indicators"

const SettingIndexRedirect = () => {
  const { isTeacher, isLoading, isRoleResolved } = useRoleOverride()
  if (isLoading || !isRoleResolved) {
    return (
      <div className="flex min-h-[300px] w-full items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }
  if (isTeacher === true) return <Navigate to="instructor" replace />
  return <Navigate to="account" replace />
}

export default SettingIndexRedirect
