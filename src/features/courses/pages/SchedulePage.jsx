import React, { useState, useMemo } from "react"
import { useNavigate } from "react-router-dom"
import { useLanguage } from "@/shared/context/LanguageContext"
import {
  useGetAllClassesQuery,
  useGetScheduleDatesQuery,
  useGetScheduleSessionsQuery
} from "@/store/api/coursesApi"
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  Calendar,
  Grid,
  CalendarDays,
  Plus,
  ArrowRight
} from "lucide-react"

import { formatUTCDate } from "../utils/courseUtils"

const SchedulePage = () => {
  const { language } = useLanguage()
  const navigate = useNavigate()

  // Local State
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [viewMode, setViewMode] = useState("calendar") // "calendar" or "grid"

  // Date Formatting Helper (yyyy-MM-dd)
  const formatDateToYYYYMMDD = (date) => {
    if (!date) return ""
    const y = date.getFullYear()
    const m = String(date.getMonth() + 1).padStart(2, "0")
    const d = String(date.getDate()).padStart(2, "0")
    return `${y}-${m}-${d}`
  }

  // Helper arrays for calendar
  const MONTHS_VI = [
    "Tháng 1", "Tháng 2", "Tháng 3", "Tháng 4", "Tháng 5", "Tháng 6",
    "Tháng 7", "Tháng 8", "Tháng 9", "Tháng 10", "Tháng 11", "Tháng 12"
  ]
  const MONTHS_EN = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ]
  const DAYS_OF_WEEK = language === "vi"
    ? ["HAI", "BA", "TƯ", "NĂM", "SÁU", "BẢY", "CHỦ NHẬT"]
    : ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"]

  // Calendar Calculations
  const year = currentMonth.getFullYear()
  const month = currentMonth.getMonth()

  const firstDayOfMonth = new Date(year, month, 1)
  let startDayOfWeek = firstDayOfMonth.getDay()
  // Adjust day of week (0 = Sunday, 1 = Monday, ..., 6 = Saturday) to (0 = Mon, ..., 6 = Sun)
  startDayOfWeek = startDayOfWeek === 0 ? 6 : startDayOfWeek - 1

  const daysInMonth = new Date(year, month + 1, 0).getDate()

  const calendarDays = useMemo(() => {
    const arr = []
    // Leading empty slots
    for (let i = 0; i < startDayOfWeek; i++) {
      arr.push(null)
    }
    // Days of month
    for (let d = 1; d <= daysInMonth; d++) {
      arr.push(new Date(year, month, d))
    }
    return arr
  }, [year, month, startDayOfWeek, daysInMonth])

  // Navigate Months
  const handlePrevMonth = () => {
    setCurrentMonth(new Date(year, month - 1, 1))
  }
  const handleNextMonth = () => {
    setCurrentMonth(new Date(year, month + 1, 1))
  }

  // Check state helpers
  const isToday = (date) => {
    if (!date) return false
    const today = new Date()
    return date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
  }

  const isSelected = (date) => {
    if (!date) return false
    return date.getDate() === selectedDate.getDate() &&
      date.getMonth() === selectedDate.getMonth() &&
      date.getFullYear() === selectedDate.getFullYear()
  }

  // YYYY-MM-DD Date Queries computed values
  const startOfMonthStr = useMemo(() => {
    const d = new Date(year, month, 1)
    return formatDateToYYYYMMDD(d)
  }, [year, month])

  const endOfMonthStr = useMemo(() => {
    const d = new Date(year, month + 1, 0)
    return formatDateToYYYYMMDD(d)
  }, [year, month])

  const selectedDateStr = useMemo(() => {
    return formatDateToYYYYMMDD(selectedDate)
  }, [selectedDate])

  // RTK Query endpoints integration
  const { data: classesData, isLoading: isClassesLoading } = useGetAllClassesQuery({ page: 1, pageSize: 100 })
  const { data: scheduleDatesData, isLoading: isDatesLoading } = useGetScheduleDatesQuery({
    from: startOfMonthStr,
    to: endOfMonthStr
  })
  const { data: scheduleSessionsData, isLoading: isSessionsLoading } = useGetScheduleSessionsQuery({
    from: selectedDateStr,
    to: selectedDateStr
  })

  const classesList = useMemo(() => classesData?.data || [], [classesData])
  const sessionDates = useMemo(() => scheduleDatesData?.dates || [], [scheduleDatesData])
  const isLoading = isClassesLoading || isDatesLoading || isSessionsLoading

  // Map schedule sessions and enrich with metadata from classesList (levels, slots, studentCount)
  const selectedDateClasses = useMemo(() => {
    const rawSessions = scheduleSessionsData?.data || []
    return rawSessions.map(session => {
      const matchedClass = classesList.find(c => c.id === session.class?.id)
      return {
        id: session.class?.id,
        name: session.class?.name || matchedClass?.name || "",
        language: session.class?.language || matchedClass?.language || "English",
        levels: matchedClass?.levels || [],
        status: session.class?.status || matchedClass?.status || "OPEN",
        startTime: session.startTime,
        endTime: session.endTime,
        sessionNumber: session.sessionNumber,
        totalSessions: session.totalSessions,
        studentCount: matchedClass?.studentCount || 0,
        slots: matchedClass?.slots || 10,
        startDate: matchedClass?.startDate
      }
    })
  }, [scheduleSessionsData, classesList])

  // Count active dates with sessions in current month
  const monthClassesCount = sessionDates.length

  return (
    <div className="flex flex-col gap-6 text-[#2e2e2e]">

      {/* ─── Breadcrumbs ─── */}
      <div className="text-xs text-gray-400 font-medium flex items-center gap-1.5">
        <span className="cursor-pointer hover:underline" onClick={() => navigate("/workspace")}>
          {language === "vi" ? "Trang chủ" : "Home"}
        </span>
        <span>/</span>
        <span className="text-[#990011] font-semibold">
          {language === "vi" ? "Lịch giảng dạy" : "Teaching Schedule"}
        </span>
      </div>

      {/* ─── Header ─── */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold tracking-tight text-gray-950">
          {language === "vi" ? "Lịch giảng dạy" : "Teaching Schedule"}
        </h1>
        <button
          onClick={() => navigate("/workspace/courses/create-class")}
          className="flex items-center justify-center gap-2 bg-[#990011] hover:bg-[#80000e] text-white px-5 py-2.5 rounded-full font-bold text-sm transition-all duration-200 shadow-sm hover:scale-[1.01] active:scale-95"
        >
          <Plus size={16} />
          <span>{language === "vi" ? "Tạo sự kiện" : "Create Event"}</span>
        </button>
      </div>

      {/* ─── Upcoming Section bar ─── */}
      <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex flex-col gap-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-4 bg-[#990011] rounded-full" />
            <h2 className="text-sm font-extrabold text-gray-800 uppercase tracking-wider flex items-center gap-2">
              <span>{language === "vi" ? "Lịch sắp tới" : "Upcoming Schedule"}</span>
              <span className="bg-[#F59E0B] text-white text-[11px] font-extrabold w-5 h-5 rounded-full flex items-center justify-center">
                {String(monthClassesCount)}
              </span>
            </h2>
          </div>
        </div>

        {/* ─── Split Columns Layout ─── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* Left Column: Calendar selector (Span 5 of 12) */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            <div className="border border-gray-100 bg-[#FDFDFD] rounded-2xl p-5 flex flex-col gap-5">

              {/* Month Selector header */}
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <button
                    onClick={handlePrevMonth}
                    className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-gray-800 transition-colors"
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <span className="text-sm font-extrabold text-gray-800">
                    {language === "vi"
                      ? `${MONTHS_VI[month]} ${year}`
                      : `${MONTHS_EN[month]} ${year}`
                    }
                  </span>
                  <button
                    onClick={handleNextMonth}
                    className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-gray-800 transition-colors"
                  >
                    <ChevronRight size={18} />
                  </button>
                </div>

                {/* View Mode controls */}
                <div className="flex bg-gray-100 p-0.5 rounded-lg">
                  <button
                    onClick={() => setViewMode("calendar")}
                    className={`p-1.5 rounded-md transition-all ${viewMode === "calendar" ? "bg-white text-[#990011] shadow-xs" : "text-gray-400"}`}
                  >
                    <CalendarDays size={14} />
                  </button>
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`p-1.5 rounded-md transition-all ${viewMode === "grid" ? "bg-white text-[#990011] shadow-xs" : "text-gray-400"}`}
                  >
                    <Grid size={14} />
                  </button>
                </div>
              </div>

              {/* Month Grid */}
              <div className="grid grid-cols-7 text-center gap-y-2.5 gap-x-1.5">
                {/* Weekday labels */}
                {DAYS_OF_WEEK.map((day, idx) => (
                  <span key={idx} className="text-[10px] font-black text-gray-400 uppercase tracking-wider py-1">
                    {day}
                  </span>
                ))}

                {/* Day numbers */}
                {calendarDays.map((date, idx) => {
                  if (!date) return <div key={idx} className="aspect-square" />

                  const hasClasses = sessionDates.includes(formatDateToYYYYMMDD(date))
                  const active = isSelected(date)
                  const today = isToday(date)

                  return (
                    <button
                      key={idx}
                      onClick={() => setSelectedDate(date)}
                      className={`relative aspect-square flex items-center justify-center text-xs font-bold rounded-full transition-all duration-200 select-none
                        ${active
                          ? "bg-[#990011] text-white shadow-sm hover:bg-[#80000e]"
                          : today
                            ? "border border-[#990011] text-[#990011] hover:bg-red-50/30"
                            : "text-gray-700 hover:bg-gray-100"
                        }
                      `}
                    >
                      <span>{date.getDate()}</span>

                      {/* Class indicator dot */}
                      {hasClasses && !active && (
                        <span className={`absolute bottom-1 w-1 h-1 rounded-full ${today ? "bg-[#990011]" : "bg-gray-400"}`} />
                      )}
                    </button>
                  )
                })}
              </div>

              {/* Calendar Legends */}
              <div className="flex items-center gap-6 pt-4 border-t border-gray-50 text-[10px] font-extrabold text-gray-500 uppercase tracking-wider">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full border border-[#990011] flex items-center justify-center text-[9px] text-[#990011] font-bold">18</div>
                  <span>{language === "vi" ? "Ngày hôm nay" : "Today"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-[#990011] flex items-center justify-center text-[9px] text-white font-bold">20</div>
                  <span>{language === "vi" ? "Ngày được chọn" : "Selected Date"}</span>
                </div>
              </div>

            </div>
          </div>

          {/* Right Column: Classes Scheduled (Span 7 of 12) */}
          <div className="lg:col-span-7 flex flex-col gap-5">
            <h3 className="text-sm font-extrabold text-gray-800 uppercase tracking-wider flex items-center gap-2 pb-1 border-b border-gray-100">
              <span>{language === "vi" ? "Lịch học của tôi" : "My Schedule"}</span>
            </h3>

            {isLoading ? (
              <div className="flex justify-center items-center py-10">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#990011]"></div>
              </div>
            ) : selectedDateClasses.length > 0 ? (
              <div className="flex flex-col gap-4">
                <span className="text-[11px] font-black text-gray-400 uppercase tracking-wider">
                  {language === "vi" ? "Ngày" : "Date"} {selectedDate.toLocaleDateString(language === "vi" ? "vi-VN" : "en-US", { day: "numeric", month: "numeric" })}
                </span>

                {selectedDateClasses.map((cls) => {
                  const scheduleTime = cls.startTime && cls.endTime
                    ? `${cls.startTime} - ${cls.endTime}`
                    : "TBA"

                  return (
                    <div
                      key={cls.id}
                      onClick={() => navigate(`/workspace/courses/class/${cls.id}`)}
                      className="bg-[#FDFDFD] border border-gray-100 hover:border-gray-250 rounded-2xl p-5 flex flex-col gap-3 shadow-xs hover:shadow-sm transition-all duration-300 cursor-pointer"
                    >
                      <div className="flex justify-between items-start">
                        {/* Pills */}
                        <div className="flex flex-wrap gap-1.5">
                          {cls.language && (
                            <span className="bg-[#F59E0B] text-white text-[10px] font-extrabold px-2.5 py-0.5 rounded-md uppercase tracking-wider">
                              {cls.language}
                            </span>
                          )}
                          {cls.levels && cls.levels.map((lvl, index) => (
                            <span key={index} className="bg-amber-600 text-white text-[10px] font-extrabold px-2.5 py-0.5 rounded-md uppercase">
                              {lvl}
                            </span>
                          ))}
                        </div>

                        {/* Status badge */}
                        <div>
                          {cls.status === "LIVE" && (
                            <span className="bg-[#FFE4E6] text-[#E11D48] font-bold text-[9px] px-2 py-0.5 rounded-md flex items-center gap-1">
                              <span className="w-1 h-1 rounded-full bg-[#E11D48] animate-ping" />
                              LIVE
                            </span>
                          )}
                          {(cls.status === "TEACHING" || !cls.status) && (
                            <span className="bg-[#E8F8F0] text-[#15803D] font-bold text-[9px] px-2 py-0.5 rounded-md">
                              LIVE ROOM
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Class Title */}
                      <h4 className="font-extrabold text-[#1f2937] text-base leading-snug">
                        {cls.name}
                      </h4>

                      {/* Schedule info under title */}
                      <div className="flex flex-col gap-1.5 text-xs text-gray-500 font-semibold">
                        <div className="flex items-center gap-1.5">
                          <Clock size={13} className="text-gray-400" />
                          <span>{scheduleTime}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Calendar size={13} className="text-gray-400" />
                          <span>
                            {cls.sessionNumber
                              ? (language === "vi" ? `Buổi ${cls.sessionNumber} / ${cls.totalSessions}` : `Session ${cls.sessionNumber} of ${cls.totalSessions}`)
                              : formatUTCDate(cls.startDate, "en-GB", { day: "2-digit", month: "short", year: "numeric" })
                            }
                          </span>
                        </div>
                      </div>

                      {/* Bottom Info: Avatars and action */}
                      <div className="flex justify-between items-center pt-3 border-t border-gray-50 mt-1">
                        <div className="flex items-center gap-2">
                          <div className="flex -space-x-1.5">
                            {/* Stub student avatar styles */}
                            <div className="w-7 h-7 rounded-full bg-gray-200 border border-white flex items-center justify-center text-[10px] font-extrabold">S1</div>
                            <div className="w-7 h-7 rounded-full bg-gray-300 border border-white flex items-center justify-center text-[10px] font-extrabold">S2</div>
                          </div>
                          <span className="text-[10px] text-gray-400 font-bold">
                            {cls.studentCount || 0} student{(cls.studentCount || 0) !== 1 ? "s" : ""}
                          </span>
                        </div>

                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            navigate(`/workspace/courses/class/${cls.id}`)
                          }}
                          className="bg-[#990011] hover:bg-[#80000e] text-white text-[11px] font-bold px-4 py-1.5 rounded-full flex items-center gap-1.5 transition-all active:scale-95 shadow-xs"
                        >
                          <span>{language === "vi" ? "Vào phòng" : "View Class"}</span>
                          <ArrowRight size={12} />
                        </button>
                      </div>

                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="py-12 text-center text-xs font-semibold text-gray-400 border border-dashed border-gray-200 rounded-2xl bg-gray-50/50">
                {language === "vi" ? "Không có lịch học cho ngày này" : "No classes scheduled for this date"}
              </div>
            )}

          </div>

        </div>

      </div>

    </div>
  )
}

export default SchedulePage
