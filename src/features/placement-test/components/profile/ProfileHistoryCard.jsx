import { cn } from "@/lib/utils"
import { formatTemplate } from "../../utils/format"

const ProfileHistoryCard = ({
  copy = {},
  band,
  score,
  testDate,
  eligible,
  eligibleDate,
}) => (
  <section className="flex w-full flex-col gap-2.5 rounded-[16px] border border-[#E2E8F0] bg-white px-[18px] py-3.5">
    <div className="flex items-center justify-between gap-3">
      <h2 className="text-[13.5px] font-bold leading-5 text-[#0F172A]">
        {copy.historyTitle}
      </h2>
      <span className="text-[11px] font-medium leading-4 text-[#64748B]">
        {formatTemplate(
          eligible ? copy.historyCountCompleted : copy.historyCountValid,
          { count: 1 },
        )}
      </span>
    </div>

    <div className="flex items-center justify-between gap-3 rounded-[8px] bg-[#F8FAFC] px-3 py-2">
      <div className="flex flex-col gap-0.5">
        <span className="text-xs font-bold leading-[17px] text-[#0F172A]">
          {copy.historyFirst}
        </span>
        <span className="text-[11px] font-medium leading-4 text-[#64748B]">
          {`${testDate} · HSK ${band} · ${score}/100`}
        </span>
      </div>
      <span className="shrink-0 rounded-[4px] bg-[#DCFCE7] px-2 py-0.5 text-[10.5px] font-bold text-[#15803D]">
        {copy.historyValid}
      </span>
    </div>

    <div
      className={cn(
        "flex items-center justify-between gap-3 rounded-[8px] px-3 py-2",
        eligible
          ? "border border-[#BBF7D0] bg-[#F0FDF4]"
          : "border border-[#F1F5F9] bg-white",
      )}
    >
      <div className="flex flex-col gap-0.5">
        <span
          className={cn(
            "text-xs font-bold leading-[17px]",
            eligible ? "text-[#15803D]" : "text-[#475569]",
          )}
        >
          {eligible ? copy.historySecondReady : copy.historySecondLocked}
        </span>
        <span
          className={cn(
            "text-[11px] leading-4",
            eligible
              ? "font-medium text-[#16A34A]"
              : "font-normal text-[#94A3B8]",
          )}
        >
          {eligible
            ? copy.historyReady
            : formatTemplate(copy.historyScheduled, { date: eligibleDate })}
        </span>
      </div>
      <span
        className={cn(
          "shrink-0 rounded-[4px] px-2 py-0.5 text-[10.5px] font-bold",
          eligible
            ? "bg-[#BBF7D0] text-[#15803D]"
            : "bg-[#F1F5F9] text-[#64748B]",
        )}
      >
        {eligible ? copy.historyUnlocked : copy.historyLocked}
      </span>
    </div>
  </section>
)

export default ProfileHistoryCard
