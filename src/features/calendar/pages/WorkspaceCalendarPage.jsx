import React, { useMemo } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { useLanguage } from "@/shared/context/LanguageContext"
import { useTimezone } from "@/shared/hooks/useTimezone"
import { LoadingSpinner } from "@/shared/components/ui/indicators"

import {
  useGetAllClassesQuery,
  useGetScheduleSessionsQuery,
} from "@/store/api/coursesApi"

import UpcomingSessionsPanel from "@/features/courses/components/sessions/UpcomingSessionsPanel"
import TeachingTasksSection from "@/features/courses/components/assignments/TeachingTasksSection"
import {
  getScheduleRange,
  mapUpcomingSessions,
} from "@/features/courses/utils/courseTransforms"
import { Breadcrumb } from "@/shared/components/ui/navigation"

const WorkspaceCalendarPage = () => {
  const { language, t } = useLanguage()
  const { formatDateMonth, formatScheduleTime } = useTimezone()
  const navigate = useNavigate()
  const c = t.courses || {}
  const mc = c.myCourses || {}

  const [searchParams] = useSearchParams()
  const statusFilter = searchParams.get("status") || "all"

  const scheduleParams = useMemo(() => getScheduleRange(180), [])

  const {
    currentData: scheduleData,
    isLoading: isScheduleLoading,
    error: scheduleError,
    refetch: refetchSchedule,
  } = useGetScheduleSessionsQuery(scheduleParams)

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
  const classesRaw = useMemo(
    () => (Array.isArray(classesData?.data) ? classesData.data : []),
    [classesData],
  )

  const isLoading = isClassesLoading || (isClassesFetching && classesData === undefined) || isScheduleLoading
  const error = classesError || scheduleError

  const upcomingClasses = useMemo(() => mapUpcomingSessions(rawSessions, classesRaw, 10, formatDateMonth, formatScheduleTime), [rawSessions, classesRaw, formatDateMonth, formatScheduleTime])

  if (isLoading) {
    return <LoadingSpinner className="flex justify-center items-center min-h-[400px]" />
  }

  if (error) {
    return (
      <div role="alert" className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl text-sm font-semibold flex flex-col items-start gap-3">
        <span>{mc.loadFailed || "The calendar overview could not be loaded. Please try again."}</span>
        <button
          type="button"
          onClick={() => {
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

  return (
    <div className="flex flex-col gap-6 text-[#2e2e2e]">
      {/* <div className="flex justify-between items-center flex-wrap gap-2">
        <div className="text-xs text-gray-400 font-medium flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            className="cursor-pointer hover:underline"
            onClick={() => navigate("/workspace")}
          >
            {t.nav?.home || "Home"}
          </button>
          <span>/</span>
          <span className="text-[#990011] font-semibold">{t.nav?.calendar || "Calendar"}</span>
        </div>
      </div> */}
      <Breadcrumb
        items={[
          { label: t.nav.home || "Home", onClick: () => navigate("/workspace") },
          { label: c.teachingTasks || "Teaching Tasks" }
        ]}
      />

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-3xl font-black text-gray-950 tracking-tight">
          {c.teachingTasks || "Teaching Tasks"}
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 flex flex-col gap-5">
          <UpcomingSessionsPanel
            title={mc.upcomingClasses || "Upcoming Classes"}
            count={rawSessions.length || upcomingClasses.length}
            sessions={upcomingClasses}
            viewScheduleLabel={c.viewSchedule || "View schedule"}
            emptyLabel={c.noUpcomingClasses || "No upcoming classes yet"}
            viewClassLabel={c.viewClass || "View class"}
            joinRoomLabel={c.joinRoom || "Join room"}
            onViewSchedule={() => navigate("/workspace/schedule")}
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
          onViewAll={() => navigate("/workspace/teaching-tasks/all")}
        />
      </div>
    </div>
  )
}

export default WorkspaceCalendarPage
