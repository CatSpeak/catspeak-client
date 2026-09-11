import { useEffect, useState } from "react"
import {
  Play,
  Pause,
  RotateCcw,
  RotateCw,
  Repeat,
  Square,
  MousePointerClick,
} from "lucide-react"

const formatTime = (seconds) => {
  if (seconds == null || !Number.isFinite(seconds) || seconds < 0) return "0:00"
  const s = Math.floor(seconds)
  const m = Math.floor(s / 60)
  return `${m}:${String(s % 60).padStart(2, "0")}`
}

/**
 * WatchTogetherToolbar — action bar rendered BELOW the synced video
 * (never overlaid), so controls stay visible on desktop and mobile.
 *
 * Host: play / pause / ±10s / seek slider (local player calls only —
 * useHostSync's tracker publishes the transition to viewers) + change / stop.
 * Viewer: status title + persistent tap-to-sync. Volume/fullscreen stay on
 * the native YouTube controls inside the player.
 */
const WatchTogetherToolbar = ({
  isHost,
  mediaTitle,
  playerRef,
  onChangeVideo,
  onStop,
  isStopping = false,
  needsTapToSync = false,
  onTapToSync,
  t,
}) => {
  const strings = t?.rooms?.videoCall?.watchTogether ?? {}
  const [now, setNow] = useState(0)
  const [duration, setDuration] = useState(0)

  useEffect(() => {
    if (!isHost) return
    const id = setInterval(() => {
      try {
        const time = playerRef?.current?.getCurrentTime?.()
        const total = playerRef?.current?.getDuration?.()
        if (typeof time === "number" && Number.isFinite(time)) setNow(time)
        if (typeof total === "number" && Number.isFinite(total)) setDuration(total)
      } catch {
        // Player not ready yet — next tick retries.
      }
    }, 1000)
    return () => clearInterval(id)
  }, [isHost, playerRef])

  const seekBy = (delta) => {
    try {
      const time = playerRef?.current?.getCurrentTime?.() ?? now
      const next = Math.max(0, (time ?? 0) + delta)
      playerRef?.current?.seekTo?.(next)
      setNow(next)
    } catch {
      // No-op when player is tearing down.
    }
  }

  const handleSeek = (value) => {
    const next = Number(value)
    if (!Number.isFinite(next)) return
    try {
      playerRef?.current?.seekTo?.(next)
      setNow(next)
    } catch {
      // No-op when player is tearing down.
    }
  }

  if (!isHost) {
    return (
      <div className="flex items-center gap-2 border-t border-border bg-white px-3 py-2 shrink-0">
        <p className="flex-1 min-w-0 truncate text-sm font-medium text-gray-800">
          {mediaTitle || strings.hostWatching || "Chủ phòng đang phát video chung."}
        </p>
        {needsTapToSync && (
          <button
            type="button"
            onClick={onTapToSync ?? undefined}
            className="flex shrink-0 items-center gap-1.5 rounded-full bg-red-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-700 transition-colors"
          >
            <MousePointerClick size={14} />
            {strings.tapToSync || "Nhấn để đồng bộ"}
          </button>
        )}
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-2 border-t border-border bg-white px-3 py-2 shrink-0">
      <div className="flex items-center gap-2 min-w-0">
        <p className="flex-1 min-w-0 truncate text-sm font-medium text-gray-800">
          {mediaTitle}
        </p>
        <button
          type="button"
          onClick={onChangeVideo ?? undefined}
          className="flex shrink-0 items-center gap-1 rounded-full border border-border px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors"
        >
          <Repeat size={14} />
          {strings.changeVideo || "Đổi video"}
        </button>
        <button
          type="button"
          onClick={onStop ?? undefined}
          disabled={isStopping}
          className="flex shrink-0 items-center gap-1 rounded-full bg-red-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-700 disabled:opacity-50 transition-colors"
        >
          <Square size={14} />
          {isStopping
            ? strings.stopping || "Đang dừng..."
            : strings.stopButton || "Dừng video"}
        </button>
      </div>
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={() => playerRef?.current?.play?.()}
          className="p-2 rounded-full hover:bg-gray-100 text-gray-700 transition-colors"
          aria-label={strings.play || "Phát"}
          title={strings.play || "Phát"}
        >
          <Play size={18} />
        </button>
        <button
          type="button"
          onClick={() => playerRef?.current?.pause?.()}
          className="p-2 rounded-full hover:bg-gray-100 text-gray-700 transition-colors"
          aria-label={strings.pause || "Tạm dừng"}
          title={strings.pause || "Tạm dừng"}
        >
          <Pause size={18} />
        </button>
        <button
          type="button"
          onClick={() => seekBy(-10)}
          className="p-2 rounded-full hover:bg-gray-100 text-gray-700 transition-colors"
          aria-label={strings.back10s || "Lùi 10 giây"}
          title={strings.back10s || "Lùi 10 giây"}
        >
          <RotateCcw size={18} />
        </button>
        <button
          type="button"
          onClick={() => seekBy(10)}
          className="p-2 rounded-full hover:bg-gray-100 text-gray-700 transition-colors"
          aria-label={strings.forward10s || "Tiến 10 giây"}
          title={strings.forward10s || "Tiến 10 giây"}
        >
          <RotateCw size={18} />
        </button>
        <span className="text-xs tabular-nums text-gray-500 shrink-0 ml-1">
          {formatTime(now)}
        </span>
        <input
          type="range"
          min={0}
          max={Math.max(0, Math.floor(duration) || 0)}
          value={Math.min(Math.floor(now), Math.floor(duration) || 0)}
          onChange={(e) => handleSeek(e.target.value)}
          disabled={!duration}
          className="flex-1 min-w-0 accent-red-600"
          aria-label={strings.seek || "Tua video"}
        />
        <span className="text-xs tabular-nums text-gray-500 shrink-0">
          {formatTime(duration)}
        </span>
      </div>
    </div>
  )
}

export default WatchTogetherToolbar
