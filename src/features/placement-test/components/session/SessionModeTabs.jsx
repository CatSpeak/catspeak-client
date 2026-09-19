import { FileText, MessagesSquare } from "lucide-react"
import { cn } from "@/lib/utils"
import { TOTAL_TURNS } from "../../engine"
import { formatTemplate } from "../../utils/format"

const SessionModeTabs = ({ copy = {}, currentOrder = 1 }) => (
  <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
    <div className="inline-flex w-full items-center gap-1.5 rounded-xl bg-slate-100 p-1 lg:w-auto">
      <span className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-slate-50 px-3.5 py-1.5 text-xs font-medium text-slate-600 lg:flex-none">
        <MessagesSquare size={13} strokeWidth={2} className="text-orange-600" />
        {copy.casual}
      </span>
      <span className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-white px-4 py-1.5 text-xs font-extrabold text-cath-red-700 shadow-[0_2px_6px_rgba(153,0,17,0.14)] lg:flex-none">
        <FileText size={13} strokeWidth={2} />
        {copy.placement}
      </span>
    </div>

    <div className="flex items-center justify-end gap-2.5">
      <span className="text-xs font-medium text-slate-600">
        {formatTemplate(copy.progress, {
          current: currentOrder,
          total: TOTAL_TURNS,
        })}
      </span>
      <div className="flex items-center gap-1">
        {Array.from({ length: TOTAL_TURNS }).map((_, index) => {
          const step = index + 1
          const done = step < currentOrder
          const active = step === currentOrder
          return (
            <span
              key={step}
              className={cn(
                "h-1.5 rounded-full transition-all",
                done && "w-3.5 bg-green-600",
                active && "w-5 bg-[#CF5B5B]",
                !done && !active && "w-3.5 bg-slate-200",
              )}
            />
          )
        })}
      </div>
    </div>
  </div>
)

export default SessionModeTabs
