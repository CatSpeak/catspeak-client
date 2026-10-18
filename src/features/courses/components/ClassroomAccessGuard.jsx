import { useEffect } from "react"
import { Navigate, Outlet, useParams } from "react-router-dom"
import { useAuth } from "@/features/auth"
import { useLazyGetClassDetailQuery, useLazyGetStudentClassDetailQuery } from "@/store/api/coursesApi"
import { useLanguage } from "@/shared/context/LanguageContext"
import { LoadingSpinner } from "@/shared/components/ui/indicators"

// Keep private screens unmounted until access to this particular class is known.
// A teacher role or a platform subscription alone does not grant classroom access.
const ClassroomAccessGuard = ({ children, instructorView = false }) => {
  const { id, classId } = useParams()
  const requestedClassId = id ?? classId
  const { user, isAuthenticated } = useAuth()
  const { t } = useLanguage()
  const labels = t.courses?.studentCourseDetail || {}
  const studentQuery = useLazyGetStudentClassDetailQuery()
  const teacherQuery = useLazyGetClassDetailQuery()
  // Instructor details also support finished classes, which student details reject.
  const [loadClass, {
    currentData: classData,
    originalArgs,
    isLoading,
    isFetching,
    isUninitialized,
    error,
    refetch,
  }] = instructorView ? teacherQuery : studentQuery

  useEffect(() => {
    if (!requestedClassId || !isAuthenticated) return
    // Revalidate on entry, class changes, and API cache resets (e.g. role switching).
    // RTK Query manages the lazy subscription's cleanup on unmount.
    if (isUninitialized || originalArgs !== requestedClassId) {
      loadClass(requestedClassId)
    }
  }, [requestedClassId, isAuthenticated, isUninitialized, originalArgs, loadClass])

  if (!requestedClassId || !isAuthenticated) {
    return <Navigate to="/workspace/explore-courses" replace />
  }

  // Revalidate cached enrollment before mounting content, including on re-entry.
  if (isLoading || isFetching || isUninitialized || originalArgs !== requestedClassId) {
    return <LoadingSpinner className="flex min-h-[400px] items-center justify-center" />
  }

  const publicClassPath = `/workspace/explore-courses/class/${encodeURIComponent(requestedClassId)}`
  if (error?.status === 401 || error?.status === 403) {
    return <Navigate to={publicClassPath} replace />
  }

  if (error || !classData?.id || String(classData.id) !== String(requestedClassId)) {
    return (
      <div role="alert" className="flex flex-col items-start gap-3 rounded-xl border border-border p-4 text-sm">
        <span>{labels.classLoadFailed || "This class could not be loaded. Please try again."}</span>
        <button type="button" onClick={refetch} className="rounded-xl bg-cath-red-700 px-4 py-2 text-xs font-bold text-white">
          {labels.retry || "Try again"}
        </button>
      </div>
    )
  }

  const accountId = user?.accountId ?? user?.id
  const isInstructor = accountId != null && [
    classData.instructorId,
    classData.instructor?.id,
    classData.teacherId,
    classData.teacher?.accountId,
    classData.teacher?.id,
  ].some((ownerId) => ownerId != null && String(ownerId) === String(accountId))

  if (!isInstructor && (instructorView || classData.isEnrolled !== true)) {
    return <Navigate to={publicClassPath} replace />
  }

  return children || <Outlet />
}

export default ClassroomAccessGuard
