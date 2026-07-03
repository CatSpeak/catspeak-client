import React from "react"
import { BookOpen, MessageSquare, FileText, ChevronRight, Plus, Clock, Calendar } from "lucide-react"

const TeachingTasksSection = ({
  teachingTasksLabel,
  viewAllLabel,
  gradeAssignmentLabel,
  giveFeedbackLabel,
  prepareLessonLabel,
  onViewAll,
  onTaskAction,
  actionIcon = "chevron" // "chevron" or "plus"
}) => {
  const tasks = [
    {
      id: "grade",
      title: gradeAssignmentLabel || "Grade homework",
      subtitle: "Lớp tiếng anh luyện nói",
      time: "11:45 AM",
      date: "31st Jul",
      due: "Urgent",
      dueColor: "bg-[#FFE4E6] text-[#E11D48]",
      icon: <BookOpen size={16} />,
      bgColor: "bg-[#EFF6FF] text-[#3B82F6]"
    },
    {
      id: "feedback1",
      title: giveFeedbackLabel || "Give feedback",
      subtitle: "Lớp viết anh ngữ chuyên n...",
      time: "11:45 AM",
      date: "31st Jul",
      due: "Required",
      dueColor: "bg-[#FEF3C7] text-[#D97706]",
      icon: <MessageSquare size={16} />,
      bgColor: "bg-[#FAF5FF] text-[#A855F7]"
    },
    {
      id: "feedback2",
      title: giveFeedbackLabel || "Give feedback",
      subtitle: "Lớp viết anh ngữ chuyên n...",
      time: "11:45 AM",
      date: "31st Jul",
      due: "Urgent",
      dueColor: "bg-[#FFE4E6] text-[#E11D48]",
      icon: <MessageSquare size={16} />,
      bgColor: "bg-[#FEF3C7] text-[#D97706]"
    },
    {
      id: "lesson",
      title: prepareLessonLabel || "Prepare lesson plan",
      subtitle: "Lớp tiếng anh luyện nói",
      time: "11:45 AM",
      date: "31st Jul",
      due: "Later",
      dueColor: "bg-[#E8F8F0] text-[#15803D]",
      icon: <FileText size={16} />,
      bgColor: "bg-[#FFE4E6] text-[#E11D48]"
    }
  ]

  return (
    <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-xs flex flex-col gap-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-black text-gray-950 tracking-tight">
          {teachingTasksLabel}
        </h3>
        <button
          onClick={onViewAll}
          className="text-xs font-black text-[#b20a1c] hover:underline"
        >
          {viewAllLabel}
        </button>
      </div>

      <div className="flex flex-col gap-4">
        {tasks.map((task) => (
          <div key={task.id} className="flex items-start gap-3 hover:bg-gray-50/50 p-1.5 rounded-2xl transition-colors">
            <div className={`w-9 h-9 shrink-0 rounded-full flex items-center justify-center ${task.bgColor}`}>
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
              <span className={`${task.dueColor} font-bold text-[10px] px-2 py-0.5 rounded`}>
                {task.due}
              </span>
              <div
                onClick={() => onTaskAction(task)}
                className="w-6 h-6 rounded-full border border-gray-150 flex items-center justify-center text-[#b20a1c] hover:bg-red-50/50 cursor-pointer"
              >
                {actionIcon === "plus" ? <Plus size={12} /> : <ChevronRight size={12} />}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default TeachingTasksSection
