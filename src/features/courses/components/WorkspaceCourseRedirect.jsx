import { Navigate } from "react-router-dom"

import { LoadingSpinner } from "@/shared/components/ui/indicators"
import { useLanguage } from "@/shared/context/LanguageContext"
import { useRoleOverride } from "./RoleSwitcher"

const WorkspaceCourseRedirect = () => {
  const { t } = useLanguage()
  const redirect = t.courses?.workspaceRedirect || {}
  const {
    isStudent,
    isRoleResolved,
    isLoading,
    isFetching,
    error,
    retry,
  } = useRoleOverride()

  if (isLoading && !error) {
    return (
      <div
        role="status"
        aria-live="polite"
        className="flex min-h-[240px] items-center justify-center"
      >
        <LoadingSpinner />
        <span className="sr-only">
          {redirect.loading || "Loading workspace"}
        </span>
      </div>
    )
  }

  if (error || !isRoleResolved) {
    return (
      <div
        role="alert"
        className="mx-auto flex min-h-[240px] max-w-md flex-col items-center justify-center gap-4 text-center"
      >
        <p className="text-sm font-semibold text-red-700">
          {redirect.loadFailed || "We could not determine your workspace. Please try again."}
        </p>
        <button
          type="button"
          onClick={() => retry()}
          disabled={isFetching}
          className="h-10 rounded-full bg-[#990011] px-5 text-xs font-extrabold text-white transition-colors hover:bg-[#80000e] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isFetching
            ? redirect.retrying || "Retrying..."
            : redirect.retry || "Try again"}
        </button>
      </div>
    )
  }

  return <Navigate to="profile" replace />
}

export default WorkspaceCourseRedirect
