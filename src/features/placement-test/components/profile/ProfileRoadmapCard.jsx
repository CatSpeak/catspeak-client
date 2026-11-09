import { cn } from "@/lib/utils"
import { formatTemplate } from "../../utils/format"

const ProfileRoadmapCard = ({ copy = {}, band, progress = {} }) => {
  const stages = copy.roadmapStages || []
  const completed = progress.completed || 0
  const total = progress.total || stages.length || 1
  const complete = completed >= total

  return (
    <section className="flex w-full flex-col gap-2.5 rounded-[16px] border border-[#E2E8F0] dark:border-[#3F3F3F] bg-white dark:bg-[#1A1A1A] px-[18px] py-3.5">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-[13.5px] font-bold leading-5 text-[#0F172A] dark:text-white">
          {formatTemplate(copy.roadmapTitle, { band })}
        </h2>
        <span className="rounded-[6px] bg-[#ECFDF5] dark:bg-emerald-950/40 px-2 py-0.5 text-[11px] font-bold text-[#059669] dark:text-emerald-300">
          {formatTemplate(copy.roadmapProgress, {
            done: completed,
            total,
            percent: progress.percent || 0,
          })}
        </span>
      </div>

      <div className="h-[7px] w-full overflow-hidden rounded-full bg-[#F1F5F9] dark:bg-[#272727]">
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
                    ? "font-bold text-[#0F172A] dark:text-white"
                    : "font-medium text-[#334155] dark:text-neutral-400",
                )}
              >
                {state.done ? "✓" : state.active ? "⏳" : "○"} {stage.tag}:{" "}
                {stage.text}
              </span>
              {state.done ? (
                <span className="shrink-0 rounded-[4px] bg-[#DCFCE7] dark:bg-emerald-950/40 px-1.5 py-px text-[10px] font-bold text-[#15803D] dark:text-emerald-300">
                  {copy.roadmapDone}
                </span>
              ) : state.active ? (
                <span className="shrink-0 rounded-[4px] bg-[#FFEDD5] dark:bg-amber-950/40 px-1.5 py-px text-[10px] font-bold text-[#C2410C] dark:text-amber-300">
                  {copy.roadmapActive}
                </span>
              ) : null}
            </div>
          )
        })}
      </div>

      {complete ? (
        <p className="text-xs font-bold leading-[17px] text-[#15803D] dark:text-emerald-400">
          {copy.roadmapComplete}
        </p>
      ) : (
        <p className="text-xs font-bold leading-[17px] text-cath-red-700 dark:text-red-400">
          {formatTemplate(copy.roadmapContinue, { day: completed + 1 })}
        </p>
      )}
    </section>
  )
}

export default ProfileRoadmapCard
