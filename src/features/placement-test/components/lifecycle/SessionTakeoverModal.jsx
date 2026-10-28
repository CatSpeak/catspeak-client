import { AlertTriangle, Copy } from "lucide-react"
import Modal from "@/shared/components/ui/Modal"
import { PillButton } from "@/shared/components/ui/buttons"

const SessionTakeoverModal = ({
  open,
  mode = "conflict",
  copy = {},
  onContinue,
  onClose,
}) => {
  const takenOver = mode === "takenOver"

  return (
    <Modal
      open={open}
      onClose={onClose}
      showCloseButton={false}
      className="md:max-w-[480px]"
      bodyClassName="p-6 sm:p-7"
      footerClassName="px-5 pb-5 sm:px-6 sm:pb-6"
      footer={
        takenOver ? (
          <div className="flex flex-col gap-2.5">
            <PillButton roundedClass="rounded-[10px]" onClick={onClose}>
              {copy.takenOverCta}
            </PillButton>
          </div>
        ) : (
          <div className="flex flex-col gap-2.5">
            <PillButton roundedClass="rounded-[10px]" onClick={onContinue}>
              {copy.continueCta}
            </PillButton>
            <PillButton
              variant="secondary"
              roundedClass="rounded-[10px]"
              onClick={onClose}
            >
              {copy.closeCta}
            </PillButton>
          </div>
        )
      }
    >
      <div className="flex flex-col items-center gap-2.5 text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-[#FFF7ED] ring-1 ring-[#FED7AA]">
          <Copy size={24} strokeWidth={2} className="text-[#C2410C]" />
        </span>
        <h2 className="text-[19px] font-bold leading-[25.65px] text-[#0F172A]">
          {takenOver ? copy.takenOverTitle : copy.title}
        </h2>
        <p className="max-w-[410px] text-[13px] leading-[18.85px] text-[#475569]">
          {takenOver ? copy.takenOverBody : copy.body}
        </p>
      </div>

      <div className="mt-4 flex items-start gap-2.5 rounded-[10px] bg-[#FEF2F2] px-3.5 py-3 ring-1 ring-[#FECACA]">
        <AlertTriangle
          size={20}
          strokeWidth={2}
          className="mt-0.5 shrink-0 text-[#B91C1C]"
        />
        <div className="flex flex-col gap-0.5">
          <span className="text-[11.5px] font-bold leading-[16.7px] text-[#991B1B]">
            {copy.mechanismTitle}
          </span>
          <p className="text-[11px] leading-4 text-[#B91C1C]">
            {copy.mechanismBody}
          </p>
        </div>
      </div>
    </Modal>
  )
}

export default SessionTakeoverModal
