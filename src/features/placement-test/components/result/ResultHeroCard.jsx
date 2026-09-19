import { formatTemplate } from "../../utils/format"

const ResultHeroCard = ({ copy = {}, band, tierLabel, cefr, score, description }) => (
  <section className="flex w-full flex-col gap-3 rounded-[18px] bg-gradient-to-r from-[#881337] to-cath-red-700 px-5 py-[18px] shadow-[0_8px_20px_rgba(153,0,17,0.25)]">
    <div className="flex items-center justify-between gap-3">
      <span className="rounded-full bg-[#FEF08A] px-2.5 py-1 text-[10.5px] font-bold leading-4 text-[#854D0E]">
        {copy.badge}
      </span>
      <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-bold leading-4 text-white">
        {formatTemplate(copy.scoreLabel, { score })}
      </span>
    </div>

    <div className="flex flex-col gap-0.5">
      <p className="text-[26px] font-bold leading-[32.5px] text-white">
        {formatTemplate(copy.bandTitle, { band, tier: tierLabel })}
      </p>
      <p className="text-[13px] leading-[18.85px] text-[#FECACA]">
        {formatTemplate(copy.cefrLabel, { cefr })}
      </p>
    </div>

    <div className="rounded-[10px] border border-white/[0.18] bg-white/[0.13] px-3 py-2">
      <p className="text-[11.5px] leading-[16.7px] text-white">{description}</p>
    </div>
  </section>
)

export default ResultHeroCard
