import React from "react"
import { Clock, Calendar } from "lucide-react"
import { formatTime12h, formatDateDayMonth } from "../utils/courseUtils"

const UpcomingSessionCard = ({
  nextClass,
  courseData,
  upcomingSessionLabel,
  noUpcomingLabel,
  createClassToScheduleLabel,
  joinRoomLabel,
  viewAllLabel,
  onJoin,
  onViewAll
}) => {
  return (
    <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-xs flex flex-col gap-5">
      <h3 className="text-lg font-black text-gray-950 tracking-tight">
        {upcomingSessionLabel}
      </h3>

      {nextClass ? (
        <div className="flex flex-col gap-4">
          {/* Badges row */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="bg-[#FEF3C7] text-[#D97706] font-bold text-[10px] px-2.5 py-0.5 rounded-full">
              {nextClass.language || courseData.language}
            </span>
            <span className="bg-[#FEF3C7] text-[#D97706] font-bold text-[10px] px-2.5 py-0.5 rounded-full">
              {nextClass.levels?.[0] || courseData.level}
            </span>
            <span className="ml-auto bg-[#E8F8F0] text-[#15803D] font-bold text-[10px] px-2.5 py-0.5 rounded-full">
              Teaching
            </span>
          </div>

          {/* Class Title */}
          <h4 className="font-extrabold text-base text-gray-950 leading-snug line-clamp-2">
            {nextClass.title}
          </h4>

          {/* Date / Time */}
          <div className="flex flex-col gap-2 border-b border-gray-50 pb-4">
            <div className="flex items-center gap-2 text-xs font-semibold text-gray-500">
              <Clock size={14} className="text-gray-400" />
              <span>{formatTime12h(nextClass.schedule?.startTime)}</span>
            </div>
            <div className="flex items-center gap-2 text-xs font-semibold text-gray-500">
              <Calendar size={14} className="text-gray-400" />
              <span>{formatDateDayMonth(nextClass.startDate)}</span>
            </div>
          </div>

          {/* Footer stack and Join button */}
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-1.5">
              {/* Avatars */}
              <div className="flex -space-x-2 overflow-hidden shrink-0">
                <img
                  className="inline-block h-6 w-6 rounded-full ring-2 ring-white object-cover"
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=80&h=80"
                  alt="Student"
                />
                <img
                  className="inline-block h-6 w-6 rounded-full ring-2 ring-white object-cover"
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=80&h=80"
                  alt="Student"
                />
                <img
                  className="inline-block h-6 w-6 rounded-full ring-2 ring-white object-cover"
                  src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=80&h=80"
                  alt="Student"
                />
              </div>
              <span className="text-[11px] font-bold text-gray-400 font-sans">10</span>
            </div>

            <button
              onClick={onJoin}
              className="h-8 px-4 bg-[#b20a1c] hover:bg-[#990011] text-white text-xs font-black rounded-full flex items-center justify-center gap-1.5 transition-all shadow-xs active:scale-95 whitespace-nowrap"
            >
              <span>{joinRoomLabel}</span>
              <span>→</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-[#FCFCFC] border border-gray-150 rounded-2xl p-6 flex flex-col items-center justify-center text-center gap-2.5 min-h-[140px]">
          <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-400">
            <Calendar size={18} />
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="font-extrabold text-xs text-gray-700">{noUpcomingLabel}</span>
            <p className="text-[10px] text-gray-400 font-semibold max-w-[200px] leading-relaxed">
              {createClassToScheduleLabel}
            </p>
          </div>
        </div>
      )}

      <button
        onClick={onViewAll}
        className="text-xs font-bold text-gray-400 hover:text-gray-600 hover:underline transition-colors mt-2 text-center"
      >
        {viewAllLabel}
      </button>
    </div>
  )
}

export default UpcomingSessionCard
