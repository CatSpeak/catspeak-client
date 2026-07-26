import React, { useMemo, useRef, useState } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { Plus } from "lucide-react"
import { toast } from "react-hot-toast"

import {
  useDeleteClassMutation,
  useGetAllClassesQuery,
  useGetAllCoursesQuery,
  useGetScheduleSessionsQuery,
} from "@/store/api/coursesApi"
import { useLanguage } from "@/shared/context/LanguageContext"
import { LoadingSpinner } from "@/shared/components/ui/indicators"
import ConfirmationModal from "@/shared/components/ui/ConfirmationModal"

import CourseManagementCard from "../components/CourseManagementCard"
import CourseSelectFilter from "../components/CourseSelectFilter"
import CourseTabs from "../components/CourseTabs"
import EmptyCoursesState from "../components/EmptyCoursesState"
import TeachingTasksSection from "../components/assignments/TeachingTasksSection"
import UpcomingSessionsPanel from "../components/sessions/UpcomingSessionsPanel"
import ViewModeToggle from "../components/shared/ViewModeToggle"
import { useDeleteCourse } from "../hooks/useDeleteCourse"
import {
  filterByStatus,
  getScheduleRange,
  mapTeacherClassSummary,
  mapTeacherCourseSummary,
  mapUpcomingSessions,
} from "../utils/courseTransforms"

const STATUS_OPTIONS = [
  { value: "all", label: "All Status" },
  { value: "teaching", label: "Teaching" },
  { value: "open", label: "Open" },
  { value: "archived", label: "Archived" },
]

const MyCoursesPage = () => {
  const { language, t } = useLanguage()
  const navigate = useNavigate()
  const c = t.courses || {}
  const mc = c.myCourses || {}

  const [searchParams, setSearchParams] = useSearchParams()
  const activeTab = searchParams.get("tab") || "courses"
  const viewMode = searchParams.get("view") || "grid"
  const statusFilter = searchParams.get("status") || "all"

  const setActiveTab = (tab) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      next.set("tab", tab)
      return next
    })
  }

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
  const [classDeleteTarget, setClassDeleteTarget] = useState(null)
  const classDeleteGuardRef = useRef(false)
  const [deleteClass, { isLoading: isDeletingClass }] = useDeleteClassMutation()
  const scheduleParams = useMemo(() => getScheduleRange(180), [])

  const {
    currentData: scheduleData,
    isLoading: isScheduleLoading,
    isFetching: isScheduleFetching,
    error: scheduleError,
    refetch: refetchSchedule,
  } = useGetScheduleSessionsQuery(scheduleParams)
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

  const rawSessions = useMemo(
    () => (Array.isArray(scheduleData?.data) ? scheduleData.data : []),
    [scheduleData],
  )
  const coursesRaw = useMemo(
    () => (Array.isArray(coursesData?.data) ? coursesData.data : []),
    [coursesData],
  )
  const classesRaw = useMemo(
    () => (Array.isArray(classesData?.data) ? classesData.data : []),
    [classesData],
  )

  const isLoading = (
    isCoursesLoading
    || isClassesLoading
    || isScheduleLoading
    || (isCoursesFetching && coursesData === undefined)
    || (isClassesFetching && classesData === undefined)
    || (isScheduleFetching && scheduleData === undefined)
  )
  const isRefreshing = isCoursesFetching || isClassesFetching || isScheduleFetching
  const error = (
    (coursesData === undefined && coursesError)
    || (classesData === undefined && classesError)
    || (scheduleData === undefined && scheduleError)
  )
  const refreshError = coursesError || classesError || scheduleError

  const upcomingClasses = useMemo(() => mapUpcomingSessions(rawSessions, classesRaw, 3), [rawSessions, classesRaw])
  const courseList = useMemo(() => coursesRaw.map(mapTeacherCourseSummary), [coursesRaw])
  const classList = useMemo(() => classesRaw.map(mapTeacherClassSummary), [classesRaw])
  const isCoursesTab = activeTab === "courses"
  const displayList = isCoursesTab ? courseList : classList
  const filteredDisplayList = useMemo(() => filterByStatus(displayList, statusFilter), [displayList, statusFilter])

  const tabs = useMemo(() => [
    { value: "courses", label: c.myCoursesTab || "My Courses" },
    { value: "classes", label: c.myClassesTab || "My Classes" },
  ], [c.myClassesTab, c.myCoursesTab])

  const cardLabels = {
    editCourse: c.editCourse || "Edit Course",
    deleteCourse: c.courseDetail?.deleteCourse || "Delete Course",
    createdDate: c.createdDate || "Created Date",
    manageDetails: c.manageDetails || "Manage Details",
    progress: c.progress || "Progress",
    courseLabel: c.course || "Course",
    classLabel: c.class || "Class",
  }
  const classCardLabels = {
    ...cardLabels,
    editCourse: c.editClass || "Edit Class",
    deleteCourse: c.classDetail?.deleteClass || "Delete Class",
  }



  if (isLoading) {
    return <LoadingSpinner className="flex justify-center items-center min-h-[400px]" />
  }

  if (error) {
    return (
      <div role="alert" className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl text-sm font-semibold flex flex-col items-start gap-3">
        <span>{mc.loadFailed || "The course overview could not be loaded. Please try again."}</span>
        <button
          type="button"
          onClick={() => {
            refetchCourses()
            refetchClasses()
            refetchSchedule()
          }}
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
    if (deleteHelper.isDeleting || isDeletingClass) return
    if (classDeleteTarget) {
      setClassDeleteTarget(null)
      return
    }
    deleteHelper.handleCancel()
  }

  return (
    <div className="flex flex-col gap-4 text-[#2e2e2e]">
      {isRefreshing && (
        <span role="status" className="sr-only">
          {mc.refreshing || "Refreshing course overview"}
        </span>
      )}
      {refreshError && !error && (
        <div role="alert" className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs font-semibold text-amber-800">
          {mc.refreshFailed || "Some overview data could not be refreshed. The displayed information may be out of date."}
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 flex flex-col gap-5">
          <UpcomingSessionsPanel
            title={mc.upcomingClasses || "Upcoming Classes"}
            count={rawSessions.length || upcomingClasses.length}
            sessions={upcomingClasses}
            viewScheduleLabel={c.viewSchedule || "View schedule"}
            emptyLabel={c.noUpcomingClasses || "No upcoming classes yet"}
            viewClassLabel={c.viewClass || "View class"}
            joinRoomLabel={c.joinRoom || "Join room"}
            onViewSchedule={() => navigate("/workspace/courses/schedule")}
            onOpenSession={(item) => {
              const targetId = item.classId
              if (targetId) {
                navigate(`/workspace/courses/class/${encodeURIComponent(String(targetId))}`)
              }
            }}
          />
        </div>

        <TeachingTasksSection
          teachingTasksLabel={c.teachingTasks || "Teaching Tasks"}
          viewAllLabel={c.viewAll || "View all"}
          language={language}
          gradeAssignmentLabel={c.gradeAssignment || "Grade homework"}
          giveFeedbackLabel={c.giveFeedback || "Give feedback"}
          prepareLessonLabel={c.prepareLesson || "Prepare lesson plan"}
          actionIcon="plus"
          emptyLabel={c.noTeachingTasks || "No teaching tasks available"}
        />
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-px gap-4 mt-6">
        <CourseTabs
          tabs={tabs}
          activeTab={activeTab}
          onChange={setActiveTab}
          className="gap-4"
        />

        <div className="flex items-center gap-3 self-end sm:self-auto">
          <CourseSelectFilter
            value={statusFilter}
            onChange={setStatusFilter}
            options={STATUS_OPTIONS}
          />
          <ViewModeToggle value={viewMode} onChange={setViewMode} />
        </div>
      </div>

      <div className="flex flex-col gap-4">
        {filteredDisplayList.length === 0 ? (
          <EmptyCoursesState
            message={isCoursesTab
              ? (c.myCourses?.noCourses || "No courses yet")
              : (c.myCourses?.noClasses || "No classes yet")}
          />
        ) : (
          <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" : "flex flex-col gap-4"}>
            {filteredDisplayList.map((item) => (
              <CourseManagementCard
                key={item.id}
                item={item}
                type={isCoursesTab ? "course" : "class"}
                viewMode={viewMode}
                labels={isCoursesTab ? cardLabels : classCardLabels}
                onOpen={() => navigate(isCoursesTab
                  ? `/workspace/courses/details/${encodeURIComponent(String(item.id))}`
                  : `/workspace/courses/class/${encodeURIComponent(String(item.id))}`)}
                onEdit={() => navigate(isCoursesTab
                  ? `/workspace/courses/edit/${encodeURIComponent(String(item.id))}`
                  : `/workspace/courses/edit-class/${encodeURIComponent(String(item.id))}`)}
                onDelete={() => {
                  if (isCoursesTab) {
                    deleteHelper.setTargetId(item.id)
                  } else {
                    setClassDeleteTarget({
                      id: item.id,
                      courseId: item.courseId,
                    })
                  }
                }}
              />
            ))}
          </div>
        )}

        {filteredDisplayList.length > 0 && (
          <button
            type="button"
            onClick={() => navigate(isCoursesTab ? "/workspace/courses/all" : "/workspace/courses/all-classes")}
            className="text-sm font-black text-[#b20a1c] hover:underline self-center py-2"
          >
            {c.myCourses?.viewAll || "View all"}
          </button>
        )}
      </div>

      <ConfirmationModal
        open={deleteHelper.isOpen || Boolean(classDeleteTarget)}
        onClose={handleCloseDeleteModal}
        onConfirm={classDeleteTarget
          ? handleConfirmClassDelete
          : deleteHelper.handleConfirm}
        isPending={deleteHelper.isDeleting || isDeletingClass}
        title={classDeleteTarget
          ? (c.classDetail?.deleteClass || "Delete Class")
          : (c.courseDetail?.deleteCourse || "Delete Course")}
        message={classDeleteTarget
          ? (
              c.classDetail?.confirmDeleteClass
              || "Are you sure you want to delete this class?"
            )
          : (
              c.courseDetail?.confirmDeleteCourse
              || "Are you sure you want to delete this course? All associated classes will also be affected."
            )}
        confirmText={classDeleteTarget
          ? (c.classDetail?.deleteClass || "Delete")
          : (c.courseDetail?.deleteCourse || "Delete")}
        cancelText={c.createClass?.cancel || "Cancel"}
      />
    </div>
  )
}

export default MyCoursesPage
