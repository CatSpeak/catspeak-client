import React from "react"
import { Calendar, Clock, Users } from "lucide-react"

import CourseStatusPill from "../CourseStatusPill"
import { useLanguage } from "@/shared/context/LanguageContext"
import { useTimezone } from "@/shared/hooks/useTimezone"
import { getLocalizedLanguageName } from "../../data/courseFormOptions"

const UpcomingSessionCard = ({
  nextClass,
  courseData,
  upcomingSessionLabel,
  noUpcomingLabel,
  createClassToScheduleLabel,
  joinRoomLabel,
  viewAllLabel,
  onJoin,
  onViewAll,
}) => {
  const { t } = useLanguage()
  const { formatDateMonth, formatScheduleTime } = useTimezone()
  const ui = t.courses?.workspaceUi || {}

  return (
    <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-xs flex flex-col gap-5">
      <h3 className="text-lg font-black text-gray-950 tracking-tight">
        {upcomingSessionLabel}
      </h3>

      {nextClass ? (
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="bg-[#FEF3C7] text-[#D97706] font-bold text-[10px] px-2.5 py-0.5 rounded-full">
              {getLocalizedLanguageName(
                nextClass.language || courseData?.language,
                t,
              ) || "—"}
            </span>
            <span className="bg-[#FEF3C7] text-[#D97706] font-bold text-[10px] px-2.5 py-0.5 rounded-full">
              {nextClass.levels?.[0] || courseData?.levels?.[0] || "—"}
            </span>
            {nextClass.status && (
              <CourseStatusPill status={nextClass.status} className="ml-auto" />
            )}
          </div>

          <h4 className="font-extrabold text-base text-gray-950 leading-snug line-clamp-2">
            {nextClass.title}
          </h4>

          <div className="flex flex-col gap-2 border-b border-gray-50 pb-4">
            <div className="flex items-center gap-2 text-xs font-semibold text-gray-500">
              <Clock size={14} className="text-gray-400" />
              <span>
                {(() => {
                  const startTimeStr = nextClass.schedule?.startTime || nextClass.startTime
                  const endTimeStr = nextClass.schedule?.endTime || nextClass.endTime
                  if (!startTimeStr) return ui.tba || "TBA"
                  const startFormatted = formatScheduleTime(startTimeStr)
                  const endFormatted = endTimeStr ? formatScheduleTime(endTimeStr) : ""
                  return endFormatted ? `${startFormatted} - ${endFormatted}` : startFormatted
                })()}
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs font-semibold text-gray-500">
              <Calendar size={14} className="text-gray-400" />
              <span>
                {formatDateMonth(nextClass.startDate || nextClass.date, ui.tba)}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-1.5">
              <Users size={14} className="text-gray-400" aria-hidden="true" />
              <span className="text-[11px] font-bold text-gray-400 font-sans">
                {nextClass.studentCount ?? "—"}
              </span>
            </div>

            <button
              type="button"
              onClick={onJoin}
              className="h-8 px-4 bg-[#b20a1c] hover:bg-[#990011] text-white text-xs font-black rounded-full flex items-center justify-center gap-1.5 transition-all shadow-xs active:scale-95 whitespace-nowrap"
            >
              <span>{joinRoomLabel}</span>
              <span>&rarr;</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-[#FCFCFC] border border-gray-150 rounded-2xl p-6 flex flex-col items-center justify-center text-center min-h-[140px]">
          <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-400">
            <Calendar size={18} />
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="font-extrabold text-base text-gray-700">{noUpcomingLabel}</span>
            <p className="text-sm text-gray-400 font-semibold max-w-[200px] leading-relaxed">
              {createClassToScheduleLabel}
            </p>
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={onViewAll}
        className="text-xs font-bold text-gray-400 hover:text-gray-600 hover:underline transition-colors mt-2 text-center"
      >
        {viewAllLabel}
      </button>
    </div>
  )
}

export default UpcomingSessionCard
