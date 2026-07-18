import React from "react"
import { BookOpen, Calendar, ChevronRight, Clock, FileText, MessageSquare, Plus } from "lucide-react"
import { toast } from "react-hot-toast"

const getTaskStatusClass = (status) => {
  if (status === "Urgent") return "bg-[#FFE4E6] text-[#E11D48]"
  if (status === "Required") return "bg-[#FEF3C7] text-[#D97706]"
  return "bg-[#E8F8F0] text-[#15803D]"
}

const buildDefaultTeachingTasks = ({
  gradeAssignmentLabel,
  giveFeedbackLabel,
  prepareLessonLabel,
  taskSpeakingSubtitle,
  taskWritingSubtitle,
}) => [
  {
    id: "grade",
    title: gradeAssignmentLabel || "Grade homework",
    subtitle: taskSpeakingSubtitle || "English speaking class",
    time: "11:45 AM",
    date: "31st Jul",
    status: "Urgent",
    icon: <BookOpen size={16} />,
    iconColor: "text-[#3B82F6] bg-[#EFF6FF]",
  },
  {
    id: "feedback1",
    title: giveFeedbackLabel || "Give feedback",
    subtitle: taskWritingSubtitle || "Professional English writing",
    time: "11:45 AM",
    date: "31st Jul",
    status: "Required",
    icon: <MessageSquare size={16} />,
    iconColor: "text-[#A855F7] bg-[#FAF5FF]",
  },
  {
    id: "feedback2",
    title: giveFeedbackLabel || "Give feedback",
    subtitle: taskWritingSubtitle || "Professional English writing",
    time: "11:45 AM",
    date: "31st Jul",
    status: "Urgent",
    icon: <MessageSquare size={16} />,
    iconColor: "text-[#D97706] bg-[#FEF3C7]",
  },
  {
    id: "lesson",
    title: prepareLessonLabel || "Prepare lesson plan",
    subtitle: taskSpeakingSubtitle || "English speaking class",
    time: "11:45 AM",
    date: "31st Jul",
    status: "Later",
    icon: <FileText size={16} />,
    iconColor: "text-[#E11D48] bg-[#FFE4E6]",
  },
]

const TeachingTasksSection = ({
  teachingTasksLabel,
  viewAllLabel,
  gradeAssignmentLabel,
  giveFeedbackLabel,
  prepareLessonLabel,
  taskSpeakingSubtitle,
  taskWritingSubtitle,
  tasks,
  onViewAll,
  onTaskAction,
  isDevelopment = true,
  actionIcon = "chevron",
  devMessage = "Tinh nang dang phat trien",
}) => {
  const handleDevelopmentAction = (callback, payload) => {
    if (isDevelopment) {
      toast.success(devMessage)
      return
    }

    callback?.(payload)
  }

  const resolvedTasks = tasks || buildDefaultTeachingTasks({
    gradeAssignmentLabel,
    giveFeedbackLabel,
    prepareLessonLabel,
    taskSpeakingSubtitle,
    taskWritingSubtitle,
  })

  return (
    <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-xs flex flex-col gap-4 h-full justify-between">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-black text-gray-950 tracking-tight">
          {teachingTasksLabel}
        </h3>
        <button
          type="button"
          onClick={() => handleDevelopmentAction(onViewAll)}
          className="text-xs font-black text-[#b20a1c] hover:underline"
        >
          {viewAllLabel}
        </button>
      </div>

      <div className="flex flex-col gap-4 flex-1 mt-2">
        {resolvedTasks.map((task) => {
          const badgeText = task.badge || task.status || task.due
          const badgeClass = task.badgeClass || task.dueColor || getTaskStatusClass(badgeText)
          const iconClass = task.iconColor || task.bgColor || "bg-gray-100 text-gray-500"

          return (
            <div key={task.id} className="flex items-start gap-3 hover:bg-gray-50/50 p-1.5 rounded-2xl transition-colors">
              <div className={`w-9 h-9 shrink-0 rounded-full flex items-center justify-center ${iconClass}`}>
                {task.icon}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-black text-gray-950 truncate leading-snug">{task.title}</h4>
                <p className="text-xs text-gray-400 font-bold truncate mt-0.5">{task.subtitle}</p>
                <div className="flex items-center gap-2 mt-1 text-[10px] text-gray-400 font-bold">
                  <div className="flex items-center gap-1">
                    <Clock size={11} />
                    <span>{task.time}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar size={11} />
                    <span>{task.date}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0 self-center">
                <span className={`${badgeClass} font-bold text-[10px] px-2 py-0.5 rounded`}>
                  {badgeText}
                </span>
                <button
                  type="button"
                  onClick={() => handleDevelopmentAction(onTaskAction, task)}
                  className="w-6 h-6 rounded-full border border-[#b20a1c] flex items-center justify-center text-[#b20a1c] hover:bg-red-50/50"
                >
                  {actionIcon === "plus" ? <Plus size={12} /> : <ChevronRight size={12} />}
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default TeachingTasksSection
