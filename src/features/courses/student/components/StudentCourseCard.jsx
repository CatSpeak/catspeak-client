import React, { useState } from "react"
import { BookOpen, Clock, Languages, ArrowRight, User, Users, ShieldCheck, Calendar, Share2, Check, AlertTriangle } from "lucide-react"
import {
  getCourseGradientAndIcon,
  formatCurrencyVND,
  getSafeMediaUrl,
  defaultCourseThumbnail,
  isClosingSoon,
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
  index
}) => {
  const { t: contextT } = useLanguage()
  const { formatDateMonth } = useTimezone()
  const t = propsT || contextT
  const sc = t?.courses?.student || {}
  const ui = t?.courses?.workspaceUi || {}
  const { gradient, icon: Icon } = getCourseGradientAndIcon(index)
  const thumbnailUrl = getSafeMediaUrl(course.thumbnailUrl)

  // Teacher Info
  const teacher = course.teacher || {}
  const teacherName = teacher.name || teacher.fullName || course.instructorName || sc.defaultInstructor || "Giảng viên CatSpeak"
  const teacherAvatar = getSafeMediaUrl(teacher.avatarImageUrl || teacher.avatar || teacher.avatarUrl)

  // Pricing Logic
  const minPrice = course.priceMin ?? course.priceRange?.min ?? course.price
  const maxPrice = course.priceMax ?? course.priceRange?.max ?? course.price
  const hasMinPrice = minPrice != null && Number.isFinite(Number(minPrice)) && Number(minPrice) >= 0
  const hasMaxPrice = maxPrice != null && Number.isFinite(Number(maxPrice)) && Number(maxPrice) >= Number(minPrice)

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
  const openClassCount = course.openClassCount != null ? Number(course.openClassCount) : null
  const classCount = course.classCount != null ? Number(course.classCount) : openClassCount
  const studentCount = course.studentCount != null ? Number(course.studentCount) : null
  const remainingSlots = course.remainingSlots != null ? Number(course.remainingSlots) : null
  const minEnrollmentEnd = course.minEnrollmentEnd || course.enrollmentEnd

  const [linkCopied, setLinkCopied] = useState(false)

  const closingSoon = isClosingSoon(minEnrollmentEnd)

  const handleCardAction = (e) => {
    e.stopPropagation()
    if (isEnrolled) {
      onViewDetails()
    } else if (onJoin) {
      onJoin()
    } else {
      onViewDetails()
    }
  }

  // --- List View Mode ---
  if (viewMode === "list") {
    return (
      <div
        onClick={onViewDetails}
        className="bg-white rounded-3xl border border-border hover:border-[#b20a1c]/30 p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 hover:shadow-lg transition-all duration-300 cursor-pointer group"
      >
        <div className="flex items-center gap-5 flex-1 min-w-0">
          {/* Thumbnail */}
          <div className="h-20 w-32 shrink-0 rounded-2xl overflow-hidden bg-slate-100 flex items-center justify-center relative shadow-sm border border-border group-hover:scale-[1.02] transition-transform duration-300">
            {thumbnailUrl ? (
              <img
                src={thumbnailUrl}
                alt={course.name || course.title || ""}
                className="w-full h-full object-cover"
                loading="lazy"
                decoding="async"
              />
            ) : (
              <div className={`w-full h-full bg-gradient-to-br ${gradient} flex items-center justify-center`}>
                <Icon size={28} className="stroke-[1.5] text-white" />
              </div>
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

          <div className="flex-1 min-w-0">
            {/* Top Badges */}
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="bg-[#b20a1c]/10 text-[#b20a1c] border border-rose-200/60 font-black text-[10px] px-2.5 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1">
                <BookOpen size={10} />
                {sc.courseBadge || "Khóa học"}
              </span>
              <span className="bg-slate-100 text-slate-700 font-bold text-[10px] px-2.5 py-0.5 rounded-full uppercase border border-border">
                {getLocalizedLanguageName(course.language, t)}
              </span>
              {openClassCount != null && openClassCount > 0 && (
                <span className="bg-emerald-50 text-emerald-700 font-black text-[10px] px-2.5 py-0.5 rounded-full uppercase border border-emerald-200/60 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  {openClassCount} {sc.classesOpen || "lớp mở"}
                </span>
              )}
            </div>

            <h3 className="font-black text-lg text-slate-950 truncate leading-snug group-hover:text-[#b20a1c] transition-colors">
              {course.name || course.title}
            </h3>

            {/* Teacher info */}
            <div className="flex items-center gap-2 mt-1.5 text-xs text-slate-500 font-semibold">
              {teacherAvatar ? (
                <img src={teacherAvatar} alt={teacherName} className="w-5 h-5 rounded-full object-cover ring-1 ring-slate-200" />
              ) : (
                <User size={14} className="text-slate-400" />
              )}
              <span className="text-slate-700 font-bold">{teacherName}</span>
            </div>
          </div>
        </div>

        {/* Right Stats & Actions */}
        <div className="flex flex-wrap md:flex-nowrap items-center gap-6 justify-between w-full md:w-auto border-t md:border-t-0 pt-4 md:pt-0 border-slate-150 shrink-0">
          <div className="flex items-center gap-4 text-xs font-bold text-slate-500">
            {studentCount != null && (
              <div className="flex items-center gap-1">
                <Users size={14} className="text-slate-400" />
                <span>{studentCount} {sc.studentsUnit || "học viên"}</span>
              </div>
            )}
            {closingSoon ? (
              <div className="flex items-center gap-1 text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200/60">
                <AlertTriangle size={12} />
                <span>{sc.closingSoon || "Sắp đóng tuyển sinh"}</span>
              </div>
            ) : remainingSlots != null && (
              <div className="flex items-center gap-1 text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200/60">
                <Clock size={12} />
                <span>{sc.slotsRemaining ? sc.slotsRemaining.replace("{{count}}", remainingSlots) : `Còn ${remainingSlots} chỗ`}</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-4 w-full md:w-auto justify-end">
            <div className="flex flex-col text-right">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">{sc.tuition || "Học phí"}</span>
              <span className="text-base font-black text-[#b20a1c] leading-none">{priceText}</span>
            </div>
            <button
              type="button"
              onClick={handleCardAction}
              className="h-10 px-5 text-xs font-extrabold rounded-full bg-[#b20a1c] hover:bg-[#960817] text-white flex items-center justify-center gap-1.5 transition-all shadow-md active:scale-95 whitespace-nowrap cursor-pointer"
            >
              <span>{isEnrolled ? (sc.details || "Chi tiết") : (sc.viewCourse || "Xem Khóa Học")}</span>
              <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    )
  }

  // --- Grid View Mode ---
  return (
    <div
      onClick={onViewDetails}
      className="relative bg-white rounded-3xl border border-border hover:border-[#b20a1c]/30 overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 cursor-pointer flex flex-col justify-between group"
    >
      {/* Thumbnail Area */}
      <div className="relative h-52 w-full bg-slate-100 flex items-center justify-center shrink-0 overflow-hidden border-b border-slate-100">
        <img
          src={thumbnailUrl || defaultCourseThumbnail}
          alt={course.name || course.title || ""}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
          decoding="async"
        />
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
      <div className="p-5 flex flex-col flex-1 justify-between gap-5">
        <div className="flex flex-col gap-2.5">
          <h3 className="font-black text-lg text-slate-950 leading-snug line-clamp-2 group-hover:text-[#b20a1c] transition-colors" title={course.name || course.title}>
            {course.name || course.title}
          </h3>

          {/* Instructor Profile */}
          <div className="flex items-center gap-2.5 pt-1">
            {teacherAvatar ? (
              <img src={teacherAvatar} alt={teacherName} className="w-7 h-7 rounded-full object-cover ring-2 ring-rose-100 shadow-2xs" />
            ) : (
              <div className="w-7 h-7 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-xs">
                {teacherName.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="flex flex-col">
              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider leading-none">
                {sc.instructor || "Giảng viên"}
              </span>
              <span className="text-xs font-bold text-slate-800 line-clamp-1 flex items-center gap-1">
                {teacherName}
                <ShieldCheck size={12} className="text-rose-500 inline shrink-0" />
              </span>
            </div>
          </div>

          {/* Class Metrics */}
          <div className="mt-2 text-xs font-bold text-slate-700 bg-slate-50/80 p-3 rounded-2xl border border-slate-100">
            <div className="grid grid-cols-2 gap-x-3 gap-y-2.5">
              {/* 1. Language */}
              <div className="flex items-center gap-1.5 min-w-0" title={getLocalizedLanguageName(course.language, t)}>
                <Languages size={13} className="text-indigo-500 shrink-0" />
                <span className="truncate text-slate-800">{getLocalizedLanguageName(course.language, t)}</span>
              </div>

              {/* 2. Students */}
              <div className="flex items-center gap-1.5 min-w-0">
                <Users size={13} className="text-sky-500 shrink-0" />
                <span className="truncate text-slate-800">{studentCount != null ? `${studentCount} ${sc.studentsUnit || "học viên"}` : `0 ${sc.studentsUnit || "học viên"}`}</span>
              </div>

              {/* 3. Open Classes */}
              <div className="flex items-center gap-1.5 min-w-0">
                <BookOpen size={13} className="text-purple-500 shrink-0" />
                <span className="truncate text-slate-800">
                  {openClassCount != null ? `${openClassCount} ${sc.classesOpen || "lớp mở"}` : `${classCount != null && classCount !== "—" ? classCount : 0} ${sc.classesUnit || "lớp"}`}
                </span>
              </div>

              {/* 4. Registration Deadline / Closing Soon */}
              {closingSoon ? (
                <div className="flex items-center gap-1.5 min-w-0">
                  <AlertTriangle size={13} className="text-rose-500 shrink-0" />
                  <span className="truncate text-rose-700 font-black">{sc.closingSoon || "Sắp đóng tuyển sinh"}</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 min-w-0">
                  <Calendar size={13} className="text-amber-500 shrink-0" />
                  <span className="truncate text-slate-800">
                    {minEnrollmentEnd
                      ? `${sc.registrationDeadline || "Hạn ĐK"}: ${formatDateMonth(minEnrollmentEnd, ui.tba || "TBA")}`
                      : (ui.tba || "TBA")}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer Pricing & CTA */}
        <div className="pt-3.5 border-t border-slate-150 flex items-center justify-between gap-3">
          <div className="flex flex-col">
            <span className="text-slate-400 text-[10px] leading-none mb-1 uppercase tracking-wider font-extrabold">{sc.tuition || "Học phí"}</span>
            <span className="text-[#b20a1c] font-black text-sm sm:text-base leading-none">{priceText}</span>
          </div>

          <button
            type="button"
            onClick={handleCardAction}
            className="h-9 px-4 bg-[#b20a1c] hover:bg-[#960817] text-white text-xs font-extrabold rounded-full flex items-center justify-center gap-1 transition-all shadow-md hover:shadow-lg active:scale-95 cursor-pointer"
          >
            <span>{sc.explore || "Khám Phá"}</span>
            <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  )
}

export default StudentCourseCard
