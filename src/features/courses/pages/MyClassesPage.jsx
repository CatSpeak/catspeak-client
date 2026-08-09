import React, { useMemo, useRef, useState } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { FileText, FilterX, GraduationCap, Layers, Plus, Video } from "lucide-react"
import { toast } from "react-hot-toast"

import {
  useDeleteClassMutation,
  useGetAllClassesQuery,
} from "@/store/api/coursesApi"
import { useLanguage } from "@/shared/context/LanguageContext"
import { LoadingSpinner } from "@/shared/components/ui/indicators"
import ConfirmationModal from "@/shared/components/ui/ConfirmationModal"

import CourseManagementCard from "../components/CourseManagementCard"
import CourseSelectFilter from "../components/CourseSelectFilter"
import EmptyCoursesState from "../components/EmptyCoursesState"
import ViewModeToggle from "../components/shared/ViewModeToggle"
import {
  filterByStatus,
  mapTeacherClassSummary,
} from "../utils/courseTransforms"
import { getCourseLocale } from "../utils/courseUtils"
import { Breadcrumb } from "@/shared/components/ui/navigation"
import { useTimezone } from "@/shared/hooks/useTimezone"

const MyClassesPage = () => {
  const { language, t } = useLanguage()
  const { formatDate, formatScheduleTime, formatScheduleDays } = useTimezone()
  const navigate = useNavigate()
  const c = t.courses || {}
  const mc = c.myCourses || {}
  const statusOptions = [
    { value: "all", label: mc.statusAll || "All Status" },
    { value: "teaching", label: c.teachingStatus || "Teaching" },
    { value: "open", label: c.openEnrollmentStatus || "Open" },
    { value: "archived", label: c.archive || "Archived" },
  ]

  const [searchParams, setSearchParams] = useSearchParams()
  const viewMode = searchParams.get("view") || "grid"
  const statusFilter = searchParams.get("status") || "all"

  const setViewMode = (mode) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      next.set("view", mode)
      return next
    })
  }

  const setStatusFilter = (status) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      next.set("status", status)
      return next
    })
  }

  const [classDeleteTarget, setClassDeleteTarget] = useState(null)
  const classDeleteGuardRef = useRef(false)
  const [deleteClass, { isLoading: isDeletingClass }] = useDeleteClassMutation()

  const {
    currentData: classesData,
    isLoading: isClassesLoading,
    isFetching: isClassesFetching,
    error: classesError,
    refetch: refetchClasses,
  } = useGetAllClassesQuery({
    page: 1,
    pageSize: 6,
    status: statusFilter === "all" ? undefined : statusFilter.toUpperCase(),
  })

  const classesRaw = useMemo(
    () => (Array.isArray(classesData?.data) ? classesData.data : []),
    [classesData],
  )

  const isLoading = isClassesLoading || (isClassesFetching && classesData === undefined)
  const isRefreshing = isClassesFetching
  const error = classesData === undefined && classesError
  const refreshError = classesError

  const classList = useMemo(
    () => classesRaw.map((cls, index) => mapTeacherClassSummary(
      cls,
      index,
      {
        notAvailable: c.workspaceUi?.notAvailable,
        studentsRatio: c.allClasses?.studentsRatio,
        tba: c.workspaceUi?.tba,
      },
      formatDate,
      formatScheduleTime,
      formatScheduleDays,
    )),
    [
      classesRaw,
      c.allClasses?.studentsRatio,
      c.workspaceUi?.notAvailable,
      c.workspaceUi?.tba,
      formatDate,
      formatScheduleTime,
      formatScheduleDays,
    ],
  )
  const filteredDisplayList = useMemo(() => filterByStatus(classList, statusFilter), [classList, statusFilter])

  const classCardLabels = {
    editCourse: c.editClass || "Edit Class",
    deleteCourse: c.createClass?.deleteClass || "Delete Class",
    createdDate: c.createdDate || "Created Date",
    manageDetails: c.manageDetails || "Manage Details",
    progress: c.progress || "Progress",
    courseLabel: c.course || "Course",
    classLabel: c.class || "Class",
    standaloneClass: c.createClass?.standaloneClass || "Lớp độc lập",
    classCount: c.classCount || "{{count}} classes",
    actionsFor: c.actionsForCourse || "Actions for {{title}}",
  }

  if (isLoading) {
    return <LoadingSpinner className="flex justify-center items-center min-h-[400px]" />
  }

  if (error) {
    return (
      <div role="alert" className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl text-sm font-semibold flex flex-col items-start gap-3">
        <span>{mc.loadClassesFailed || "The class overview could not be loaded. Please try again."}</span>
        <button
          type="button"
          onClick={() => refetchClasses()}
          className="rounded-xl bg-[#990011] px-4 py-2 text-xs font-bold text-white"
        >
          {mc.retry || "Try again"}
        </button>
      </div>
    )
  }

  const handleConfirmClassDelete = async () => {
    if (!classDeleteTarget?.id || classDeleteGuardRef.current) return

    classDeleteGuardRef.current = true
    try {
      await deleteClass({
        id: classDeleteTarget.id,
        courseId: classDeleteTarget.courseId,
      }).unwrap()
      const successMessage = (
        c.classDetail?.toastCancelSuccess
        || "Class deleted successfully!"
      )
      toast.success(successMessage)
    } catch {
      toast.error(
        c.classDetail?.toastCancelFailed
        || "Failed to delete class!",
      )
    } finally {
      classDeleteGuardRef.current = false
      setClassDeleteTarget(null)
    }
  }

  const handleCloseDeleteModal = () => {
    if (isDeletingClass) return
    setClassDeleteTarget(null)
  }

  return (
    <div className="flex flex-col gap-4 text-[#2e2e2e]">
      {isRefreshing && (
        <span role="status" className="sr-only">
          {mc.refreshingClasses || "Refreshing class overview"}
        </span>
      )}
      {refreshError && !error && (
        <div role="alert" className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs font-semibold text-amber-800">
          {mc.refreshClassesFailed || "Some class data could not be refreshed. The displayed information may be out of date."}
        </div>
      )}
      {/* ─── Breadcrumbs ─── */}
      <Breadcrumb
        items={[
          { label: t.nav?.home || "Home", onClick: () => navigate("/workspace") },
          { label: c.myClassesTab || "My Classes" },
        ]}
      />

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-3xl font-black text-gray-950 tracking-tight">
          {c.myClassesTab || "My Classes"}
        </h1>
        <button
          type="button"
          onClick={() => navigate("/workspace/classes/create-class")}
          className="h-10 px-5 bg-[#b20a1c] hover:bg-[#990011] text-white font-extrabold text-sm rounded-full flex items-center justify-center gap-2 transition-all shadow-md active:scale-95 active:shadow-sm"
        >
          <Plus size={16} />
          <span>{c.createClass?.createClass || "Create Class"}</span>
        </button>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-end pb-px gap-4 mt-6">
        <div className="flex items-center gap-3 self-end sm:self-auto">
          <CourseSelectFilter
            value={statusFilter}
            onChange={setStatusFilter}
            options={statusOptions}
          />
          <ViewModeToggle value={viewMode} onChange={setViewMode} />
        </div>
      </div>

      <div className="flex flex-col gap-4">
        {filteredDisplayList.length === 0 ? (
          <EmptyCoursesState
            icon={statusFilter !== "all" ? FilterX : GraduationCap}
            title={
              statusFilter !== "all"
                ? (mc.noFilteredClassesTitle || "No matching classes found")
                : (mc.noClassesTitle || "Ready to Set Up Your First Class?")
            }
            message={
              statusFilter !== "all"
                ? (mc.noFilteredClassesDesc || "No classes match the selected status filter. Try changing or clearing your filter to view other classes.")
                : (mc.noClassesDesc || "You don't have any active classes right now. Create a class to schedule live sessions, track attendance, and assign coursework.")
            }
            isFiltered={statusFilter !== "all"}
            onResetFilter={statusFilter !== "all" ? () => setStatusFilter("all") : undefined}
            resetFilterLabel={mc.resetFilter || "Reset Filter"}
            action={
              statusFilter === "all" ? (
                <button
                  type="button"
                  onClick={() => navigate("/workspace/classes/create-class")}
                  className="h-9 px-4 bg-[#b20a1c] hover:bg-[#990011] text-white font-semibold text-xs rounded-lg flex items-center justify-center gap-1.5 transition-all shadow-2xs active:scale-98 cursor-pointer"
                >
                  <Plus size={15} />
                  <span>{c.createClass?.createClass || "Create Class"}</span>
                </button>
              ) : null
            }
          />
        ) : (
          <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" : "flex flex-col gap-4"}>
            {filteredDisplayList.map((item) => (
              <CourseManagementCard
                key={item.id}
                item={item}
                type="class"
                viewMode={viewMode}
                labels={classCardLabels}
                onOpen={() => navigate(`/workspace/courses/class/${encodeURIComponent(String(item.id))}`)}
                onEdit={() => navigate(`/workspace/courses/edit-class/${encodeURIComponent(String(item.id))}`)}
                onDelete={() => {
                  setClassDeleteTarget({
                    id: item.id,
                    courseId: item.courseId,
                  })
                }}
              />
            ))}
          </div>
        )}

        {filteredDisplayList.length > 0 && (
          <button
            type="button"
            onClick={() => navigate("/workspace/classes/all-classes")}
            className="text-sm font-black text-[#b20a1c] hover:underline self-center py-2"
          >
            {c.myCourses?.viewAll || "View all"}
          </button>
        )}
      </div>

      <ConfirmationModal
        open={Boolean(classDeleteTarget)}
        onClose={handleCloseDeleteModal}
        onConfirm={handleConfirmClassDelete}
        isPending={isDeletingClass}
        title={c.createClass?.deleteClass || "Delete Class"}
        message={c.createClass?.confirmDeleteClassMsg || "Are you sure you want to delete this class?"}
        confirmText={c.createClass?.deleteConfirmButton || "Delete"}
        cancelText={c.createClass?.cancel || "Cancel"}
      />
    </div>
  )
}

export default MyClassesPage
