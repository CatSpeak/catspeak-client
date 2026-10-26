import { Share2, Sparkles } from "lucide-react"

const ResultTopbar = ({ copy = {}, subtitle, onShare }) => (
  <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
    <div className="flex items-center gap-3">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] bg-[#FFF1F2] text-cath-red-700">
        <Sparkles size={20} strokeWidth={2} />
      </span>
      <div className="flex flex-col">
        <h1 className="text-[17px] font-semibold leading-6 text-[#09090B]">
          {copy.topbarTitle}
        </h1>
        <p className="text-xs font-semibold leading-4 text-cath-red-700">
          {subtitle}
        </p>
      </div>
    </div>

    <button
      type="button"
      onClick={onShare}
      className="inline-flex h-8 w-fit items-center gap-1.5 rounded-[8px] border border-[#E2E8F0] bg-white px-3.5 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-50"
    >
      <Share2 size={14} strokeWidth={2} />
      {copy.shareCta}
    </button>
  </div>
)

export default ResultTopbar
