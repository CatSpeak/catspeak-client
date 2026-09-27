import React, { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Star, Users, GraduationCap, ArrowRight, Check } from "lucide-react"
import {
  getTeacherInitials,
  getTeacherHeadline,
  formatTeacherNumber,
  formatRating,
  formatActiveClassesText,
  getTeacherSlugOrId,
} from "../utils/teacherUtils"

const TeacherCard = ({
  teacher,
  onViewProfile,
  t,
}) => {
  const navigate = useNavigate()
  const [imgError, setImgError] = useState(false)

  if (!teacher) return null

  const name = teacher.name || teacher.fullName || "Giảng viên"
  const avatarUrl = teacher.avatarUrl || teacher.avatar
  const headline = getTeacherHeadline(teacher, t?.defaultTeacherHeadline || "Giảng viên ngôn ngữ")
  const rating = formatRating(teacher.rating || teacher.averageRating)
  const reviewCount = Number(teacher.reviewCount || teacher.totalReviews || 0)
  const totalStudents = teacher.totalStudents || teacher.studentCount || 0
  const activeClassesCount =
    teacher.activeClassCount || teacher.activeClassesCount || teacher.openClassesCount || 0
  const slugOrId = getTeacherSlugOrId(teacher)

  const handleCardClick = (e) => {
    e.stopPropagation()
    if (onViewProfile) {
      onViewProfile(teacher)
    } else if (slugOrId) {
      navigate(`/explore/teachers/${encodeURIComponent(slugOrId)}`)
    }
  }

  return (
    <div
      onClick={handleCardClick}
      className="group relative flex flex-col items-center bg-white rounded-2xl border border-slate-200 p-6 transition-all duration-200 hover:shadow-md hover:border-slate-300 cursor-pointer text-center select-none"
    >
      {/* ─── Avatar with Verified Badge Overlay ─── */}
      <div className="relative w-[72px] h-[72px] shrink-0">
        {avatarUrl && !imgError ? (
          <img
            src={avatarUrl}
            alt={name}
            onError={() => setImgError(true)}
            className="w-[72px] h-[72px] rounded-full object-cover ring-2 ring-slate-100 shadow-2xs"
          />
        ) : (
          <div className="w-[72px] h-[72px] rounded-full bg-red-50 text-[#990011] font-extrabold text-xl flex items-center justify-center ring-2 ring-slate-100 shadow-2xs">
            {getTeacherInitials(name)}
          </div>
        )}

        {/* BR-EX-GV-02: Verified Badge Overlay (bottom-right) */}
        <div
          title="Giảng viên đã xác minh"
          className="absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full bg-[#10B981] ring-2 ring-white flex items-center justify-center shadow-xs"
        >
          <Check size={11} className="text-white stroke-[3]" />
        </div>
      </div>

      {/* ─── Teacher Name ─── */}
      <h3 className="mt-3 text-base font-bold text-slate-900 group-hover:text-[#990011] transition-colors truncate w-full">
        {name}
      </h3>

      {/* ─── Headline / Specialty (BR-EX-GV-03) ─── */}
      <p className="mt-0.5 text-xs font-medium text-slate-500 truncate w-full h-4">
        {headline}
      </p>

      {/* ─── Rating & Review Count (BR-EX-GV-04) ─── */}
      <div className="mt-2.5 flex items-center justify-center gap-1.5 text-xs">
        <Star size={13} className="fill-[#FBBF24] text-[#FBBF24]" />
        <span className="font-bold text-slate-800">{rating}</span>
        <span className="text-slate-400 font-normal">
          {reviewCount > 0 ? `(${reviewCount} đánh giá)` : "(Chưa có đánh giá)"}
        </span>
      </div>

      {/* ─── Stats Box (BR-EX-GV-05 & BR-EX-GV-06) ─── */}
      <div className="mt-3.5 w-full bg-[#F9FAFB] border border-[#F3F4F6] rounded-xl px-3 py-2 flex items-center justify-center gap-2 text-xs">
        {/* Số học viên */}
        <div className="flex items-center gap-1 text-slate-600 font-semibold truncate">
          <Users size={13} className="text-slate-400 shrink-0" />
          <span>{formatTeacherNumber(totalStudents)} học viên</span>
        </div>

        <span className="text-slate-300 font-bold">·</span>

        {/* Số lớp đang mở */}
        <div className="flex items-center gap-1 text-[#990011] font-semibold truncate shrink-0">
          <GraduationCap size={14} className="text-[#990011] shrink-0" />
          <span>{formatActiveClassesText(activeClassesCount)}</span>
        </div>
      </div>

      {/* ─── Profile Action Button ─── */}
      <button
        type="button"
        onClick={handleCardClick}
        className="mt-3.5 w-full h-9 rounded-xl border border-[#990011] text-[#990011] group-hover:bg-[#990011] group-hover:text-white transition-all text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs active:scale-[0.98]"
      >
        <span>{t?.viewProfile || "Xem trang cá nhân"}</span>
        <ArrowRight size={13} className="transition-transform group-hover:translate-x-0.5" />
      </button>
    </div>
  )
}

export default TeacherCard
