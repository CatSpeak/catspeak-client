import React from "react"
import { Clock, Users, ShieldCheck, Calendar, ArrowRight, Settings } from "lucide-react"
import {
  formatCurrencyVND,
  getSafeMediaUrl,
  formatDateDayMonth,
  getCourseLocale,
  defaultCourseThumbnail,
} from "../utils/courseUtils"
import { useLanguage } from "@/shared/context/LanguageContext"
import { formatScheduleDays } from "../utils/scheduleUtils"
import CourseStatusPill from "./CourseStatusPill"

const ClassCard = ({
  cls,
  isStudent = true,
  isClassEnrolled,
  isLocked,
  onClick,
  onEnroll,
  progressLabel,
}) => {
  const { language, t } = useLanguage()
  const c = t.courses || {}
  const ui = c.workspaceUi || {}

  const thumbnailUrl = getSafeMediaUrl(cls.thumbnailUrl || cls.thumbnail)

  // Teacher Info
  const teacher = cls.teacher || {}
  const teacherName = teacher.name || teacher.fullName || c.defaultInstructor || "Giảng viên CatSpeak"
  const teacherAvatar = getSafeMediaUrl(teacher.avatarImageUrl || teacher.avatar || teacher.avatarUrl)

  // Pricing
  const tuitionValue = cls.price ?? cls.tuitionFee ?? cls.priceMin
  const tuitionLabel = tuitionValue != null && Number.isFinite(Number(tuitionValue))
    ? formatCurrencyVND(tuitionValue)
    : ui.tba || "TBA"

  // Counts & Slot Info
  const studentCount = cls.studentCount ?? cls.enrolledStudents ?? null
  const remainingSlots = cls.remainingSlots
  const minEnrollmentEnd = cls.minEnrollmentEnd || cls.enrollmentEnd
  const scheduleDays = Array.isArray(cls.schedule)
    ? cls.schedule.map((s) => s.dayOfWeek).filter(Boolean)
    : cls.schedule?.days
  const firstSchedule = Array.isArray(cls.schedule) && cls.schedule.length > 0
    ? cls.schedule[0]
    : cls.schedule

  const scheduleDaysText = formatScheduleDays(scheduleDays, language, ui.tba)
  const scheduleTimeText = firstSchedule?.startTime && firstSchedule?.endTime
    ? `${firstSchedule.startTime} - ${firstSchedule.endTime}`
    : ""

  // Extract progress value (number, string, or object { completedSessions, totalSessions, percentage })
  let progressPercent = null
  if (cls.progress != null) {
    if (typeof cls.progress === "number" || (typeof cls.progress === "string" && !isNaN(Number(cls.progress)))) {
      progressPercent = Number(cls.progress)
    } else if (typeof cls.progress === "object") {
      if (cls.progress.percentage != null && !isNaN(Number(cls.progress.percentage))) {
        progressPercent = Number(cls.progress.percentage)
      } else if (cls.progress.totalSessions && !isNaN(Number(cls.progress.completedSessions))) {
        progressPercent = Math.round((Number(cls.progress.completedSessions || 0) / Number(cls.progress.totalSessions)) * 100)
      }
    }
  }

  return (
    <div
      onClick={isLocked ? undefined : onClick}
      aria-disabled={isLocked || undefined}
      className={`bg-white border rounded-3xl overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between group ${isClassEnrolled
        ? "border-emerald-400 ring-2 ring-emerald-50"
        : isLocked
          ? "border-slate-200 opacity-60 cursor-not-allowed"
          : "border-slate-200 cursor-pointer hover:border-[#b20a1c]/30"
        }`}
    >
      {/* Thumbnail Area */}
      <div className="relative h-52 w-full bg-slate-100 flex items-center justify-center shrink-0 overflow-hidden border-b border-slate-100">
        <img
          src={thumbnailUrl || defaultCourseThumbnail}
          alt={cls.name || cls.title || ""}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
          decoding="async"
        />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 z-10">
          {cls.language && (
            <span className="bg-slate-900/85 backdrop-blur-md text-white border border-slate-700/60 text-[10px] font-bold px-2.5 py-1 rounded-full shadow-sm">
              {cls.language}
            </span>
          )}
          {Array.isArray(cls.levels) && cls.levels.map((lvl) => (
            <span key={lvl} className="bg-rose-600 text-white text-[10px] font-black px-2.5 py-1 rounded-full shadow-sm">
              {lvl}
            </span>
          ))}
        </div>

        {/* Teacher / Admin status pill */}
        {!isStudent && cls.status && (
          <div className="absolute top-3 right-3 z-10">
            <CourseStatusPill status={cls.status} t={t} />
          </div>
        )}
      </div>

      {/* Class Details Content */}
      <div className="p-5 flex flex-col flex-1 justify-between gap-5">
        <div className="flex flex-col gap-2.5">
          <h3 className="font-black text-lg text-slate-950 leading-snug line-clamp-2 group-hover:text-[#b20a1c] transition-colors" title={cls.name || cls.title}>
            {cls.name || cls.title}
          </h3>

          {/* Instructor Profile */}
          <div className="flex items-center gap-2.5 pt-1">
            {teacherAvatar ? (
              <img src={teacherAvatar} alt={teacherName} className="w-7 h-7 rounded-full object-cover ring-2 ring-indigo-100 shadow-2xs" />
            ) : (
              <div className="w-7 h-7 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-xs">
                {teacherName.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="flex flex-col">
              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider leading-none">
                {c.instructorLabel || "Giảng viên"}
              </span>
              <span className="text-xs font-bold text-slate-800 line-clamp-1 flex items-center gap-1">
                {teacherName}
                <ShieldCheck size={12} className="text-indigo-500 inline shrink-0" />
              </span>
            </div>
          </div>

          {/* Schedule & Slot Info Grid */}
          <div className="mt-2 flex flex-col gap-2 text-xs font-bold text-slate-600 bg-slate-50/80 p-3 rounded-2xl border border-slate-100">
            {scheduleDaysText && scheduleDaysText !== ui.tba && (
              <div className="flex items-center gap-1.5 text-slate-800">
                <Clock size={13} className="text-[#b20a1c] shrink-0" />
                <span className="truncate">
                  {scheduleDaysText} {scheduleTimeText ? `| ${scheduleTimeText}` : ""}
                </span>
              </div>
            )}

            <div className="grid grid-cols-2 gap-2 pt-0.5">
              <div className="flex items-center gap-1.5">
                <Users size={13} className="text-slate-400 shrink-0" />
                <span>{studentCount != null ? `${studentCount} ${c.studentsUnit || "học viên"}` : `0 ${c.studentsUnit || "học viên"}`}</span>
              </div>
              {remainingSlots != null && (
                <div className="flex items-center gap-1.5 text-emerald-700">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <span>{c.slotsRemaining ? c.slotsRemaining.replace("{{count}}", remainingSlots) : `Còn ${remainingSlots} chỗ`}</span>
                </div>
              )}
            </div>

            {minEnrollmentEnd && (
              <div className="flex items-center gap-1.5 text-amber-800 border-t border-slate-100 pt-1.5 text-[11px]">
                <Calendar size={12} className="text-amber-600 shrink-0" />
                <span>{c.registrationDeadline || "Hạn ĐK"}: {formatDateDayMonth(minEnrollmentEnd, getCourseLocale(language), ui.tba)}</span>
              </div>
            )}

            {progressLabel && progressPercent != null && !isNaN(progressPercent) && (
              <div className="flex items-center justify-between border-t border-slate-100 pt-1.5 text-[11px] text-indigo-700 font-bold">
                <span>{progressLabel}:</span>
                <span>{progressPercent}%</span>
              </div>
            )}
          </div>
        </div>

        {/* Pricing & Footer Action */}
        <div className="pt-3.5 border-t border-slate-150 flex items-center justify-between gap-3">
          <div className="flex flex-col">
            <span className="text-slate-400 text-[10px] leading-none mb-1 uppercase tracking-wider font-extrabold">{c.tuition || "Học phí"}</span>
            <span className="text-[#b20a1c] font-black text-sm sm:text-base leading-none">{tuitionLabel}</span>
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              if (onEnroll) {
                onEnroll(e)
              } else if (onClick) {
                onClick(e)
              }
            }}
            className="h-9 px-4 bg-[#b20a1c] hover:bg-[#960817] text-white text-xs font-extrabold rounded-full flex items-center justify-center gap-1 transition-all shadow-md hover:shadow-lg active:scale-95 cursor-pointer"
          >
            {!isStudent ? (
              <>
                <Settings size={13} />
                <span>{c.manageClass || "Quản Lý Lớp"}</span>
              </>
            ) : isClassEnrolled ? (
              <>
                <span>{c.enterClass || "Vào Lớp"}</span>
                <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
              </>
            ) : (
              <>
                <span>{c.viewClass || "Xem Lớp Học"}</span>
                <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ClassCard
