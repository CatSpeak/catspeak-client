import React, { useState, useMemo } from "react"
import dayjs from "dayjs"
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  CalendarDays,
  Clock,
} from "lucide-react"
import { useLanguage } from "@/shared/context/LanguageContext"
import { useTimezone } from "@/shared/hooks/useTimezone"
import { getShiftedDayOfWeek } from "@/shared/utils/dateUtils"

const DAY_INDEX_MAP = {
  SUN: 0,
  MON: 1,
  TUE: 2,
  WED: 3,
  THU: 4,
  FRI: 5,
  SAT: 6,
}

const PublicClassScheduleCard = ({ classData }) => {
  const { t, language } = useLanguage()
  const {
    userTimeZone,
    formatScheduleDays,
    formatScheduleTime,
    formatDate,
    getZoneDateStr,
  } = useTimezone()
  const c = t.courses || {}
  const pc = c.publicClass || {}

  // 1. Identify start date and end date
  const rawStartDate =
    classData?.startDate || classData?.start_date || classData?.admissionStart
  const rawEndDate =
    classData?.endDate || classData?.end_date || classData?.admissionEnd

  // Schedule days list & session times (supporting both array and object formats)
  const rawSchedule = classData?.schedule
  const rawDays = useMemo(() => {
    if (Array.isArray(rawSchedule)) {
      return rawSchedule.map((s) => s.dayOfWeek).filter(Boolean)
    }
    return rawSchedule?.days || []
  }, [rawSchedule])

  const firstSchedule =
    Array.isArray(rawSchedule) && rawSchedule.length > 0
      ? rawSchedule[0]
      : rawSchedule
  const startTime = firstSchedule?.startTime
  const endTime = firstSchedule?.endTime

  // Modified Sessions list
  const modifiedSessions = useMemo(() => {
    if (!Array.isArray(classData?.modifiedSessions)) return []
    return classData.modifiedSessions
  }, [classData?.modifiedSessions])

  // Map modified sessions by localized date string (YYYY-MM-DD)
  const modifiedSessionsByDate = useMemo(() => {
    const map = new Map()
    modifiedSessions.forEach((session) => {
      if (!session?.date) return
      const dateKey = getZoneDateStr(session.date, session.startTime)
      if (dateKey) {
        map.set(dateKey, session)
      }
    })
    return map
  }, [modifiedSessions, getZoneDateStr])

  // Calculate days of week indices that have class
  const classDayIndices = useMemo(() => {
    if (!Array.isArray(rawDays) || rawDays.length === 0) return new Set()
    const set = new Set()
    rawDays.forEach((dayStr) => {
      const shifted = getShiftedDayOfWeek(dayStr, startTime, userTimeZone)
      const upper = String(shifted || "").toUpperCase()
      if (DAY_INDEX_MAP[upper] !== undefined) {
        set.add(DAY_INDEX_MAP[upper])
      }
    })
    return set
  }, [rawDays, startTime, userTimeZone])

  // 2. Estimate End Date if not directly provided in classData
  const effectiveEndDate = useMemo(() => {
    if (rawEndDate) return rawEndDate
    const total = Number(
      classData?.totalSessions || classData?.sessionsCount || 0,
    )
    if (!rawStartDate || !total || total <= 1 || classDayIndices.size === 0)
      return null

    const start = dayjs(rawStartDate)
    if (!start.isValid()) return null

    let current = start
    let sessionCount = 0
    // Walk forward up to 365 days to find the final session date
    for (let i = 0; i < 365; i++) {
      if (classDayIndices.has(current.day())) {
        sessionCount++
        if (sessionCount >= total) {
          return current.toISOString()
        }
      }
      current = current.add(1, "day")
    }
    return null
  }, [
    rawEndDate,
    rawStartDate,
    classData?.totalSessions,
    classData?.sessionsCount,
    classDayIndices,
  ])

  // 3. Compute earliest date (minimum among schedule start and all modified sessions)
  // and latest date (maximum among schedule end and all modified sessions)
  const earliestDate = useMemo(() => {
    let earliest = null

    if (rawStartDate && dayjs(rawStartDate).isValid()) {
      earliest = dayjs(rawStartDate)
    }

    modifiedSessions.forEach((s) => {
      if (!s?.date) return
      const d = dayjs(s.date)
      if (d.isValid()) {
        if (!earliest || d.isBefore(earliest, "day")) {
          earliest = d
        }
      }
    })

    return earliest
  }, [rawStartDate, modifiedSessions])

  const latestDate = useMemo(() => {
    let latest = null

    const endTarget = rawEndDate || effectiveEndDate
    if (endTarget && dayjs(endTarget).isValid()) {
      latest = dayjs(endTarget)
    } else if (rawStartDate && dayjs(rawStartDate).isValid()) {
      latest = dayjs(rawStartDate)
    }

    modifiedSessions.forEach((s) => {
      if (!s?.date) return
      const d = dayjs(s.date)
      if (d.isValid()) {
        if (!latest || d.isAfter(latest, "day")) {
          latest = d
        }
      }
    })

    return latest
  }, [rawEndDate, effectiveEndDate, rawStartDate, modifiedSessions])

  // Formatted date range strings
  const formattedStartDate = useMemo(() => {
    if (!earliestDate) return null
    return earliestDate.isValid() ? formatDate(earliestDate.toISOString()) : null
  }, [earliestDate, formatDate])

  const formattedEndDate = useMemo(() => {
    if (!latestDate) return null
    return latestDate.isValid() ? formatDate(latestDate.toISOString()) : null
  }, [latestDate, formatDate])

  const dateRangeText = useMemo(() => {
    if (
      formattedStartDate &&
      formattedEndDate &&
      earliestDate &&
      latestDate &&
      !earliestDate.isSame(latestDate, "day")
    ) {
      return `${formattedStartDate} – ${formattedEndDate}`
    }
    if (formattedStartDate) {
      return `${c.student?.startsOn || pc.startsOn || "Khai giảng:"} ${formattedStartDate}`
    }
    return null
  }, [
    formattedStartDate,
    formattedEndDate,
    earliestDate,
    latestDate,
    c.student?.startsOn,
    pc.startsOn,
  ])

  // Initial display month (defaults to earliest date if available)
  const initialDate = useMemo(() => {
    if (earliestDate && earliestDate.isValid()) {
      return earliestDate
    }
    return dayjs()
  }, [earliestDate])

  const [currentMonth, setCurrentMonth] = useState(initialDate)

  // Calendar dates generation (Monday first)
  const startDay = (currentMonth.startOf("month").day() + 6) % 7 // Monday = 0
  const daysInMonth = currentMonth.daysInMonth()
  const prevMonthDays = currentMonth.subtract(1, "month").daysInMonth()

  const startDayjs =
    rawStartDate && dayjs(rawStartDate).isValid()
      ? dayjs(rawStartDate).startOf("day")
      : null
  const endDayjs =
    effectiveEndDate && dayjs(effectiveEndDate).isValid()
      ? dayjs(effectiveEndDate).endOf("day")
      : null

  const calendarDates = useMemo(() => {
    const arr = []
    // Leading previous month days
    for (let i = 0; i < startDay; i++) {
      arr.push({
        day: prevMonthDays - startDay + 1 + i,
        isCurrentMonth: false,
        date: currentMonth
          .subtract(1, "month")
          .date(prevMonthDays - startDay + 1 + i),
      })
    }
    // Days of current month
    for (let d = 1; d <= daysInMonth; d++) {
      const dateObj = currentMonth.date(d)
      const dayOfWeek = dateObj.day()
      const dateKey = dateObj.format("YYYY-MM-DD")

      const isWithinDuration =
        (!startDayjs ||
          dateObj.isSame(startDayjs, "day") ||
          dateObj.isAfter(startDayjs, "day")) &&
        (!endDayjs ||
          dateObj.isSame(endDayjs, "day") ||
          dateObj.isBefore(endDayjs, "day"))

      const isClassDay = classDayIndices.has(dayOfWeek) && isWithinDuration
      const modifiedSession = modifiedSessionsByDate.get(dateKey)
      const isModifiedSession = Boolean(modifiedSession)

      arr.push({
        day: d,
        isCurrentMonth: true,
        date: dateObj,
        dateKey,
        isClassDay,
        isModifiedSession,
        modifiedSession,
      })
    }
    // Trailing days to fill 35 or 42 slots
    const totalSlots = arr.length > 35 ? 42 : 35
    const trailingCount = totalSlots - arr.length
    for (let i = 1; i <= trailingCount; i++) {
      arr.push({
        day: i,
        isCurrentMonth: false,
        date: currentMonth.add(1, "month").date(i),
      })
    }
    return arr
  }, [
    currentMonth,
    startDay,
    daysInMonth,
    prevMonthDays,
    classDayIndices,
    startDayjs,
    endDayjs,
    modifiedSessionsByDate,
  ])

  // Localized Month string
  const monthNum = currentMonth.format("M")
  const yearNum = currentMonth.format("YYYY")
  let localizedMonth = `Tháng ${monthNum}, ${yearNum}`
  if (language === "en") {
    localizedMonth = `${currentMonth.locale("en").format("MMMM")} ${yearNum}`
  } else if (language === "zh") {
    localizedMonth = `${yearNum}年 ${monthNum}月`
  }

  // Weekday labels in short localized format (T2, T3... CN)
  const DAY_LABELS = useMemo(() => {
    if (language === "vi") {
      return ["T2", "T3", "T4", "T5", "T6", "T7", "CN"]
    }
    if (language === "zh") {
      return ["一", "二", "三", "四", "五", "六", "日"]
    }
    return ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"]
  }, [language])

  // Schedule text summary
  const defaultScheduleText = pc.flexibleSchedule || "Lịch linh hoạt"
  const scheduleDaysText = formatScheduleDays(
    rawDays,
    defaultScheduleText,
    " - ",
    startTime,
  )

  const scheduleDaysWithModifiedText =
    modifiedSessions.length > 0
      ? (pc.scheduleWithModified || "{{schedule}} và {{count}} buổi ngoại lệ")
          .replace("{{schedule}}", scheduleDaysText)
          .replace("{{count}}", modifiedSessions.length)
      : scheduleDaysText

  const timeFormatted =
    startTime && endTime
      ? `${formatScheduleTime(startTime)} - ${formatScheduleTime(endTime)}`
      : startTime
        ? formatScheduleTime(startTime)
        : null

  const handlePrevMonth = () => {
    setCurrentMonth((prev) => prev.subtract(1, "month"))
  }

  const handleNextMonth = () => {
    setCurrentMonth((prev) => prev.add(1, "month"))
  }

  return (
    <div className="bg-white border border-border rounded-3xl p-5 flex flex-col gap-3.5 shadow-xs">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CalendarIcon size={18} className="text-[#b20a1c]" />
          <h3 className="text-base font-bold text-slate-950">
            {pc.scheduleTitle || "Lịch học"}
          </h3>
        </div>

        {/* Month Navigation */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={handlePrevMonth}
            className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-slate-100 text-slate-600 transition-colors cursor-pointer"
            aria-label="Previous month"
          >
            <ChevronLeft size={16} />
          </button>
          <span className="text-xs font-bold text-slate-800 min-w-[96px] text-center">
            {localizedMonth}
          </span>
          <button
            type="button"
            onClick={handleNextMonth}
            className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-slate-100 text-slate-600 transition-colors cursor-pointer"
            aria-label="Next month"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Quick Jump Buttons */}
      <div className="flex items-center justify-center gap-1.5 flex-wrap">
        <button
          type="button"
          onClick={() => setCurrentMonth(dayjs())}
          className={`px-2.5 py-0.5 rounded-full text-[11px] font-medium transition-colors border cursor-pointer ${
            currentMonth.isSame(dayjs(), "day")
              ? "bg-slate-900 text-white border-slate-900 font-bold"
              : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100 hover:text-slate-900"
          }`}
        >
          {pc.jumpToday || "Hôm nay"}
        </button>
        {earliestDate && earliestDate.isValid() && (
          <button
            type="button"
            onClick={() => setCurrentMonth(earliestDate)}
            className={`px-2.5 py-0.5 rounded-full text-[11px] font-medium transition-colors border cursor-pointer ${
              currentMonth.isSame(earliestDate, "day")
                ? "bg-slate-900 text-white border-slate-900 font-bold"
                : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100 hover:text-slate-900"
            }`}
          >
            {pc.jumpStart || "Bắt đầu"}
          </button>
        )}
        {latestDate && latestDate.isValid() && (
          <button
            type="button"
            onClick={() => setCurrentMonth(latestDate)}
            className={`px-2.5 py-0.5 rounded-full text-[11px] font-medium transition-colors border cursor-pointer ${
              currentMonth.isSame(latestDate, "day")
                ? "bg-slate-900 text-white border-slate-900 font-bold"
                : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100 hover:text-slate-900"
            }`}
          >
            {pc.jumpEnd || "Kết thúc"}
          </button>
        )}
      </div>

      {/* Weekday Header */}
      <div className="grid grid-cols-7 gap-1 text-center border-b border-slate-100 pb-2">
        {DAY_LABELS.map((label, idx) => (
          <div
            key={idx}
            className="text-[11px] font-bold text-slate-400 uppercase tracking-tight"
          >
            {label}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1">
        {calendarDates.map((item, idx) => {
          if (!item.isCurrentMonth) {
            return (
              <div
                key={`empty-${idx}`}
                className="h-8 flex items-center justify-center text-xs text-slate-300 select-none"
              >
                {item.day}
              </div>
            )
          }

          const isToday =
            item.day === dayjs().date() && currentMonth.isSame(dayjs(), "month")

          let badgeClass = "text-slate-700"
          let titleText = ""

          if (item.isModifiedSession) {
            const mSession = item.modifiedSession
            const mTime =
              mSession?.startTime && mSession?.endTime
                ? `${formatScheduleTime(mSession.startTime, mSession.date)} - ${formatScheduleTime(mSession.endTime, mSession.date)}`
                : mSession?.startTime
                  ? formatScheduleTime(mSession.startTime, mSession.date)
                  : ""
            titleText = `${pc.modifiedSession || "Buổi ngoại lệ"}${mTime ? `: ${mTime}` : ""}`
            badgeClass = isToday
              ? "bg-amber-100 text-amber-900 border border-slate-900 font-bold"
              : "bg-amber-100 text-amber-900 font-bold"
          } else if (item.isClassDay) {
            titleText = pc.classDayLegend || "Ngày có buổi học"
            badgeClass = isToday
              ? "bg-rose-50 text-[#b20a1c] font-bold border border-slate-900"
              : "bg-rose-50 text-[#b20a1c] font-bold"
          } else if (isToday) {
            titleText = pc.todayLegend || "Hôm nay"
            badgeClass = "border border-slate-900 text-slate-900 font-bold"
          }

          return (
            <div
              key={`day-${idx}`}
              className="h-8 flex items-center justify-center relative"
            >
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold select-none ${badgeClass}`}
                title={titleText}
              >
                {item.day}
              </div>
            </div>
          )
        })}
      </div>

      {/* Schedule & Duration Info Summary */}
      <div className="pt-3 border-t border-slate-100 flex flex-col gap-2.5">
        {dateRangeText && (
          <div className="flex items-center gap-2 text-xs font-medium text-slate-700">
            <CalendarDays size={14} className="text-[#b20a1c] shrink-0" />
            <span>{dateRangeText}</span>
          </div>
        )}
        <div className="flex items-center gap-2 text-xs font-medium text-slate-700">
          <CalendarIcon size={14} className="text-[#b20a1c] shrink-0" />
          <span>{scheduleDaysWithModifiedText}</span>
        </div>
        {timeFormatted && (
          <div className="flex items-center gap-2 text-xs font-medium text-slate-700">
            <Clock size={14} className="text-[#b20a1c] shrink-0" />
            <span>{timeFormatted}</span>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-3.5 text-[11px] text-slate-500 font-medium pt-1 flex-wrap">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-[#b20a1c]" />
          <span>{pc.classDayLegend || "Ngày học"}</span>
        </div>
        {modifiedSessions.length > 0 && (
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            <span>{pc.modifiedSessionLegend || "Buổi ngoại lệ"}</span>
          </div>
        )}
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full border border-slate-900" />
          <span>{pc.todayLegend || "Hôm nay"}</span>
        </div>
      </div>
    </div>
  )
}

export default PublicClassScheduleCard
