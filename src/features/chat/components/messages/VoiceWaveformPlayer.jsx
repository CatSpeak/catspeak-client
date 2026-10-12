import React, { useState, useRef, useEffect, useCallback, useMemo } from "react"
import { Play, Pause } from "lucide-react"
import { useLanguage } from "@/shared/context/LanguageContext"

// Simple seeded pseudo-random heights generator for visually pleasant waveforms
const generateWaveformBars = (seedString = "", barCount = 32) => {
  let hash = 0
  for (let i = 0; i < seedString.length; i++) {
    hash = (hash << 5) - hash + seedString.charCodeAt(i)
    hash |= 0
  }

  const bars = []
  for (let i = 0; i < barCount; i++) {
    // Generate organic-looking variation with some smooth peaks
    const pseudoRandom = Math.abs(Math.sin((i + 1) * 0.45 + hash) * 0.75 + Math.cos((i + 1) * 0.25) * 0.25)
    // Scale height between 20% and 95%
    const heightPercent = Math.max(20, Math.min(95, Math.round(pseudoRandom * 100)))
    bars.push(heightPercent)
  }
  return bars
}

const formatSeconds = (sec) => {
  if (isNaN(sec) || sec == null || sec < 0) return "0:00"
  const m = Math.floor(sec / 60)
  const s = Math.floor(sec % 60)
  return `${m}:${s < 10 ? "0" : ""}${s}`
}

/**
 * VoiceWaveformPlayer — Professional voice audio message player with
 * interactive vertical waveform bars, playback progress scrubbing,
 * play/pause toggle, duration display, and 1x/1.5x/2x speed selector.
 */
const VoiceWaveformPlayer = ({
  audioUrl,
  duration: initialDuration = 0,
  messageId,
  isOwn = false,
  className = "",
}) => {
  const { t } = useLanguage()
  const audioRef = useRef(null)
  const waveformRef = useRef(null)

  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(initialDuration || 0)
  const [playbackRate, setPlaybackRate] = useState(1)
  const [isHoveringWaveform, setIsHoveringWaveform] = useState(false)

  // Pre-generate stable waveform bars
  const bars = useMemo(() => {
    return generateWaveformBars(String(messageId || audioUrl || "voice"), 32)
  }, [messageId, audioUrl])

  // Handle global audio coordination so only one message plays at once
  useEffect(() => {
    const handleGlobalPause = (e) => {
      if (e.detail?.source !== audioRef.current && isPlaying) {
        audioRef.current?.pause()
        setIsPlaying(false)
      }
    }
    window.addEventListener("catspeak-voice-play", handleGlobalPause)
    return () => {
      window.removeEventListener("catspeak-voice-play", handleGlobalPause)
    }
  }, [isPlaying])

  const togglePlay = useCallback(() => {
    const audio = audioRef.current
    if (!audio) return

    if (isPlaying) {
      audio.pause()
      setIsPlaying(false)
    } else {
      window.dispatchEvent(
        new CustomEvent("catspeak-voice-play", {
          detail: { source: audio },
        }),
      )
      audio.play().catch((err) => {
        console.warn("Audio playback failed:", err)
        setIsPlaying(false)
      })
      setIsPlaying(true)
    }
  }, [isPlaying])

  const handleTimeUpdate = () => {
    const audio = audioRef.current
    if (audio) {
      setCurrentTime(audio.currentTime)
    }
  }

  const handleLoadedMetadata = () => {
    const audio = audioRef.current
    if (audio && (!duration || isNaN(duration) || duration === 0)) {
      if (isFinite(audio.duration) && audio.duration > 0) {
        setDuration(audio.duration)
      }
    }
  }

  const handleEnded = () => {
    setIsPlaying(false)
    setCurrentTime(0)
  }

  const handleSeek = (e) => {
    const audio = audioRef.current
    const waveform = waveformRef.current
    if (!audio || !waveform) return

    const rect = waveform.getBoundingClientRect()
    const clickX = e.clientX - rect.left
    const percent = Math.max(0, Math.min(1, clickX / rect.width))

    const targetTime = percent * (duration || audio.duration || 1)
    audio.currentTime = targetTime
    setCurrentTime(targetTime)

    if (!isPlaying) {
      togglePlay()
    }
  }

  const cycleSpeed = () => {
    const rates = [1, 1.5, 2]
    const nextIndex = (rates.indexOf(playbackRate) + 1) % rates.length
    const nextRate = rates[nextIndex]
    setPlaybackRate(nextRate)
    if (audioRef.current) {
      audioRef.current.playbackRate = nextRate
    }
  }

  const effectiveDuration = duration > 0 ? duration : (initialDuration || 0)
  const progressRatio = effectiveDuration > 0 ? currentTime / effectiveDuration : 0
  const activeBarCount = Math.round(progressRatio * bars.length)

  return (
    <div
      className={`flex items-center gap-3 py-2 px-3 select-none min-w-[240px] max-w-[320px] rounded-2xl ${
        isOwn ? "text-white" : "text-neutral-800 dark:text-neutral-100"
      } ${className}`}
    >
      <audio
        ref={audioRef}
        src={audioUrl}
        preload="metadata"
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleEnded}
      />

      {/* ── Play / Pause circular button ── */}
      <button
        type="button"
        onClick={togglePlay}
        aria-label={isPlaying ? "Pause voice message" : "Play voice message"}
        className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-transform active:scale-95 shadow-sm cursor-pointer ${
          isOwn
            ? "bg-white text-[#990011] hover:bg-white/95"
            : "bg-[#990011] text-white hover:bg-[#80000e]"
        }`}
      >
        {isPlaying ? (
          <Pause size={18} className="fill-current" />
        ) : (
          <Play size={18} className="fill-current translate-x-0.5" />
        )}
      </button>

      {/* ── Waveform & Times ── */}
      <div className="flex-1 flex flex-col justify-center min-w-0">
        <div
          ref={waveformRef}
          onClick={handleSeek}
          onMouseEnter={() => setIsHoveringWaveform(true)}
          onMouseLeave={() => setIsHoveringWaveform(false)}
          className="h-8 flex items-center gap-[2.5px] cursor-pointer py-1 relative"
          title={`Seek audio (${formatSeconds(currentTime)} / ${formatSeconds(effectiveDuration)})`}
        >
          {bars.map((heightPercent, index) => {
            const isPlayed = index < activeBarCount
            return (
              <div
                key={index}
                className="flex-1 flex items-center justify-center h-full"
              >
                <div
                  style={{ height: `${heightPercent}%` }}
                  className={`w-full rounded-full transition-colors duration-100 ${
                    isOwn
                      ? isPlayed
                        ? "bg-white"
                        : "bg-white/40"
                      : isPlayed
                        ? "bg-[#990011]"
                        : "bg-neutral-300 dark:bg-neutral-600"
                  } ${isHoveringWaveform ? "opacity-90 scale-y-105" : ""}`}
                />
              </div>
            )
          })}
        </div>

        {/* ── Timestamp & Duration ── */}
        <div className="flex items-center justify-between text-[11px] font-mono leading-none mt-0.5 opacity-85">
          <span>{isPlaying ? formatSeconds(currentTime) : formatSeconds(effectiveDuration)}</span>
          {isPlaying && (
            <span className="opacity-70">
              - {formatSeconds(Math.max(0, effectiveDuration - currentTime))}
            </span>
          )}
        </div>
      </div>

      {/* ── Playback Speed Selector (1x / 1.5x / 2x) ── */}
      <button
        type="button"
        onClick={cycleSpeed}
        className={`px-1.5 py-0.5 text-[11px] font-bold rounded-md shrink-0 transition-colors cursor-pointer select-none ${
          isOwn
            ? "bg-white/20 hover:bg-white/30 text-white"
            : "bg-neutral-200 dark:bg-zinc-700 hover:bg-neutral-300 text-neutral-700 dark:text-neutral-200"
        }`}
        title={t?.chat?.togglePlaybackSpeed || "Toggle playback speed"}
      >
        {playbackRate}x
      </button>
    </div>
  )
}

export default React.memo(VoiceWaveformPlayer)
