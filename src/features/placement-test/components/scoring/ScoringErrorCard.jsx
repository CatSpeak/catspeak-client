import { Home, RefreshCw, ShieldCheck, TriangleAlert } from "lucide-react"
import { PillButton } from "@/shared/components/ui/buttons"
import { TOTAL_TURNS } from "../../engine"
import { formatTemplate } from "../../utils/format"

const ScoringErrorCard = ({
  copy = {},
  session,
  retrying = false,
  onRetry,
  onSaveLater,
}) => {
  const answered = Array.isArray(session?.turns) ? session.turns.length : 0
  const code = session?.code || "—"

  return (
    <section className="flex w-full flex-col items-start gap-6 rounded-3xl bg-white p-6 shadow-[0_8px_24px_rgba(15,23,42,0.05)] ring-1 ring-[#E2E8F0] md:p-9">
      <span className="flex h-16 w-16 items-center justify-center rounded-full bg-[#FFF1F2] ring-1 ring-[#FECDD3]">
        <TriangleAlert
          size={32}
          strokeWidth={2}
          className="text-cath-red-700"
        />
      </span>
      <h2 className="text-2xl font-bold leading-8 text-[#09090B]">
        {copy.errorHeading}
      </h2>
      <p className="text-[15px] leading-[22px] text-slate-600">
        {copy.errorBody}
      </p>

      <div className="flex w-full items-start gap-4 rounded-[14px] bg-[#F8FAFC] px-5 py-4 ring-1 ring-[#E2E8F0]">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#DCFCE7]">
          <ShieldCheck size={22} strokeWidth={2} className="text-[#16A34A]" />
        </span>
        <div className="flex flex-col gap-1.5">
          <p className="text-sm font-bold leading-5 text-[#15803D]">
            {formatTemplate(copy.safeTitle, { answered, total: TOTAL_TURNS })}
          </p>
          <p className="text-[13px] leading-[19px] text-slate-600">
            {copy.safeBody}
          </p>
          <p className="text-[11px] leading-4 text-slate-400">
            {formatTemplate(copy.safeMeta, { code })}
          </p>
        </div>
      </div>

      <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center">
        <PillButton
          roundedClass="rounded-[10px]"
          className="w-full sm:w-auto"
          onClick={onRetry}
          loading={retrying}
          loadingText={copy.retryCta}
          startIcon={<RefreshCw size={16} strokeWidth={2} />}
        >
          {copy.retryCta}
        </PillButton>
        <PillButton
          variant="secondary"
          roundedClass="rounded-[10px]"
          className="w-full sm:w-auto"
          onClick={onSaveLater}
          startIcon={<Home size={16} strokeWidth={2} />}
        >
          {copy.saveLaterCta}
        </PillButton>
      </div>
    </section>
  )
}

export default ScoringErrorCard
