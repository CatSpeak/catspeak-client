import React from "react"
import { Calendar, Clock, FileText, Award, ArrowRight } from "lucide-react"
import { useLanguage } from "@/shared/context/LanguageContext"

const getTaskStatusClass = (status) => {
  const norm = String(status || "")
    .trim()
    .toLowerCase()
  if (norm === "urgent") return "bg-[#FFE4E6] text-[#E11D48]"
  if (norm === "required") return "bg-[#FEF3C7] text-[#D97706]"
  return "bg-[#E8F8F0] text-[#15803D]"
}

const TeachingTasksSection = ({
  teachingTasksLabel,
  viewAllLabel,
  tasks,
  isLoading = false,
  onViewAll,
  onTaskAction,
  emptyLabel,
}) => {
  const { t } = useLanguage()
  const courses = t.courses || {}
  const grading = courses.grading || {}
  const resolvedTasks = Array.isArray(tasks) ? tasks : []
  const hasViewAllAction = typeof onViewAll === "function"
  const resolvedTeachingTasksLabel = teachingTasksLabel || courses.teachingTasks
  const resolvedViewAllLabel = viewAllLabel || courses.viewAll
  const resolvedEmptyLabel = emptyLabel || grading.noTeachingTasks

  return (
    <div className="bg-white rounded-3xl border border-border p-6 shadow-xs flex flex-col gap-4 h-fit">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-bold text-gray-950 tracking-tight">
          {resolvedTeachingTasksLabel}
        </h3>
        {hasViewAllAction && (
          <button
            type="button"
            onClick={onViewAll}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#990011] hover:text-[#7a000e] transition-colors cursor-pointer group"
          >
            <span>{resolvedViewAllLabel}</span>
            <ArrowRight
              size={14}
              className="transition-transform group-hover:translate-x-0.5"
            />
          </button>
        )}
      </div>

      <div className="flex flex-col gap-2 flex-1">
        {isLoading ? (
          <div className="rounded-2xl border border-border p-6 text-center text-xs font-bold text-gray-400 animate-pulse">
            {grading.loadingTasks}
          </div>
        ) : resolvedTasks.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border p-6 text-center text-sm font-bold text-gray-400">
            {resolvedEmptyLabel}
          </div>
        ) : (
          resolvedTasks.map((task) => {
            const badgeText = task.badge || task.status || task.due
            const badgeClass =
              task.badgeClass || task.dueColor || getTaskStatusClass(badgeText)
            const iconClass =
              task.iconColor || task.bgColor || "bg-gray-100 text-gray-500"

            const defaultIcon =
              task.taskType === "QuizGrading" || task.quizId ? (
                <Award size={16} />
              ) : (
                <FileText size={16} />
              )

            return (
              <button
                type="button"
                key={
                  task.id ||
                  `${task.taskType}-${task.assignmentId}-${task.quizId}-${task.classId}`
                }
                onClick={() => onTaskAction?.(task)}
                disabled={typeof onTaskAction !== "function"}
                className="w-full text-left flex items-start gap-3 p-1.5 rounded-2xl transition-all cursor-pointer hover:bg-gray-50/70 active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#990011] disabled:cursor-default disabled:hover:bg-transparent disabled:active:scale-100"
              >
                <span
                  className={`w-9 h-9 shrink-0 rounded-full flex items-center justify-center ${iconClass}`}
                >
                  {task.icon || defaultIcon}
                </span>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-black text-gray-950 truncate leading-snug">
                    {task.title || task.taskName}
                  </h4>
                  <p className="text-xs text-gray-400 font-bold truncate mt-0.5">
                    {task.subtitle}
                  </p>
                  {(task.time || task.date) && (
                    <div className="flex items-center gap-2 mt-1 text-[10px] text-gray-400 font-bold">
                      {task.time && (
                        <span className="flex items-center gap-1">
                          <Clock size={11} />
                          <span>{task.time}</span>
                        </span>
                      )}
                      {task.date && (
                        <span className="flex items-center gap-1">
                          <Calendar size={11} />
                          <span>{task.date}</span>
                        </span>
                      )}
                    </div>
                  )}
                </div>
                {badgeText && (
                  <span className="flex items-center gap-2 shrink-0 self-center">
                    <span
                      className={`${badgeClass} font-bold text-[10px] px-2 py-0.5 rounded`}
                    >
                      {badgeText}
                    </span>
                  </span>
                )}
              </button>
            )
          })
        )}
      </div>
    </div>
  )
}

export default TeachingTasksSection
