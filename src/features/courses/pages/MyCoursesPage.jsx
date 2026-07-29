import React, { useMemo } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { Plus } from "lucide-react"

import { useGetAllCoursesQuery } from "@/store/api/coursesApi"
import { useLanguage } from "@/shared/context/LanguageContext"
import { LoadingSpinner } from "@/shared/components/ui/indicators"
import ConfirmationModal from "@/shared/components/ui/ConfirmationModal"

import CourseManagementCard from "../components/CourseManagementCard"
import CourseSelectFilter from "../components/CourseSelectFilter"
import EmptyCoursesState from "../components/EmptyCoursesState"
import ViewModeToggle from "../components/shared/ViewModeToggle"
import { useDeleteCourse } from "../hooks/useDeleteCourse"
import {
  filterByStatus,
  mapTeacherCourseSummary,
} from "../utils/courseTransforms"
import { getCourseLocale } from "../utils/courseUtils"

const MyCoursesPage = () => {
  const { language, t } = useLanguage()
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

  const deleteHelper = useDeleteCourse(t)

  const {
    currentData: coursesData,
    isLoading: isCoursesLoading,
    isFetching: isCoursesFetching,
    error: coursesError,
    refetch: refetchCourses,
  } = useGetAllCoursesQuery({
    page: 1,
    pageSize: 6,
    status: statusFilter === "all" ? undefined : statusFilter.toUpperCase(),
  })

  const coursesRaw = useMemo(
    () => (Array.isArray(coursesData?.data) ? coursesData.data : []),
    [coursesData],
  )

  const isLoading = isCoursesLoading || (isCoursesFetching && coursesData === undefined)
  const isRefreshing = isCoursesFetching
  const error = coursesData === undefined && coursesError
  const refreshError = coursesError

  const courseList = useMemo(
    () => coursesRaw.map((course, index) => mapTeacherCourseSummary(
      course,
      index,
      {
        studentsCount: c.studentsCount,
        tba: c.workspaceUi?.tba,
      },
      getCourseLocale(language),
    )),
    [coursesRaw, c.studentsCount, c.workspaceUi?.tba, language],
  )
  const filteredDisplayList = useMemo(() => filterByStatus(courseList, statusFilter), [courseList, statusFilter])

  const cardLabels = {
    editCourse: c.editCourse || "Edit Course",
    deleteCourse: c.courseDetail?.deleteCourse || "Delete Course",
    createdDate: c.createdDate || "Created Date",
    manageDetails: c.manageDetails || "Manage Details",
    progress: c.progress || "Progress",
    courseLabel: c.course || "Course",
    classLabel: c.class || "Class",
    classCount: c.classCount || "{{count}} classes",
    actionsFor: c.actionsForCourse || "Actions for {{title}}",
  }

  if (isLoading) {
    return <LoadingSpinner className="flex justify-center items-center min-h-[400px]" />
  }

  if (error) {
    return (
      <div role="alert" className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl text-sm font-semibold flex flex-col items-start gap-3">
        <span>{mc.loadCoursesFailed || "The course overview could not be loaded. Please try again."}</span>
        <button
          type="button"
          onClick={() => refetchCourses()}
          className="rounded-xl bg-[#990011] px-4 py-2 text-xs font-bold text-white"
        >
          {mc.retry || "Try again"}
        </button>
      </div>
    )
  }

  const handleCloseDeleteModal = () => {
    if (deleteHelper.isDeleting) return
    deleteHelper.handleCancel()
  }

  return (
    <div className="flex flex-col gap-4 text-[#2e2e2e]">
      {isRefreshing && (
        <span role="status" className="sr-only">
          {mc.refreshingCourses || "Refreshing course overview"}
        </span>
      )}
      {refreshError && !error && (
        <div role="alert" className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs font-semibold text-amber-800">
          {mc.refreshCoursesFailed || "Some course data could not be refreshed. The displayed information may be out of date."}
        </div>
      )}
      <div className="flex justify-between items-center flex-wrap gap-2">
        <div className="text-xs text-gray-400 font-medium flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            className="cursor-pointer hover:underline"
            onClick={() => navigate("/workspace")}
          >
            {t.nav?.home || "Home"}
          </button>
          <span>/</span>
          <span className="text-[#990011] font-semibold">{c.title || "My Courses"}</span>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-3xl font-black text-gray-950 tracking-tight">
          {c.title || "My Courses"}
        </h1>
        <button
          type="button"
          onClick={() => navigate("/workspace/courses/create")}
          className="h-10 px-5 bg-[#b20a1c] hover:bg-[#990011] text-white font-extrabold text-sm rounded-full flex items-center justify-center gap-2 transition-all shadow-md active:scale-95 active:shadow-sm"
        >
          <Plus size={16} />
          <span>{c.createCourse?.title || "Create Course"}</span>
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
            message={c.myCourses?.noCourses || "No courses yet"}
          />
        ) : (
          <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" : "flex flex-col gap-4"}>
            {filteredDisplayList.map((item) => (
              <CourseManagementCard
                key={item.id}
                item={item}
                type="course"
                viewMode={viewMode}
                labels={cardLabels}
                onOpen={() => navigate(`/workspace/courses/details/${encodeURIComponent(String(item.id))}`)}
                onEdit={() => navigate(`/workspace/courses/edit/${encodeURIComponent(String(item.id))}`)}
                onDelete={() => {
                  deleteHelper.setTargetId(item.id)
                }}
              />
            ))}
          </div>
        )}

        {filteredDisplayList.length > 0 && (
          <button
            type="button"
            onClick={() => navigate("/workspace/courses/all")}
            className="text-sm font-black text-[#b20a1c] hover:underline self-center py-2"
          >
            {c.myCourses?.viewAll || "View all"}
          </button>
        )}
      </div>

      <ConfirmationModal
        open={deleteHelper.isOpen}
        onClose={handleCloseDeleteModal}
        onConfirm={deleteHelper.handleConfirm}
        isPending={deleteHelper.isDeleting}
        title={c.courseDetail?.deleteCourse || "Delete Course"}
        message={c.courseDetail?.confirmDeleteCourse || "Are you sure you want to delete this course? All associated classes will also be affected."}
        confirmText={c.courseDetail?.deleteCourse || "Delete"}
        cancelText={c.createClass?.cancel || "Cancel"}
      />
    </div>
  )
}

export default MyCoursesPage
