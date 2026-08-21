import React, { useState, useMemo, useEffect } from "react"
import dayjs from "dayjs"
import utc from "dayjs/plugin/utc"
import timezone from "dayjs/plugin/timezone"
import { ChevronLeft, ChevronRight, Calendar, Table } from "lucide-react"
import { useLanguage } from "@/shared/context/LanguageContext"
import { useTimezone } from "@/shared/hooks/useTimezone"
import { useGetScheduleSessionsQuery } from "@/store/api/coursesApi"
import {
  DAY_MAP,
  WEEKDAYS,
  computeClassScheduleDates,
} from "../utils/scheduleUtils"

dayjs.extend(utc)
dayjs.extend(timezone)

const ClassScheduleCalendarPreview = ({
  startDate,
  sessions = 0,
  checkedDays = {},
  timeSlots = {},
  editingClassId = "",
}) => {
  const { t, language } = useLanguage()
  const { userTimeZone, getZoneDateStr, formatScheduleTime } = useTimezone()
  const cc = t?.courses?.createClass || {}

  // Mode: "calendar" | "list"
  const [viewMode, setViewMode] = useState("calendar")

  // Current view date (month navigation) in user's timezone
  const [currentViewDate, setCurrentViewDate] = useState(() => {
    if (startDate && dayjs(startDate).isValid()) {
      return dayjs.tz(startDate, userTimeZone).startOf("month")
    }
    return dayjs().tz(userTimeZone).startOf("month")
  })

  // Sync view month when startDate changes
  useEffect(() => {
    if (startDate && dayjs(startDate).isValid()) {
      setCurrentViewDate(dayjs.tz(startDate, userTimeZone).startOf("month"))
    }
  }, [startDate, userTimeZone])

  // Range of dates for fetching instructor's other schedules
  const fromDateStr = useMemo(
    () => currentViewDate.tz(userTimeZone).startOf("month").format("YYYY-MM-DD"),
    [currentViewDate, userTimeZone]
  )
  const toDateStr = useMemo(
    () => currentViewDate.tz(userTimeZone).endOf("month").format("YYYY-MM-DD"),
    [currentViewDate, userTimeZone]
  )

  const { data: scheduleData } = useGetScheduleSessionsQuery(
    { from: fromDateStr, to: toDateStr },
    { skip: !fromDateStr || !toDateStr }
  )

  // Other scheduled dates of the instructor in this month (underlined dates in user's timezone)
  const otherScheduleDatesSet = useMemo(() => {
    const rawSessions = scheduleData?.data || []
    const dates = new Set()
    rawSessions.forEach((s) => {
      const zoneDate = getZoneDateStr(s.date, s.startTime) || (s.date ? String(s.date).slice(0, 10) : "")
      if (zoneDate && (!editingClassId || String(s.class?.id) !== String(editingClassId))) {
        dates.add(zoneDate)
      }
    })
    return dates
  }, [scheduleData, editingClassId, getZoneDateStr])

  // Compute all scheduled dates for the current class based on startDate, sessions count & checkedDays
  const computedClassDates = useMemo(() => {
    return computeClassScheduleDates(startDate, sessions, checkedDays, userTimeZone)
  }, [startDate, sessions, checkedDays, userTimeZone])

  const currentClassDatesSet = useMemo(() => {
    return new Set(computedClassDates.map((item) => item.dateStr))
  }, [computedClassDates])

  // Month navigation handlers
  const handlePrevMonth = () => {
    setCurrentViewDate((prev) => prev.tz(userTimeZone).subtract(1, "month"))
  }

  const handleNextMonth = () => {
    setCurrentViewDate((prev) => prev.tz(userTimeZone).add(1, "month"))
  }

  // Localized Month & Year header title
  const monthYearTitle = useMemo(() => {
    if (language === "vi") {
      return `Tháng ${currentViewDate.month() + 1} ${currentViewDate.year()}`
    } else if (language === "zh") {
      return `${currentViewDate.year()}年${currentViewDate.month() + 1}月`
    }
    return currentViewDate.format("MMMM YYYY")
  }, [currentViewDate, language])

  // Month calendar grid calculation
  const calendarCells = useMemo(() => {
    const year = currentViewDate.year()
    const month = currentViewDate.month() // 0-11
    const firstDay = new Date(year, month, 1)
    const daysInMonth = new Date(year, month + 1, 0).getDate()

    // Monday-based start: 0 = Mon, ..., 6 = Sun
    const startCol = (firstDay.getDay() + 6) % 7

    const cells = []
    // Leading blanks
    for (let i = 0; i < startCol; i++) {
      cells.push({ type: "empty", key: `empty-${i}` })
    }

    const today = dayjs().tz(userTimeZone).startOf("day")

    // Days in current month
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`
      const isCurrentSchedule = currentClassDatesSet.has(dateStr)
      const isOtherSchedule = otherScheduleDatesSet.has(dateStr)
      const isPast = dayjs.tz(dateStr, userTimeZone).isBefore(today)

      cells.push({
        type: "day",
        key: `day-${d}`,
        dayNumber: d,
        dayFormatted: String(d).padStart(2, "0"),
        dateStr,
        isCurrentSchedule,
        isOtherSchedule,
        isPast,
      })
    }

    return cells
  }, [currentViewDate, currentClassDatesSet, otherScheduleDatesSet, userTimeZone])

  return (
    <div className="bg-white rounded-3xl p-6 border border-border/80 shadow-sm flex flex-col gap-4 select-none w-full">
      {/* ─── Header: Month Navigation & View Switcher ─── */}
      <div className="flex items-center justify-between">
        {/* Left: Navigation and Title */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handlePrevMonth}
            className="text-gray-400 hover:text-gray-700 transition-colors p-1 rounded-full hover:bg-gray-100 cursor-pointer"
            aria-label="Previous month"
          >
            <ChevronLeft size={18} />
          </button>

          <span className="font-bold text-gray-800 text-base">
            {monthYearTitle}
          </span>

          <button
            type="button"
            onClick={handleNextMonth}
            className="text-[#990011] hover:text-[#80000e] transition-colors p-1 rounded-full hover:bg-rose-50 cursor-pointer"
            aria-label="Next month"
          >
            <ChevronRight size={18} />
          </button>
        </div>

        {/* Right: Mode Switcher (List / Calendar) */}
        <div className="bg-gray-100/90 p-1 rounded-full flex items-center gap-0.5">
          <button
            type="button"
            onClick={() => setViewMode("list")}
            className={`p-1.5 rounded-full transition-all cursor-pointer ${
              viewMode === "list"
                ? "bg-[#990011] text-white shadow-sm"
                : "text-gray-500 hover:text-gray-800"
            }`}
            title="List view"
          >
            <Table size={14} />
          </button>

          <button
            type="button"
            onClick={() => setViewMode("calendar")}
            className={`p-1.5 rounded-full transition-all cursor-pointer ${
              viewMode === "calendar"
                ? "bg-[#990011] text-white shadow-sm"
                : "text-gray-500 hover:text-gray-800"
            }`}
            title="Calendar view"
          >
            <Calendar size={14} />
          </button>
        </div>
      </div>

      <div className="border-b border-gray-100" />

      {/* ─── Content View ─── */}
      {viewMode === "calendar" ? (
        <div className="flex flex-col gap-2">
          {/* Weekday column headers */}
          <div className="grid grid-cols-7 text-center font-bold text-xs text-gray-800 tracking-wider py-1">
            {WEEKDAYS.map((wd) => (
              <div key={wd} className="text-center">
                {wd}
              </div>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-y-3 gap-x-1 items-center justify-items-center py-2">
            {calendarCells.map((cell) => {
              if (cell.type === "empty") {
                return <div key={cell.key} className="w-10 h-10" />
              }

              // 1. Current class session in the PAST -> Gray circle
              if (cell.isCurrentSchedule && cell.isPast) {
                return (
                  <div
                    key={cell.key}
                    className="w-10 h-10 rounded-full bg-gray-200/90 flex items-center justify-center font-bold text-sm text-gray-500 transition-transform hover:scale-105"
                  >
                    {cell.isOtherSchedule ? (
                      <span className="underline underline-offset-4 decoration-1 decoration-gray-400">
                        {cell.dayFormatted}
                      </span>
                    ) : (
                      cell.dayFormatted
                    )}
                  </div>
                )
              }

              // 2. Current class session in the FUTURE / TODAY -> Pink circle
              if (cell.isCurrentSchedule && !cell.isPast) {
                return (
                  <div
                    key={cell.key}
                    className="w-10 h-10 rounded-full bg-[#ffebee] flex items-center justify-center font-bold text-sm text-[#990011] transition-transform hover:scale-105"
                  >
                    {cell.isOtherSchedule ? (
                      <span className="underline underline-offset-4 decoration-1 decoration-[#990011]">
                        {cell.dayFormatted}
                      </span>
                    ) : (
                      cell.dayFormatted
                    )}
                  </div>
                )
              }

              // 3. Other schedule (NOT a session of this class) -> Underline ONLY, NO circle
              if (cell.isOtherSchedule) {
                return (
                  <div
                    key={cell.key}
                    className={`w-10 h-10 flex items-center justify-center font-semibold text-sm underline underline-offset-4 decoration-1 ${
                      cell.isPast ? "text-gray-400 decoration-gray-400" : "text-gray-800 decoration-gray-500"
                    }`}
                  >
                    {cell.dayFormatted}
                  </div>
                )
              }

              // 4. Regular day -> Normal plain text
              return (
                <div
                  key={cell.key}
                  className={`w-10 h-10 flex items-center justify-center font-semibold text-sm ${
                    cell.isPast ? "text-gray-400" : "text-gray-700"
                  }`}
                >
                  {cell.dayFormatted}
                </div>
              )
            })}
          </div>
        </div>
      ) : (
        /* ─── List View of sessions ─── */
        <div className="flex flex-col gap-2 max-h-[300px] overflow-y-auto pr-1">
          {computedClassDates.length === 0 ? (
            <p className="text-xs text-gray-400 py-6 text-center italic">
              {cc.noScheduleSelected || "Chưa có lịch dạy nào được cấu hình."}
            </p>
          ) : (
            computedClassDates.map((item, idx) => {
              const timeSlot = timeSlots[item.dayKey] || {}
              const timeStr = timeSlot.start && timeSlot.end ? `${timeSlot.start} - ${timeSlot.end}` : ""
              const dayFull = cc.days?.[item.dayKey]?.full || cc.days?.[item.dayKey]?.short || item.dayKey
              const isPast = dayjs.tz(item.dateStr, userTimeZone).isBefore(dayjs().tz(userTimeZone).startOf("day"))

              return (
                <div
                  key={item.dateStr}
                  className={`flex items-center justify-between py-2 px-3 rounded-xl border text-xs ${
                    isPast
                      ? "bg-gray-100/70 border-gray-200 text-gray-400"
                      : "bg-gray-50/80 border-gray-100 text-gray-800"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-5 h-5 rounded-full font-bold text-[10px] flex items-center justify-center shrink-0 ${
                        isPast ? "bg-gray-400 text-white" : "bg-[#990011] text-white"
                      }`}
                    >
                      {idx + 1}
                    </span>
                    <span className={`font-bold ${isPast ? "text-gray-500" : "text-gray-800"}`}>{dayFull}</span>
                    <span className="text-gray-400 font-medium">({item.dateStr})</span>
                  </div>
                  {timeStr && (
                    <span className="font-semibold text-gray-600 bg-white px-2 py-0.5 rounded border border-gray-200">
                      {timeStr}
                    </span>
                  )}
                </div>
              )
            })
          )}
        </div>
      )}

      {/* ─── Footer Legend ─── */}
      <div className="pt-4 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-500 font-medium flex-wrap gap-2">
        {/* Left Legend: Ngày có lịch khác */}
        <div className="flex items-center gap-1.5">
          <span className="underline underline-offset-4 decoration-gray-500 font-semibold text-gray-800 text-xs">
            01
          </span>
          <span>{cc.legendOtherSchedule || "Ngày có lịch khác"}</span>
        </div>

        {/* Middle Legend: Đã qua */}
        <div className="flex items-center gap-1.5">
          <span className="w-5 h-5 rounded-full bg-gray-200 text-gray-500 font-bold text-[10px] flex items-center justify-center">
            01
          </span>
          <span>{cc.legendPastSchedule || "Đã qua"}</span>
        </div>

        {/* Right Legend: Lịch dạy hiện tại */}
        <div className="flex items-center gap-1.5">
          <span className="w-5 h-5 rounded-full bg-[#ffebee] text-[#990011] font-bold text-[10px] flex items-center justify-center">
            01
          </span>
          <span>{cc.legendCurrentSchedule || "Lịch dạy hiện tại"}</span>
        </div>
      </div>
    </div>
  )
}

export default ClassScheduleCalendarPreview
