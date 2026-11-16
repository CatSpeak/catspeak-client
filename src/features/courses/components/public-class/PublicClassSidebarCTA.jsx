import React from "react"
import { Check, Shield, BookOpen, Video, Award, MessageSquare } from "lucide-react"
import { formatCurrencyVND, getSafeMediaUrl, defaultCourseThumbnail, getClassEnrollmentIssue } from "../../utils/courseUtils"
import { useLanguage } from "@/shared/context/LanguageContext"

const PublicClassSidebarCTA = ({
  classData,
  isEnrolled,
  isEnrolling,
  isUpcoming,
  onEnroll,
}) => {
  const { t } = useLanguage()
  const c = t.courses || {}
  const pc = c.publicClass || {}
  const ui = c.workspaceUi || {}

  const tuitionValue = classData?.tuitionFee ?? classData?.price
  const tuitionLabel = tuitionValue == null
    ? (ui.tba || "TBA")
    : Number(tuitionValue) === 0
      ? (c.student?.priceFree || "Miễn phí")
      : formatCurrencyVND(tuitionValue)

  const thumbnailUrl = getSafeMediaUrl(classData?.thumbnailUrl) || defaultCourseThumbnail

  const enrollmentIssue = isEnrolled ? null : getClassEnrollmentIssue({ classData })

  const highlights = [
    { icon: Video, text: pc.featLive || "Học trực tuyến tương tác trực tiếp" },
    { icon: BookOpen, text: pc.featCurriculum || "Giáo trình bài tập & tài liệu độc quyền" },
    { icon: MessageSquare, text: pc.featFeedback || "Chấm chữa bài tập & phản hồi 1:1" },
    { icon: Award, text: pc.featCert || "Chứng chỉ hoàn thành CatSpeak" },
    { icon: Shield, text: pc.featSupport || "Hỗ trợ kỹ thuật & học tập 24/7" },
  ]

  return (
    <div className="bg-white dark:bg-[#1A1A1A] border border-border dark:border-[#3F3F3F] rounded-3xl p-5 flex flex-col gap-4 shadow-xs">
      {/* Thumbnail */}
      <div className="relative h-44 rounded-2xl overflow-hidden bg-slate-100 dark:bg-[#2A2A2A] border border-slate-100 dark:border-[#3F3F3F]">
        <img
          src={thumbnailUrl}
          alt={classData?.title || classData?.name || ""}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Pricing Header */}
      <div className="flex flex-col gap-1">
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-black text-slate-950 dark:text-white">
            {tuitionLabel}
          </span>
        </div>
        <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 mt-0.5">
          <Check size={14} /> {pc.includedDocs || "Bao gồm toàn bộ tài liệu & chứng chỉ"}
        </p>
      </div>

      {/* Primary Action Button */}
      {onEnroll && (
        <div>
          {isEnrolled ? (
            <button
              type="button"
              onClick={onEnroll}
              className="w-full bg-[#b20a1c] hover:bg-[#960817] dark:bg-[#FF6B6B] dark:hover:bg-[#ff8585] dark:text-[#1A1A1A] text-white font-bold py-3.5 px-4 rounded-full flex items-center justify-center gap-2 text-sm shadow-md transition-all active:scale-[0.98] cursor-pointer"
            >
              <Check size={16} /> {c.enterClass || pc.enterClass || "Vào Lớp Học"}
            </button>
          ) : isUpcoming ? (
            <button
              type="button"
              disabled
              className="w-full bg-[#b20a1c] dark:bg-[#FF6B6B] dark:text-[#1A1A1A] text-white font-bold py-3.5 px-4 rounded-full flex items-center justify-center gap-2 text-sm opacity-90 cursor-not-allowed shadow-md"
            >
              {pc.upcomingLabel || c.upcomingStatus || "Sắp diễn ra"}
            </button>
          ) : enrollmentIssue === "full" ? (
            <button
              type="button"
              disabled
              className="w-full bg-gray-100 dark:bg-[#2A2A2A] text-gray-400 dark:text-gray-500 font-bold py-3.5 px-4 rounded-full flex items-center justify-center gap-2 text-sm cursor-not-allowed"
            >
              {pc.classFull || "Đã đủ học viên"}
            </button>
          ) : enrollmentIssue === "closed" ? (
            <button
              type="button"
              disabled
              className="w-full bg-gray-100 dark:bg-[#2A2A2A] text-gray-400 dark:text-gray-500 font-bold py-3.5 px-4 rounded-full flex items-center justify-center gap-2 text-sm cursor-not-allowed"
            >
              {pc.enrollmentClosed || "Đã đóng đăng ký"}
            </button>
          ) : (
            <button
              type="button"
              onClick={onEnroll}
              disabled={isEnrolling}
              className="w-full bg-[#b20a1c] hover:bg-[#960817] dark:bg-[#FF6B6B] dark:hover:bg-[#ff8585] dark:text-[#1A1A1A] disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold py-3.5 px-4 rounded-full flex items-center justify-center gap-2 text-sm shadow-md transition-all active:scale-[0.98] cursor-pointer"
            >
              {isEnrolling ? (pc.processing || "Đang xử lý...") : (c.enrollNow || pc.enrollNow || "Đăng Ký Ngay")}
            </button>
          )}
        </div>
      )}

      {/* Features Checklist */}
      <div className="pt-3 border-t border-slate-100 dark:border-[#3F3F3F] flex flex-col gap-3">
        <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
          {pc.classIncludes || "Lớp học bao gồm:"}
        </h4>
        {highlights.map((item, idx) => {
          const Icon = item.icon
          return (
            <div key={idx} className="flex items-center gap-2.5 text-xs font-medium text-slate-700 dark:text-gray-300">
              <Icon size={16} className="text-[#b20a1c] dark:text-[#FF6B6B] shrink-0" />
              <span>{item.text}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default PublicClassSidebarCTA
