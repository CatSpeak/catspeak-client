import React from "react"
import { BookOpen, Clock, Languages, ArrowRight, User } from "lucide-react"
import {
  getCourseGradientAndIcon,
  formatCurrencyVND,
  getSafeMediaUrl,
} from "../../utils/courseUtils"
import { getLocalizedLanguageName } from "../../data/courseFormOptions"

const StudentCourseCard = ({
  course,
  isEnrolled,
  viewMode = "grid",
  onViewDetails,
  onJoin,
  t,
  index
}) => {
  const { gradient, icon: Icon } = getCourseGradientAndIcon(index)
  const sc = t?.courses?.student || {}
  const thumbnailUrl = getSafeMediaUrl(course.thumbnailUrl)
  const minimumPrice = Number(course.priceRange?.min)
  const maximumPrice = Number(course.priceRange?.max)
  const hasMinimumPrice = Number.isFinite(minimumPrice) && minimumPrice >= 0
  const hasMaximumPrice = Number.isFinite(maximumPrice) && maximumPrice >= minimumPrice
  const priceText = hasMinimumPrice && hasMaximumPrice
    ? minimumPrice === 0 && maximumPrice === 0
      ? sc.priceFree
      : `${formatCurrencyVND(minimumPrice)} - ${formatCurrencyVND(maximumPrice)}`
    : sc.toBeAnnounced
  const classCount = course.classCount != null && course.classCount !== "" && Number.isFinite(Number(course.classCount))
    ? Number(course.classCount)
    : "—"
  const totalSessions = course.totalSessions != null && course.totalSessions !== "" && Number.isFinite(Number(course.totalSessions))
    ? Number(course.totalSessions)
    : "—"
  const instructorName = course.instructorName || course.teacher?.name || "—"
  const completedSessions = Number(course.progress?.completedSessions)
  const progressTotal = Number(course.progress?.totalSessions)
  const progressPercent = (
    Number.isFinite(completedSessions)
    && completedSessions >= 0
    && Number.isFinite(progressTotal)
    && progressTotal > 0
  )
    ? Math.min(100, Math.round((completedSessions / progressTotal) * 100))
    : null
  const formatCountLabel = (template, count) => (
    template.replace("{{count}}", String(count))
  )
  if (viewMode === "list") {
    return (
      <div
        onClick={onViewDetails}
        className="bg-white rounded-3xl border border-gray-150 hover:border-[#990011]/20 p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 hover:shadow-md transition-all duration-300 cursor-pointer group"
      >
        <div className="flex items-center gap-5 flex-1 min-w-0">
          {/* Icon/Thumbnail area */}
          <div className="h-16 w-24 shrink-0 rounded-2xl overflow-hidden bg-[#D9D9D9] flex items-center justify-center relative shadow-sm border border-gray-100 group-hover:scale-102 transition-transform duration-300">
            {thumbnailUrl ? (
              <img
                src={thumbnailUrl}
                alt={course.title || ""}
                className="w-full h-full object-cover"
                loading="lazy"
                decoding="async"
              />
            ) : (
              <div className={`w-full h-full bg-gradient-to-br ${gradient} flex items-center justify-center`}>
                <Icon size={24} className="stroke-[1.5] text-white" />
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <span className="bg-[#fcf8e3] border border-amber-200/50 text-[#b28730] font-black text-[9px] px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                {getLocalizedLanguageName(course.language, t)}
              </span>
              {Array.isArray(course.levels) && course.levels.map((lvl) => (
                <span key={lvl} className="bg-red-50 text-[#990011] font-black text-[9px] px-2.5 py-0.5 rounded-full uppercase border border-red-100/50">
                  {lvl}
                </span>
              ))}
            </div>
            <h3 className="font-black text-base text-gray-950 truncate leading-snug group-hover:text-[#990011] transition-colors">
              {course.title}
            </h3>
            <p className="text-xs text-gray-500 font-semibold line-clamp-1 mt-1 flex items-center gap-1.5">
              <User size={12} className="text-gray-400" />
              <span>{instructorName}</span>
            </p>
          </div>
        </div>

        {/* Stats and actions */}
        <div className="flex flex-wrap md:flex-nowrap items-center gap-6 justify-between w-full md:w-auto border-t md:border-t-0 pt-4 md:pt-0 border-gray-150 shrink-0">
          <div className="flex items-center gap-4 text-xs font-bold text-gray-500">
            <div className="flex items-center gap-1">
              <BookOpen size={13} className="text-gray-400" />
              <span>{formatCountLabel(sc.batchesCount, classCount)}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock size={13} className="text-gray-400" />
              <span>{formatCountLabel(sc.sessionsCount, totalSessions)}</span>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto justify-end">
            <div className="text-sm font-black text-gray-950 pr-2">
              {isEnrolled ? (
                <span className="text-green-700 font-black text-xs bg-green-50 px-3 py-1 rounded-full border border-green-100 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500" /> {sc.enrolledStatus}
                </span>
              ) : (
                <div className="flex flex-col text-right">
                  <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest leading-none mb-0.5">{sc.tuition}</span>
                  <span className="text-sm font-black text-[#990011] leading-none">{priceText}</span>
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                isEnrolled ? onViewDetails() : onJoin()
              }}
              className={`h-9 px-5 text-xs font-black rounded-full flex items-center justify-center gap-1.5 transition-all shadow-xs active:scale-95 whitespace-nowrap ${isEnrolled
                ? "bg-white border border-gray-250 text-gray-700 hover:bg-gray-50"
                : "bg-[#990011] hover:bg-[#b20a1c] text-white"
                }`}
            >
              <span>{isEnrolled ? sc.details : sc.joinCourse}</span>
              <ArrowRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Grid Layout
  return (
    <div
      onClick={onViewDetails}
      className="bg-white rounded-3xl border border-gray-150 hover:border-[#990011]/20 overflow-hidden shadow-sm hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.06)] hover:-translate-y-1.5 transition-all duration-300 cursor-pointer flex flex-col justify-between min-h-[450px] group"
    >
      {/* Thumbnail / Icon area */}
      <div className="relative h-60 w-full bg-[#D9D9D9] flex items-center justify-center shrink-0 overflow-hidden border-b border-gray-100">
        {thumbnailUrl ? (
          <img
            src={thumbnailUrl}
            alt={course.title || ""}
            className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500"
            loading="lazy"
            decoding="async"
          />
        ) : (
          <div className={`w-full h-full bg-gradient-to-br ${gradient} flex items-center justify-center group-hover:scale-102 transition-transform duration-500`}>
            <Icon size={44} className="stroke-[1.5] text-white" />
          </div>
        )}

        {/* Badges on card top */}
        <div className="absolute top-3 left-3 flex gap-1.5">
          <span className="bg-white/95 backdrop-blur-xs border border-gray-100 text-gray-800 text-[10px] font-black px-2.5 py-1 rounded-full flex items-center gap-1 shadow-sm uppercase tracking-wider">
            <Languages size={10} className="text-gray-500" />
            <span>{getLocalizedLanguageName(course.language, t)}</span>
          </span>
          {Array.isArray(course.levels) && course.levels.slice(0, 2).map((lvl) => (
            <span key={lvl} className="bg-[#990011]/90 text-white text-[10px] font-black px-2.5 py-1 rounded-full shadow-sm">
              {lvl}
            </span>
          ))}
        </div>

        {isEnrolled && (
          <div className="absolute top-3 right-3 bg-green-600 border border-green-500/20 text-white text-[10px] font-black px-3 py-1 rounded-full shadow-sm flex items-center gap-1">
            {sc.enrolledStatus}
          </div>
        )}
      </div>

      {/* Content Details */}
      <div className="p-5 flex flex-col flex-1 justify-between gap-4">
        <div className="flex flex-col gap-2">
          <h4 className="font-black text-base text-gray-950 leading-snug line-clamp-1 group-hover:text-[#990011] transition-colors" title={course.title}>
            {course.title}
          </h4>

          <div className="flex items-center gap-1.5 text-[10px] text-gray-400 font-extrabold uppercase tracking-wide">
            <User size={12} className="text-gray-400" />
            <span>{sc.instructor}: {instructorName}</span>
          </div>

          <p className="text-xs text-gray-500 font-semibold line-clamp-3 leading-relaxed mt-2" title={course.description ? course.description.replace(/<[^>]*>/g, " ").trim() : ""}>
            {course.description ? course.description.replace(/<[^>]*>/g, " ").trim() : ""}
          </p>

          {/* Key details */}
          <div className="mt-4 flex flex-col gap-2 text-xs font-bold text-gray-500 bg-slate-50 p-3 rounded-2xl border border-gray-100">
            <div className="flex items-center gap-2">
              <BookOpen size={13} className="text-gray-400" />
              <span>{formatCountLabel(sc.batchesAvailable, classCount)}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock size={13} className="text-gray-400" />
              <span>{formatCountLabel(sc.sessionsCount, totalSessions)}</span>
            </div>
          </div>
        </div>

        {/* Progress or Pricing Footer */}
        <div className="pt-4 border-t border-gray-150 flex flex-col gap-3">
          {isEnrolled ? (
            <div className="w-full">
              <div className="flex justify-between items-center text-[10px] font-bold text-gray-400 uppercase">
                <span>{sc.progress}</span>
                <span>{progressPercent == null ? "—" : `${progressPercent}%`}</span>
              </div>
              <div className="h-1.5 w-full bg-gray-100 rounded-full mt-1.5 overflow-hidden">
                <div
                  className="h-full bg-green-500 rounded-full transition-all duration-500"
                  style={{ width: `${progressPercent ?? 0}%` }}
                  role="progressbar"
                  aria-label={sc.progress}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={progressPercent ?? 0}
                />
              </div>
              <div className="text-[10px] font-bold text-gray-500 mt-1 truncate">
                {sc.classLabel}{course.enrolledClassName || "—"}
              </div>
            </div>
          ) : (
            <div className="flex justify-between items-center w-full">
              <div className="flex flex-col">
                <span className="text-gray-400 text-[10px] leading-none mb-1 uppercase tracking-wider font-black">{sc.tuition}</span>
                <span className="text-gray-950 font-black text-sm">{priceText}</span>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  isEnrolled ? onViewDetails() : onJoin()
                }}
                className={`h-9 px-5 text-xs font-black rounded-full flex items-center justify-center gap-1 transition-all shadow-xs active:scale-95 whitespace-nowrap group-hover:translate-x-0.5 duration-300 ${isEnrolled
                  ? "bg-white border border-gray-250 text-gray-700 hover:bg-gray-50"
                  : "bg-[#990011] hover:bg-[#b20a1c] text-white shadow-md hover:shadow-lg"
                  }`}
              >
                <span>{isEnrolled ? sc.details : sc.joinCourse}</span>
                <ArrowRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default StudentCourseCard
