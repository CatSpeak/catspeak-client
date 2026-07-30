import React from "react"
import { Calendar, Tag, Clock } from "lucide-react"
import {
  formatDateRange,
  formatCurrencyVND,
  getCourseLocale,
  getSafeMediaUrl,
} from "../utils/courseUtils"
import CourseStatusPill from "./CourseStatusPill"
import { useLanguage } from "@/shared/context/LanguageContext"
import { formatScheduleDays } from "../utils/scheduleUtils"

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
  const { language, t } = useLanguage()
  const c = t.courses || {}
  const scd = c.studentCourseDetail || {}
  const ui = c.workspaceUi || {}
  const completedSessions = Number(cls.completedSessions)
  const totalSessions = Number(cls.totalSessions)
  const progress = (
    Number.isFinite(completedSessions)
    && completedSessions >= 0
    && Number.isFinite(totalSessions)
    && totalSessions > 0
  )
    ? Math.min(100, Math.round((completedSessions / totalSessions) * 100))
    : null
  const thumbnailUrl = getSafeMediaUrl(cls.thumbnailUrl)
  const tuitionLabel = cls.tuitionFee == null
    ? ui.tba || "TBA"
    : formatCurrencyVND(cls.tuitionFee)

  return (
    <div
      onClick={isLocked ? undefined : onClick}
      aria-disabled={isLocked || undefined}
      className={`bg-white border rounded-3xl overflow-hidden shadow-xs hover:shadow-md transition-all duration-300 flex flex-col justify-between ${isClassEnrolled
        ? "border-green-300 ring-2 ring-green-50/50"
        : isLocked
          ? "border-gray-100 opacity-60 cursor-not-allowed"
          : "border-gray-100 cursor-pointer"
        }`}
    >
      {/* Image Thumbnail Placeholder Area */}
      <div className="relative h-60 bg-[#D9D9D9] flex items-center justify-center overflow-hidden shrink-0">
        {thumbnailUrl ? (
          <img
            src={thumbnailUrl}
            alt={cls.title || ""}
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
                {c.student?.enrolled || "Enrolled"}
              </span>
            ) : isLocked ? (
              <span className="text-[10px] font-black px-3 py-1 rounded-full bg-gray-200 text-gray-500">
                {scd.locked || "Locked"}
              </span>
            ) : (
              <span className="text-[10px] font-black px-3 py-1 rounded-full bg-blue-105 text-blue-700">
                {scd.open || "Open"}
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
            <button
              type="button"
              disabled={isLocked}
              className="text-left disabled:cursor-not-allowed"
              onClick={(event) => {
                event.stopPropagation()
                onClick?.()
              }}
            >
              {cls.title}
            </button>
          </h4>
          <span className="text-xs text-gray-400 font-bold mt-1 block">
            {c.course ? `${c.course} ${courseTitle}` : `Course ${courseTitle}`}
          </span>

          <div className="mt-4 flex flex-col gap-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-gray-500">
              <Tag size={13} className="text-gray-400" />
              <span className="text-gray-900 font-extrabold">{tuitionLabel}</span>
            </div>
            <div className="flex items-center gap-2 text-xs font-semibold text-gray-500">
              <Calendar size={13} className="text-gray-400" />
              <span>
                {formatScheduleDays(
                  cls.schedule?.days,
                  language,
                  ui.tba,
                )}
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs font-semibold text-gray-500">
              <Clock size={13} className="text-gray-400" />
              <span>
                {formatDateRange(
                  cls.startDate,
                  cls.endDate,
                  getCourseLocale(language),
                  ui.tba,
                )}
              </span>
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
                  <span>{progress == null ? "—" : `${progress}%`}</span>
                </div>
                <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-green-500 rounded-full" style={{ width: `${progress ?? 0}%` }} />
                </div>
              </div>
            )}

            <div className="flex justify-end items-center gap-4">
              {isClassEnrolled ? (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    onClick()
                  }}
                  className="h-8 px-4 bg-green-600 hover:bg-green-700 text-white text-xs font-black rounded-full flex items-center justify-center gap-1.5 transition-all shadow-xs active:scale-95"
                >
                  <span>{scd.goToClass || "Go to Class"}</span>
                  <span>→</span>
                </button>
              ) : isLocked ? (
                <span className="text-xs text-gray-400 font-bold italic">
                  {scd.otherBatchSelected || "Other batch selected"}
                </span>
              ) : (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    onEnroll(e)
                  }}
                  className="h-8 px-4 bg-[#b20a1c] hover:bg-[#990011] text-white text-xs font-black rounded-full flex items-center justify-center gap-1.5 transition-all shadow-xs active:scale-95"
                >
                  <span>{c.student?.enroll || "Enroll"}</span>
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
                <span>{progress == null ? "—" : `${progress}%`}</span>
              </div>
              <div className="h-1.5 w-full bg-gray-100 rounded-full mt-2 overflow-hidden">
                <div className="h-full bg-[#b20a1c] rounded-full transition-all duration-500" style={{ width: `${progress ?? 0}%` }} />
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default ClassCard
