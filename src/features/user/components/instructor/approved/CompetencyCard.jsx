import React from "react"
import {
  ExternalLink,
  Edit3,
  Award,
  GraduationCap,
  Briefcase,
  Lightbulb,
  Sparkles,
} from "lucide-react"
import FluentCard from "@/shared/components/ui/FluentCard"
import PillButton from "@/shared/components/ui/buttons/PillButton"

/**
 * Card hiển thị tổng quan Hồ sơ Năng lực của Giảng viên trong trang Settings (Ticket 10)
 */
const CompetencyCard = ({
  competencyData,
  profile,
  t,
  onEdit,
}) => {
  const ins = t.profile?.instructor || {}
  const comp = competencyData?.data || competencyData || {}

  const headline = comp.headline || ins.notSet || "Chưa thiết lập"
  const teachingMotto = comp.teachingMotto
  const educationCount = Array.isArray(comp.education)
    ? comp.education.length
    : 0
  const experienceCount = Array.isArray(comp.experience)
    ? comp.experience.length
    : 0
  const certsCount = Array.isArray(comp.certificates)
    ? comp.certificates.length
    : 0
  const methodTags = Array.isArray(comp.teachingMethods?.tags)
    ? comp.teachingMethods.tags
    : []

  const teacherSlugOrId = comp.slug || profile?.slug || profile?.accountId || profile?.id

  return (
    <FluentCard className="p-5 sm:p-6 flex flex-col gap-5">
      {/* ─── Card Header: Title + Public Link + Edit Button ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-red-50 text-[#990011] flex items-center justify-center shrink-0">
            <Sparkles size={18} />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-slate-900 leading-tight">
              {ins.competencyProfileTitle || "Hồ sơ năng lực giảng dạy"}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {ins.competencyProfileSubtitle ||
                "Quản lý chuyên môn, triết lý giảng dạy, học vấn, kinh nghiệm và chứng chỉ công khai."}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0 self-start sm:self-center">
          {/* Public Profile Link */}
          {teacherSlugOrId && (
            <a
              href={`/explore/teachers/${encodeURIComponent(teacherSlugOrId)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs font-bold text-slate-600 hover:text-[#990011] transition-colors px-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50"
            >
              <span>
                {ins.viewPublicProfile || "Xem trang cá nhân công khai"}
              </span>
              <ExternalLink size={12} />
            </a>
          )}

          {/* Edit Button */}
          <PillButton
            variant="secondary"
            onClick={onEdit}
            className="flex items-center gap-1 text-xs font-bold"
          >
            <Edit3 size={13} />
            <span>{ins.edit || "Chỉnh sửa"}</span>
          </PillButton>
        </div>
      </div>

      {/* ─── Summary Content ─── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Left Column: Headline & Teaching Motto */}
        <div className="flex flex-col gap-3.5">
          <div>
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              {ins.headlineLabel || "Chuyên môn hiển thị"}
            </div>
            <div className="text-sm font-bold text-slate-900 mt-0.5">
              {headline}
            </div>
          </div>

          <div>
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              {ins.teachingMottoLabel || "Phương châm giảng dạy"}
            </div>
            <div className="text-xs sm:text-sm text-slate-600 italic mt-0.5 leading-relaxed">
              {teachingMotto ? `"${teachingMotto}"` : "Chưa cập nhật phương châm giảng dạy."}
            </div>
          </div>
        </div>

        {/* Right Column: Counts of Credentials & Teaching Methods */}
        <div className="flex flex-col gap-3.5">
          {/* 3 Count Badges */}
          <div>
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
              {ins.credentialsSummary || "Tóm tắt hồ sơ chuyên môn"}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 text-xs font-bold border border-blue-100">
                <GraduationCap size={13} />
                <span>{educationCount} học vấn</span>
              </span>

              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-100">
                <Briefcase size={13} />
                <span>{experienceCount} kinh nghiệm</span>
              </span>

              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-50 text-amber-700 text-xs font-bold border border-amber-100">
                <Award size={13} />
                <span>{certsCount} chứng chỉ</span>
              </span>
            </div>
          </div>

          {/* Teaching Methods Tags */}
          <div>
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
              {ins.teachingMethodsLabel || "Phương pháp giảng dạy"}
            </div>
            {methodTags.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {methodTags.map((tag, i) => (
                  <span
                    key={i}
                    className="px-2.5 py-0.5 rounded-md bg-red-50 text-[#990011] text-xs font-bold border border-red-100/80"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            ) : (
              <span className="text-xs text-slate-400">
                Chưa khai báo phương pháp giảng dạy.
              </span>
            )}
          </div>
        </div>
      </div>
    </FluentCard>
  )
}

export default CompetencyCard
