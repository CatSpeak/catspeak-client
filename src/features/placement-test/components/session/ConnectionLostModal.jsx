import { ShieldCheck, WifiOff } from "lucide-react"
import Modal from "@/shared/components/ui/Modal"
import { PillButton } from "@/shared/components/ui/buttons"
import { MAX_RECONNECT_ATTEMPTS } from "../../constants/lifecycle"
import { TOTAL_TURNS } from "../../engine"
import { formatTemplate } from "../../utils/format"

const ConnectionLostModal = ({
  open,
  copy = {},
  reconnectAttempt = 1,
  reconnectRemainingMs = 0,
  currentOrder = 1,
  answeredCount = 0,
  onRetry,
  onLeave,
}) => {
  const seconds = Math.max(0, Math.ceil(reconnectRemainingMs / 1000))

  return (
    <Modal
      open={open}
      onClose={() => {}}
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
            onClick={onRetry}
          >
            {copy.reconnectRetryCta}
          </PillButton>
        </div>
      }
    >
      <div className="flex flex-col items-center gap-2.5 text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-[#FEF2F2] ring-1 ring-[#FECACA]">
          <WifiOff size={24} strokeWidth={2} className="text-[#B91C1C]" />
        </span>
        <h2 className="text-xl font-bold text-[#0F172A]">
          {copy.reconnectTitle}
        </h2>
        <p className="max-w-[420px] text-[13px] leading-5 text-slate-600">
          {copy.reconnectBody}
        </p>
      </div>

      <div className="mt-4 flex items-start gap-2.5 rounded-[10px] bg-[#F0FDF4] px-3.5 py-3 ring-1 ring-[#BBF7D0]">
        <ShieldCheck
          size={20}
          strokeWidth={2}
          className="mt-0.5 shrink-0 text-green-700"
        />
        <span className="text-[11.5px] leading-4 text-[#166534]">
          {formatTemplate(copy.reconnectSafeData, {
            answered: answeredCount,
            order: currentOrder,
            total: TOTAL_TURNS,
          })}
        </span>
      </div>

      <div className="mt-2.5 flex flex-wrap items-center justify-between gap-2 rounded-[10px] bg-[#FEF2F2] px-3.5 py-2.5 ring-1 ring-[#FECACA]">
        <span className="text-xs font-medium text-[#991B1B]">
          {copy.reconnectProgressLabel}
        </span>
        <span className="rounded-md bg-[#FEE2E2] px-2 py-0.5 text-xs font-bold text-[#B91C1C]">
          {formatTemplate(copy.reconnectProgressChip, {
            seconds,
            attempt: reconnectAttempt,
            max: MAX_RECONNECT_ATTEMPTS,
          })}
        </span>
      </div>
    </Modal>
  )
}

export default ConnectionLostModal
