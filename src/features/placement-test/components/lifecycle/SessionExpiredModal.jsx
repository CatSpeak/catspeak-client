import { Clock, ShieldAlert } from "lucide-react"
import Modal from "@/shared/components/ui/Modal"
import { PillButton } from "@/shared/components/ui/buttons"

const SessionExpiredModal = ({
  open,
  copy = {},
  busy = false,
  onStartNew,
  onGoHome,
}) => (
  <Modal
    open={open}
    onClose={() => {}}
    showCloseButton={false}
    className="md:max-w-[480px]"
    bodyClassName="p-6 sm:p-7"
    footerClassName="px-5 pb-5 sm:px-6 sm:pb-6"
    footer={
      <div className="flex flex-col gap-2.5">
        <PillButton
          roundedClass="rounded-[10px]"
          loading={busy}
          onClick={onStartNew}
        >
          {copy.startCta}
        </PillButton>
        <PillButton
          variant="secondary"
          roundedClass="rounded-[10px]"
          disabled={busy}
          onClick={onGoHome}
        >
          {copy.homeCta}
        </PillButton>
      </div>
    }
  >
    <div className="flex flex-col items-center gap-2.5 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-[#FEF2F2] dark:bg-rose-950/40 ring-1 ring-[#FECACA] dark:ring-rose-800/40">
        <Clock size={24} strokeWidth={2} className="text-[#B91C1C] dark:text-rose-400" />
      </span>
      <h2 className="text-[19px] font-bold leading-[25.65px] text-[#0F172A] dark:text-white">
        {copy.title}
      </h2>
      <p className="max-w-[410px] text-[13px] leading-[18.85px] text-[#475569] dark:text-neutral-300">
        {copy.body}
      </p>
    </div>

    <div className="mt-4 flex items-start gap-2.5 rounded-[10px] bg-[#FFF7ED] dark:bg-amber-950/30 px-3.5 py-3 ring-1 ring-[#FED7AA] dark:ring-amber-800/40">
      <ShieldAlert
        size={20}
        strokeWidth={2}
        className="mt-0.5 shrink-0 text-[#C2410C] dark:text-amber-400"
      />
      <div className="flex flex-col gap-0.5">
        <span className="text-[11.5px] font-bold leading-[16.7px] text-[#9A3412] dark:text-amber-300">
          {copy.securityTitle}
        </span>
        <p className="text-[11px] leading-4 text-[#C2410C] dark:text-amber-400">
          {copy.securityBody}
        </p>
      </div>
    </div>
  </Modal>
)

export default SessionExpiredModal
