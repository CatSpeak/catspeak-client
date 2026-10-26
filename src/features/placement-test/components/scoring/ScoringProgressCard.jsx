import { Check, Clock, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { formatTemplate } from "../../utils/format"
import { SCORING_STEP_STATUS } from "../../utils/scoring"

const STEP_LABEL_KEYS = {
  pronunciation: "stepPronunciation",
  vocabulary: "stepVocabulary",
  ranking: "stepRanking",
}

const statusText = (copy, step) => {
  if (step.status === SCORING_STEP_STATUS.DONE) return copy.statusDone
  if (step.status === SCORING_STEP_STATUS.ACTIVE) {
    return formatTemplate(copy.statusActive, { percent: step.percent })
  }
  return copy.statusPending
}

const ScoringStepRow = ({ copy, step }) => {
  const done = step.status === SCORING_STEP_STATUS.DONE
  const active = step.status === SCORING_STEP_STATUS.ACTIVE

  return (
    <div
      className={cn(
        "flex w-full items-center justify-between gap-3 rounded-[14px] px-5 py-4",
        done && "bg-[#F0FDF4]",
        active && "bg-[#EFF6FF]",
        !done && !active && "bg-[#F8FAFC]",
      )}
    >
      <p
        className={cn(
          "text-[15px] leading-5",
          done && "font-bold text-[#15803D]",
          active && "font-bold text-[#1D4ED8]",
          !done && !active && "font-medium text-slate-600",
        )}
      >
        {copy[STEP_LABEL_KEYS[step.key]]}: {statusText(copy, step)}
      </p>
      {done ? (
        <Check size={14} strokeWidth={2.5} className="shrink-0 text-green-600" />
      ) : active ? (
        <Loader2
          size={14}
          strokeWidth={2.5}
          className="shrink-0 animate-spin text-[#2563EB]"
        />
      ) : (
        <Clock size={14} strokeWidth={2.5} className="shrink-0 text-[#94A3B8]" />
      )}
    </div>
  )
}

const ScoringProgressCard = ({ copy = {}, steps = [] }) => (
  <section className="flex w-full flex-col items-start gap-5 rounded-3xl bg-white p-6 shadow-[0_10px_28px_-4px_rgba(15,23,42,0.07),0_2px_6px_rgba(15,23,42,0.03)] md:p-9">
    <span className="flex h-16 w-16 items-center justify-center rounded-full bg-[#FFF1F2] text-cath-red-700 shadow-[0_4px_12px_rgba(153,0,17,0.10)]">
      <Loader2 size={32} strokeWidth={2.5} className="animate-spin" />
    </span>
    <h2 className="text-2xl font-bold leading-[30px] text-[#09090B]">
      {copy.heading}
    </h2>
    <p className="text-[15px] leading-5 text-slate-600 md:leading-6">
      {copy.body}
    </p>
    <div className="flex w-full flex-col gap-3.5">
      {steps.map((step) => (
        <ScoringStepRow key={step.key} copy={copy} step={step} />
      ))}
    </div>
  </section>
)

export default ScoringProgressCard
