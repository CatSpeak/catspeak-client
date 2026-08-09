import React from "react"
import { Check, Shield, BookOpen, Video, Award, MessageSquare, Share2 } from "lucide-react"
import { formatCurrencyVND, getSafeMediaUrl, defaultCourseThumbnail } from "../../utils/courseUtils"
import { useLanguage } from "@/shared/context/LanguageContext"

const PublicClassSidebarCTA = ({ classData }) => {
  const { t } = useLanguage()
  const c = t.courses || {}
  const pc = c.publicClass || {}
  const ui = c.workspaceUi || {}

  const tuitionLabel = classData?.tuitionFee == null
    ? (ui.tba || "TBA")
    : formatCurrencyVND(classData.tuitionFee)

  const thumbnailUrl = getSafeMediaUrl(classData?.thumbnailUrl) || defaultCourseThumbnail

  const highlights = [
    { icon: Video, text: pc.featLive || "Học trực tuyến tương tác trực tiếp" },
    { icon: BookOpen, text: pc.featCurriculum || "Giáo trình bài tập & tài liệu độc quyền" },
    { icon: MessageSquare, text: pc.featFeedback || "Chấm chữa bài tập & phản hồi 1:1" },
    { icon: Award, text: pc.featCert || "Chứng chỉ hoàn thành CatSpeak" },
    { icon: Shield, text: pc.featSupport || "Hỗ trợ kỹ thuật & học tập 24/7" },
  ]

  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-6 sticky top-20 flex flex-col gap-5">
      {/* Thumbnail */}
      <div className="relative h-44 rounded-2xl overflow-hidden bg-slate-100 border border-slate-100">
        <img
          src={thumbnailUrl}
          alt={classData?.title || ""}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Pricing Header */}
      <div className="flex flex-col gap-1">
        {/* <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">
          {c.tuition || "Học phí trọn gói"}
        </span> */}
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-black text-slate-950">
            {tuitionLabel}
          </span>
        </div>
        <p className="text-xs font-semibold text-emerald-600 flex items-center gap-1 mt-0.5">
          <Check size={14} /> {pc.includedDocs || "Bao gồm toàn bộ tài liệu & chứng chỉ"}
        </p>
      </div>

      {/* Features Checklist */}
      <div className="pt-3 border-t border-slate-100 flex flex-col gap-3">
        <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
          {pc.classIncludes || "Lớp học bao gồm:"}
        </h4>
        {highlights.map((item, idx) => {
          const Icon = item.icon
          return (
            <div key={idx} className="flex items-center gap-2.5 text-xs font-medium text-slate-700">
              <Icon size={16} className="text-[#b20a1c] shrink-0" />
              <span>{item.text}</span>
            </div>
          )
        })}
      </div>

      {/* Share / Guarantee Footer */}
      {/* <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
        <span className="font-semibold">{pc.qualityGuarantee || "Đảm bảo chất lượng 100%"}</span>
        <button
          type="button"
          onClick={() => {
            if (navigator.share) {
              navigator.share({ title: classData?.title, url: window.location.href })
            } else {
              navigator.clipboard.writeText(window.location.href)
            }
          }}
          className="hover:text-[#b20a1c] flex items-center gap-1 font-bold transition-colors"
        >
          <Share2 size={14} /> {pc.share || "Chia sẻ"}
        </button>
      </div> */}
    </div>
  )
}

export default PublicClassSidebarCTA
