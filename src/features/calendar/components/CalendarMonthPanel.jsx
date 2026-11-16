import React from "react"
import dayjs from "dayjs"
import { ChevronLeft, ChevronRight } from "lucide-react"

import { useLanguage } from "@/shared/context/LanguageContext"
import { IconButton } from "@/shared/components/ui/buttons"

const DAY_LABELS = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"]

const CalendarMonthPanel = ({
  currentDate,
  selectedDate,
  eventCountsByDay,
  localizedMonth,
  todayLegend,
  selectedDayLegend,
  onPrevMonth,
  onNextMonth,
  onSelectDate,
}) => {
  const { t } = useLanguage()

  // Calculate days for the 6-week (42 days) month grid
  const startDay = (currentDate.startOf("month").day() + 6) % 7
  const prevDays = currentDate.subtract(1, "month").daysInMonth()
  const daysInMonth = currentDate.daysInMonth()

  const calendarDates = Array.from({ length: 42 }, (_, i) => {
    const dayValue = i - startDay + 1
    if (dayValue < 1) {
      return { day: prevDays + dayValue, isCurrentMonth: false }
    }
    if (dayValue > daysInMonth) {
      return { day: dayValue - daysInMonth, isCurrentMonth: false }
    }
    return { day: dayValue, isCurrentMonth: true }
  })

  return (
    <div className="flex flex-col gap-4 bg-white dark:bg-[#1A1A1A] border border-transparent dark:border-[#3F3F3F] rounded-xl">
      {/* ── 1. Header: Month Navigation ── */}
      <div className="pl-4 pr-1 h-[56px] flex items-center justify-between">
        <span className="text-lg font-bold text-black dark:text-white">
          {localizedMonth}
        </span>

        <div className="flex items-center gap-2">
          <IconButton
            onClick={onPrevMonth}
            variant="ghost"
            title={t.calendar?.prevMonth || "Tháng trước"}
          >
            <ChevronLeft />
          </IconButton>
          <IconButton
            onClick={onNextMonth}
            variant="ghost"
            title={t.calendar?.nextMonth || "Tháng sau"}
          >
            <ChevronRight />
          </IconButton>
        </div>
      </div>

      {/* ── 2. Calendar Grid: Day Headers & Date Cells (Grouped Together) ── */}
      <div className="flex flex-col gap-2 w-full">
        {/* Day-of-Week Labels Header (MON - SUN) */}
        <div className="grid grid-cols-7">
          {DAY_LABELS.map((label) => (
            <div
              key={label}
              className="h-12 flex items-center justify-center text-base uppercase text-gray-700 dark:text-neutral-300"
            >
              {label}
            </div>
          ))}
        </div>

        {/* Date Cells Grid (6-week month grid) */}
        <div className="grid grid-cols-7 gap-y-2">
          {calendarDates.map((dateObj, idx) => {
            const { day, isCurrentMonth } = dateObj

            // Inactive days from previous or next month
            if (!isCurrentMonth) {
              return (
                <div
                  key={`empty-${idx}`}
                  className="h-12 flex items-center justify-center"
                >
                  <span className="text-base text-gray-300 dark:text-neutral-600">
                    {day}
                  </span>
                </div>
              )
            }

            const isToday =
              day === dayjs().date() && currentDate.isSame(dayjs(), "month")
            const isSelected = day === selectedDate
            const eventCount = eventCountsByDay?.[day] ?? 0

            return (
              <div
                key={`day-${idx}`}
                className="h-12 flex items-center justify-center relative"
              >
                <button
                  type="button"
                  onClick={() => onSelectDate(day)}
                  className={`
                    w-10 h-10
                    flex items-center justify-center
                    rounded-full
                    text-base font-medium
                    transition-all
                    cursor-pointer
                    ${
                      isSelected
                        ? "bg-cath-red-700 text-white shadow-md"
                        : isToday
                          ? "border border-cath-red-700 dark:border-red-400 text-cath-red-700 dark:text-red-400 font-bold hover:bg-cath-red-700 hover:text-white hover:border-cath-red-700"
                          : "text-gray-700 dark:text-neutral-200 hover:border hover:border-cath-red-700 dark:hover:border-red-400 hover:text-cath-red-700 dark:hover:text-red-400"
                    }
                  `}
                >
                  {day}
                </button>
                {/* Event Indicator Bar */}
                {eventCount > 0 && (
                  <span
                    className={`absolute bottom-1 left-1/2 -translate-x-1/2 w-4 h-[2px] ${
                      isSelected
                        ? "bg-white"
                        : "bg-cath-red-700 dark:bg-red-400"
                    }`}
                  ></span>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* ── 3. Footer: Calendar Status Legend ── */}
      <div className="px-4 pb-4 grid grid-cols-1 sm:flex sm:items-center sm:justify-between gap-x-2 gap-y-2">
        {/* Today Legend */}
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-5 h-5 rounded-full border border-cath-red-700 dark:border-red-400 flex items-center justify-center">
            <span className="text-xs text-cath-red-700 dark:text-red-400 font-semibold">
              01
            </span>
          </div>
          <span className="text-sm text-gray-500 dark:text-neutral-400">
            {todayLegend}
          </span>
        </div>

        {/* Has Events Legend */}
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-5 h-5 flex items-center justify-center relative">
            <span className="text-xs text-gray-700 dark:text-neutral-300 font-semibold">
              01
            </span>
            <span className="absolute bottom-[2px] w-4 h-[2px] bg-cath-red-700 dark:bg-red-400"></span>
          </div>
          <span className="text-sm text-gray-500 dark:text-neutral-400">
            {t.calendar?.eventDayLegend || "Ngày sự kiện"}
          </span>
        </div>

        {/* Selected Day Legend */}
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-5 h-5 rounded-full bg-cath-red-700 flex items-center justify-center">
            <span className="text-xs text-white font-semibold">01</span>
          </div>
          <span className="text-sm text-gray-500 dark:text-neutral-400">
            {selectedDayLegend}
          </span>
        </div>
      </div>
    </div>
  )
}

export default CalendarMonthPanel
