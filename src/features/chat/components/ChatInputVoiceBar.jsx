import React, { useRef } from "react"
import { Trash2, Send, Square, Play, Pause } from "lucide-react"
import { IconButton } from "@/shared/components/ui/buttons"
import { useLanguage } from "@/shared/context/LanguageContext"

const formatRecordTime = (seconds) => {
  if (isNaN(seconds) || seconds == null || seconds < 0) return "00:00"
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m < 10 ? "0" : ""}${m}:${s < 10 ? "0" : ""}${s}`
}

/**
 * ChatInputVoiceBar — UI bar rendered when voice recording or review is active.
 *
 * In Recording Mode:
 *   - Pulsing live recording indicator & duration timer
 *   - Real-time animated frequency waveform visualizer
 *   - Discard (Trash), Stop & Review (Square), and Direct Send buttons
 *
 * In Review Mode:
 *   - Play / Pause preview button
 *   - Scrubbable waveform progress with click-to-seek
 *   - Current playback vs total recorded time indicator
 *   - Discard and Confirm & Send buttons
 */
const ChatInputVoiceBar = ({
  isReviewing = false,
  recordingSeconds = 0,
  visualizerBars = [],
  reviewBars = [],
  isPlaying = false,
  playbackCurrentTime = 0,
  onStop,
  onCancel,
  onSend,
  onTogglePlay,
  onSeek,
}) => {
  const { t } = useLanguage()
  const waveformRef = useRef(null)

  const handleSeek = (e) => {
    if (!waveformRef.current || !onSeek) return
    const rect = waveformRef.current.getBoundingClientRect()
    const clickX = e.clientX - rect.left
    const percent = Math.max(0, Math.min(1, clickX / rect.width))
    onSeek(percent)
  }

  // Selected bars to render
  const displayBars = isReviewing
    ? reviewBars.length > 0
      ? reviewBars
      : visualizerBars
    : visualizerBars

  const progressRatio =
    recordingSeconds > 0 ? playbackCurrentTime / recordingSeconds : 0
  const activeBarCount = Math.round(progressRatio * displayBars.length)

  return (
    <div className="w-full flex items-center justify-between px-1 h-14 border border-cath-red-700 bg-red-50/50 rounded-[28px] transition-all duration-200">
      {/* ── Left Section: Dynamic Action Button (Stop <-> Play/Pause) & Timer ── */}
      <div className="flex items-center gap-1 shrink-0">
        {isReviewing ? (
          /* Play / Pause Toggle Button */
          <IconButton
            onClick={onTogglePlay}
            variant="primary"
            aria-label={
              isPlaying
                ? t?.chat?.pausePreview || "Pause preview"
                : t?.chat?.playPreview || "Play preview"
            }
            title={
              isPlaying
                ? t?.chat?.pausePreview || "Pause preview"
                : t?.chat?.playPreview || "Play preview"
            }
          >
            {isPlaying ? (
              <Pause className="fill-current" />
            ) : (
              <Play className="fill-current" />
            )}
          </IconButton>
        ) : (
          /* Stop Recording Button */
          <IconButton
            onClick={onStop}
            variant="primary"
            aria-label={t?.chat?.stopRecording || "Stop and review"}
            title={t?.chat?.stopRecording || "Stop and review"}
          >
            <Square className="fill-current" />
          </IconButton>
        )}

        {/* Timers */}
        <span className="text-xs select-none shrink-0 pr-1">
          {isReviewing
            ? `${formatRecordTime(playbackCurrentTime)} / ${formatRecordTime(recordingSeconds)}`
            : formatRecordTime(recordingSeconds)}
        </span>
      </div>

      {/* ── Center Section: Waveform (Live when recording, scrubbable when reviewing) ── */}
      {isReviewing ? (
        <div
          ref={waveformRef}
          onClick={handleSeek}
          className="flex-1 flex items-center justify-center gap-[2.5px] sm:gap-[3px] px-2 sm:px-4 h-8 overflow-hidden max-w-[200px] sm:max-w-xs cursor-pointer select-none py-1 group/wave"
          title={t?.chat?.clickToSeek || "Click to seek"}
        >
          {displayBars.map((height, idx) => {
            const isPlayed = idx < activeBarCount
            return (
              <div
                key={idx}
                style={{ height: `${height}%` }}
                className={`w-1 sm:w-1.5 rounded-full transition-all duration-75 ${
                  isPlayed ? "bg-cath-red-700" : "bg-red-200"
                } group-hover/wave:opacity-90`}
              />
            )
          })}
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center gap-[2.5px] sm:gap-[3px] px-2 sm:px-4 h-8 overflow-hidden max-w-[200px] sm:max-w-xs">
          {displayBars.map((height, idx) => (
            <div
              key={idx}
              style={{ height: `${height}%` }}
              className="w-1 sm:w-1.5 bg-red-500/80 rounded-full transition-all duration-75"
            />
          ))}
        </div>
      )}

      {/* ── Right Section: Consistent Action Buttons (Discard & Send) ── */}
      <div className="flex items-center gap-0.5 sm:gap-1 shrink-0">
        {/* Discard / Cancel Button */}
        <IconButton
          onClick={onCancel}
          variant="ghost"
          aria-label={
            isReviewing
              ? t?.chat?.discardRecording || "Discard recording"
              : t?.chat?.recordingCancelled || "Cancel recording"
          }
          title={
            isReviewing
              ? t?.chat?.discardRecording || "Discard recording"
              : t?.chat?.recordingCancelled || "Cancel recording"
          }
        >
          <Trash2 className="text-neutral-500 hover:text-red-600 transition-colors" />
        </IconButton>

        {/* Send Button */}
        <IconButton
          onClick={onSend}
          variant="primary"
          aria-label={t?.chat?.sendVoice || t?.chat?.send || "Send voice message"}
          title={t?.chat?.sendVoice || t?.chat?.send || "Send voice message"}
        >
          <Send className="-translate-x-[1px] translate-y-[1px]" />
        </IconButton>
      </div>
    </div>
  )
}

export default ChatInputVoiceBar
