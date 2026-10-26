import { AlertTriangle, Award, CheckCircle2 } from "lucide-react"
import { formatTemplate } from "../../utils/format"

const ResultFeedbackCard = ({ copy = {}, strength, weakness }) => {
  const dimensionLabel = (key) => copy.dimensions?.[key] || key

  return (
    <section className="flex w-full flex-col gap-2.5 rounded-2xl border-[1.5px] border-[#E2E8F0] bg-white px-[18px] py-4 shadow-[0_4px_12px_rgba(15,23,42,0.03)]">
      <div className="flex items-center gap-2">
        <Award size={16} strokeWidth={2} className="text-[#7C3AED]" />
        <h2 className="text-[13.5px] font-bold leading-5 text-[#09090B]">
          {copy.feedbackTitle}
        </h2>
      </div>

      <div className="flex items-start gap-2 rounded-[10px] bg-[#F0FDF4] px-2.5 py-2">
        <CheckCircle2
          size={15}
          strokeWidth={2}
          className="mt-0.5 shrink-0 text-[#16A34A]"
        />
        <p className="text-[11.5px] leading-[16.7px] text-[#15803D]">
          <span className="font-semibold">{copy.strengthLabel} </span>
          {formatTemplate(copy.strengthLine, {
            dimension: dimensionLabel(strength.key),
            score: strength.score,
          })}
        </p>
      </div>

      <div className="flex items-start gap-2 rounded-[10px] bg-[#FFF7ED] px-2.5 py-2">
        <AlertTriangle
          size={15}
          strokeWidth={2}
          className="mt-0.5 shrink-0 text-[#EA580C]"
        />
        <p className="text-[11.5px] leading-[16.7px] text-[#9A3412]">
          <span className="font-semibold">{copy.attentionLabel} </span>
          {weakness
            ? formatTemplate(copy.weaknessLine, {
                dimension: dimensionLabel(weakness.key),
                score: weakness.score,
              })
            : copy.noWeaknessLine}
        </p>
      </div>
    </section>
  )
}

export default ResultFeedbackCard
