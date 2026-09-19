import { CalendarDays } from "lucide-react"
import { formatTemplate } from "../../utils/format"

const ResultRoadmapCard = ({ copy = {}, band, days = [] }) => (
  <section className="flex w-full flex-col gap-2.5 rounded-2xl border-[1.5px] border-[#FEF3C7] bg-[#FFFBEB] px-[18px] py-4 shadow-[0_4px_12px_rgba(180,83,9,0.03)]">
    <div className="flex items-center gap-2">
      <CalendarDays size={15} strokeWidth={2} className="text-[#B45309]" />
      <h2 className="text-[13.5px] font-bold leading-5 text-[#92400E]">
        {formatTemplate(copy.roadmapTitle, { band })}
      </h2>
    </div>

    {days.map((day) => (
      <div key={day.tag} className="flex items-center gap-2">
        <span className="shrink-0 rounded-[4px] bg-[#FDE68A] px-1.5 py-0.5 text-[10px] font-bold leading-4 text-[#78350F]">
          {day.tag}
        </span>
        <p className="text-[11.5px] leading-[16.7px] text-[#78350F]">
          {day.text}
        </p>
      </div>
    ))}
  </section>
)

export default ResultRoadmapCard
