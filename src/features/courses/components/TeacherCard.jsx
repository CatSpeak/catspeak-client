import React, { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Star, Users, GraduationCap, ArrowRight, Check } from "lucide-react"
import {
  getTeacherInitials,
  getTeacherHeadline,
  formatTeacherNumber,
  formatRating,
  getTeacherSlugOrId,
} from "../utils/teacherUtils"

const TeacherCard = ({
  teacher,
  onViewProfile,
  t,
  viewMode = "grid",
}) => {
  const navigate = useNavigate()
  const [imgError, setImgError] = useState(false)

  if (!teacher) return null

  const name = teacher.name || teacher.fullName || t?.defaultTeacherHeadline
  const avatarUrl = teacher.avatarUrl || teacher.avatar
  const headline = getTeacherHeadline(teacher, t?.defaultTeacherHeadline, t?.teacherLanguageHeadline)
  const rating = formatRating(teacher.rating || teacher.averageRating)
  const reviewCount = Number(teacher.reviewCount || teacher.totalReviews || 0)
  const totalStudents = teacher.totalStudents || teacher.studentCount || 0
  const activeClassesCount =
    teacher.activeClassCount || teacher.activeClassesCount || teacher.openClassesCount || 0
  const slugOrId = getTeacherSlugOrId(teacher)
  const isList = viewMode === "list"

  const handleCardClick = (e) => {
    e.stopPropagation()
    if (onViewProfile) {
      onViewProfile(teacher)
    } else if (slugOrId) {
      navigate(`/explore/teachers/${encodeURIComponent(slugOrId)}`)
    }
  }

  const renderAvatar = (size) => (
    <div className={`relative shrink-0 ${size}`}>
      {avatarUrl && !imgError ? (
        <img
          src={avatarUrl}
          alt={name}
          onError={() => setImgError(true)}
          className={`${size} rounded-full object-cover ring-2 ring-slate-100 dark:ring-[#2E2E2E] shadow-2xs`}
        />
      ) : (
        <div
          className={`${size} rounded-full bg-red-50 dark:bg-rose-950/40 text-[#990011] dark:text-[#FF6B6B] font-extrabold text-xl flex items-center justify-center ring-2 ring-slate-100 dark:ring-[#2E2E2E] shadow-2xs`}
        >
          {getTeacherInitials(name)}
        </div>
      )}

      {/* BR-EX-GV-02: Verified Badge Overlay (bottom-right) */}
      <div
        title={t?.verifiedTeacher}
        className="absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full bg-[#10B981] ring-2 ring-white dark:ring-[#1A1A1A] flex items-center justify-center shadow-xs"
      >
        <Check size={11} className="text-white stroke-[3]" />
      </div>
    </div>
  )

  const renderRating = () => (
    <div className="flex items-center gap-1.5 text-xs">
      <Star size={13} className="fill-[#FBBF24] text-[#FBBF24]" />
      <span className="font-bold text-slate-800 dark:text-gray-200">{rating}</span>
      <span className="text-slate-400 dark:text-gray-500 font-normal">
        ({reviewCount > 0 ? t?.teacherReviews?.replace("{{count}}", reviewCount) : t?.teacherNoReviews})
      </span>
    </div>
  )

  const renderStats = () => (
    <div className="w-full bg-[#F9FAFB] dark:bg-[#242424] border border-[#F3F4F6] dark:border-[#333333] rounded-xl px-3 py-2 flex items-center justify-center gap-2 text-xs">
      {/* Số học viên */}
      <div className="flex items-center gap-1 text-slate-600 dark:text-gray-300 font-semibold truncate">
        <Users size={13} className="text-slate-400 dark:text-gray-500 shrink-0" />
        <span>{t?.teacherStudents?.replace("{{count}}", formatTeacherNumber(totalStudents))}</span>
      </div>

      <span className="text-slate-300 dark:text-gray-600 font-bold">·</span>

      {/* Số lớp đang mở */}
      <div className="flex items-center gap-1 text-[#990011] dark:text-[#FF6B6B] font-semibold truncate shrink-0">
        <GraduationCap size={14} className="text-[#990011] dark:text-[#FF6B6B] shrink-0" />
        <span>{Number(activeClassesCount) > 0 ? t?.teacherOpenClasses?.replace("{{count}}", activeClassesCount) : t?.teacherNoOpenClasses}</span>
      </div>
    </div>
  )

  const renderProfileButton = (extraClassName = "") => (
    <button
      type="button"
      onClick={handleCardClick}
      className={`${extraClassName} rounded-xl border border-[#990011] dark:border-[#FF6B6B] text-[#990011] dark:text-[#FF6B6B] group-hover:bg-[#990011] group-hover:text-white dark:group-hover:bg-[#FF6B6B] dark:group-hover:text-black transition-all text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs active:scale-[0.98]`}
    >
      <span>{t?.viewProfile || "Xem trang cá nhân"}</span>
      <ArrowRight size={13} className="transition-transform group-hover:translate-x-0.5" />
    </button>
  )

  // ISS-47: list mode mirrors the horizontal StudentCourseCard / ClassCard
  // layout instead of stretching the vertical grid card across the row.
  if (isList) {
    return (
      <div
        onClick={handleCardClick}
        className="group relative flex flex-col md:flex-row items-start md:items-center justify-between gap-4 sm:gap-6 bg-white dark:bg-[#1A1A1A] rounded-2xl border border-slate-200 dark:border-[#3F3F3F] p-4 sm:p-5 transition-all duration-200 hover:shadow-md hover:border-slate-300 dark:hover:border-[#555] cursor-pointer text-left select-none"
      >
        <div className="flex items-center gap-4 flex-1 min-w-0">
          {renderAvatar("w-16 h-16")}

          <div className="min-w-0 flex flex-col gap-0.5 text-left">
            <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-[#990011] dark:group-hover:text-[#FF6B6B] transition-colors truncate">
              {name}
            </h3>
            <p className="text-xs font-medium text-slate-500 dark:text-gray-400 truncate">
              {headline}
            </p>
            <div className="mt-1">{renderRating()}</div>
          </div>
        </div>

        <div className="flex flex-wrap sm:flex-nowrap items-center justify-between md:justify-end gap-4 w-full md:w-auto pt-3 md:pt-0 border-t md:border-t-0 border-slate-100 dark:border-[#333333] shrink-0">
          {renderStats()}
          {renderProfileButton("w-full sm:w-auto px-4 h-9")}
        </div>
      </div>
    )
  }

  return (
    <div
      onClick={handleCardClick}
      className="group relative flex flex-col items-center bg-white dark:bg-[#1A1A1A] rounded-2xl border border-slate-200 dark:border-[#3F3F3F] p-6 transition-all duration-200 hover:shadow-md hover:border-slate-300 dark:hover:border-[#555] cursor-pointer text-center select-none"
    >
      {/* ─── Avatar with Verified Badge Overlay ─── */}
      {renderAvatar("w-[72px] h-[72px]")}

      {/* ─── Teacher Name ─── */}
      <h3 className="mt-3 text-base font-bold text-slate-900 dark:text-white group-hover:text-[#990011] dark:group-hover:text-[#FF6B6B] transition-colors truncate w-full">
        {name}
      </h3>

      {/* ─── Headline / Specialty (BR-EX-GV-03) ─── */}
      <p className="mt-0.5 text-xs font-medium text-slate-500 dark:text-gray-400 truncate w-full h-4">
        {headline}
      </p>

      {/* ─── Rating & Review Count (BR-EX-GV-04) ─── */}
      <div className="mt-2.5 flex items-center justify-center gap-1.5 text-xs">
        {renderRating()}
      </div>

      {/* ─── Stats Box (BR-EX-GV-05 & BR-EX-GV-06) ─── */}
      <div className="mt-3.5 w-full">
        {renderStats()}
      </div>

      {/* ─── Profile Action Button ─── */}
      <div className="mt-3.5 w-full">
        {renderProfileButton("w-full h-9")}
      </div>
    </div>
  )
}

export default TeacherCard
