import {
  Check,
  Clock,
  Loader2,
  Mic,
  RotateCcw,
  SkipForward,
  Square,
  Volume2,
} from "lucide-react"
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
  isRecording = false,
  hasRecorded = false,
  recordedMs = 0,
  maxDurationMs = 45000,
  canSkip = true,
  isPlayingUserAudio = false,
  onPlayUserAudio,
  onStopUserAudio,
  onToggleRecord,
  onReRecord,
  onSubmit,
  onSkip,
}) => {
  const analyzing = phase === CONVERSATION_PHASE.ANALYZING
  const waiting = notice === CONVERSATION_NOTICE.NO_HEARING && isRecording

  let timerText = ""
  if (isRecording) {
    if (waiting) {
      timerText = formatTemplate(
        copy.timerWaiting || "{{time}} / 00:45 • Đang chờ âm thanh",
        { time: formatClock(recordedMs) },
      )
    } else {
      timerText = formatTemplate(
        copy.timerRecording || "{{time}} / 00:45 • Thu âm phản xạ",
        { time: formatClock(recordedMs) },
      )
    }
  } else if (hasRecorded) {
    timerText = `${formatClock(recordedMs)} / ${formatClock(maxDurationMs)} • ${copy.recordedStatus || "Đã ghi âm"}`
  } else {
    timerText = `00:00 / ${formatClock(maxDurationMs)} • ${copy.pressMicToRecord || "Nhấn mic để trả lời"}`
  }

  return (
    <div className="flex w-full flex-col items-center gap-3 sm:flex-row sm:justify-between">
      <span
        className={cn(
          "inline-flex h-10 items-center gap-2 rounded-full px-4 text-xs font-medium transition-colors",
          waiting
            ? "bg-[#FFFBEB] text-[#B45309]"
            : isRecording
              ? "bg-[#FFF1F2] text-cath-red-700 ring-2 ring-red-300 ring-offset-1"
              : hasRecorded
                ? "bg-emerald-50 text-emerald-700"
                : "bg-slate-100 text-slate-600",
        )}
      >
        <Clock
          size={14}
          strokeWidth={2}
          className={
            waiting
              ? "text-amber-600"
              : isRecording
                ? "text-red-600 animate-spin"
                : hasRecorded
                  ? "text-emerald-600"
                  : "text-slate-500"
          }
        />
        {timerText}
      </span>

      {/* Mic Button: Start / Stop / Re-record */}
      <button
        type="button"
        onClick={onToggleRecord}
        disabled={analyzing}
        aria-label={
          isRecording
            ? copy.stopRecordCta || "Dừng ghi âm"
            : hasRecorded
              ? copy.reRecordCta || "Ghi âm lại"
              : copy.startRecordCta || "Bắt đầu nói"
        }
        title={
          isRecording
            ? copy.stopRecordCta || "Dừng ghi âm"
            : hasRecorded
              ? copy.reRecordCta || "Ghi âm lại"
              : copy.startRecordCta || "Bắt đầu nói"
        }
        className={cn(
          "flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-full text-white transition-all",
          analyzing
            ? "bg-slate-300 shadow-none cursor-not-allowed"
            : isRecording
              ? "bg-red-600 hover:bg-red-700 animate-pulse shadow-[0_6px_20px_rgba(220,38,38,0.5)] scale-105"
              : hasRecorded
                ? "bg-slate-700 hover:bg-slate-800 shadow-[0_4px_14px_rgba(51,65,85,0.3)]"
                : "bg-cath-red-700 hover:bg-[#85000f] shadow-[0_6px_18px_rgba(153,0,17,0.33)] hover:scale-105",
        )}
      >
        {analyzing ? (
          <Loader2 size={22} className="animate-spin" />
        ) : isRecording ? (
          <Square size={20} className="fill-white" />
        ) : hasRecorded ? (
          <RotateCcw size={22} strokeWidth={2} />
        ) : (
          <Mic size={22} strokeWidth={2} />
        )}
      </button>

      <div className="flex w-full flex-col items-stretch gap-2 sm:w-auto sm:flex-row sm:items-center">
        {canSkip && (
          <button
            type="button"
            onClick={onSkip}
            disabled={analyzing}
            className="inline-flex h-10 items-center justify-center gap-1.5 rounded-full bg-[#F8FAFC] px-4 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-100 disabled:opacity-50"
          >
            {copy.skipCta}
            <SkipForward size={13} strokeWidth={2} />
          </button>
        )}

        {hasRecorded && !isRecording && !analyzing && onPlayUserAudio && (
          <button
            type="button"
            onClick={isPlayingUserAudio ? onStopUserAudio : onPlayUserAudio}
            className={cn(
              "inline-flex h-10 items-center justify-center gap-1.5 rounded-xl border px-3.5 text-xs font-medium transition-colors",
              isPlayingUserAudio
                ? "border-emerald-300 bg-emerald-50 text-emerald-800 hover:bg-emerald-100"
                : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50",
            )}
          >
            {isPlayingUserAudio ? (
              <>
                <Square size={13} className="fill-emerald-700 text-emerald-700" />
                {copy.stopUserAudio || "Dừng phát"}
              </>
            ) : (
              <>
                <Volume2 size={13} strokeWidth={2} className="text-emerald-600" />
                {copy.playUserAudio || "Nghe lại bản thu"}
              </>
            )}
          </button>
        )}

        {hasRecorded && !isRecording && !analyzing && onReRecord && (
          <button
            type="button"
            onClick={onReRecord}
            className="inline-flex h-10 items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-50"
          >
            <RotateCcw size={13} strokeWidth={2} />
            {copy.reRecordCta || "Thu âm lại"}
          </button>
        )}

        {/* Submit CTA Button: ONLY this button submits the answer */}
        <button
          type="button"
          onClick={onSubmit}
          disabled={analyzing}
          className={cn(
            "inline-flex h-10 items-center justify-center gap-2 rounded-xl px-5 text-xs font-semibold text-white transition-colors",
            analyzing
              ? "bg-slate-300 shadow-none cursor-not-allowed"
              : hasRecorded
                ? "bg-emerald-600 hover:bg-emerald-700 shadow-[0_4px_12px_rgba(16,185,129,0.3)] hover:scale-[1.02]"
                : "bg-cath-red-700 hover:bg-[#85000f] shadow-[0_4px_12px_rgba(153,0,17,0.25)]",
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
