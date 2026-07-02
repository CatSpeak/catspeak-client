import React from "react"
import { BookOpen, Users, Clock, Languages, Star } from "lucide-react"
import { getCourseGradientAndIcon, formatCurrencyVND } from "../../utils/courseUtils"

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

  const priceText = course.priceRange
    ? course.priceRange.min === 0
      ? sc.priceFree || "Free"
      : `${formatCurrencyVND(course.priceRange.min)} - ${formatCurrencyVND(course.priceRange.max)}`
    : sc.priceFree || "Free"

  if (viewMode === "list") {
    return (
      <div
        onClick={onViewDetails}
        className="bg-white rounded-2xl border border-gray-150 hover:border-gray-250 p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 hover:shadow-xs transition-all duration-300 cursor-pointer"
      >
        <div className="flex items-center gap-4 flex-1">
          {/* Icon/Thumbnail area */}
          <div className="h-16 w-16 shrink-0 rounded-xl overflow-hidden bg-[#D9D9D9] flex items-center justify-center">
            {course.thumbnailUrl ? (
              <img src={course.thumbnailUrl} alt={course.title} className="w-full h-full object-cover" />
            ) : (
              <div className={`w-full h-full bg-gradient-to-br ${gradient} flex items-center justify-center`}>
                <Icon size={24} className="stroke-[1.5]" />
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span className="bg-[#FEF3C7] text-[#D97706] font-extrabold text-[9px] px-2 py-0.5 rounded-full uppercase tracking-wider">
                {course.language}
              </span>
              {course.levels && course.levels.map((lvl) => (
                <span key={lvl} className="bg-gray-100 text-gray-600 font-extrabold text-[9px] px-2 py-0.5 rounded-full uppercase">
                  {lvl}
                </span>
              ))}
            </div>
            <h3 className="font-extrabold text-base text-gray-950 truncate leading-snug">
              {course.title}
            </h3>
            <p className="text-xs text-gray-500 line-clamp-1 mt-0.5">
              {course.description}
            </p>
          </div>
        </div>

        {/* Stats and actions */}
        <div className="flex flex-wrap md:flex-nowrap items-center gap-6 justify-between w-full md:w-auto border-t md:border-t-0 pt-3 md:pt-0 border-gray-100 shrink-0">
          <div className="flex items-center gap-4 text-xs font-semibold text-gray-500">
            <div className="flex items-center gap-1">
              <BookOpen size={13} className="text-gray-400" />
              <span>{course.classCount} batch{course.classCount !== 1 ? "es" : ""}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock size={13} className="text-gray-400" />
              <span>{course.totalSessions} sessions</span>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto justify-end">
            <span className="text-sm font-black text-gray-900 pr-2">
              {isEnrolled ? (
                <span className="text-green-600 font-bold text-xs bg-green-50 px-2.5 py-1 rounded-full">
                  {sc.goToClasses || "Enrolled"}
                </span>
              ) : (
                priceText
              )}
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation()
                isEnrolled ? onViewDetails() : onJoin()
              }}
              className={`h-8 px-4 text-xs font-black rounded-full flex items-center justify-center gap-1.5 transition-all shadow-xs active:scale-95 whitespace-nowrap ${isEnrolled
                  ? "bg-white border border-gray-250 text-gray-700 hover:bg-gray-50"
                  : "bg-[#b20a1c] hover:bg-[#990011] text-white"
                }`}
            >
              <span>{isEnrolled ? (sc.details || "Details") : (sc.joinCourse || "Join")}</span>
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
      className="bg-white rounded-3xl border border-gray-100 hover:border-gray-200 overflow-hidden shadow-xs hover:shadow-md transition-all duration-300 cursor-pointer flex flex-col justify-between min-h-[440px]"
    >
      {/* Thumbnail / Icon area */}
      <div className="relative h-44 w-full bg-[#D9D9D9] flex items-center justify-center shrink-0 overflow-hidden">
        {course.thumbnailUrl ? (
          <img src={course.thumbnailUrl} alt={course.title} className="w-full h-full object-cover" />
        ) : (
          <div className={`w-full h-full bg-gradient-to-br ${gradient} flex items-center justify-center`}>
            <Icon size={48} className="stroke-[1.5]" />
          </div>
        )}

        {/* Badges on card top */}
        <div className="absolute top-3 left-3 flex gap-1.5">
          <span className="bg-white/90 backdrop-blur-xs text-gray-800 text-[10px] font-black px-2.5 py-1 rounded-full flex items-center gap-1 shadow-sm uppercase tracking-wider">
            <Languages size={10} className="text-gray-500" />
            <span>{course.language}</span>
          </span>
          {course.levels && course.levels.slice(0, 2).map((lvl) => (
            <span key={lvl} className="bg-[#b20a1c] text-white text-[10px] font-black px-2.5 py-1 rounded-full shadow-sm">
              {lvl}
            </span>
          ))}
        </div>

        {isEnrolled && (
          <div className="absolute top-3 right-3 bg-green-600 text-white text-[10px] font-black px-3 py-1 rounded-full shadow-sm">
            Enrolled
          </div>
        )}
      </div>

      {/* Content Details */}
      <div className="p-5 flex flex-col flex-1 justify-between gap-4">
        <div className="flex flex-col gap-2">
          <h4 className="font-extrabold text-base text-gray-950 leading-snug line-clamp-1 hover:text-[#b20a1c] transition-colors" title={course.title}>
            {course.title}
          </h4>
          <span className="text-[10px] text-gray-400 font-extrabold uppercase tracking-wide">
            {sc.instructor || "Instructor"}: {course.instructorName || "CatSpeak Native Partner"}
          </span>

          <p className="text-xs text-gray-500 font-medium line-clamp-3 leading-relaxed mt-2" title={course.description}>
            {course.description}
          </p>

          {/* Key details */}
          <div className="mt-4 flex flex-col gap-2 text-xs font-semibold text-gray-500">
            <div className="flex items-center gap-2">
              <BookOpen size={13} className="text-gray-400" />
              <span>{course.classCount} batch{course.classCount !== 1 ? "es" : ""} available</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock size={13} className="text-gray-400" />
              <span>{course.totalSessions} sessions ({sc.classDuration || "Duration"})</span>
            </div>
          </div>
        </div>

        {/* Progress or Pricing Footer */}
        <div className="pt-4 border-t border-gray-100 flex flex-col gap-3">
          {isEnrolled && course.progress ? (
            <div className="w-full">
              <div className="flex justify-between items-center text-[10px] font-bold text-gray-400 uppercase">
                <span>{sc.progress || "Progress"}</span>
                <span>{Math.round((course.progress.completedSessions / course.progress.totalSessions) * 100)}%</span>
              </div>
              <div className="h-1.5 w-full bg-gray-100 rounded-full mt-1.5 overflow-hidden">
                <div
                  className="h-full bg-green-500 rounded-full transition-all duration-500"
                  style={{ width: `${(course.progress.completedSessions / course.progress.totalSessions) * 100}%` }}
                />
              </div>
              <div className="text-[10px] font-bold text-gray-500 mt-1 truncate">
                {course.enrolledClassName || "Active Class"}
              </div>
            </div>
          ) : (
            <div className="flex justify-between items-center w-full">
              <div className="flex flex-col">
                <span className="text-gray-400 text-[10px] leading-none mb-0.5 uppercase tracking-wider font-extrabold">{sc.tuition || "Tuition"}</span>
                <span className="text-gray-900 font-black text-sm">{priceText}</span>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  isEnrolled ? onViewDetails() : onJoin()
                }}
                className={`h-8 px-4 text-xs font-black rounded-full flex items-center justify-center gap-1 transition-all shadow-xs active:scale-95 whitespace-nowrap ${isEnrolled
                    ? "bg-white border border-gray-250 text-gray-700 hover:bg-gray-50"
                    : "bg-[#b20a1c] hover:bg-[#990011] text-white"
                  }`}
              >
                <span>{isEnrolled ? (sc.details || "Details") : (sc.joinCourse || "Join")}</span>
                <span>&rarr;</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default StudentCourseCard
