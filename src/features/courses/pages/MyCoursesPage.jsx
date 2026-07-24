import React, { useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Plus } from "lucide-react"

import { useGetAllClassesQuery, useGetAllCoursesQuery, useGetScheduleSessionsQuery } from "@/store/api/coursesApi"
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

  const [activeTab, setActiveTab] = useState("courses")
  const [viewMode, setViewMode] = useState("grid")
  const [statusFilter, setStatusFilter] = useState("all")

  const deleteHelper = useDeleteCourse(t)
  const scheduleParams = useMemo(() => getScheduleRange(180), [])

  const { data: scheduleData, isLoading: isScheduleLoading } = useGetScheduleSessionsQuery(scheduleParams)
  const { data: coursesData, isLoading: isCoursesLoading, error: coursesError } = useGetAllCoursesQuery({ page: 1, pageSize: 6 })
  const { data: classesData, isLoading: isClassesLoading, error: classesError } = useGetAllClassesQuery({ page: 1, pageSize: 6 })

  const rawSessions = useMemo(() => scheduleData?.data || [], [scheduleData])
  const coursesRaw = useMemo(() => coursesData?.data || [], [coursesData])
  const classesRaw = useMemo(() => classesData?.data || [], [classesData])

  const isLoading = isCoursesLoading || isClassesLoading || isScheduleLoading
  const error = coursesError || classesError

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



  if (isLoading) {
    return <LoadingSpinner className="flex justify-center items-center min-h-[400px]" />
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl text-sm font-semibold">
        Error loading course overview: {error.message || "Unknown error"}
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4 text-[#2e2e2e]">
      <div className="flex justify-between items-center flex-wrap gap-2">
        <div className="text-xs text-gray-400 font-medium flex flex-wrap items-center gap-1.5">
          <span className="cursor-pointer hover:underline" onClick={() => navigate("/workspace")}>{t.nav?.home || "Home"}</span>
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
            onOpenSession={(item) => navigate(`/workspace/courses/class/${item.classId || item.id}`)}
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
          devMessage={c.devMessage || "Feature in development"}
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
                labels={cardLabels}
                onOpen={() => navigate(isCoursesTab ? `/workspace/courses/details/${item.id}` : `/workspace/courses/class/${item.id}`)}
                onEdit={() => navigate(`/workspace/courses/edit/${item.id}`)}
                onDelete={() => deleteHelper.setTargetId(item.id)}
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
        open={deleteHelper.isOpen}
        onClose={deleteHelper.handleCancel}
        onConfirm={deleteHelper.handleConfirm}
        title={c.courseDetail?.deleteCourse || "Delete Course"}
        message={c.courseDetail?.confirmDeleteCourse || "Are you sure you want to delete this course? All associated classes will also be affected."}
        confirmText={c.courseDetail?.deleteCourse || "Delete"}
        cancelText={c.createClass?.cancel || "Cancel"}
      />
    </div>
  )
}

export default MyCoursesPage
