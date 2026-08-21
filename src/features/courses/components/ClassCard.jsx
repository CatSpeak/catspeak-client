import React, { useState } from "react"
import { Clock, Users, ShieldCheck, Calendar, ArrowRight, Settings, Share2, Check } from "lucide-react"
import {
  formatCurrencyVND,
  getSafeMediaUrl,
  defaultCourseThumbnail,
} from "../utils/courseUtils"
import { useLanguage } from "@/shared/context/LanguageContext"
import { useTimezone } from "@/shared/hooks/useTimezone"
import CourseStatusPill from "./CourseStatusPill"

const ClassCard = ({
  cls,
  isStudent = true,
  isClassEnrolled,
  isLocked,
  onClick,
  onEnroll,
  onShare,
  progressLabel,
  viewMode = "grid",
}) => {
  const { t } = useLanguage()
  const [linkCopied, setLinkCopied] = useState(false)
  const { formatDateMonth, formatScheduleTime, formatScheduleDays } = useTimezone()
  const c = t.courses || {}
  const ui = c.workspaceUi || {}

  const thumbnailUrl = getSafeMediaUrl(cls.thumbnailUrl || cls.thumbnail)

  // Teacher Info
  const teacher = cls.teacher || {}
  const teacherName = teacher.name || teacher.fullName || c.defaultInstructor || "Giảng viên CatSpeak"
  const teacherAvatar = getSafeMediaUrl(teacher.avatarImageUrl || teacher.avatar || teacher.avatarUrl)

  // Pricing
  const tuitionValue = cls.price ?? cls.tuitionFee ?? cls.priceMin;
  const tuitionLabel =
    tuitionValue != null && Number.isFinite(Number(tuitionValue))
      ? Number(tuitionValue) === 0
        ? c.student?.priceFree || "Miễn phí"
        : formatCurrencyVND(tuitionValue)
      : ui.tba || "TBA";

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

  const scheduleDaysText = formatScheduleDays(scheduleDays, ui.tba, " - ", firstSchedule?.startTime)
  const scheduleTimeText = firstSchedule?.startTime && firstSchedule?.endTime
    ? `${formatScheduleTime(firstSchedule.startTime, cls.startDate)} - ${formatScheduleTime(firstSchedule.endTime, cls.startDate)}`
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

  return viewMode === "list" ? (
    <div
      onClick={isLocked ? undefined : onClick}
      aria-disabled={isLocked || undefined}
      className={`bg-white rounded-3xl border border-border hover:border-[#b20a1c]/30 p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 hover:shadow-lg transition-all duration-300 cursor-pointer group ${
        isClassEnrolled ? "border-emerald-400 ring-2 ring-emerald-50" : ""
      } ${isLocked ? "opacity-60 cursor-not-allowed" : ""}`}
    >
      <div className="flex items-center gap-5 flex-1 min-w-0">
        {/* Thumbnail */}
        <div className="h-20 w-32 shrink-0 rounded-2xl overflow-hidden bg-slate-100 flex items-center justify-center relative shadow-sm border border-border group-hover:scale-[1.02] transition-transform duration-300">
          <img
            src={thumbnailUrl || defaultCourseThumbnail}
            alt={cls.name || cls.title || ""}
            className="w-full h-full object-cover"
            loading="lazy"
            decoding="async"
          />
          {onShare && (
            <button
              type="button"
              onClick={async (event) => {
                event.stopPropagation()
                try {
                  await onShare(cls)
                  setLinkCopied(true)
                  setTimeout(() => setLinkCopied(false), 2000)
                } catch (e) {
                  console.error("Share failed", e)
                }
              }}
              className="absolute top-1.5 right-1.5 z-10 h-6 w-6 flex items-center justify-center rounded-full bg-black/30 hover:bg-black/60 backdrop-blur-sm text-white transition-all duration-200 opacity-0 group-hover:opacity-100 active:scale-90 cursor-pointer"
              title={c.classDetail?.shareClass || "Share"}
            >
              {linkCopied ? <Check size={10} /> : <Share2 size={10} />}
            </button>
          )}
        </div>

        <div className="flex-1 min-w-0">
          {/* Top Badges */}
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="bg-[#b20a1c]/10 text-[#b20a1c] border border-rose-200/60 font-black text-[10px] px-2.5 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1">
              {c.classBadge || "Lớp học"}
            </span>
            {cls.language && (
              <span className="bg-slate-100 text-slate-700 font-bold text-[10px] px-2.5 py-0.5 rounded-full uppercase border border-border">
                {cls.language}
              </span>
            )}
            {Array.isArray(cls.levels) &&
              cls.levels.map((lvl) => (
                <span
                  key={lvl}
                  className="bg-rose-600 text-white text-[10px] font-black px-2.5 py-0.5 rounded-full"
                >
                  {lvl}
                </span>
              ))}
          </div>

          <h3
            className="font-black text-lg text-slate-950 truncate leading-snug group-hover:text-[#b20a1c] transition-colors"
            title={cls.name || cls.title}
          >
            {cls.name || cls.title}
          </h3>

          {/* Teacher info */}
          <div className="flex items-center gap-2 mt-1.5 text-xs text-slate-500 font-semibold">
            {teacherAvatar ? (
              <img
                src={teacherAvatar}
                alt={teacherName}
                className="w-5 h-5 rounded-full object-cover ring-1 ring-slate-200"
              />
            ) : (
              <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-[10px]">
                {teacherName.charAt(0).toUpperCase()}
              </span>
            )}
            <span className="text-slate-700 font-bold">{teacherName}</span>
          </div>

          {/* Schedule */}
          {scheduleDaysText && scheduleDaysText !== ui.tba && (
            <div className="flex items-center gap-1.5 mt-1.5 text-xs text-slate-500 font-semibold">
              <Clock size={12} className="text-[#b20a1c] shrink-0" />
              <span>
                {scheduleDaysText}
                {scheduleTimeText ? ` | ${scheduleTimeText}` : ""}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Right Stats & Actions */}
      <div className="flex flex-wrap md:flex-nowrap items-center gap-6 justify-between w-full md:w-auto border-t md:border-t-0 pt-4 md:pt-0 border-slate-150 shrink-0">
        <div className="flex items-center gap-4 text-xs font-bold text-slate-500">
          {studentCount != null && (
            <div className="flex items-center gap-1">
              <Users size={14} className="text-slate-400" />
              <span>
                {studentCount} {c.studentsUnit || "học viên"}
              </span>
            </div>
          )}
          {remainingSlots != null && (
            <div className="flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/60">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span>
                {c.slotsRemaining
                  ? c.slotsRemaining.replace("{{count}}", remainingSlots)
                  : `Còn ${remainingSlots} chỗ`}
              </span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-4 w-full md:w-auto justify-end">
          <div className="flex flex-col text-right">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">
              {c.tuition || "Học phí"}
            </span>
            <span className="text-base font-black text-[#b20a1c] leading-none">
              {tuitionLabel}
            </span>
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
            className="h-10 px-5 text-xs font-extrabold rounded-full bg-[#b20a1c] hover:bg-[#960817] text-white flex items-center justify-center gap-1.5 transition-all shadow-md active:scale-95 whitespace-nowrap cursor-pointer"
          >
            {!isStudent ? (
              <>
                <Settings size={13} />
                <span>{c.manageClass || "Quản Lý Lớp"}</span>
              </>
            ) : isClassEnrolled ? (
              <>
                <span>{c.enterClass || "Vào Lớp"}</span>
                <ArrowRight
                  size={13}
                  className="group-hover:translate-x-0.5 transition-transform"
                />
              </>
            ) : (
              <>
                <span>{c.viewClass || "Xem Lớp Học"}</span>
                <ArrowRight
                  size={13}
                  className="group-hover:translate-x-0.5 transition-transform"
                />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  ) : (
    <div
      onClick={isLocked ? undefined : onClick}
      aria-disabled={isLocked || undefined}
      className={`relative bg-white border rounded-3xl overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between group ${isClassEnrolled
        ? "border-emerald-400 ring-2 ring-emerald-50"
        : isLocked
          ? "border-border opacity-60 cursor-not-allowed"
          : "border-border cursor-pointer hover:border-[#b20a1c]/30"
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
        <div className="absolute top-3 left-3 flex flex-wrap items-center gap-1.5 z-10">
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
          <div className={`absolute top-3 ${onShare ? "right-12" : "right-3"} z-10`}>
            <CourseStatusPill status={cls.status} t={t} />
          </div>
        )}

        {onShare && (
          <button
            type="button"
            onClick={async (event) => {
              event.stopPropagation()
              try {
                await onShare(cls)
                setLinkCopied(true)
                setTimeout(() => setLinkCopied(false), 2000)
              } catch (e) {
                console.error("Share failed", e)
              }
            }}
            className="absolute top-3 right-3 z-10 h-8 w-8 flex items-center justify-center rounded-full bg-black/30 hover:bg-black/60 backdrop-blur-sm text-white transition-all duration-200 opacity-0 group-hover:opacity-100 active:scale-90 cursor-pointer"
            title={c.classDetail?.shareClass || "Share"}
          >
            {linkCopied ? <Check size={14} /> : <Share2 size={14} />}
          </button>
        )}
      </div>

      {/* Class Details Content */}
      <div className="p-5 flex flex-col flex-1 justify-between gap-5">
        <div className="flex flex-col gap-2.5">
          <h3 className="font-black text-lg text-slate-950 leading-snug line-clamp-2 group-hover:text-[#b20a1c] transition-colors" title={cls.name || cls.title}>
            {cls.name || cls.title}
          </h3>

          {/* Instructor Profile & Duration */}
          <div className="flex items-center justify-between gap-2.5 pt-1">
            <div className="flex items-center gap-2 min-w-0">
              {teacherAvatar ? (
                <img src={teacherAvatar} alt={teacherName} className="w-7 h-7 rounded-full object-cover ring-2 ring-slate-100 shrink-0" />
              ) : (
                <div className="w-7 h-7 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-xs shrink-0">
                  {teacherName.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="flex flex-col min-w-0">
                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider leading-none">
                  {c.instructorLabel || "Giảng viên"}
                </span>
                <span className="text-xs font-bold text-slate-700 truncate mt-0.5" title={teacherName}>
                  {teacherName}
                </span>
              </div>
            </div>

            {(cls.startDate || cls.endDate) && (
              <div className="flex items-center gap-1 text-[11px] font-semibold text-gray-500 shrink-0">
                <Clock size={12} className="text-gray-400 shrink-0" />
                <span>
                  {cls.startDate && cls.endDate
                    ? `${formatDateMonth(cls.startDate, ui.tba, firstSchedule?.startTime)} - ${formatDateMonth(cls.endDate, ui.tba, firstSchedule?.startTime)}`
                    : ui.tba}
                </span>
              </div>
            )}
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
                <span>{c.registrationDeadline || "Hạn ĐK"}: {formatDateMonth(minEnrollmentEnd, ui.tba)}</span>
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
