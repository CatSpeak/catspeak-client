import React from "react"
import {
  ExternalLink,
  Pencil,
  Award,
  GraduationCap,
  Briefcase,
  Sparkles,
} from "lucide-react"
import FluentCard from "@/shared/components/ui/FluentCard"

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
              className="inline-flex h-9 items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-[#990011] transition-colors px-3 rounded-[7px] border border-slate-200 hover:bg-slate-50 shadow-2xs"
            >
              <span>
                {ins.viewPublicProfile || "Xem trang cá nhân công khai"}
              </span>
              <ExternalLink size={13} />
            </a>
          )}

          {/* Edit Button */}
          <button
            type="button"
            onClick={onEdit}
            className="inline-flex h-9 shrink-0 items-center justify-center gap-2 rounded-[7px] border border-[#990011] px-3 text-xs font-semibold text-[#990011] transition-colors hover:bg-[#990011]/5 active:bg-[#990011]/10 shadow-2xs cursor-pointer"
          >
            <Pencil size={14} className="shrink-0" />
            <span className="whitespace-nowrap">{ins.edit || "Chỉnh sửa"}</span>
          </button>
        </div>
      </div>

      {/* ─── Summary Content ─── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5 pt-1">
        {/* Row 1 Left: Headline */}
        <div className="flex flex-col">
          <div className="text-xs font-bold text-slate-700 uppercase tracking-wide">
            {ins.headlineLabel || "Chuyên môn hiển thị"}
          </div>
          <div className="mt-1.5">
            {comp.headline ? (
              <span className="text-sm font-bold text-slate-900">
                {comp.headline}
              </span>
            ) : (
              <span className="text-xs text-slate-400 italic">
                {ins.notSet || "Chưa thiết lập"}
              </span>
            )}
          </div>
        </div>

        {/* Row 1 Right: Counts of Credentials */}
        <div className="flex flex-col">
          <div className="text-xs font-bold text-slate-700 uppercase tracking-wide">
            {ins.credentialsSummary || "Tóm tắt hồ sơ chuyên môn"}
          </div>
          <div className="mt-1.5 flex flex-wrap items-center gap-2">
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

        {/* Row 2 Left: Teaching Motto */}
        <div className="flex flex-col">
          <div className="text-xs font-bold text-slate-700 uppercase tracking-wide">
            {ins.teachingMottoLabel || "Phương châm giảng dạy"}
          </div>
          <div className="mt-1.5">
            {teachingMotto ? (
              <div className="text-sm text-slate-800 leading-relaxed italic">
                "{teachingMotto}"
              </div>
            ) : (
              <div className="text-xs text-slate-400 italic">
                {ins.teachingMottoEmpty || "Chưa cập nhật phương châm giảng dạy."}
              </div>
            )}
          </div>
        </div>

        {/* Row 2 Right: Teaching Methods Tags */}
        <div className="flex flex-col">
          <div className="text-xs font-bold text-slate-700 uppercase tracking-wide">
            {ins.teachingMethodsLabel || "Phương pháp giảng dạy"}
          </div>
          <div className="mt-1.5">
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
              <span className="text-xs text-slate-400 italic">
                {ins.teachingMethodsEmpty || "Chưa khai báo phương pháp giảng dạy."}
              </span>
            )}
          </div>
        </div>
      </div>
    </FluentCard>
  )
}

export default CompetencyCard
