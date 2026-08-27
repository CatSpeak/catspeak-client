import React, { useState } from "react"
import { useNavigate } from "react-router-dom"
import { ShieldCheck, Share2, Check, ArrowLeft, BadgeCheck } from "lucide-react"
import {
  getSafeMediaUrl,
  defaultCourseThumbnail,
} from "../../utils/courseUtils"
import { useLanguage } from "@/shared/context/LanguageContext"
import { copyShareLink } from "@/shared/utils/shareUtils"
import { getLocalizedLanguageName } from "../../data/courseFormOptions"

const PublicClassHero = ({
  classData,
  isEnrolled,
  isEnrolling,
  isUpcoming,
  enrollmentIssue,
  onEnroll,
  onBack,
}) => {
  const navigate = useNavigate()
  const { t } = useLanguage()
  const c = t.courses || {}
  const pc = c.publicClass || {}
  const [linkCopied, setLinkCopied] = useState(false)

  const teacher = classData?.teacher || {}
  const teacherName =
    teacher.fullName ||
    teacher.name ||
    teacher.title ||
    c.defaultInstructor ||
    "CatSpeak Instructor"
  const teacherAvatar = getSafeMediaUrl(
    teacher.avatar || teacher.avatarImageUrl,
  )
  const bgThumbnailUrl =
    getSafeMediaUrl(classData?.thumbnailUrl) || defaultCourseThumbnail

  return (
    <section className="relative bg-slate-950 text-white overflow-hidden min-h-[360px] sm:min-h-[420px] lg:min-h-[460px] flex flex-col justify-between pt-4 pb-12 sm:pb-14 border-b border-slate-800">
      {/* Full-Vibrancy Thumbnail Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-85 transition-all duration-700"
        style={{ backgroundImage: `url(${bgThumbnailUrl})` }}
      />

      {/* Lightweight Scrim Overlays */}
      <div className="absolute inset-0 bg-gradient-to-r from-slate-950/95 via-slate-950/60 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/50 to-transparent" />

      {/* Top Bar with Return Back Button */}
      {onBack && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full pt-2 pb-1">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/80 hover:bg-slate-800 text-slate-200 hover:text-white border border-slate-700/80 backdrop-blur-md text-xs sm:text-sm font-semibold transition-all duration-200 group cursor-pointer shadow-md hover:shadow-lg"
          >
            <ArrowLeft
              size={16}
              className="transition-transform duration-200 text-slate-300"
            />
            <span>{pc.back || t.common?.back || "Quay lại"}</span>
          </button>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full pt-3 sm:pt-4">
        <div className="max-w-4xl flex flex-col gap-4">
          {/* Top Tags */}
          <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
            <span className="bg-green-600 text-white px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-sm text-[11px]">
              {pc.onlineBadge || "Lớp Học Trực Tuyến"}
            </span>
            {isUpcoming && (
              <span className="bg-indigo-600 text-white px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-sm text-[11px]">
                {pc.upcomingLabel || c.upcomingStatus || "Sắp diễn ra"}
              </span>
            )}
            {classData?.language && (
              <span className="bg-slate-900/90 text-white border border-slate-700/80 backdrop-blur-md px-2.5 py-0.5 rounded-full font-medium text-[11px] uppercase">
                {getLocalizedLanguageName(classData.language, t) ||
                  classData.language}
              </span>
            )}
          </div>

          {/* Title */}
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white leading-tight tracking-tight drop-shadow-md">
            {classData?.title ||
              classData?.name ||
              pc.defaultTitle ||
              "Chi Tiết Lớp Học CatSpeak"}
          </h1>

          {/* Instructor Badge */}
          <div
            className="group cursor-pointer inline-flex items-center gap-3 pt-1 w-fit transition-all duration-200"
            onClick={() => {
              const teacherId = teacher.accountId || teacher.id
              if (teacherId) {
                navigate(`/profile/${encodeURIComponent(String(teacherId))}`)
              }
            }}
          >
            {teacherAvatar ? (
              <img
                src={teacherAvatar}
                alt={teacherName}
                className="w-10 h-10 rounded-full object-cover shadow-md transition-transform duration-200 group-hover:scale-105"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-[#b20a1c] text-white flex items-center justify-center font-bold text-base ring-2 ring-rose-400/40 transition-transform duration-200 group-hover:scale-105">
                {teacherName.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="flex flex-col">
              <div className="flex items-center gap-1 text-xs text-slate-300 group-hover:text-cath-red-700 font-medium transition-colors">
                {c.instructorLabel || pc.instructorLabel || "Giảng viên"}
                <BadgeCheck size={13} className="text-rose-400 group-hover:text-cath-red-700 transition-colors inline" />
              </div>
              <span className="text-white font-bold text-sm sm:text-base group-hover:text-cath-red-700 transition-colors">
                {teacherName}
              </span>
            </div>
          </div>

          {/* Primary Action Buttons Bar */}
          <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 pt-2 sm:pt-3">
            {isEnrolled ? (
              <button
                type="button"
                onClick={onEnroll}
                className="h-10 sm:h-11 px-5 sm:px-6 rounded-full bg-[#b20a1c] hover:bg-[#960817] text-white font-bold shadow-lg shadow-[#b20a1c]/40 transition-all transform hover:-translate-y-0.5 inline-flex items-center justify-center gap-2 text-sm cursor-pointer"
              >
                {c.enterClass || pc.enterClass || "Vào Lớp Học"}
              </button>
            ) : isUpcoming ? (
              <button
                type="button"
                disabled
                className="h-10 sm:h-11 px-5 sm:px-6 rounded-full bg-[#b20a1c] text-white font-bold inline-flex items-center justify-center gap-2 text-sm cursor-not-allowed opacity-90 shadow-md"
              >
                {pc.upcomingLabel || c.upcomingStatus || "Sắp diễn ra"}
              </button>
            ) : enrollmentIssue === "full" ? (
              <button
                type="button"
                disabled
                className="h-10 sm:h-11 px-5 sm:px-6 rounded-full bg-slate-800 text-slate-400 font-bold inline-flex items-center justify-center gap-2 text-sm cursor-not-allowed"
              >
                {pc.classFull || "Đã đủ học viên"}
              </button>
            ) : enrollmentIssue === "closed" ? (
              <button
                type="button"
                disabled
                className="h-10 sm:h-11 px-5 sm:px-6 rounded-full bg-slate-800 text-slate-400 font-bold inline-flex items-center justify-center gap-2 text-sm cursor-not-allowed"
              >
                {pc.enrollmentClosed || "Đã đóng đăng ký"}
              </button>
            ) : (
              <button
                type="button"
                onClick={onEnroll}
                disabled={isEnrolling}
                className="h-10 sm:h-11 px-5 sm:px-6 rounded-full bg-[#b20a1c] hover:bg-[#960817] disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold shadow-lg shadow-[#b20a1c]/40 transition-all transform hover:-translate-y-0.5 inline-flex items-center justify-center gap-2 text-sm cursor-pointer"
              >
                {isEnrolling
                  ? pc.processing || "Đang xử lý..."
                  : c.enrollNow || pc.enrollNow || "Đăng ký tham gia"}
              </button>
            )}

            <button
              type="button"
              onClick={async () => {
                const shareUrl = `${window.location.origin}/explore-courses/class/${classData?.id || classData?._id}`
                await copyShareLink({
                  url: shareUrl,
                  successMessage: c.classDetail?.linkCopied || "Link copied!",
                  errorMessage:
                    c.classDetail?.linkCopyFailed || "Failed to copy link",
                })
                setLinkCopied(true)
                setTimeout(() => setLinkCopied(false), 2000)
              }}
              className="w-10 h-10 sm:w-11 sm:h-11 rounded-full shrink-0 bg-slate-900/80 hover:bg-slate-800 text-slate-200 border border-slate-700/80 inline-flex items-center justify-center transition-colors backdrop-blur-md cursor-pointer shadow-md"
              title={pc.shareClass || "Chia sẻ lớp học"}
            >
              {linkCopied ? <Check size={18} /> : <Share2 size={18} />}
            </button>
          </div>

          {/* Enrollment statistics subtext */}
          {/* <div className="flex items-center gap-4 text-xs text-slate-300 pt-1">
            <span className="flex items-center gap-1 text-slate-200 font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              {classData?.enrolledCount ? `${classData.enrolledCount} ${pc.studentsEnrolled || "học viên đã đăng ký"}` : `3,750+ ${pc.studentsEnrolled || "học viên đã đăng ký"}`}
            </span>
          </div> */}
        </div>
      </div>
    </section>
  )
}

export default PublicClassHero
