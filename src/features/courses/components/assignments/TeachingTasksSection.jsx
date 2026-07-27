import React from "react"
import { Calendar, Clock } from "lucide-react"

const getTaskStatusClass = (status) => {
  if (status === "Urgent") return "bg-[#FFE4E6] text-[#E11D48]"
  if (status === "Required") return "bg-[#FEF3C7] text-[#D97706]"
  return "bg-[#E8F8F0] text-[#15803D]"
}

const TeachingTasksSection = ({
  teachingTasksLabel,
  viewAllLabel,
  tasks,
  onViewAll,
  onTaskAction,
  emptyLabel = "No teaching tasks available",
}) => {
  const resolvedTasks = Array.isArray(tasks) ? tasks : []
  const hasViewAllAction = typeof onViewAll === "function"

  return (
    <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-xs flex flex-col gap-4 h-fit">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-black text-gray-950 tracking-tight">
          {teachingTasksLabel}
        </h3>
        <button
          type="button"
          onClick={onViewAll}
          disabled={!hasViewAllAction}
          className="text-xs font-black text-[#b20a1c] hover:underline disabled:cursor-not-allowed disabled:text-gray-300 disabled:no-underline"
        >
          {viewAllLabel}
        </button>
      </div>

      <div className="flex flex-col gap-2 flex-1">
        {resolvedTasks.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-200 p-6 text-center text-xs font-bold text-gray-400">
            {emptyLabel}
          </div>
        ) : resolvedTasks.map((task) => {
          const badgeText = task.badge || task.status || task.due
          const badgeClass = task.badgeClass || task.dueColor || getTaskStatusClass(badgeText)
          const iconClass = task.iconColor || task.bgColor || "bg-gray-100 text-gray-500"

          return (
            <button
              type="button"
              key={task.id}
              onClick={() => onTaskAction?.(task)}
              disabled={typeof onTaskAction !== "function"}
              className="w-full text-left flex items-start gap-3 p-1.5 rounded-2xl transition-all cursor-pointer hover:bg-gray-50/70 active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#990011] disabled:cursor-default disabled:hover:bg-transparent disabled:active:scale-100"
            >
              <span className={`w-9 h-9 shrink-0 rounded-full flex items-center justify-center ${iconClass}`}>
                {task.icon}
              </span>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-black text-gray-950 truncate leading-snug">{task.title}</h4>
                <p className="text-xs text-gray-400 font-bold truncate mt-0.5">{task.subtitle}</p>
                {(task.time || task.date) && (
                  <div className="flex items-center gap-2 mt-1 text-[10px] text-gray-400 font-bold">
                    {task.time && <span className="flex items-center gap-1">
                      <Clock size={11} />
                      <span>{task.time}</span>
                    </span>}
                    {task.date && <span className="flex items-center gap-1">
                      <Calendar size={11} />
                      <span>{task.date}</span>
                    </span>}
                  </div>
                )}
              </div>
              {badgeText && <span className="flex items-center gap-2 shrink-0 self-center">
                <span className={`${badgeClass} font-bold text-[10px] px-2 py-0.5 rounded`}>
                  {badgeText}
                </span>
              </span>}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default TeachingTasksSection
