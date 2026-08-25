import React, { useMemo } from "react"
import { useNavigate, useParams } from "react-router-dom"
import TeachingTasksSection from "../assignments/TeachingTasksSection"
import GeneralSection from "./GeneralSection"
import UpcomingSessionSection from "./UpcomingSessionSection"
import TeachingProgressSection from "./TeachingProgressSection"
import VoucherSection from "./VoucherSection"
import { useGetTeacherClassTeachingTasksCombinedQuery } from "@/store/api/coursesApi"
import { mapTeachingTask } from "../../utils/courseTransforms"
import { useLanguage } from "@/shared/context/LanguageContext"
import { getSafeMediaUrl } from "../../utils/courseUtils"

const ClassOverviewTab = ({
  classData = {},
  isStudent = false,
  isEnrolled = true,
  id: propId,
  navigate: propNavigate,
  showActionsDropdown,
  setShowActionsDropdown,
  onCompleteClass,
  onCancelClassClick,
  isActionPending = false,
  formatCurrency,
  getWeeklyScheduleText,
  upcomingSessionLabel,
  viewAllLabel,
  teachingTasksLabel,
  gradeAssignmentLabel,
  giveFeedbackLabel,
  prepareLessonLabel,
  onJoinRoom,
  onTaskAction,
  onViewTasks,
  cd: propCd,
}) => {
  const { t } = useLanguage()
  const hookNavigate = useNavigate()
  const params = useParams()

  const navigate = propNavigate || hookNavigate
  const id = propId || classData?.id || params.id

  const c = t.courses || {}
  const cd = propCd || c.classDetail || {}
  const taskText = c.grading || {}

  const thumbnailUrl = getSafeMediaUrl(classData?.thumbnailUrl)

  const { data: rawTasks = [], isLoading: isLoadingTasks } =
    useGetTeacherClassTeachingTasksCombinedQuery(id, {
      skip: !id || isStudent,
    })

  const teachingTasks = useMemo(() => {
    const list = Array.isArray(rawTasks)
      ? rawTasks
      : Array.isArray(rawTasks?.data)
        ? rawTasks.data
        : Array.isArray(rawTasks?.items)
          ? rawTasks.items
          : Array.isArray(rawTasks?.result)
            ? rawTasks.result
            : Array.isArray(rawTasks?.value)
              ? rawTasks.value
              : []

    return list
      .map((task) =>
        mapTeachingTask(task, {
          pendingCount: taskText.teachingTaskPendingCount,
          urgent: taskText.teachingTaskUrgent,
          required: taskText.teachingTaskRequired,
          later: taskText.teachingTaskLater,
          gradeQuiz: taskText.teachingTaskGradeQuiz,
          gradeAssignment: taskText.teachingTaskGradeAssignment,
          unknown: taskText.statusUnknown,
        }),
      )
      .filter(Boolean)
  }, [
    rawTasks,
    taskText.teachingTaskGradeAssignment,
    taskText.teachingTaskGradeQuiz,
    taskText.teachingTaskPendingCount,
    taskText.teachingTaskRequired,
    taskText.teachingTaskUrgent,
    taskText.teachingTaskLater,
    taskText.statusUnknown,
  ])

  const handleTaskAction = (task) => {
    if (onTaskAction) {
      onTaskAction(task)
      return
    }
    const targetClassId = task.classId || id
    let targetUrl = `/workspace/courses/class/${encodeURIComponent(String(targetClassId))}?tab=grading`
    if (task.assignmentId) {
      targetUrl += `&assignmentId=${encodeURIComponent(String(task.assignmentId))}`
    } else if (task.quizId) {
      targetUrl += `&quizId=${encodeURIComponent(String(task.quizId))}`
    }
    navigate(targetUrl)
  }

  const showRightColumn = !isStudent || isEnrolled

  return (
    <div className="flex flex-col sm:grid sm:grid-cols-1 lg:grid-cols-3 gap-4">
      {/* LEFT COLUMN: Visual Banner, Information Details, Vouchers, and Circular Progress */}
      <div
        className={`contents sm:flex sm:flex-col sm:gap-4 ${
          showRightColumn ? "lg:col-span-2" : "lg:col-span-3"
        }`}
      >
        {/* 1. Unified Class Overview Card (Visual Banner + Information Grid) */}
        <div className="order-1 sm:order-none">
          <GeneralSection
            classData={classData}
            isStudent={isStudent}
            id={id}
            navigate={navigate}
            showActionsDropdown={showActionsDropdown}
            setShowActionsDropdown={setShowActionsDropdown}
            onCompleteClass={onCompleteClass}
            onCancelClassClick={onCancelClassClick}
            isActionPending={isActionPending}
            formatCurrency={formatCurrency}
            getWeeklyScheduleText={getWeeklyScheduleText}
            cd={cd}
            thumbnailUrl={thumbnailUrl}
          />
        </div>

        {/* 5. Vouchers (Ưu đãi đang áp dụng) */}
        <div className="order-5 sm:order-none">
          <VoucherSection
            classData={classData}
            id={id}
            navigate={navigate}
            cd={cd}
          />
        </div>

        {/* 4. Teaching Progress Circular Chart */}
        <div className="order-4 sm:order-none">
          <TeachingProgressSection classData={classData} cd={cd} />
        </div>
      </div>

      {/* RIGHT COLUMN: Upcoming session and Teaching tasks */}
      {showRightColumn && (
        <div className="contents sm:flex sm:flex-col sm:gap-4 lg:col-span-1">
          {/* 2. Upcoming Session */}
          <div className="order-2 sm:order-none">
            <UpcomingSessionSection
              classData={classData}
              onJoinRoom={onJoinRoom}
              cd={cd}
              upcomingSessionLabel={upcomingSessionLabel}
            />
          </div>

          {/* 3. Teaching Tasks */}
          {!isStudent && (
            <div className="order-3 sm:order-none">
              <TeachingTasksSection
                teachingTasksLabel={teachingTasksLabel}
                viewAllLabel={viewAllLabel}
                gradeAssignmentLabel={gradeAssignmentLabel}
                giveFeedbackLabel={giveFeedbackLabel}
                prepareLessonLabel={prepareLessonLabel}
                tasks={teachingTasks}
                isLoading={isLoadingTasks}
                onViewAll={onViewTasks}
                onTaskAction={handleTaskAction}
              />
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default ClassOverviewTab
