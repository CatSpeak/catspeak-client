import React from "react"
import { Calendar, Clock, Users } from "lucide-react"
import CourseStatusPill from "../CourseStatusPill"
import { useLanguage } from "@/shared/context/LanguageContext"
import { getLocalizedLanguageName } from "../../data/courseFormOptions"

const UpcomingSessionsPanel = ({
  title,
  count = 0,
  sessions = [],
  viewScheduleLabel,
  emptyLabel,
  viewClassLabel,
  joinRoomLabel,
  onViewSchedule,
  onOpenSession,
}) => {
  const { t } = useLanguage()

  return (
    <div className="bg-white dark:bg-[#1A1A1A] rounded-3xl p-6 border border-border dark:border-[#3F3F3F] shadow-xs flex flex-col gap-5 h-full">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-4 bg-[#990011] dark:bg-[#b20a1c] rounded-full" />
          <h2 className="text-sm font-extrabold text-gray-800 dark:text-gray-100 uppercase tracking-wider flex items-center gap-1.5">
            <span>{title}</span>
            <span className="bg-[#EAB308] text-white text-[10px] px-2 font-black w-4.5 h-4.5 rounded-full flex items-center justify-center shrink-0">
              {String(count)}
            </span>
          </h2>
        </div>
        <button
          type="button"
          onClick={onViewSchedule}
          className="text-xs text-[#990011] dark:text-[#FF6B6B] hover:text-[#80000e] dark:hover:text-[#ff8585] hover:underline font-bold transition-colors cursor-pointer"
        >
          {viewScheduleLabel}
        </button>
      </div>

      <div className="flex flex-col gap-4 flex-1">
        {sessions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center text-gray-400 dark:text-gray-400 font-bold text-base gap-3 h-full min-h-[220px]">
            <Calendar size={54} className="text-gray-300 dark:text-gray-600 stroke-[1.2]" />
            <span>{emptyLabel}</span>
          </div>
        ) : (
          sessions.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => onOpenSession(item)}
              className="text-left bg-[#FCFCFC] dark:bg-[#222222] border border-border dark:border-[#3F3F3F] rounded-2xl p-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 hover:shadow-xs transition-all duration-300 cursor-pointer"
            >
              <div className="flex flex-col gap-2.5">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="bg-[#FEF3C7] dark:bg-amber-950/40 text-[#D97706] dark:text-amber-300 font-bold text-[10px] px-2.5 py-0.5 rounded-full">
                    {getLocalizedLanguageName(item.language, t)}
                  </span>
                  <span className="bg-[#FEF3C7] dark:bg-amber-950/40 text-[#D97706] dark:text-amber-300 font-bold text-[10px] px-2.5 py-0.5 rounded-full">
                    {item.levels?.[0]}
                  </span>
                  {item.status && <CourseStatusPill status={item.status} />}
                </div>

                <h3 className="font-extrabold text-base text-gray-950 dark:text-white leading-snug">
                  {item.title}
                </h3>

                <div className="flex items-center gap-4 text-xs font-semibold text-gray-500 dark:text-gray-400">
                  <div className="flex items-center gap-1.5">
                    <Clock size={13} className="text-gray-400 dark:text-gray-500" />
                    <span>{item.time}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Calendar size={13} className="text-gray-400 dark:text-gray-500" />
                    <span>{item.date}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-6 border-t sm:border-t-0 pt-3 sm:pt-0 border-border dark:border-[#3F3F3F]">
                <div className="flex items-center gap-1.5">
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-gray-400 dark:text-gray-400 font-sans">
                    <Users size={11} />
                    {item.studentCount ?? "—"}
                  </span>
                </div>

                <span className="h-8 px-4 bg-[#b20a1c] hover:bg-[#990011] dark:bg-[#b20a1c] dark:hover:bg-[#c9182b] text-white text-xs font-black rounded-full flex items-center justify-center gap-1.5 transition-all shadow-xs active:scale-95 whitespace-nowrap">
                  <span>{item.status === "OPEN" ? viewClassLabel : joinRoomLabel}</span>
                  <span>&rarr;</span>
                </span>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  )
}

export default UpcomingSessionsPanel
