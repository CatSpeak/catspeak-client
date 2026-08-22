import React, { useState } from "react"
import { Clock, Medal, Users, BookOpen, Share2, Check, ArrowRight } from "lucide-react"
import {
  formatCurrencyVND,
  getSafeMediaUrl,
  defaultCourseThumbnail,
  isClosingSoon,
} from "../utils/courseUtils"
import { getLocalizedLanguageName } from "../data/courseFormOptions"
import { useLanguage } from "@/shared/context/LanguageContext"
import { useTimezone } from "@/shared/hooks/useTimezone"

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
  const sc = c.student || {}
  const ui = c.workspaceUi || {}

  const thumbnailUrl = getSafeMediaUrl(cls.thumbnailUrl || cls.thumbnail)

  // Teacher Info
  const teacher = cls.teacher || {}
  const teacherName = teacher.name || teacher.fullName || c.defaultInstructor || "Giảng viên CatSpeak"
  const teacherAvatar = getSafeMediaUrl(teacher.avatarImageUrl || teacher.avatar || teacher.avatarUrl)

  // Pricing
  const tuitionValue = cls.price ?? cls.tuitionFee ?? cls.priceMin
  const tuitionLabel =
    tuitionValue != null && Number.isFinite(Number(tuitionValue))
      ? Number(tuitionValue) === 0
        ? sc.priceFree || "Miễn phí"
        : formatCurrencyVND(tuitionValue)
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

  const scheduleDaysText = formatScheduleDays(scheduleDays, ui.tba, " - ", firstSchedule?.startTime)
  const scheduleTimeText = firstSchedule?.startTime && firstSchedule?.endTime
    ? `${formatScheduleTime(firstSchedule.startTime, cls.startDate)} - ${formatScheduleTime(firstSchedule.endTime, cls.startDate)}`
    : ""

  const scheduleText = [
    scheduleDaysText && scheduleDaysText !== ui.tba ? scheduleDaysText : "",
    scheduleTimeText,
  ]
    .filter(Boolean)
    .join(" | ") ||
    (cls.startDate && cls.endDate
      ? `${formatDateMonth(cls.startDate, ui.tba, firstSchedule?.startTime)} - ${formatDateMonth(cls.endDate, ui.tba, firstSchedule?.startTime)}`
      : null)

  const languageLabel =
    getLocalizedLanguageName(cls.language, t) || cls.language || ""

  const levelsText = Array.isArray(cls.levels)
    ? cls.levels.filter(Boolean).join(", ")
    : cls.level || cls.levels || ""

  // Do not display openClassCount in ClassCard
  const sessionsText = cls.totalSessions
    ? `${cls.totalSessions} ${c.sessionsUnit || "buổi học"}`
    : null

  const closingSoon = isClosingSoon(minEnrollmentEnd, Date.now(), 1)

  const slotsText =
    remainingSlots != null
      ? (c.slotsRemaining || sc.slotsRemaining
        ? (c.slotsRemaining || sc.slotsRemaining).replace("{{count}}", remainingSlots)
        : `Còn ${remainingSlots} chỗ`)
      : c.slotsAvailable || sc.slotsAvailable || "Còn chỗ"

  return viewMode === "list" ? (
    <div
      onClick={isLocked ? undefined : onClick}
      aria-disabled={isLocked || undefined}
      className={`bg-white rounded-3xl border border-border hover:border-[#b20a1c]/30 p-3.5 sm:p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 sm:gap-6 hover:shadow-lg transition-all duration-300 cursor-pointer group ${
        isClassEnrolled ? "border-emerald-400 ring-2 ring-emerald-50" : ""
      } ${isLocked ? "opacity-60 cursor-not-allowed" : ""}`}
    >
      <div className="flex items-center gap-4 sm:gap-5 flex-1 min-w-0">
        {/* Thumbnail */}
        <div className="h-20 w-32 shrink-0 rounded-2xl overflow-hidden bg-slate-100 flex items-center justify-center relative shadow-xs border border-border">
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

        <div className="flex-1 min-w-0 flex flex-col gap-1.5">
          {/* Row 1: Badges (Class badge & Language badge) */}
          <div className="flex items-center gap-2">
            <span className="bg-[#FFF0F2] text-[#b20a1c] text-[11px] font-extrabold px-2.5 py-0.5 rounded-xl border border-rose-200/60 shrink-0">
              {c.classBadge || "Lớp học"}
            </span>
            {languageLabel && (
              <span className="bg-[#b20a1c] text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full shadow-xs shrink-0">
                {languageLabel}
              </span>
            )}
          </div>

          {/* Row 2: Title */}
          <h3
            className="font-black text-base text-slate-950 truncate group-hover:text-[#b20a1c] transition-colors"
            title={cls.name || cls.title}
          >
            {cls.name || cls.title}
          </h3>

          {/* Row 3: Teacher info (No "Giảng viên" text) */}
          <div className="flex items-center gap-2 min-w-0">
            {teacherAvatar ? (
              <img
                src={teacherAvatar}
                alt={teacherName}
                className="w-5 h-5 rounded-full object-cover ring-1 ring-slate-200 shrink-0"
              />
            ) : (
              <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-[10px] shrink-0">
                {teacherName.charAt(0).toUpperCase()}
              </span>
            )}
            <span
              className="text-xs font-semibold text-slate-700 truncate"
              title={teacherName}
            >
              {teacherName}
            </span>
          </div>

          {/* Row 4: Metrics (No yellow parent) */}
          <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-800">
            {scheduleText && (
              <div className="flex items-center gap-1.5">
                <Clock size={13} className="text-amber-500 shrink-0" />
                <span>{scheduleText}</span>
              </div>
            )}
            {levelsText && (
              <div className="flex items-center gap-1.5">
                <Medal size={13} className="text-amber-500 shrink-0" />
                <span>{levelsText}</span>
              </div>
            )}
            {studentCount != null && (
              <div className="flex items-center gap-1.5">
                <Users size={13} className="text-amber-500 shrink-0" />
                <span>
                  {studentCount} {c.studentsUnit || "học viên"}
                </span>
              </div>
            )}
            {sessionsText && (
              <div className="flex items-center gap-1.5">
                <BookOpen size={13} className="text-amber-500 shrink-0" />
                <span>{sessionsText}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Right Stats, Slots & Action Button */}
      <div className="flex items-center gap-6 justify-between md:justify-end w-full md:w-auto border-t md:border-t-0 pt-3 md:pt-0 border-slate-150 shrink-0">
        <div className="flex flex-col items-center justify-center text-center">
          <span className="text-[10px] font-bold text-slate-400 leading-none mb-1">
            {c.tuition || "Học phí"}
          </span>
          <span className="text-base font-black text-[#b20a1c] leading-none mb-1">
            {tuitionLabel}
          </span>
          {closingSoon ? (
            <span className="text-amber-600 font-bold text-xs shrink-0">
              {c.closingSoon || sc.closingSoon || "Sắp đóng tuyển sinh"}
            </span>
          ) : (
            <span className="text-emerald-600 font-bold text-xs shrink-0">
              {slotsText}
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            if (!isLocked) {
              onClick?.()
            }
          }}
          disabled={isLocked}
          className={`inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-full bg-[#b20a1c] hover:bg-[#960817] text-white text-xs font-bold transition-all shrink-0 cursor-pointer shadow-xs active:scale-95 ${
            isLocked ? "opacity-60 cursor-not-allowed" : ""
          }`}
        >
          <span>{c.viewClass || "Xem lớp"}</span>
          <ArrowRight size={14} />
        </button>
      </div>
    </div>
  ) : (
    <div
      onClick={isLocked ? undefined : onClick}
      aria-disabled={isLocked || undefined}
      className={`relative bg-white border rounded-3xl overflow-visible shadow-xs hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between group ${
        isClassEnrolled
          ? "border-emerald-400 ring-2 ring-emerald-50"
          : isLocked
          ? "border-border opacity-60 cursor-not-allowed"
          : "border-border cursor-pointer hover:border-[#b20a1c]/30"
      }`}
    >
      {/* Thumbnail Area (-25% height: h-36 instead of h-48) */}
      <div className="relative h-36 w-full bg-slate-100 flex items-center justify-center shrink-0 rounded-t-3xl overflow-visible border-b border-slate-100">
        <img
          src={thumbnailUrl || defaultCourseThumbnail}
          alt={cls.name || cls.title || ""}
          className="w-full h-full object-cover rounded-t-3xl"
          loading="lazy"
          decoding="async"
        />

        {/* Language Badge centered at bottom edge of thumbnail */}
        {languageLabel && (
          <span className="absolute -bottom-3.5 left-5 z-10 bg-[#b20a1c] text-white text-xs font-bold px-3.5 py-1 rounded-full shadow-md">
            {languageLabel}
          </span>
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
      <div className="p-3.5 pt-5 flex flex-col flex-1 justify-between gap-3">
        <div className="flex flex-col gap-2.5">
          {/* Hàng 1: Avatar & Teacher Name (Left) + Soft Red Badge (Right) */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              {teacherAvatar ? (
                <img
                  src={teacherAvatar}
                  alt={teacherName}
                  className="w-7 h-7 rounded-full object-cover ring-1 ring-slate-200 shrink-0 shadow-2xs"
                />
              ) : (
                <div className="w-7 h-7 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-xs shrink-0">
                  {teacherName.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="flex flex-col min-w-0">
                <span className="text-[10px] font-bold text-slate-400 leading-none">
                  {c.instructorLabel || sc.instructor || "Giảng viên"}
                </span>
                <span
                  className="text-xs font-bold text-slate-800 truncate leading-tight mt-0.5"
                  title={teacherName}
                >
                  {teacherName}
                </span>
              </div>
            </div>

            <span className="bg-[#FFF0F2] text-[#b20a1c] text-[11px] font-extrabold px-2.5 py-1 rounded-xl border border-rose-200/60 shrink-0">
              {c.classBadge || "Lớp học"}
            </span>
          </div>

          {/* Hàng 2: Tên lớp học (multiline wrap) */}
          <h3
            className="font-black text-base text-slate-950 leading-snug line-clamp-2 group-hover:text-[#b20a1c] transition-colors break-words"
            title={cls.name || cls.title}
          >
            {cls.name || cls.title}
          </h3>

          {/* Hàng 3: Ô vàng nhạt, bo góc, không viền, 4 dòng theo thứ tự */}
          <div className="bg-amber-50/90 rounded-2xl p-2.5 flex flex-col gap-1.5">
            {/* 1. <Clock /> {schedule} */}
            {scheduleText && (
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-900 min-w-0">
                <Clock size={14} className="text-amber-500 shrink-0" />
                <span className="truncate">{scheduleText}</span>
              </div>
            )}

            {/* 2. <Medal /> {levels} */}
            {levelsText && (
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-900 min-w-0">
                <Medal size={14} className="text-amber-500 shrink-0" />
                <span className="truncate">{levelsText}</span>
              </div>
            )}

            {/* 3. <Users /> {studentCount} học viên */}
            {studentCount != null && (
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-900 min-w-0">
                <Users size={14} className="text-amber-500 shrink-0" />
                <span className="truncate">
                  {studentCount} {c.studentsUnit || "học viên"}
                </span>
              </div>
            )}

            {/* 4. <BookOpen /> {sessionsText} (Only sessions, no openClassCount) */}
            {sessionsText && (
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-900 min-w-0">
                <BookOpen size={14} className="text-amber-500 shrink-0" />
                <span className="truncate">{sessionsText}</span>
              </div>
            )}
          </div>
        </div>

        {/* Footer: Pricing (Left) + Còn {remainingSlots} chỗ / Sắp đóng tuyển sinh (Right) */}
        <div className="pt-2.5 border-t border-slate-150 flex items-center justify-between gap-3">
          <div className="flex flex-col">
            <span className="text-slate-400 text-[10px] leading-none mb-1 font-bold">
              {c.tuition || "Học phí"}
            </span>
            <span className="text-[#b20a1c] font-black text-sm sm:text-base leading-none">
              {tuitionLabel}
            </span>
          </div>

          {closingSoon ? (
            <span className="text-amber-600 font-bold text-xs shrink-0">
              {c.closingSoon || sc.closingSoon || "Sắp đóng tuyển sinh"}
            </span>
          ) : (
            <span className="text-emerald-600 font-bold text-xs shrink-0">
              {slotsText}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

export default ClassCard
