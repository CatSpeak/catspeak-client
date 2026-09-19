import { Check, Clock, Loader2, Mic, SkipForward } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  CONVERSATION_NOTICE,
  CONVERSATION_PHASE,
} from "../../constants/conversation"
import { formatClock, formatTemplate } from "../../utils/format"

const SessionControlRow = ({
  copy = {},
  phase,
  notice,
  remainingMs,
  canSkip,
  onSubmit,
  onSkip,
}) => {
  const analyzing = phase === CONVERSATION_PHASE.ANALYZING
  const waiting = notice === CONVERSATION_NOTICE.NO_HEARING
  const timerTemplate = waiting ? copy.timerWaiting : copy.timerRecording

  return (
    <div className="flex w-full flex-col items-center gap-3 sm:flex-row sm:justify-between">
      <span
        className={cn(
          "inline-flex h-10 items-center gap-2 rounded-full px-4 text-xs font-medium",
          waiting
            ? "bg-[#FFFBEB] text-[#B45309]"
            : "bg-[#FFF1F2] text-cath-red-700",
        )}
      >
        <Clock
          size={14}
          strokeWidth={2}
          className={waiting ? "text-amber-600" : "text-red-600"}
        />
        {formatTemplate(timerTemplate, { time: formatClock(remainingMs) })}
      </span>

      <button
        type="button"
        onClick={onSubmit}
        disabled={analyzing}
        aria-label={copy.submitCta}
        className={cn(
          "flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-full text-white shadow-[0_6px_18px_rgba(153,0,17,0.33)] transition-colors",
          analyzing
            ? "bg-slate-300"
            : waiting
              ? "bg-amber-600 hover:bg-amber-700"
              : "bg-cath-red-700 hover:bg-[#85000f]",
        )}
      >
        {analyzing ? (
          <Loader2 size={22} className="animate-spin" />
        ) : (
          <Mic size={22} strokeWidth={2} />
        )}
      </button>

      <div className="flex w-full flex-col items-stretch gap-2 sm:w-auto sm:flex-row sm:items-center">
        {canSkip && (
          <button
            type="button"
            onClick={onSkip}
            className="inline-flex h-10 items-center justify-center gap-1.5 rounded-full bg-[#F8FAFC] px-4 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-100"
          >
            {copy.skipCta}
            <SkipForward size={13} strokeWidth={2} />
          </button>
        )}
        <button
          type="button"
          onClick={onSubmit}
          disabled={analyzing}
          className={cn(
            "inline-flex h-10 items-center justify-center gap-2 rounded-xl px-5 text-xs font-semibold text-white shadow-[0_4px_12px_rgba(153,0,17,0.25)] transition-colors",
            analyzing
              ? "bg-slate-300"
              : "bg-cath-red-700 hover:bg-[#85000f]",
          )}
        >
          {analyzing ? copy.scoringSummary : copy.submitCta}
          <Check size={14} strokeWidth={2} />
        </button>
      </div>
    </div>
  )
}

export default SessionControlRow
