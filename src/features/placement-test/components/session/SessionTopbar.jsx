import { Pause, Settings2, Sparkles } from "lucide-react"

const SessionTopbar = ({ copy = {}, onPause, onConfigure }) => (
  <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
    <div className="flex items-center gap-3">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] bg-[#FFF1F2] text-cath-red-700">
        <Sparkles size={20} strokeWidth={2} />
      </span>
      <div className="flex flex-col">
        <h1 className="text-[17px] font-semibold leading-6 text-[#09090B]">
          {copy.title}
        </h1>
        <p className="text-xs font-medium leading-4 text-slate-600">
          {copy.subtitle}
        </p>
      </div>
    </div>

    <div className="flex flex-wrap items-center gap-2.5">
      <span className="inline-flex h-[34px] items-center gap-1.5 rounded-full bg-[#F0FDF4] px-3 text-[11px] font-medium text-[#15803D]">
        <span className="h-1.5 w-1.5 rounded-full bg-green-600" />
        {copy.connection}
      </span>
      <button
        type="button"
        onClick={onConfigure}
        className="inline-flex h-9 items-center gap-1.5 rounded-[10px] bg-slate-50 px-3.5 text-xs font-bold text-[#0F172A] shadow-sm transition-colors hover:bg-slate-100"
      >
        <Settings2 size={14} strokeWidth={2} className="text-indigo-500" />
        {copy.configure}
      </button>
      <button
        type="button"
        onClick={onPause}
        className="inline-flex h-9 items-center gap-1.5 rounded-[10px] bg-[#FFF1F2] px-3.5 text-xs font-bold text-[#991B1B] shadow-sm transition-colors hover:bg-[#FFE4E6]"
      >
        <Pause size={13} strokeWidth={2} className="text-red-600" />
        {copy.pause}
      </button>
    </div>
  </div>
)

export default SessionTopbar
