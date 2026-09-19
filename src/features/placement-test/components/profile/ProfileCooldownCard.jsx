import { Clock, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"
import { formatTemplate } from "../../utils/format"

const ProgressRow = ({ label, value, percent, barClass }) => (
  <div className="flex w-full flex-col gap-1.5">
    <div className="flex items-center justify-between gap-3">
      <span className="text-[11.5px] font-medium leading-[16.7px] text-[#475569]">
        {label}
      </span>
      <span
        className={cn(
          "text-xs font-bold leading-[17px]",
          percent >= 100 ? "text-[#15803D]" : "text-[#0F172A]",
        )}
      >
        {value}
      </span>
    </div>
    <div className="h-2 w-full overflow-hidden rounded-full bg-[#F1F5F9]">
      <div
        className={cn("h-full rounded-full", barClass)}
        style={{ width: `${Math.min(100, percent || 0)}%` }}
      />
    </div>
  </div>
)

const ProfileCooldownCard = ({
  copy = {},
  variant = "locked",
  eligibility = {},
  band,
  unlockDate,
  onRetake,
  onContinue,
}) => {
  const eligible = variant === "eligible"
  const percent = Math.min(100, eligibility.progress || 0)
  const elapsedValue = formatTemplate(copy.cooldownElapsedValue, {
    elapsed: eligibility.daysElapsed || 0,
    total: eligibility.totalDays || 14,
    percent,
  })

  return (
    <section
      className={cn(
        "flex w-full flex-col gap-3 rounded-[16px] border-2 bg-white px-[18px] py-4",
        eligible
          ? "border-[#86EFAC] shadow-[0_4px_14px_rgba(22,163,74,0.08)]"
          : "border-[#FED7AA] shadow-[0_4px_12px_rgba(234,88,12,0.08)]",
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span
            className={cn(
              "flex h-9 w-9 shrink-0 items-center justify-center rounded-full",
              eligible
                ? "bg-[#ECFDF5] text-[#15803D] ring-1 ring-[#BBF7D0]"
                : "bg-[#FFF7ED] text-[#C2410C] ring-1 ring-[#FED7AA]",
            )}
          >
            {eligible ? (
              <Sparkles size={18} strokeWidth={2} />
            ) : (
              <Clock size={18} strokeWidth={2} />
            )}
          </span>
          <div className="flex flex-col">
            <span
              className={cn(
                "text-sm font-bold leading-5",
                eligible ? "text-[#15803D]" : "text-[#9A3412]",
              )}
            >
              {eligible ? copy.eligibleTitle : copy.cooldownTitle}
            </span>
            <span
              className={cn(
                "text-[11px] font-medium leading-4",
                eligible ? "text-[#166534]" : "text-[#B45309]",
              )}
            >
              {eligible ? copy.eligibleSub : copy.cooldownActive}
            </span>
          </div>
        </div>
        <span
          className={cn(
            "shrink-0 rounded-[12px] px-2.5 py-1 text-[11px] font-bold leading-4",
            eligible
              ? "bg-[#DCFCE7] text-[#15803D]"
              : "bg-[#FFEDD5] text-[#C2410C]",
          )}
        >
          {eligible
            ? copy.eligibleBadge
            : formatTemplate(copy.cooldownRemaining, {
                days: eligibility.daysRemaining || 0,
              })}
        </span>
      </div>

      <ProgressRow
        label={copy.cooldownElapsedLabel}
        value={elapsedValue}
        percent={percent}
        barClass={eligible ? "bg-[#10B981]" : "bg-[#F97316]"}
      />

      {eligible ? (
        <p className="text-[11px] font-bold leading-4 text-[#16A34A]">
          {copy.eligibleUnlocked}
        </p>
      ) : (
        <p className="text-[11px] font-medium leading-4 text-[#64748B]">
          {formatTemplate(copy.cooldownUnlockAt, { date: unlockDate })}
        </p>
      )}

      <div
        className={cn(
          "rounded-[8px] px-2.5 py-2",
          eligible
            ? "border border-[#BBF7D0] bg-[#F0FDF4]"
            : "border border-[#E2E8F0] bg-[#F8FAFC]",
        )}
      >
        <p
          className={cn(
            "text-[11px] leading-4",
            eligible ? "text-[#166534]" : "text-[#475569]",
          )}
        >
          {eligible ? copy.eligibleBody : copy.cooldownPolicy}
        </p>
      </div>

      <div className="flex w-full flex-col gap-2">
        <button
          type="button"
          onClick={eligible ? onRetake : onContinue}
          className="h-11 w-full rounded-[8px] bg-cath-red-700 text-[13.5px] font-bold text-white shadow-[0_4px_12px_rgba(153,0,17,0.2)] transition hover:brightness-90"
        >
          {eligible
            ? copy.retakeNowCta
            : formatTemplate(copy.continueRoadmapCta, { band })}
        </button>

        {eligible ? (
          <button
            type="button"
            onClick={onContinue}
            className="h-10 w-full rounded-[8px] border border-[#CBD5E1] bg-white text-[12.5px] font-bold text-[#334155] transition hover:bg-slate-50"
          >
            {copy.continueCurrentCta}
          </button>
        ) : (
          <button
            type="button"
            disabled
            className="h-10 w-full cursor-not-allowed rounded-[8px] border border-[#E2E8F0] bg-[#F1F5F9] text-xs font-bold text-[#94A3B8]"
          >
            {formatTemplate(copy.retakeLockedCta, { date: unlockDate })}
          </button>
        )}
      </div>
    </section>
  )
}

export default ProfileCooldownCard
