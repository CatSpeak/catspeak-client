import React from "react"
import { Calendar, Tag, Clock } from "lucide-react"
import { formatDateRange, formatCurrencyVND } from "../utils/courseUtils"
import CourseStatusPill from "./CourseStatusPill"
import { useLanguage } from "@/shared/context/LanguageContext"

const ClassCard = ({
  cls,
  isStudent,
  isClassEnrolled,
  isLocked,
  onClick,
  onEnroll,
  progressLabel,
  courseTitle
}) => {
  const { t } = useLanguage()
  const c = t.courses || {}
  const progress = cls.totalSessions ? Math.round((cls.completedSessions / cls.totalSessions) * 100) : 0

  return (
    <div
      onClick={onClick}
      className={`bg-white border rounded-3xl overflow-hidden shadow-xs hover:shadow-md transition-all duration-300 flex flex-col justify-between ${isClassEnrolled
        ? "border-green-300 ring-2 ring-green-50/50"
        : isLocked
          ? "border-gray-100 opacity-60 cursor-not-allowed"
          : "border-gray-100 cursor-pointer"
        }`}
    >
      {/* Image Thumbnail Placeholder Area */}
      <div className="relative h-44 bg-[#D9D9D9] flex items-center justify-center overflow-hidden shrink-0">
        {cls.thumbnailUrl ? (
          <img
            src={cls.thumbnailUrl}
            alt={cls.title}
            className="w-full h-full object-cover"
            loading="lazy"
            decoding="async"
          />
        ) : null}



        {/* Top-right status pill */}
        <div className="absolute top-3 right-3">
          {isStudent ? (
            isClassEnrolled ? (
              <span className="text-[10px] font-black px-3 py-1 rounded-full bg-green-100 text-green-700">
                Enrolled
              </span>
            ) : isLocked ? (
              <span className="text-[10px] font-black px-3 py-1 rounded-full bg-gray-200 text-gray-500">
                Locked
              </span>
            ) : (
              <span className="text-[10px] font-black px-3 py-1 rounded-full bg-blue-105 text-blue-700">
                Open
              </span>
            )
          ) : (
            <CourseStatusPill status={cls.status} />
          )}
        </div>
      </div>

      {/* Class Details Area */}
      <div className="p-6 flex flex-col flex-1 justify-between">
        <div>
          <h4 className="font-extrabold text-base text-gray-950 leading-snug line-clamp-1 hover:text-[#b20a1c] transition-colors" title={cls.title}>
            {cls.title}
          </h4>
          <span className="text-xs text-gray-400 font-bold mt-1 block">
            {c.course ? `${c.course} ${courseTitle}` : `Course ${courseTitle}`}
          </span>

          <div className="mt-4 flex flex-col gap-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-gray-500">
              <Tag size={13} className="text-gray-400" />
              <span className="text-gray-900 font-extrabold">{formatCurrencyVND(cls.tuitionFee)}</span>
            </div>
            <div className="flex items-center gap-2 text-xs font-semibold text-gray-500">
              <Calendar size={13} className="text-gray-400" />
              <span>{cls.schedule?.days?.join(" - ") || "TBA"}</span>
            </div>
            <div className="flex items-center gap-2 text-xs font-semibold text-gray-500">
              <Clock size={13} className="text-gray-400" />
              <span>{formatDateRange(cls.startDate, cls.endDate)}</span>
            </div>
          </div>
        </div>

        {/* Student / Teacher footer split */}
        {isStudent ? (
          <div className="mt-5 pt-4 border-t border-gray-100 flex flex-col gap-4">
            {isClassEnrolled && (
              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center text-xs font-bold text-gray-500">
                  <span>{progressLabel}</span>
                  <span>{progress}%</span>
                </div>
                <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-green-500 rounded-full" style={{ width: `${progress}%` }} />
                </div>
              </div>
            )}

            <div className="flex justify-end items-center gap-4">
              {isClassEnrolled ? (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onClick()
                  }}
                  className="h-8 px-4 bg-green-600 hover:bg-green-700 text-white text-xs font-black rounded-full flex items-center justify-center gap-1.5 transition-all shadow-xs active:scale-95"
                >
                  <span>Go to Class</span>
                  <span>→</span>
                </button>
              ) : isLocked ? (
                <span className="text-xs text-gray-400 font-bold italic">Other batch selected</span>
              ) : (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onEnroll(e)
                  }}
                  className="h-8 px-4 bg-[#b20a1c] hover:bg-[#990011] text-white text-xs font-black rounded-full flex items-center justify-center gap-1.5 transition-all shadow-xs active:scale-95"
                >
                  <span>Enroll</span>
                </button>
              )}
            </div>
          </div>
        ) : (
          <>
            {/* Progress Section */}
            <div className="mt-5">
              <div className="flex justify-between items-center text-xs font-bold text-gray-500">
                <span>{progressLabel}</span>
                <span>{progress}%</span>
              </div>
              <div className="h-1.5 w-full bg-gray-100 rounded-full mt-2 overflow-hidden">
                <div className="h-full bg-[#b20a1c] rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default ClassCard
