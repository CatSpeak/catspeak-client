import React from "react"
import { Play, Pause, X } from "lucide-react"
import { formatDuration } from "../../utils/galleryUtils"
import IconButton from "@/shared/components/ui/buttons/IconButton"
import ProgressBar from "@/shared/components/ui/ProgressBar"

/**
 * DockedAudioPlayer — Persistent audio player bar docked at the bottom of SharedMediaGallery.
 */
const DockedAudioPlayer = ({
  activeAudio,
  isPlayingAudio,
  audioCurrentTime,
  audioDuration,
  playbackSpeed,
  onTogglePlay,
  onCycleSpeed,
  onSeek,
  onClose,
  t,
}) => {
  if (!activeAudio) return null

  const activeTotal =
    Number.isFinite(audioDuration) && audioDuration > 0
      ? audioDuration
      : Number.isFinite(activeAudio.audioDuration) &&
          activeAudio.audioDuration > 0
        ? activeAudio.audioDuration
        : Number.isFinite(activeAudio.duration) && activeAudio.duration > 0
          ? activeAudio.duration
          : 0

  const progressPercent =
    activeTotal > 0 ? Math.min(100, (audioCurrentTime / activeTotal) * 100) : 0

  return (
    <div className="shrink-0 border-t border-border bg-white shadow-md flex flex-col select-none z-20">
      <div className="flex items-center justify-between gap-4 px-4 h-[72px]">
        {/* Play/Pause Button */}
        <button
          type="button"
          onClick={onTogglePlay}
          className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center shrink-0 cursor-pointer hover:bg-primary/90 transition-colors"
        >
          {isPlayingAudio ? (
            <Pause className="fill-current" />
          ) : (
            <Play className="fill-current" />
          )}
        </button>

        {/* Info */}
        <div className="min-w-0 flex-1">
          <p className="truncate">
            {activeAudio.senderName || t?.chat?.voiceAudio || "Voice Message"}
          </p>
          <div className="flex items-center gap-1 text-sm text-secondary">
            <span>{formatDuration(audioCurrentTime)}</span>
            {activeTotal > 0 ? (
              <>
                <span>/</span>
                <span>{formatDuration(activeTotal)}</span>
              </>
            ) : null}
          </div>
        </div>

        {/* Playback Speed Button */}
        {onCycleSpeed && (
          <button
            type="button"
            onClick={onCycleSpeed}
            className="text-xs font-semibold px-2 py-1 rounded-md bg-neutral-100 hover:bg-neutral-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-neutral-700 dark:text-neutral-200 transition-colors cursor-pointer shrink-0 select-none"
            title={t?.chat?.playbackSpeed || "Playback Speed"}
          >
            {playbackSpeed || 1}x
          </button>
        )}

        {/* Close Button */}
        <IconButton
          variant="ghost"
          size="sm"
          onClick={onClose}
          title={t?.common?.close || "Close Player"}
          aria-label={t?.common?.close || "Close Player"}
          className="shrink-0"
        >
          <X />
        </IconButton>
      </div>

      {/* Interactive Progress Scrubber */}
      <div className="px-4 pb-4 w-full">
        <div
          onClick={onSeek}
          className="group relative w-full flex items-center cursor-pointer"
        >
          <ProgressBar
            progress={progressPercent}
            className="w-full pointer-events-none"
          />
        </div>
      </div>
    </div>
  )
}

export default React.memo(DockedAudioPlayer)
