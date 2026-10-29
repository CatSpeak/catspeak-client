import { cn } from "@/lib/utils"
import { formatTemplate } from "../../utils/format"

const ProfileRoadmapCard = ({ copy = {}, band, progress = {} }) => {
  const stages = copy.roadmapStages || []
  const completed = progress.completed || 0
  const total = progress.total || stages.length || 1
  const complete = completed >= total

  return (
    <section className="flex w-full flex-col gap-2.5 rounded-[16px] border border-[#E2E8F0] bg-white px-[18px] py-3.5">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-[13.5px] font-bold leading-5 text-[#0F172A]">
          {formatTemplate(copy.roadmapTitle, { band })}
        </h2>
        <span className="rounded-[6px] bg-[#ECFDF5] px-2 py-0.5 text-[11px] font-bold text-[#059669]">
          {formatTemplate(copy.roadmapProgress, {
            done: completed,
            total,
            percent: progress.percent || 0,
          })}
        </span>
      </div>

      <div className="h-[7px] w-full overflow-hidden rounded-full bg-[#F1F5F9]">
        <div
          className="h-full rounded-full bg-[#10B981]"
          style={{ width: `${progress.percent || 0}%` }}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        {stages.map((stage, index) => {
          const state = progress.stages?.[index] || {}
          return (
            <div
              key={stage.tag}
              className="flex items-center justify-between gap-3"
            >
              <span
                className={cn(
                  "text-[11.5px] leading-[16.7px]",
                  state.active
                    ? "font-bold text-[#0F172A]"
                    : "font-medium text-[#334155]",
                )}
              >
                {state.done ? "✓" : state.active ? "⏳" : "○"} {stage.tag}:{" "}
                {stage.text}
              </span>
              {state.done ? (
                <span className="shrink-0 rounded-[4px] bg-[#DCFCE7] px-1.5 py-px text-[10px] font-bold text-[#15803D]">
                  {copy.roadmapDone}
                </span>
              ) : state.active ? (
                <span className="shrink-0 rounded-[4px] bg-[#FFEDD5] px-1.5 py-px text-[10px] font-bold text-[#C2410C]">
                  {copy.roadmapActive}
                </span>
              ) : null}
            </div>
          )
        })}
      </div>

      {complete ? (
        <p className="text-xs font-bold leading-[17px] text-[#15803D]">
          {copy.roadmapComplete}
        </p>
      ) : (
        <p className="text-xs font-bold leading-[17px] text-cath-red-700">
          {formatTemplate(copy.roadmapContinue, { day: completed + 1 })}
        </p>
      )}
    </section>
  )
}

export default ProfileRoadmapCard
