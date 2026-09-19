import { Play, ShieldCheck } from "lucide-react"
import Modal from "@/shared/components/ui/Modal"
import { PillButton } from "@/shared/components/ui/buttons"
import { formatTemplate } from "../../utils/format"
import {
  formatDurationShort,
  formatExpiryStamp,
} from "../../utils/sessionLifecycle"

const ResumeSessionModal = ({
  open,
  copy = {},
  answeredCount = 0,
  totalTurns = 5,
  nextOrder = 1,
  remainingMs = 0,
  expiresAt = 0,
  busy = false,
  onResume,
  onDiscard,
}) => (
  <Modal
    open={open}
    onClose={() => {}}
    showCloseButton={false}
    className="md:max-w-[480px]"
    bodyClassName="p-6 sm:p-7"
    footerClassName="px-5 pb-5 sm:px-6 sm:pb-6"
    footer={
      <div className="flex flex-col gap-2.5 sm:flex-row">
        <PillButton
          variant="secondary"
          roundedClass="rounded-[10px]"
          className="flex-1"
          disabled={busy}
          onClick={onDiscard}
        >
          {copy.discardCta}
        </PillButton>
        <PillButton
          roundedClass="rounded-[10px]"
          className="flex-1"
          loading={busy}
          onClick={onResume}
        >
          {formatTemplate(copy.resumeCta, { order: nextOrder })}
        </PillButton>
      </div>
    }
  >
    <div className="flex flex-col items-center gap-2.5 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-[#EFF6FF] ring-1 ring-[#BFDBFE]">
        <Play size={24} strokeWidth={2} className="text-[#1D4ED8]" />
      </span>
      <h2 className="text-[19px] font-bold leading-[25.65px] text-[#0F172A]">
        {copy.title}
      </h2>
      <p className="max-w-[410px] text-[13px] leading-[18.85px] text-[#475569]">
        {formatTemplate(copy.body, {
          answered: answeredCount,
          total: totalTurns,
          remaining: formatDurationShort(remainingMs),
        })}
      </p>
    </div>

    <div className="mt-4 flex items-start gap-2.5 rounded-[10px] bg-[#F0FDF4] px-3.5 py-3 ring-1 ring-[#BBF7D0]">
      <ShieldCheck
        size={20}
        strokeWidth={2}
        className="mt-0.5 shrink-0 text-green-700"
      />
      <div className="flex flex-col gap-0.5">
        <span className="text-[11.5px] font-bold leading-[16.7px] text-[#15803D]">
          {copy.safeTitle}
        </span>
        <p className="text-[11px] leading-4 text-[#166534]">
          {formatTemplate(copy.safeBody, {
            answered: answeredCount,
            order: nextOrder,
          })}
        </p>
      </div>
    </div>

    <div className="mt-2.5 flex flex-wrap items-center justify-between gap-2 rounded-[10px] bg-[#F8FAFC] px-3.5 py-2.5 ring-1 ring-[#E2E8F0]">
      <div className="flex flex-col gap-0.5">
        <span className="text-[11.5px] font-bold leading-[16.7px] text-[#334155]">
          {copy.deadlineLabel}
        </span>
        <span className="text-[11px] font-medium leading-4 text-[#64748B]">
          {formatTemplate(copy.autoCancel, {
            date: formatExpiryStamp(expiresAt),
          })}
        </span>
      </div>
      <span className="rounded-md bg-[#FEF3C7] px-2 py-0.5 text-[11px] font-bold text-[#B45309]">
        {formatTemplate(copy.remainingChip, {
          remaining: formatDurationShort(remainingMs),
        })}
      </span>
    </div>
  </Modal>
)

export default ResumeSessionModal
