import React, { useMemo } from "react"
import { useNavigate } from "react-router-dom"
import { Calendar, Clock, ArrowRight, SquarePen, Puzzle } from "lucide-react"
import { useLanguage } from "@/shared/context/LanguageContext"
import {
  useGetTeacherAllTeachingTasksCombinedQuery,
} from "@/store/api/coursesApi"
import { formatTaskDueText, mapTeachingTask } from "../../utils/courseTransforms"

const getStatusConfig = (status, labels = {}) => {
  const norm = String(status || "")
    .trim()
    .toLowerCase()

  if (norm === "urgent") {
    return {
      label: labels.urgent || "Khẩn cấp",
      badgeClass: "bg-[#FEE2E2] text-[#DC2626]",
      accentBarClass: "bg-[#E11D48]",
      circleBg: "bg-[#FFF1F2]",
      ringStroke: "#E11D48",
      trackStroke: "stroke-red-100",
      iconColor: "text-[#E11D48]",
      arrowBtnClass:
        "border-[#E11D48] text-[#E11D48] group-hover:bg-[#E11D48] group-hover:text-white",
    }
  }

  if (norm === "required") {
    return {
      label: labels.required || "Cần làm",
      badgeClass: "bg-[#FEF3C7] text-[#B45309]",
      accentBarClass: "bg-[#F59E0B]",
      circleBg: "bg-[#FFFBEB]",
      ringStroke: "#F59E0B",
      trackStroke: "stroke-amber-100",
      iconColor: "text-[#D97706]",
      arrowBtnClass:
        "border-[#F59E0B] text-[#D97706] group-hover:bg-[#F59E0B] group-hover:text-white",
    }
  }

  // Later / default
  return {
    label: labels.later || "Xử lý sau",
    badgeClass: "bg-[#EFF6FF] text-[#2563EB]",
    accentBarClass: "bg-[#3B82F6]",
    circleBg: "bg-[#EFF6FF]",
    ringStroke: "#3B82F6",
    trackStroke: "stroke-blue-100",
    iconColor: "text-[#2563EB]",
    arrowBtnClass:
      "border-[#3B82F6] text-[#2563EB] group-hover:bg-[#3B82F6] group-hover:text-white",
  }
}

const TeachingTasksSection = ({
  teachingTasksLabel,
  viewAllLabel,
  tasks: propTasks,
  isLoading: propIsLoading,
  onTaskAction,
  emptyLabel,
  language: propLanguage,
}) => {
  const navigate = useNavigate()
  const { language: contextLanguage, t } = useLanguage()
  const currentLanguage = propLanguage || contextLanguage || "vi"
  const courses = t.courses || {}
  const grading = courses.grading || {}

  // Fetch teaching tasks if not provided from parent
  const { data: rawTasks, isLoading: isFetchingTasks } =
    useGetTeacherAllTeachingTasksCombinedQuery(
      { page: 1, limit: 3 },
      { skip: propTasks !== undefined },
    )

  const isLoading = propIsLoading !== undefined ? propIsLoading : isFetchingTasks

  const resolvedTasks = useMemo(() => {
    if (propTasks !== undefined) {
      const list = Array.isArray(propTasks)
        ? propTasks
        : Array.isArray(propTasks?.items)
          ? propTasks.items
          : Array.isArray(propTasks?.data?.items)
            ? propTasks.data.items
            : Array.isArray(propTasks?.data)
              ? propTasks.data
              : Array.isArray(propTasks?.result)
                ? propTasks.result
                : Array.isArray(propTasks?.value)
                  ? propTasks.value
                  : []
      return list
    }

    const list = Array.isArray(rawTasks)
      ? rawTasks
      : Array.isArray(rawTasks?.items)
        ? rawTasks.items
        : Array.isArray(rawTasks?.data?.items)
          ? rawTasks.data.items
          : Array.isArray(rawTasks?.data)
            ? rawTasks.data
            : []

    return list
      .map((task) =>
        mapTeachingTask(task, {
          pendingCount: grading.teachingTaskPendingCount,
          urgent: grading.teachingTaskUrgent,
          required: grading.teachingTaskRequired,
          later: grading.teachingTaskLater,
          gradeQuiz: grading.teachingTaskGradeQuiz,
          gradeAssignment: grading.teachingTaskGradeAssignment,
          unknown: grading.statusUnknown,
        }),
      )
      .filter(Boolean)
  }, [
    propTasks,
    rawTasks,
    grading.teachingTaskPendingCount,
    grading.teachingTaskUrgent,
    grading.teachingTaskRequired,
    grading.teachingTaskLater,
    grading.teachingTaskGradeQuiz,
    grading.teachingTaskGradeAssignment,
    grading.statusUnknown,
  ])

  const handleTaskClick = (task) => {
    if (onTaskAction) {
      onTaskAction(task)
      return
    }
    if (!task?.classId) return
    let targetUrl = `/workspace/courses/class/${encodeURIComponent(String(task.classId))}?tab=grading`
    if (task.assignmentId) {
      targetUrl += `&assignmentId=${encodeURIComponent(String(task.assignmentId))}`
    } else if (task.quizId) {
      targetUrl += `&quizId=${encodeURIComponent(String(task.quizId))}`
    }
    navigate(targetUrl)
  }

  const resolvedTeachingTasksLabel =
    teachingTasksLabel || courses.teachingTasks || "Việc giảng dạy"
  const resolvedViewAllLabel = viewAllLabel || courses.viewAll || "Xem tất cả"
  const resolvedEmptyLabel =
    emptyLabel || grading.noTeachingTasks || "Hiện chưa có nhiệm vụ giảng dạy."

  return (
    <div className="bg-white rounded-3xl border border-border shadow-xs p-4 sm:p-5 flex flex-col gap-3.5 h-fit">
      {/* Section Header */}
      <div className="flex justify-between items-center">
        <h3
          className="text-base sm:text-lg font-bold text-gray-950 tracking-tight"
          title={resolvedTeachingTasksLabel}
        >
          {resolvedTeachingTasksLabel}
        </h3>
        <button
          type="button"
          onClick={() => navigate("/workspace/teaching-tasks")}
          title={resolvedViewAllLabel}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#990011] hover:text-[#7a000e] transition-colors cursor-pointer group"
        >
          <span>{resolvedViewAllLabel}</span>
          <ArrowRight
            size={13}
            className="transition-transform group-hover:translate-x-0.5"
          />
        </button>
      </div>

      {/* Section Tasks List (Hiển thị toàn bộ teaching tasks) */}
      <div className="flex flex-col gap-2.5 flex-1">
        {isLoading ? (
          <div className="flex flex-col gap-2.5">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="relative overflow-hidden p-3 pl-4 animate-pulse bg-gray-50 flex flex-col gap-2.5 shadow-[0_2px_8px_rgba(0,0,0,0.06)]"
              >
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-gray-200" />
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-full bg-gray-200 shrink-0" />
                  <div className="flex-1 flex flex-col gap-1.5">
                    <div className="h-4 bg-gray-200 rounded w-2/3" />
                    <div className="h-3 bg-gray-200 rounded w-1/3" />
                  </div>
                </div>
                <div className="flex justify-between items-center pt-1">
                  <div className="h-3 bg-gray-200 rounded w-1/4" />
                  <div className="h-5 bg-gray-200 rounded-full w-14" />
                </div>
              </div>
            ))}
          </div>
        ) : resolvedTasks.length === 0 ? (
          <div className="p-4 text-center text-sm font-semibold text-gray-400">
            {resolvedEmptyLabel}
          </div>
        ) : (
          resolvedTasks.map((task, idx) => {
            const taskType = task.taskType || task.TaskType || "Grading"
            const assignmentId = task.assignmentId ?? task.AssignmentId
            const quizId = task.quizId ?? task.QuizId
            const isGrading = taskType === "Grading"

            const rawStatus = task.status || task.Status || "Urgent"

            const statusConfig = getStatusConfig(rawStatus, {
              urgent: grading.teachingTaskUrgent || "Khẩn cấp",
              required: grading.teachingTaskRequired || "Cần làm",
              later: grading.teachingTaskLater || "Xử lý sau",
            })

            // Đa ngôn ngữ hiển thị trạng thái
            const displayStatusText = statusConfig.label

            const taskTitle =
              task.taskName ||
              task.TaskName ||
              task.title ||
              task.Title ||
              (isGrading
                ? grading.teachingTaskGradeAssignment || "Chấm bài nộp"
                : grading.teachingTaskGradeQuiz || "Chấm bài kiểm tra")

            const taskSubtitle =
              task.className ||
              task.ClassName ||
              task.subtitle ||
              task.Subtitle ||
              ""

            const dueText = formatTaskDueText(task, {
              language: currentLanguage,
            })

            const pendingCount = task.pendingCount ?? task.PendingCount
            const progressPercent =
              task.progressPercent ?? task.ProgressPercent ?? 0

            const pendingText =
              pendingCount != null
                ? (
                    grading.pendingSubmissionCount || "{{count}} bài nộp"
                  ).replace("{{count}}", pendingCount)
                : grading.submissionNeedToGrade || "Bài nộp"

            const defaultIcon = isGrading ? (
              <SquarePen
                className={`w-4 h-4 sm:w-5 sm:h-5 ${statusConfig.iconColor}`}
                strokeWidth={2}
              />
            ) : (
              <Puzzle
                className={`w-4 h-4 sm:w-5 sm:h-5 ${statusConfig.iconColor}`}
                strokeWidth={2}
              />
            )

            const taskKey =
              task.id ||
              task.Id ||
              `${taskType}-${assignmentId || 0}-${quizId || 0}-${task.classId || task.ClassId || 0}-${idx}`

            return (
              <button
                type="button"
                key={taskKey}
                onClick={() => handleTaskClick(task)}
                title={`${taskTitle} - ${taskSubtitle}`}
                className="rounded-xl relative overflow-hidden w-full text-left bg-white p-2.5 sm:p-3 pl-3.5 sm:pl-4 transition-all cursor-pointer flex flex-col justify-between gap-2 group active:scale-[0.99] focus-visible:outline-none hover:bg-gray-50/60 shadow-[0_2px_8px_rgba(0,0,0,0.06)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.1)]"
              >
                {/* Left status indicator accent bar (Không bo góc) */}
                <span
                  className={`absolute left-0 top-0 bottom-0 w-1 ${statusConfig.accentBarClass}`}
                  aria-hidden="true"
                />

                {/* Top Section: Avatar Icon & Task Information */}
                <div className="flex items-center gap-3">
                  <div
                    className={`relative w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center shrink-0 ${statusConfig.circleBg}`}
                    title={`${taskTitle} (${progressPercent}%)`}
                  >
                    {/* SVG circular border/progress ring đồng bộ màu với status */}
                    <svg
                      className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none"
                      viewBox="0 0 44 44"
                    >
                      <circle
                        cx="22"
                        cy="22"
                        r="19"
                        className={`${statusConfig.trackStroke} fill-none`}
                        strokeWidth="2.5"
                      />
                      <circle
                        cx="22"
                        cy="22"
                        r="19"
                        stroke={statusConfig.ringStroke}
                        className="fill-none transition-all duration-500"
                        strokeWidth="2.5"
                        strokeDasharray={119.4}
                        strokeDashoffset={
                          typeof progressPercent === "number" &&
                          progressPercent > 0
                            ? 119.4 * (1 - progressPercent / 100)
                            : 30
                        }
                        strokeLinecap="round"
                      />
                    </svg>

                    {/* Icon: TaskType = Grading -> SquarePen, else Puzzle */}
                    {task.icon || defaultIcon}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h4
                      className="text-sm sm:text-base font-bold text-gray-900 truncate leading-snug group-hover:text-[#990011] transition-colors"
                      title={taskTitle}
                    >
                      {taskTitle}
                    </h4>
                    <p
                      className="text-xs sm:text-sm text-gray-500 font-normal truncate mt-0.5"
                      title={taskSubtitle}
                    >
                      {taskSubtitle}
                    </p>
                  </div>
                </div>

                {/* Bottom Section: Clock, Calendar & Status Badge + Arrow Button */}
                <div className="flex items-end justify-between gap-2.5 pt-0.5">
                  {/* Left info items */}
                  <div className="flex flex-col gap-1 min-w-0 text-xs text-gray-700 font-medium">
                    <div
                      className="flex items-center gap-1.5 text-gray-700 font-medium truncate"
                      title={dueText}
                    >
                      <Clock className="w-3.5 h-3.5 text-gray-800 shrink-0 stroke-[2]" />
                      <span className="truncate">{dueText}</span>
                    </div>
                    <div
                      className="flex items-center gap-1.5 text-gray-700 font-medium truncate"
                      title={pendingText}
                    >
                      <Calendar className="w-3.5 h-3.5 text-gray-800 shrink-0 stroke-[2]" />
                      <span className="truncate">{pendingText}</span>
                    </div>
                  </div>

                  {/* Right: Status Pill & Arrow Action (đổi màu khi hover card) */}
                  <div className="flex items-center gap-2 shrink-0">
                    <span
                      className={`${statusConfig.badgeClass} text-[11px] font-semibold px-2.5 py-0.5 rounded-full tracking-wide`}
                      title={`${grading.status || "Trạng thái"}: ${displayStatusText}`}
                    >
                      {displayStatusText}
                    </span>
                    <span
                      className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full border ${statusConfig.arrowBtnClass} flex items-center justify-center transition-colors shrink-0`}
                      aria-hidden="true"
                      title={resolvedViewAllLabel}
                    >
                      <ArrowRight className="w-3 h-3 sm:w-3.5 sm:h-3.5 stroke-[2.5]" />
                    </span>
                  </div>
                </div>
              </button>
            )
          })
        )}
      </div>
    </div>
  )
}

export default TeachingTasksSection
