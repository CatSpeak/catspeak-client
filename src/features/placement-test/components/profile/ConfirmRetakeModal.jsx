import { AlertTriangle, RotateCcw } from "lucide-react"
import Modal from "@/shared/components/ui/Modal"
import { PillButton } from "@/shared/components/ui/buttons"

const ConfirmRetakeModal = ({
  open,
  onClose,
  copy = {},
  confirming = false,
  onConfirm,
}) => (
  <Modal
    open={open}
    onClose={onClose}
    showCloseButton={false}
    className="md:max-w-[480px]"
    bodyClassName="p-6 sm:p-7"
    footerClassName="px-5 pb-5 sm:px-6 sm:pb-6"
    footer={
      <div className="flex items-center gap-3">
        <PillButton
          variant="secondary"
          roundedClass="rounded-[10px]"
          className="flex-1"
          onClick={onClose}
        >
          {copy.cancelCta}
        </PillButton>
        <PillButton
          roundedClass="rounded-[10px]"
          className="flex-1"
          loading={confirming}
          onClick={onConfirm}
        >
          {copy.confirmCta}
        </PillButton>
      </div>
    }
  >
    <div className="flex flex-col items-center gap-3 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-[#FFF1F2] dark:bg-rose-950/40 text-cath-red-700 dark:text-red-400 ring-1 ring-[#FECDD3] dark:ring-red-900/40">
        <RotateCcw size={24} strokeWidth={2} />
      </span>
      <h2 className="text-[19px] font-bold leading-[25.65px] text-[#0F172A] dark:text-white">
        {copy.title}
      </h2>
      <p className="max-w-[410px] text-[13px] leading-[18.85px] text-[#475569] dark:text-neutral-300">
        {copy.body}
      </p>
    </div>

    <div className="mt-4 flex items-start gap-2.5 rounded-[10px] border border-[#FDE68A] dark:border-amber-900/40 bg-[#FFFBEB] dark:bg-amber-950/30 px-3.5 py-3">
      <AlertTriangle
        size={20}
        strokeWidth={2}
        className="mt-0.5 shrink-0 text-[#92400E] dark:text-amber-400"
      />
      <div className="flex flex-col gap-0.5">
        <span className="text-[11.5px] font-bold leading-[16.7px] text-[#92400E] dark:text-amber-400">
          {copy.cooldownTitle}
        </span>
        <p className="text-[11px] leading-4 text-[#B45309] dark:text-amber-300">
          {copy.cooldownBody}
        </p>
      </div>
    </div>

    <div className="mt-3 flex flex-col gap-1.5 rounded-[10px] border border-[#E2E8F0] dark:border-[#3F3F3F] bg-[#F8FAFC] dark:bg-[#202020] px-3.5 py-2.5">
      <p className="text-[11.5px] font-medium leading-[16.7px] text-[#334155] dark:text-neutral-300">
        • {copy.bullet1}
      </p>
      <p className="text-[11.5px] font-medium leading-[16.7px] text-[#334155] dark:text-neutral-300">
        • {copy.bullet2}
      </p>
    </div>
  </Modal>
)

export default ConfirmRetakeModal
