import { useEffect, useRef, useState } from "react"
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
  Captions,
} from "lucide-react"
import {
  readWatchCcEnabled,
  writeWatchCcEnabled,
} from "@/features/video-call/utils/watchPlayerVars"

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
 * surface. Normal mode is a light SaaS card (white on #F5F5F7); fullscreen
 * mode is a cinematic dark stage (deep black #000, OLED style) covering
 * only the video + toolbar card — participant strip stays behind.
 *
 * Layout (both breakpoints):
 *   Row 1 — LIVE badge + title (line-clamp-1, tooltip) + change / stop.
 *     Hidden in fullscreen to maximize the video (exit via Row 3).
 *   Row 2 — seek slider full-width (time + slider + duration).
 *   Row 3 — transport: play/pause toggle, ±10s, spacer, volume, fullscreen.
 * Full-width slider fixes the 375px squeeze where the old single-row
 * layout left ~80px for the seek bar.
 *
 * Host: play / pause / ±10s / seek slider (local player calls only —
 * useHostSync's tracker publishes the transition to viewers) + volume /
 * fullscreen (local-only) + change / stop.
 * Viewer: title + volume / fullscreen / captions (local-only) + persistent tap-to-sync.
 * CC is local-only per viewer (remembered on device); quality stays YouTube auto.
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
  playerState = null,
  t,
}) => {
  const strings = t?.rooms?.videoCall?.watchTogether ?? {}
  const [now, setNow] = useState(0)
  const [duration, setDuration] = useState(0)
  const [muted, setMuted] = useState(false)
  const [volume, setVolume] = useState(100)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const fullscreenBtnRef = useRef(null)
  // Local-only CC (Q6=A, Q8=A): per-viewer toggle, remembered on device.
  const [ccEnabled, setCcEnabled] = useState(() => readWatchCcEnabled())

  useEffect(() => {
    const id = setInterval(() => {
      try {
        if (isHost) {
          const time = playerRef?.current?.getCurrentTime?.()
          const total = playerRef?.current?.getDuration?.()
          if (typeof time === "number" && Number.isFinite(time)) setNow(time)
          if (typeof total === "number" && Number.isFinite(total)) setDuration(total)
          // YT.PlayerState.PLAYING === 1 — single toggle button needs it.
          // Prefer the live prop when the parent already tracks it.
          if (typeof playerState === "number") {
            setIsPlaying(playerState === 1)
          } else {
            const st = playerRef?.current?.getPlayerState?.()
            if (typeof st === "number") setIsPlaying(st === 1)
          }
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
  }, [isHost, playerRef, playerState])

  useEffect(() => {
    const isPseudo = () =>
      !!mediaRef?.current?.classList?.contains("watch-pseudo-fullscreen")
    const onChange = () => {
      const native = !!(
        document.fullscreenElement || document.webkitFullscreenElement
      )
      setIsFullscreen(native || isPseudo())
      // Focus-management (ux: Focus States): when native fullscreen closes
      // (Esc / browser UI), return focus to the trigger.
      if (!native && !isPseudo()) fullscreenBtnRef.current?.focus?.()
    }
    const onKey = (e) => {
      if (e.key === "Escape" && isPseudo()) {
        mediaRef?.current?.classList?.remove("watch-pseudo-fullscreen")
        document.body.style.overflow = ""
        setIsFullscreen(false)
        fullscreenBtnRef.current?.focus?.()
      }
    }
    document.addEventListener("fullscreenchange", onChange)
    document.addEventListener("webkitfullscreenchange", onChange)
    document.addEventListener("keydown", onKey)
    return () => {
      document.removeEventListener("fullscreenchange", onChange)
      document.removeEventListener("webkitfullscreenchange", onChange)
      document.removeEventListener("keydown", onKey)
    }
  }, [mediaRef])

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

  const togglePlayPause = () => {
    try {
      if (isPlaying) playerRef?.current?.pause?.()
      else playerRef?.current?.play?.()
    } catch {
      // No-op when player is tearing down.
    }
  }

  const toggleFullscreen = () => {
    try {
      const el = mediaRef?.current
      const isPseudo = !!el?.classList?.contains("watch-pseudo-fullscreen")
      const isNative = !!(
        document.fullscreenElement || document.webkitFullscreenElement
      )
      if (isNative) {
        if (document.exitFullscreen) document.exitFullscreen()?.catch?.(() => {})
        else document.webkitExitFullscreen?.()
        return
      }
      if (isPseudo) {
        el?.classList?.remove("watch-pseudo-fullscreen")
        document.body.style.overflow = ""
        setIsFullscreen(false)
        return
      }
      // iOS Safari has no requestFullscreen for divs (and desktop Safari
      // needs the webkit prefix) — fall back to a fixed-position stage
      // sharing the same black styling as native :fullscreen.
      const request =
        el?.requestFullscreen?.bind(el) ?? el?.webkitRequestFullscreen?.bind(el)
      if (request) {
        Promise.resolve(request())?.catch?.(() => {
          el?.classList?.add("watch-pseudo-fullscreen")
          document.body.style.overflow = "hidden"
          setIsFullscreen(true)
        })
      } else {
        el?.classList?.add("watch-pseudo-fullscreen")
        document.body.style.overflow = "hidden"
        setIsFullscreen(true)
      }
    } catch {
      // Fullscreen unsupported — no-op.
    }
  }

  const toggleCaptions = () => {
    const next = !ccEnabled
    setCcEnabled(next)
    writeWatchCcEnabled(next)
    try {
      // Best-effort: the player re-applies the stored preference on
      // ready/cue, so a tearing-down player self-heals on remount.
      playerRef?.current?.setCaptionsEnabled?.(next)
    } catch {
      // No-op when player is tearing down.
    }
  }

  // 44px touch targets (iOS 44pt / Android 48dp floor) + dark stage variant.
  const iconButton = isFullscreen
    ? "grid h-11 w-11 shrink-0 place-items-center rounded-full text-white transition-colors hover:bg-white/10 active:bg-white/20 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
    : "grid h-11 w-11 shrink-0 place-items-center rounded-full text-gray-600 transition-colors hover:bg-gray-100 active:bg-gray-200 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#990011]"
  const toolbarShell = isFullscreen
    ? "flex shrink-0 flex-col gap-2.5 border-t border-white/10 bg-black px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]"
    : "flex shrink-0 flex-col gap-2.5 border-t border-gray-100 bg-white px-4 py-3"
  const titleText = isFullscreen
    ? "min-w-0 flex-1 truncate text-sm font-medium text-white"
    : "min-w-0 flex-1 truncate text-sm font-medium text-gray-900"
  const timeText = (alignRight) =>
    isFullscreen
      ? `w-10 shrink-0 text-xs tabular-nums text-neutral-400${alignRight ? " text-right" : ""}`
      : `w-10 shrink-0 text-xs tabular-nums text-gray-500${alignRight ? " text-right" : ""}`
  const seekSliderClass = isFullscreen
    ? "h-6 min-w-0 flex-1 cursor-pointer accent-red-500 disabled:cursor-not-allowed disabled:opacity-40"
    : "h-6 min-w-0 flex-1 cursor-pointer accent-[#990011] disabled:cursor-not-allowed disabled:opacity-40"
  const volumeButton = (
    <button
      type="button"
      onClick={toggleMute}
      className={iconButton}
      aria-label={muted ? strings.unmute || "Bật tiếng" : strings.mute || "Tắt tiếng"}
      title={muted ? strings.unmute || "Bật tiếng" : strings.mute || "Tắt tiếng"}
    >
      {muted ? <VolumeX size={20} /> : <Volume2 size={20} />}
    </button>
  )
  const volumeSlider = (
    <input
      type="range"
      min={0}
      max={100}
      value={Math.round(volume)}
      onChange={(e) => handleVolume(e.target.value)}
      className={
        isFullscreen
          ? "h-6 w-24 cursor-pointer accent-red-500"
          : "hidden h-6 w-20 cursor-pointer accent-[#990011] sm:block"
      }
      aria-label={strings.volume || "Âm lượng"}
      title={strings.volume || "Âm lượng"}
    />
  )
  const fullscreenButton = (
    <button
      ref={fullscreenBtnRef}
      type="button"
      onClick={toggleFullscreen}
      className={iconButton}
      aria-label={isFullscreen ? strings.exitFullscreen || "Thoát toàn màn hình" : strings.fullscreen || "Toàn màn hình"}
      title={isFullscreen ? strings.exitFullscreen || "Thoát toàn màn hình" : strings.fullscreen || "Toàn màn hình"}
    >
      {isFullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
    </button>
  )
  // No availability auto-disable: the IFrame API's tracklist getter reads
  // [] even while captions demonstrably render (verified headless), so no
  // client signal can mean "no captions". The button stays enabled; ON is
  // a harmless no-op on captionless videos, OFF always hides via unload.
  const ccLabel = ccEnabled
    ? strings.captionsOff || "Tắt phụ đề"
    : strings.captionsOn || "Bật phụ đề"
  const ccButton = (
    <button
      type="button"
      onClick={toggleCaptions}
      aria-pressed={ccEnabled}
      aria-label={ccLabel}
      title={ccLabel}
      className={`${iconButton} ${
        ccEnabled
          ? isFullscreen
            ? "!bg-red-600 !text-white"
            : "!bg-red-50 !text-[#990011]"
          : ""
      }`}
    >
      <Captions size={20} />
    </button>
  )
  const liveBadge = (
    <span className="flex shrink-0 items-center gap-1.5 rounded-full bg-red-50 px-2.5 py-1 text-[11px] font-bold tracking-wider text-red-600 ring-1 ring-inset ring-red-600/20">
      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-red-600" />
      LIVE
    </span>
  )

  if (!isHost) {
    return (
      <div className={toolbarShell}>
        {/* Title row hides in fullscreen — transport stays reachable. */}
        {!isFullscreen && (
          <div className="flex min-w-0 items-center gap-2.5">
            {liveBadge}
            <p
              title={mediaTitle || strings.hostWatching || "Chủ phòng đang phát video chung."}
              className={titleText}
            >
              {mediaTitle || strings.hostWatching || "Chủ phòng đang phát video chung."}
            </p>
            {needsTapToSync && (
              <button
                type="button"
                onClick={onTapToSync ?? undefined}
                aria-label={strings.tapToSync || "Nhấn để đồng bộ"}
                title={strings.tapToSync || "Nhấn để đồng bộ"}
                className="flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full bg-red-600 px-3.5 py-2 text-[13px] font-semibold text-white transition-colors hover:bg-red-500 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#990011]"
              >
                <MousePointerClick size={15} />
                {strings.tapToSync || "Nhấn để đồng bộ"}
              </button>
            )}
          </div>
        )}
        <div className="flex items-center gap-1">
          <div className="flex-1" />
          {ccButton}
          {volumeButton}
          {volumeSlider}
          {fullscreenButton}
        </div>
      </div>
    )
  }

  return (
    <div className={toolbarShell}>
      {/* Row 1 — badge + title + actions. Hidden in fullscreen (YouTube
          pattern) to maximize video; exit via Row 3 fullscreen button. */}
      {!isFullscreen && (
        <div className="flex min-w-0 items-center gap-2.5">
          {liveBadge}
          <p title={mediaTitle} className={titleText}>
            {mediaTitle}
          </p>
          <button
            type="button"
            onClick={onChangeVideo ?? undefined}
            aria-label={strings.changeVideo || "Đổi video"}
            title={strings.changeVideo || "Đổi video"}
            className="flex h-9 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border border-gray-200 bg-white px-3.5 text-[13px] font-medium text-gray-700 transition-colors hover:bg-gray-50 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#990011]"
          >
            <Repeat size={15} />
            <span className="hidden min-[420px]:inline">{strings.changeVideo || "Đổi video"}</span>
          </button>
          <button
            type="button"
            onClick={onStop ?? undefined}
            disabled={isStopping}
            aria-label={isStopping ? strings.stopping || "Đang dừng..." : strings.stopButton || "Dừng video"}
            title={isStopping ? strings.stopping || "Đang dừng..." : strings.stopButton || "Dừng video"}
            className="flex h-9 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full bg-red-600 px-3.5 text-[13px] font-semibold text-white transition-colors hover:bg-red-500 active:scale-95 disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#990011]"
          >
            <Square size={14} fill="currentColor" />
            {isStopping
              ? strings.stopping || "Đang dừng..."
              : strings.stopButton || "Dừng video"}
          </button>
        </div>
      )}
      {/* Row 2 — full-width seek (YouTube pattern: slider above buttons) */}
      <div className="flex items-center gap-2.5">
        <span className={timeText(true)}>
          {formatTime(now)}
        </span>
        <input
          type="range"
          min={0}
          max={Math.max(0, Math.floor(duration) || 0)}
          value={Math.min(Math.floor(now), Math.floor(duration) || 0)}
          onChange={(e) => handleSeek(e.target.value)}
          disabled={!duration}
          className={seekSliderClass}
          aria-label={strings.seek || "Tua video"}
          title={strings.seek || "Tua video"}
        />
        <span className={timeText(false)}>
          {formatTime(duration)}
        </span>
      </div>
      {/* Row 3 — transport. Play toggle uses the platform brand red
          (#990011, same as IconButton `primary`), not neutral black. */}
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={togglePlayPause}
          className={
            isFullscreen
              ? "grid h-11 w-11 shrink-0 place-items-center rounded-full bg-red-600 text-white shadow-sm transition hover:bg-red-500 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
              : "grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[#990011] text-white shadow-sm transition hover:bg-[#80000e] active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#990011]"
          }
          aria-label={isPlaying ? strings.pause || "Tạm dừng" : strings.play || "Phát"}
          title={isPlaying ? strings.pause || "Tạm dừng" : strings.play || "Phát"}
        >
          {isPlaying ? (
            <Pause size={20} fill="currentColor" />
          ) : (
            <Play size={20} className="ml-0.5" fill="currentColor" />
          )}
        </button>
        <button
          type="button"
          onClick={() => seekBy(-10)}
          className={iconButton}
          aria-label={strings.back10s || "Lùi 10 giây"}
          title={strings.back10s || "Lùi 10 giây"}
        >
          <RotateCcw size={20} />
        </button>
        <button
          type="button"
          onClick={() => seekBy(10)}
          className={iconButton}
          aria-label={strings.forward10s || "Tiến 10 giây"}
          title={strings.forward10s || "Tiến 10 giây"}
        >
          <RotateCw size={20} />
        </button>
        <div className="flex-1" />
        {ccButton}
        {volumeButton}
        {volumeSlider}
        {fullscreenButton}
      </div>
    </div>
  )
}

export default WatchTogetherToolbar
