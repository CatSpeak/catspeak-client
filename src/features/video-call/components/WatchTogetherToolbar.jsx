import { useEffect, useState } from "react"
import {
  Play,
  Pause,
  RotateCcw,
  RotateCw,
  Repeat,
  Square,
  MousePointerClick,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
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
 * The player itself is chromeless (controls=0): this is the only control
 * surface. Mobile renders on black (YouTube-app style), desktop on white.
 *
 * Host: play / pause / ±10s / seek slider (local player calls only —
 * useHostSync's tracker publishes the transition to viewers) + volume /
 * fullscreen (local-only) + change / stop.
 * Viewer: title + volume / fullscreen (local-only) + persistent tap-to-sync.
 * CC / quality pickers are intentionally dropped (YouTube auto quality).
 */
const WatchTogetherToolbar = ({
  isHost,
  mediaTitle,
  playerRef,
  mediaRef,
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
  const [muted, setMuted] = useState(false)
  const [volume, setVolume] = useState(100)
  const [isFullscreen, setIsFullscreen] = useState(false)

  useEffect(() => {
    const id = setInterval(() => {
      try {
        if (isHost) {
          const time = playerRef?.current?.getCurrentTime?.()
          const total = playerRef?.current?.getDuration?.()
          if (typeof time === "number" && Number.isFinite(time)) setNow(time)
          if (typeof total === "number" && Number.isFinite(total)) setDuration(total)
        }
        const isMuted = playerRef?.current?.isMuted?.()
        const level = playerRef?.current?.getVolume?.()
        if (typeof isMuted === "boolean") setMuted(isMuted)
        if (typeof level === "number" && Number.isFinite(level)) setVolume(level)
      } catch {
        // Player not ready yet — next tick retries.
      }
    }, 1000)
    return () => clearInterval(id)
  }, [isHost, playerRef])

  useEffect(() => {
    const onChange = () => setIsFullscreen(!!document.fullscreenElement)
    document.addEventListener("fullscreenchange", onChange)
    return () => document.removeEventListener("fullscreenchange", onChange)
  }, [])

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

  const toggleMute = () => {
    try {
      if (muted) {
        playerRef?.current?.unMute?.()
        setMuted(false)
      } else {
        playerRef?.current?.mute?.()
        setMuted(true)
      }
    } catch {
      // No-op when player is tearing down.
    }
  }

  const handleVolume = (value) => {
    const next = Number(value)
    if (!Number.isFinite(next)) return
    try {
      playerRef?.current?.setVolume?.(next)
      if (next > 0 && muted) {
        playerRef?.current?.unMute?.()
        setMuted(false)
      }
      setVolume(next)
    } catch {
      // No-op when player is tearing down.
    }
  }

  const toggleFullscreen = () => {
    try {
      if (document.fullscreenElement) {
        document.exitFullscreen?.()?.catch?.(() => {})
      } else {
        mediaRef?.current?.requestFullscreen?.()?.catch?.(() => {})
      }
    } catch {
      // Fullscreen unsupported — no-op.
    }
  }

  const iconButton =
    "p-2 rounded-full text-white hover:bg-white/10 md:text-gray-700 md:hover:bg-gray-100 transition-colors"
  const volumeButton = (
    <button
      type="button"
      onClick={toggleMute}
      className={iconButton}
      aria-label={muted ? strings.unmute || "Bật tiếng" : strings.mute || "Tắt tiếng"}
      title={muted ? strings.unmute || "Bật tiếng" : strings.mute || "Tắt tiếng"}
    >
      {muted ? <VolumeX size={18} /> : <Volume2 size={18} />}
    </button>
  )
  const volumeSlider = (
    <input
      type="range"
      min={0}
      max={100}
      value={Math.round(volume)}
      onChange={(e) => handleVolume(e.target.value)}
      className="hidden md:block w-20 accent-red-600"
      aria-label={strings.volume || "Âm lượng"}
    />
  )
  const fullscreenButton = (
    <button
      type="button"
      onClick={toggleFullscreen}
      className={iconButton}
      aria-label={isFullscreen ? strings.exitFullscreen || "Thoát toàn màn hình" : strings.fullscreen || "Toàn màn hình"}
      title={isFullscreen ? strings.exitFullscreen || "Thoát toàn màn hình" : strings.fullscreen || "Toàn màn hình"}
    >
      {isFullscreen ? <Minimize size={18} /> : <Maximize size={18} />}
    </button>
  )

  if (!isHost) {
    return (
      <div className="flex items-center gap-2 border-t border-white/10 bg-black px-3 py-2 shrink-0 md:border-border md:bg-white">
        <p className="flex-1 min-w-0 truncate text-sm font-medium text-white md:text-gray-800">
          {mediaTitle || strings.hostWatching || "Chủ phòng đang phát video chung."}
        </p>
        {volumeButton}
        {volumeSlider}
        {fullscreenButton}
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
    <div className="flex flex-col gap-2 border-t border-white/10 bg-black px-3 py-2 shrink-0 md:border-border md:bg-white">
      <div className="flex items-center gap-2 min-w-0">
        <p className="flex-1 min-w-0 truncate text-sm font-medium text-white md:text-gray-800">
          {mediaTitle}
        </p>
        <button
          type="button"
          onClick={onChangeVideo ?? undefined}
          className="flex shrink-0 items-center gap-1 rounded-full border border-white/20 px-3 py-1.5 text-xs font-medium text-white hover:bg-white/10 transition-colors md:border-border md:text-gray-700 md:hover:bg-gray-50"
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
          className={iconButton}
          aria-label={strings.play || "Phát"}
          title={strings.play || "Phát"}
        >
          <Play size={18} />
        </button>
        <button
          type="button"
          onClick={() => playerRef?.current?.pause?.()}
          className={iconButton}
          aria-label={strings.pause || "Tạm dừng"}
          title={strings.pause || "Tạm dừng"}
        >
          <Pause size={18} />
        </button>
        <button
          type="button"
          onClick={() => seekBy(-10)}
          className={iconButton}
          aria-label={strings.back10s || "Lùi 10 giây"}
          title={strings.back10s || "Lùi 10 giây"}
        >
          <RotateCcw size={18} />
        </button>
        <button
          type="button"
          onClick={() => seekBy(10)}
          className={iconButton}
          aria-label={strings.forward10s || "Tiến 10 giây"}
          title={strings.forward10s || "Tiến 10 giây"}
        >
          <RotateCw size={18} />
        </button>
        <span className="text-xs tabular-nums text-white/70 shrink-0 ml-1 md:text-gray-500">
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
        <span className="text-xs tabular-nums text-white/70 shrink-0 md:text-gray-500">
          {formatTime(duration)}
        </span>
        {volumeButton}
        {volumeSlider}
        {fullscreenButton}
      </div>
    </div>
  )
}

export default WatchTogetherToolbar
