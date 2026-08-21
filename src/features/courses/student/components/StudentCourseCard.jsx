import React, { useState } from "react"
import { BookOpen, Clock, Medal, Users, Share2, Check } from "lucide-react"
import {
  getCourseGradientAndIcon,
  formatCurrencyVND,
  getSafeMediaUrl,
  defaultCourseThumbnail,
} from "../../utils/courseUtils"
import { getLocalizedLanguageName } from "../../data/courseFormOptions"
import { useLanguage } from "@/shared/context/LanguageContext"
import { useTimezone } from "@/shared/hooks/useTimezone"

const StudentCourseCard = ({
  course,
  isEnrolled,
  viewMode = "grid",
  onViewDetails,
  onJoin,
  onShare,
  t: propsT,
  index,
}) => {
  const { t: contextT } = useLanguage()
  const { formatDateMonth } = useTimezone()
  const t = propsT || contextT
  const c = t?.courses || {}
  const sc = c?.student || {}
  const ui = c?.workspaceUi || {}
  const { gradient, icon: Icon } = getCourseGradientAndIcon(index)
  const thumbnailUrl = getSafeMediaUrl(course.thumbnailUrl)

  // Teacher Info
  const teacher = course.teacher || {}
  const teacherName =
    teacher.name ||
    teacher.fullName ||
    course.instructorName ||
    sc.defaultInstructor ||
    "Giảng viên CatSpeak"
  const teacherAvatar = getSafeMediaUrl(
    teacher.avatarImageUrl || teacher.avatar || teacher.avatarUrl,
  )

  // Pricing Logic
  const minPrice = course.priceMin ?? course.priceRange?.min ?? course.price
  const maxPrice = course.priceMax ?? course.priceRange?.max ?? course.price
  const hasMinPrice =
    minPrice != null && Number.isFinite(Number(minPrice)) && Number(minPrice) >= 0
  const hasMaxPrice =
    maxPrice != null &&
    Number.isFinite(Number(maxPrice)) &&
    Number(maxPrice) >= Number(minPrice)

  let priceText = sc.toBeAnnounced || "TBA"
  if (hasMinPrice && hasMaxPrice) {
    if (Number(minPrice) === 0 && Number(maxPrice) === 0) {
      priceText = sc.priceFree || "Miễn phí"
    } else if (Number(minPrice) === Number(maxPrice)) {
      priceText = formatCurrencyVND(minPrice)
    } else {
      priceText = `${formatCurrencyVND(minPrice)} - ${formatCurrencyVND(maxPrice)}`
    }
  } else if (hasMinPrice) {
    priceText = formatCurrencyVND(minPrice)
  }

  // Counts & Stats
  const openClassCount =
    course.openClassCount != null ? Number(course.openClassCount) : null
  const classCount =
    course.classCount != null ? Number(course.classCount) : openClassCount
  const studentCount =
    course.studentCount != null ? Number(course.studentCount) : null
  const remainingSlots =
    course.remainingSlots != null ? Number(course.remainingSlots) : null
  const minEnrollmentEnd = course.minEnrollmentEnd || course.enrollmentEnd

  const [linkCopied, setLinkCopied] = useState(false)

  const languageLabel =
    getLocalizedLanguageName(course.language, t) || course.language || ""

  const levelsText = Array.isArray(course.levels)
    ? course.levels.filter(Boolean).join(", ")
    : course.levels || ""

  const scheduleText = course.duration
    ? `${course.duration} ${c.hoursUnit || "giờ"}`
    : minEnrollmentEnd
    ? `${sc.registrationDeadline || "Hạn ĐK"}: ${formatDateMonth(minEnrollmentEnd, ui.tba || "TBA")}`
    : null

  const slotsText =
    remainingSlots != null
      ? sc.slotsRemaining
        ? sc.slotsRemaining.replace("{{count}}", remainingSlots)
        : `Còn ${remainingSlots} chỗ`
      : sc.slotsAvailable || "Còn chỗ"

  // --- List View Mode ---
  if (viewMode === "list") {
    return (
      <div
        onClick={onViewDetails}
        className="bg-white rounded-3xl border border-border hover:border-[#b20a1c]/30 p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 hover:shadow-lg transition-all duration-300 cursor-pointer group"
      >
        <div className="flex items-center gap-5 flex-1 min-w-0">
          {/* Thumbnail */}
          <div className="h-24 w-36 shrink-0 rounded-2xl overflow-hidden bg-slate-100 flex items-center justify-center relative shadow-xs border border-border group-hover:scale-[1.02] transition-transform duration-300">
            {thumbnailUrl ? (
              <img
                src={thumbnailUrl}
                alt={course.name || course.title || ""}
                className="w-full h-full object-cover"
                loading="lazy"
                decoding="async"
              />
            ) : (
              <div
                className={`w-full h-full bg-gradient-to-br ${gradient} flex items-center justify-center`}
              >
                <Icon size={28} className="stroke-[1.5] text-white" />
              </div>
            )}
            {languageLabel && (
              <span className="absolute bottom-2 left-2 z-10 bg-[#b20a1c] text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full shadow-xs">
                {languageLabel}
              </span>
            )}
            {onShare && (
              <button
                type="button"
                onClick={async (event) => {
                  event.stopPropagation()
                  try {
                    await onShare(course)
                    setLinkCopied(true)
                    setTimeout(() => setLinkCopied(false), 2000)
                  } catch (e) {
                    console.error("Share failed", e)
                  }
                }}
                className="absolute top-1.5 right-1.5 z-10 h-6 w-6 flex items-center justify-center rounded-full bg-black/30 hover:bg-black/60 backdrop-blur-sm text-white transition-all duration-200 opacity-0 group-hover:opacity-100 active:scale-90 cursor-pointer"
                title={sc.shareCourse || "Share"}
              >
                {linkCopied ? <Check size={10} /> : <Share2 size={10} />}
              </button>
            )}
          </div>

          <div className="flex-1 min-w-0 flex flex-col gap-2">
            {/* Row 1: Teacher & Type */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                {teacherAvatar ? (
                  <img
                    src={teacherAvatar}
                    alt={teacherName}
                    className="w-6 h-6 rounded-full object-cover ring-1 ring-slate-200"
                  />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-[10px]">
                    {teacherName.charAt(0).toUpperCase()}
                  </div>
                )}
                <span className="text-xs font-bold text-slate-800 truncate">
                  {teacherName}
                </span>
              </div>
              <span className="bg-[#FFF0F2] text-[#b20a1c] text-[11px] font-extrabold px-2.5 py-0.5 rounded-xl border border-rose-200/60 shrink-0">
                {sc.courseBadge || c.courseBadge || "Khóa học"}
              </span>
            </div>

            {/* Row 2: Title */}
            <h3 className="font-black text-base text-slate-950 truncate group-hover:text-[#b20a1c] transition-colors">
              {course.name || course.title}
            </h3>

            {/* Row 3: Metrics */}
            <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-900 bg-amber-50/90 px-3 py-1.5 rounded-xl">
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
                  <span>{studentCount} {c.studentsUnit || sc.studentsUnit || "học viên"}</span>
                </div>
              )}
              {(openClassCount != null || classCount != null) && (
                <div className="flex items-center gap-1.5">
                  <BookOpen size={13} className="text-amber-500 shrink-0" />
                  <span>
                    {openClassCount != null
                      ? `${openClassCount} ${sc.classesOpen || "lớp mở"}`
                      : `${classCount} ${sc.classesUnit || "lớp"}`}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Stats & Remaining Slots */}
        <div className="flex items-center gap-6 justify-between w-full md:w-auto border-t md:border-t-0 pt-4 md:pt-0 border-slate-150 shrink-0">
          <div className="flex flex-col text-right">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">
              {sc.tuition || "Học phí"}
            </span>
            <span className="text-base font-black text-[#b20a1c] leading-none">
              {priceText}
            </span>
          </div>
          <div className="text-emerald-600 font-bold text-xs flex items-center gap-1.5 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200/60 shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span>{slotsText}</span>
          </div>
        </div>
      </div>
    )
  }

  // --- Grid View Mode ---
  return (
    <div
      onClick={onViewDetails}
      className="relative bg-white rounded-3xl border border-border hover:border-[#b20a1c]/30 shadow-xs hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 cursor-pointer flex flex-col justify-between group overflow-visible"
    >
      {/* Thumbnail Area */}
      <div className="relative h-48 w-full bg-slate-100 flex items-center justify-center shrink-0 rounded-t-3xl overflow-visible border-b border-slate-100">
        <img
          src={thumbnailUrl || defaultCourseThumbnail}
          alt={course.name || course.title || ""}
          className="w-full h-full object-cover rounded-t-3xl group-hover:scale-105 transition-transform duration-500"
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
                await onShare(course)
                setLinkCopied(true)
                setTimeout(() => setLinkCopied(false), 2000)
              } catch (e) {
                console.error("Share failed", e)
              }
            }}
            className="absolute top-3 right-3 z-10 h-8 w-8 flex items-center justify-center rounded-full bg-black/30 hover:bg-black/60 backdrop-blur-sm text-white transition-all duration-200 opacity-0 group-hover:opacity-100 active:scale-90 cursor-pointer"
            title={sc.shareCourse || "Share"}
          >
            {linkCopied ? <Check size={14} /> : <Share2 size={14} />}
          </button>
        )}
      </div>

      {/* Content Details */}
      <div className="p-5 pt-6 flex flex-col flex-1 justify-between gap-4">
        <div className="flex flex-col gap-3">
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
              <span className="text-xs font-bold text-slate-800 truncate" title={teacherName}>
                {teacherName}
              </span>
            </div>

            <span className="bg-[#FFF0F2] text-[#b20a1c] text-[11px] font-extrabold px-2.5 py-1 rounded-xl border border-rose-200/60 shrink-0">
              {sc.courseBadge || c.courseBadge || "Khóa học"}
            </span>
          </div>

          {/* Hàng 2: Tên khóa học (multiline wrap) */}
          <h3
            className="font-black text-base text-slate-950 leading-snug line-clamp-2 group-hover:text-[#b20a1c] transition-colors break-words"
            title={course.name || course.title}
          >
            {course.name || course.title}
          </h3>

          {/* Hàng 3: Ô vàng nhạt, bo góc, không viền, 4 dòng theo thứ tự */}
          <div className="bg-amber-50/90 rounded-2xl p-3.5 flex flex-col gap-2">
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
                  {studentCount} {c.studentsUnit || sc.studentsUnit || "học viên"}
                </span>
              </div>
            )}

            {/* 4. <BookOpen /> {openClassCount} lớp mở */}
            {(openClassCount != null || classCount != null) && (
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-900 min-w-0">
                <BookOpen size={14} className="text-amber-500 shrink-0" />
                <span className="truncate">
                  {openClassCount != null
                    ? `${openClassCount} ${sc.classesOpen || "lớp mở"}`
                    : `${classCount} ${sc.classesUnit || "lớp"}`}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Footer: Học phí (Left) + Còn {remainingSlots} chỗ (Right, chữ xanh lá) */}
        <div className="pt-3 border-t border-slate-150 flex items-center justify-between gap-3">
          <div className="flex flex-col">
            <span className="text-slate-400 text-[10px] leading-none mb-1 uppercase tracking-wider font-extrabold">
              {sc.tuition || "Học phí"}
            </span>
            <span className="text-[#b20a1c] font-black text-sm sm:text-base leading-none">
              {priceText}
            </span>
          </div>

          <div className="text-emerald-600 font-bold text-xs flex items-center gap-1.5 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200/60 shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span>{slotsText}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default StudentCourseCard
