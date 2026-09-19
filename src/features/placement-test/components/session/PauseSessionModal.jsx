import { Pause, ShieldCheck } from "lucide-react"
import Modal from "@/shared/components/ui/Modal"
import { PillButton } from "@/shared/components/ui/buttons"
import { TOTAL_TURNS } from "../../engine"
import { formatClock, formatTemplate } from "../../utils/format"

const PauseSessionModal = ({
  open,
  copy = {},
  pauseRemainingMs = 0,
  answeredCount = 0,
  onResume,
  onLeave,
}) => (
  <Modal
    open={open}
    onClose={onResume}
    showCloseButton={false}
    className="md:max-w-lg"
    footer={
      <div className="flex flex-col gap-2.5 sm:flex-row">
        <PillButton
          variant="secondary"
          roundedClass="rounded-[10px]"
          className="flex-1"
          onClick={onLeave}
        >
          {copy.pauseLeaveCta}
        </PillButton>
        <PillButton
          roundedClass="rounded-[10px]"
          className="flex-1"
          onClick={onResume}
        >
          {copy.pauseResumeCta}
        </PillButton>
      </div>
    }
  >
    <div className="flex flex-col items-center gap-2.5 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-[#FEF3C7] ring-1 ring-[#FDE68A]">
        <Pause size={24} strokeWidth={2} className="text-[#B45309]" />
      </span>
      <h2 className="text-xl font-bold text-[#0F172A]">{copy.pauseTitle}</h2>
      <p className="max-w-[420px] text-[13px] leading-5 text-slate-600">
        {copy.pauseBody}
      </p>
    </div>

    <div className="mt-4 flex items-start gap-2.5 rounded-[10px] bg-[#F0FDF4] px-3.5 py-3 ring-1 ring-[#BBF7D0]">
      <ShieldCheck
        size={20}
        strokeWidth={2}
        className="mt-0.5 shrink-0 text-green-700"
      />
      <span className="text-[11.5px] leading-4 text-[#166534]">
        {formatTemplate(copy.pauseSafeData, {
          answered: answeredCount,
          total: TOTAL_TURNS,
        })}
      </span>
    </div>

    <div className="mt-2.5 flex flex-wrap items-center justify-between gap-2 rounded-[10px] bg-[#FFFBEB] px-3.5 py-2.5 ring-1 ring-[#FDE68A]">
      <span className="text-xs font-medium text-[#92400E]">
        {copy.pauseBudgetLabel}
      </span>
      <span className="rounded-md bg-[#FEF3C7] px-2 py-0.5 text-xs font-bold text-[#B45309]">
        {formatTemplate(copy.pauseBudgetChip, {
          time: formatClock(pauseRemainingMs),
        })}
      </span>
    </div>
  </Modal>
)

export default PauseSessionModal
