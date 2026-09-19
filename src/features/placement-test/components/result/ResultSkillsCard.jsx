import { BookOpen, FileText, Flame, Mic, SlidersHorizontal, Sparkles } from "lucide-react"
import { formatTemplate } from "../../utils/format"

const DIMENSION_STYLES = {
  pronunciation: { color: "#2563EB", bg: "#EFF6FF", Icon: Mic },
  vocabulary: { color: "#16A34A", bg: "#F0FDF4", Icon: BookOpen },
  grammar: { color: "#7C3AED", bg: "#FAF5FF", Icon: FileText },
  fluency: { color: "#EA580C", bg: "#FFF7ED", Icon: Flame },
}

const SkillBar = ({ item }) => {
  const style = DIMENSION_STYLES[item.key] || DIMENSION_STYLES.pronunciation
  const { Icon } = style

  return (
    <div className="flex w-full flex-col gap-1.5">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span
            className="flex h-6 w-6 items-center justify-center rounded-[6px]"
            style={{ backgroundColor: style.bg }}
          >
            <Icon size={13} strokeWidth={2} style={{ color: style.color }} />
          </span>
          <span className="text-[12.5px] font-semibold leading-[18px] text-[#1E293B]">
            {item.label}
          </span>
        </div>
        <span
          className="text-xs font-bold leading-[17px]"
          style={{ color: style.color }}
        >
          {item.scoreText}
        </span>
      </div>
      <div className="h-[7px] w-full overflow-hidden rounded-full bg-[#F1F5F9]">
        <div
          className="h-full rounded-full"
          style={{ width: `${item.score}%`, backgroundColor: style.color }}
        />
      </div>
    </div>
  )
}

const ResultSkillsCard = ({
  copy = {},
  items = [],
  band,
  onStart,
  onAdjust,
  adjustLocked = false,
}) => (
  <section className="flex w-full flex-col gap-3.5 rounded-[20px] border border-[#E2E8F0] bg-white p-5 shadow-[0_8px_24px_rgba(15,23,42,0.03)] md:p-[22px]">
    <div className="flex flex-col gap-0.5">
      <h2 className="text-base font-bold leading-6 text-[#09090B]">
        {copy.skillsTitle}
      </h2>
      <p className="text-[11.5px] leading-[16.7px] text-slate-500">
        {copy.skillsSubtitle}
      </p>
    </div>

    <div className="flex w-full flex-col gap-3">
      {items.map((item) => (
        <SkillBar key={item.key} item={item} />
      ))}
    </div>

    <div className="flex items-start gap-2.5 rounded-[10px] border border-[#E2E8F0] bg-[#F8FAFC] px-3 py-2.5">
      <Sparkles size={16} strokeWidth={2} className="mt-0.5 shrink-0 text-[#2563EB]" />
      <p className="text-[11px] leading-4 text-slate-600">
        {formatTemplate(copy.aiNote, { band })}
      </p>
    </div>

    <button
      type="button"
      onClick={onStart}
      className="h-12 w-full rounded-xl bg-cath-red-700 text-sm font-bold text-white shadow-[0_4px_12px_rgba(153,0,17,0.2)] transition hover:brightness-90"
    >
      {formatTemplate(copy.startCta, { band })}
    </button>

    {adjustLocked ? (
      <p className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-4 py-3 text-center text-xs font-medium leading-4 text-slate-500">
        {copy.adjustLocked}
      </p>
    ) : (
      <button
        type="button"
        onClick={onAdjust}
        className="inline-flex h-[42px] w-full items-center justify-center gap-2 rounded-xl border-[1.5px] border-[#CBD5E1] bg-white text-[13px] font-semibold text-slate-600 transition hover:bg-slate-50"
      >
        <SlidersHorizontal size={14} strokeWidth={2} />
        {copy.adjustCta}
      </button>
    )}

    <p className="text-center text-[10.5px] leading-[15px] text-slate-500">
      {copy.adjustCaption}
    </p>
  </section>
)

export default ResultSkillsCard
