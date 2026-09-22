import React, { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Clock, Users, ArrowRight, ChevronDown, ChevronUp } from "lucide-react"
import { formatTeacherPrice, getSlotStatusColor } from "../utils/teacherUtils"
import { useLanguage } from "@/shared/context/LanguageContext"

const DAY_MAP_VI = {
  Monday: "Thứ 2",
  Tuesday: "Thứ 3",
  Wednesday: "Thứ 4",
  Thursday: "Thứ 5",
  Friday: "Thứ 6",
  Saturday: "Thứ 7",
  Sunday: "Chủ nhật",
  Mon: "Thứ 2",
  Tue: "Thứ 3",
  Wed: "Thứ 4",
  Thu: "Thứ 5",
  Fri: "Thứ 6",
  Sat: "Thứ 7",
  Sun: "Chủ nhật",
}

const MONTH_NAMES = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
]

/**
 * Format schedule entries into a readable string
 * e.g. "Thứ 5 - Thứ 7 | 13:00 - 14:30"
 */
const formatScheduleString = (scheduleList) => {
  if (!Array.isArray(scheduleList) || scheduleList.length === 0) {
    return "Lịch học linh hoạt"
  }
  const days = scheduleList
    .map((s) => DAY_MAP_VI[s.dayOfWeek] || s.dayOfWeek)
    .filter(Boolean)
    .join(" - ")
  const first = scheduleList[0]
  const time =
    first?.startTime && first?.endTime
      ? ` | ${first.startTime.slice(0, 5)} - ${first.endTime.slice(0, 5)}`
      : ""
  return `${days}${time}`
}

/**
 * Card hiển thị lớp học công khai đang mở của Giảng viên (BR-EX-GV-08, BR-EX-GV-14)
 */
const TeacherOpenClassCard = ({ classItem }) => {
  const navigate = useNavigate()
  const { t } = useLanguage()
  const [isExpanded, setIsExpanded] = useState(false)

  if (!classItem) return null

  const {
    classId,
    className,
    language,
    price = 0,
    capacity = 20,
    enrolledCount = 0,
    remainingSlots = 0,
    schedule = [],
    startDate,
    enrollmentEnd,
  } = classItem

  // Date box parsing
  const startD = startDate ? new Date(startDate) : null
  const dayNumber = startD && !isNaN(startD.getTime()) ? startD.getDate() : "--"
  const monthName =
    startD && !isNaN(startD.getTime())
      ? MONTH_NAMES[startD.getMonth()]
      : "--"

  const deadlineFormatted =
    enrollmentEnd && !isNaN(new Date(enrollmentEnd).getTime())
      ? new Date(enrollmentEnd).toLocaleDateString("vi-VN", {
          day: "2-digit",
          month: "2-digit",
        })
      : startD && !isNaN(startD.getTime())
      ? startD.toLocaleDateString("vi-VN", {
          day: "2-digit",
          month: "2-digit",
        })
      : "--"

  // Slot status color according to BR-EX-GV-08
  const slotColor = getSlotStatusColor(remainingSlots)

  const handleRegisterClick = (e) => {
    e.stopPropagation()
    navigate(`/explore-courses/class/${classId}`)
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-sm transition-all p-4 sm:p-5 flex flex-col gap-4">
      {/* ─── Main Row: Date Box + Summary + Price & Actions ─── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Left Side: Date Box + Title & Info */}
        <div className="flex items-start sm:items-center gap-4 min-w-0">
          {/* Date Box */}
          <div className="w-14 h-16 sm:w-16 sm:h-18 rounded-xl bg-slate-50 border border-slate-200/80 flex flex-col items-center justify-center shrink-0 text-center select-none shadow-2xs">
            <span className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              {t.courses?.startDate || "BẮT ĐẦU"}
            </span>
            <span className="text-lg sm:text-xl font-black text-slate-900 leading-tight">
              {dayNumber}
            </span>
            <span className="text-[10px] sm:text-[11px] font-semibold text-slate-500">
              {monthName}
            </span>
          </div>

          {/* Class Title & Details */}
          <div className="min-w-0 flex-1">
            <h3
              onClick={handleRegisterClick}
              className="text-base sm:text-lg font-extrabold text-slate-900 hover:text-[#990011] transition-colors cursor-pointer truncate"
              title={className}
            >
              {className}
            </h3>

            <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 mt-1 text-xs text-slate-500">
              {/* Schedule */}
              <div className="flex items-center gap-1">
                <Clock size={13} className="text-amber-500 shrink-0" />
                <span className="font-medium text-slate-600">
                  {formatScheduleString(schedule)}
                </span>
              </div>

              <span className="text-slate-300">•</span>

              {/* Enrolled */}
              <div className="flex items-center gap-1">
                <Users size={13} className="text-slate-400 shrink-0" />
                <span>{enrolledCount} học viên</span>
              </div>

              <span className="text-slate-300">•</span>

              {/* Level / Language */}
              <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-semibold text-[11px]">
                {language || "Cơ bản"}
              </span>
            </div>
          </div>
        </div>

        {/* Right Side: Price + Slots Status + Action Buttons */}
        <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
          {/* Price & Slot Count */}
          <div className="text-left sm:text-right">
            <div className="text-lg sm:text-xl font-black text-[#990011] leading-tight">
              {formatTeacherPrice(price)}
            </div>
            <div
              className={`text-[11px] font-bold mt-0.5 ${slotColor.textColor}`}
            >
              {remainingSlots > 0
                ? `Còn ${remainingSlots}/${capacity} chỗ`
                : "Hết chỗ"}
            </div>
          </div>

          {/* Buttons */}
          <div className="flex items-center gap-2">
            {/* Expand / Collapse Button */}
            <button
              type="button"
              onClick={() => setIsExpanded((prev) => !prev)}
              className="px-3 py-2 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 transition-colors flex items-center gap-1 cursor-pointer select-none"
            >
              <span>
                {isExpanded
                  ? t.courses?.collapseDetails || "Thu gọn"
                  : t.courses?.viewDetails || "Xem chi tiết"}
              </span>
              {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>

            {/* Register Button */}
            <button
              type="button"
              onClick={handleRegisterClick}
              className="px-4 py-2 rounded-xl bg-[#990011] text-white text-xs font-bold hover:bg-[#80000e] transition-all shadow-2xs active:scale-[0.98] flex items-center gap-1.5 cursor-pointer select-none"
            >
              <span>{t.courses?.registerNow || "Đăng ký ngay"}</span>
              <ArrowRight size={13} />
            </button>
          </div>
        </div>
      </div>

      {/* ─── Expandable Details Accordion ─── */}
      {isExpanded && (
        <div className="pt-3 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-4 gap-2.5 animate-fadeIn">
          {/* Sĩ số phòng */}
          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
            <div className="text-[11px] font-medium text-slate-400">
              {t.courses?.classCapacity || "Sĩ số phòng"}
            </div>
            <div className="text-xs font-bold text-slate-800 mt-0.5">
              {enrolledCount}/{capacity} học viên
            </div>
          </div>

          {/* Trình độ */}
          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
            <div className="text-[11px] font-medium text-slate-400">
              {t.courses?.level || "Trình độ"}
            </div>
            <div className="text-xs font-bold text-slate-800 mt-0.5">
              {language || "Cơ bản"}
            </div>
          </div>

          {/* Thời gian đăng ký */}
          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
            <div className="text-[11px] font-medium text-slate-400">
              {t.courses?.enrollmentTime || "Thời gian đăng ký"}
            </div>
            <div className="text-xs font-bold text-slate-800 mt-0.5">
              Hạn chót {deadlineFormatted}
            </div>
          </div>

          {/* Hình thức */}
          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
            <div className="text-[11px] font-medium text-slate-400">
              {t.courses?.format || "Hình thức"}
            </div>
            <div className="text-xs font-bold text-slate-800 mt-0.5">
              {t.courses?.formatOnline || "Trực tuyến Cat Speak"}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default TeacherOpenClassCard
