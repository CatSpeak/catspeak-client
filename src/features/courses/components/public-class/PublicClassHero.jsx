import React from "react"
import { ShieldCheck, Share2 } from "lucide-react"
import { getSafeMediaUrl, defaultCourseThumbnail } from "../../utils/courseUtils"
import { useLanguage } from "@/shared/context/LanguageContext"

const PublicClassHero = ({
  classData,
  isEnrolled,
  isEnrolling,
  onEnroll,
}) => {
  const { t } = useLanguage()
  const c = t.courses || {}
  const pc = c.publicClass || {}

  const teacher = classData?.teacher || {}
  const teacherName = teacher.fullName || teacher.name || teacher.title || c.defaultInstructor || "CatSpeak Instructor"
  const teacherAvatar = getSafeMediaUrl(teacher.avatar || teacher.avatarImageUrl)
  const bgThumbnailUrl = getSafeMediaUrl(classData?.thumbnailUrl) || defaultCourseThumbnail

  return (
    <section className="relative bg-slate-950 text-white overflow-hidden min-h-[480px] sm:min-h-[560px] lg:min-h-[620px] flex flex-col justify-end pt-16 pb-16 sm:pb-20 border-b border-slate-800">
      {/* Full-Vibrancy Thumbnail Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-85 transition-all duration-700"
        style={{ backgroundImage: `url(${bgThumbnailUrl})` }}
      />

      {/* Lightweight Scrim Overlays */}
      <div className="absolute inset-0 bg-gradient-to-r from-slate-950/95 via-slate-950/60 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/50 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
        <div className="max-w-4xl flex flex-col gap-5">
          {/* Top Tags */}
          <div className="flex flex-wrap items-center gap-2.5 text-xs font-semibold">
            <span className="bg-[#b20a1c] text-white px-3 py-1 rounded-full font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-sm">
              {pc.onlineBadge || "Lớp Học Trực Tuyến"}
            </span>
            {classData?.language && (
              <span className="bg-slate-900/90 text-white border border-slate-700/80 backdrop-blur-md px-3 py-1 rounded-full font-medium">
                {classData.language}
              </span>
            )}
          </div>

          {/* Title */}
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white leading-tight tracking-tight drop-shadow-md">
            {classData?.title || pc.defaultTitle || "Chi Tiết Lớp Học CatSpeak"}
          </h1>

          {/* Instructor Badge */}
          <div className="flex items-center gap-3.5 pt-2">
            {teacherAvatar ? (
              <img
                src={teacherAvatar}
                alt={teacherName}
                className="w-12 h-12 rounded-full object-cover ring-2 ring-[#b20a1c] shadow-md"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-[#b20a1c] text-white flex items-center justify-center font-bold text-lg ring-2 ring-rose-400/40">
                {teacherName.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5 text-sm text-slate-300 font-medium">
                {c.instructorLabel || pc.instructorLabel || "Giảng viên"}
                <ShieldCheck size={14} className="text-rose-400 inline" />
              </div>
              <span className="text-white font-bold text-base hover:text-rose-300 transition-colors">
                {teacherName}
              </span>
            </div>
          </div>

          {/* Primary Action Buttons Bar */}
          <div className="flex flex-wrap items-center gap-4 pt-4">
            {isEnrolled ? (
              <button
                type="button"
                onClick={onEnroll}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold px-8 py-3.5 rounded-2xl shadow-lg shadow-emerald-900/30 transition-all transform hover:-translate-y-0.5 flex items-center gap-2 text-base"
              >
                {c.enterClass || pc.enterClass || "Vào Lớp Học"}
              </button>
            ) : (
              <button
                type="button"
                onClick={onEnroll}
                disabled={isEnrolling}
                className="bg-[#b20a1c] hover:bg-[#960817] disabled:opacity-60 disabled:cursor-not-allowed text-white font-extrabold px-8 py-3.5 rounded-2xl shadow-xl shadow-[#b20a1c]/40 transition-all transform hover:-translate-y-0.5 flex items-center gap-2 text-base cursor-pointer"
              >
                {isEnrolling ? (pc.processing || "Đang xử lý...") : (c.enrollNow || pc.enrollNow || "Đăng ký tham gia")}
              </button>
            )}

            <button
              type="button"
              onClick={() => {
                if (navigator.share) {
                  navigator.share({ title: classData?.title, url: window.location.href })
                } else {
                  navigator.clipboard.writeText(window.location.href)
                }
              }}
              className="bg-slate-900/80 hover:bg-slate-800 text-slate-200 border border-slate-700/80 p-3.5 rounded-2xl transition-colors backdrop-blur-md cursor-pointer"
              title={pc.shareClass || "Chia sẻ lớp học"}
            >
              <Share2 size={20} />
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
