import { Check, Languages, RotateCcw } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  CONVERSATION_NOTICE,
  CONVERSATION_PHASE,
} from "../../constants/conversation"
import { formatTemplate } from "../../utils/format"

const statusFor = (copy, { phase, notice, transcript }) => {
  if (notice === CONVERSATION_NOTICE.NO_HEARING) {
    return { label: copy.statusNoAudio, tone: "amber" }
  }
  if (phase === CONVERSATION_PHASE.ANALYZING) {
    return { label: copy.statusSubmitted, tone: "green" }
  }
  if (transcript) {
    return { label: copy.statusRecognized, tone: "green" }
  }
  return { label: copy.statusWaiting, tone: "slate" }
}

const STATUS_TONES = {
  green: "text-green-600",
  amber: "text-amber-600",
  slate: "text-slate-500",
}

const ScriptToggle = ({ active, label, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className={cn(
      "inline-flex items-center gap-1 rounded-md border px-2 py-1 text-[10px] font-semibold transition-colors",
      active
        ? "border-cath-red-700 bg-[#FFF1F2] text-cath-red-700"
        : "border-slate-200 bg-white text-slate-400",
    )}
  >
    <Languages size={11} strokeWidth={2} />
    {label}
  </button>
)

const TranscriptCards = ({
  copy = {},
  question,
  transcript,
  phase,
  notice,
  showHanzi,
  showPinyin,
  onToggleHanzi,
  onTogglePinyin,
  onReplay,
}) => {
  const status = statusFor(copy, { phase, notice, transcript })
  const subline =
    phase === CONVERSATION_PHASE.ANALYZING || transcript
      ? copy.analyzingSubline
      : copy.waitingSubline

  return (
    <div className="grid w-full gap-3 md:grid-cols-2">
      <div className="flex flex-col gap-2 rounded-2xl bg-white px-4 py-3 shadow-[0_4px_12px_-1px_rgba(99,102,241,0.10)]">
        <div className="flex items-center justify-between gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-md bg-[#EDE9FE] px-2 py-1 text-xs font-bold text-[#4338CA]">
            <RotateCcw size={13} strokeWidth={2} />
            {copy.aiLabel}
          </span>
          <button
            type="button"
            onClick={onReplay}
            className="inline-flex items-center gap-1 rounded-full bg-[#FFF1F2] px-2.5 py-1 text-[11px] font-bold text-[#991B1B] transition-colors hover:bg-[#FFE4E6]"
          >
            <RotateCcw size={12} strokeWidth={2} className="text-red-600" />
            {copy.replay}
          </button>
        </div>

        {showHanzi && (
          <p className="font-sans text-sm font-medium leading-5 text-[#09090B]">
            {question?.hanzi}
          </p>
        )}
        {showPinyin && question?.pinyin && (
          <p className="text-[11px] font-medium leading-4 text-slate-600">
            {formatTemplate(copy.pinyinLabel, { pinyin: question.pinyin })}
          </p>
        )}

        <div className="mt-0.5 flex items-center gap-1.5">
          <ScriptToggle
            active={showHanzi}
            label={copy.scriptHanzi}
            onClick={onToggleHanzi}
          />
          <ScriptToggle
            active={showPinyin}
            label={copy.scriptPinyin}
            onClick={onTogglePinyin}
          />
        </div>
      </div>

      <div className="flex flex-col gap-2 rounded-2xl bg-white px-4 py-3 shadow-[0_4px_12px_-1px_rgba(34,197,94,0.10)]">
        <div className="flex items-center justify-between gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-md bg-[#DCFCE7] px-2 py-1 text-xs font-bold text-[#15803D]">
            <Check size={13} strokeWidth={2} />
            {copy.youLabel}
          </span>
          <span
            className={cn(
              "text-[11px] font-medium",
              STATUS_TONES[status.tone],
            )}
          >
            {status.label}
          </span>
        </div>

        <p
          className={cn(
            "text-xs font-medium leading-[17px]",
            transcript ? "text-[#09090B]" : "text-slate-400",
          )}
        >
          {transcript || copy.transcriptPlaceholder}
        </p>
        <p className="text-[10px] font-medium leading-[14px] text-slate-600">
          {subline}
        </p>
      </div>
    </div>
  )
}

export default TranscriptCards
