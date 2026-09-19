import { HelpCircle, Sparkles } from "lucide-react"

const ScoringTopbar = ({ copy = {}, error = false, onHelp }) => (
  <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
    <div className="flex items-center gap-3">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] bg-[#FFF1F2] text-cath-red-700">
        <Sparkles size={20} strokeWidth={2} />
      </span>
      <div className="flex flex-col">
        <h1 className="text-[17px] font-semibold leading-6 text-[#09090B]">
          {error ? copy.errorTitle : copy.title}
        </h1>
        <p className="text-xs font-semibold leading-4 text-cath-red-700">
          {error ? copy.errorSubtitle : copy.subtitle}
        </p>
      </div>
    </div>

    {error ? (
      <button
        type="button"
        onClick={onHelp}
        className="inline-flex h-9 w-fit items-center gap-1.5 rounded-[10px] border border-[#E2E8F0] bg-white px-3.5 text-xs font-semibold text-slate-600 transition-colors hover:bg-slate-50"
      >
        <HelpCircle size={14} strokeWidth={2} />
        {copy.helpCta}
      </button>
    ) : (
      <span className="inline-flex h-8 w-fit items-center rounded-full bg-[#EFF6FF] px-3.5 text-xs font-bold text-[#1D4ED8]">
        {copy.analyzingPill}
      </span>
    )}
  </div>
)

export default ScoringTopbar
