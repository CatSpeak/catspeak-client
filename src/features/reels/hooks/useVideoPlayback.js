import { useState, useCallback, useEffect, useRef } from "react"

export const useVideoPlayback = ({
  reel,
  isActive,
  sharedMuted,
  setSharedMuted,
  sharedVolume,
  setSharedVolume,
  hasUserInteracted,
}) => {
  const videoRef = useRef(null)
  const progressRef = useRef(null)
  const containerRef = useRef(null)
  const resetTimerRef = useRef(null)

  const [isPlaying, setIsPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [isSeeking, setIsSeeking] = useState(false)
  const [isPlaybackMuted, setIsPlaybackMuted] = useState(sharedMuted)

  const hasVideo = Boolean(reel?.videoUrl)
  const preferredMuted = sharedMuted || sharedVolume === 0
  const isEffectivelyMuted = preferredMuted || isPlaybackMuted

  /* ── Auto-play / pause based on active state ────── */
  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    if (isActive) {
      if (video._unmuteCleanup) {
        video._unmuteCleanup()
        video._unmuteCleanup = null
      }
      
      const userHasInteracted = hasUserInteracted?.current === true
      const shouldStartMuted = !userHasInteracted && !preferredMuted
      video.muted = shouldStartMuted || preferredMuted

      const attemptPlay = (muted) => {
        video.muted = muted
        setIsPlaybackMuted(muted)

        const playPromise = video.play()
        if (playPromise !== undefined) {
          playPromise
            .then(() => setIsPlaying(true))
            .catch(() => {
              setIsPlaying(false)
            })
        }
      }

      if (shouldStartMuted) {
        attemptPlay(true)

        const unmuteOnInteraction = () => {
          if (!preferredMuted) {
            video.muted = false
            setIsPlaybackMuted(false)
          }
        }
        window.addEventListener("pointerdown", unmuteOnInteraction, { once: true })
        video._unmuteCleanup = () => window.removeEventListener("pointerdown", unmuteOnInteraction)
      } else {
        attemptPlay(preferredMuted)
      }

    } else {
      if (video._unmuteCleanup) {
        video._unmuteCleanup()
        video._unmuteCleanup = null
      }

      video.pause()

      resetTimerRef.current = window.setTimeout(() => {
        const currentVideo = videoRef.current
        if (currentVideo?.readyState > 0) {
          currentVideo.currentTime = 0
        }
        setIsPlaying(false)
        setProgress(0)
        resetTimerRef.current = null
      }, 250)
    }

    return () => {
      if (resetTimerRef.current) {
        window.clearTimeout(resetTimerRef.current)
        resetTimerRef.current = null
      }
      if (video._unmuteCleanup) {
        video._unmuteCleanup()
        video._unmuteCleanup = null
      }
    }
  }, [isActive, preferredMuted, reel.videoUrl, sharedVolume, hasUserInteracted])

  /* ── Sync shared volume and mute preferences ────── */
  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    video.volume = sharedVolume

    if (preferredMuted) {
      video.muted = true
    } else if (!isPlaybackMuted) {
      video.muted = false
    }
  }, [isPlaybackMuted, preferredMuted, sharedVolume])

  /* ── Playback control ───────────────────────────── */
  const handlePlayPause = useCallback(() => {
    if (!videoRef.current) return
    if (videoRef.current.paused) {
      videoRef.current.play()
        .then(() => setIsPlaying(true))
        .catch(() => {})
    } else {
      videoRef.current.pause()
      setIsPlaying(false)
    }
  }, [])

  const handleToggleMute = useCallback((e) => {
    e?.stopPropagation()
    const video = videoRef.current

    if (isEffectivelyMuted) {
      const nextVolume = sharedVolume === 0 ? 1 : sharedVolume
      setSharedVolume(nextVolume)
      setSharedMuted(false)
      setIsPlaybackMuted(false)

      if (video) {
        video.volume = nextVolume
        video.muted = false

        if (video.paused) {
          video.play()
            .then(() => setIsPlaying(true))
            .catch(() => {
              video.muted = true
              setIsPlaybackMuted(true)
              setIsPlaying(false)
            })
        }
      }
    } else {
      if (video) {
        video.muted = true
      }
      setIsPlaybackMuted(true)
      setSharedMuted(true)
    }
  }, [isEffectivelyMuted, sharedVolume, setSharedMuted, setSharedVolume])

  const handleVolumeChange = useCallback((e) => {
    const newVol = parseFloat(e.target.value)
    const video = videoRef.current

    setSharedVolume(newVol)

    if (video) {
      video.volume = newVol
    }

    if (newVol > 0) {
      if (video) {
        video.muted = false
      }
      setIsPlaybackMuted(false)
      setSharedMuted(false)
    } else {
      if (video) {
        video.muted = true
      }
      setIsPlaybackMuted(true)
      setSharedMuted(true)
    }
  }, [setSharedMuted, setSharedVolume])

  /* ── Progress bar ───────────────────────────────── */
  const handleTimeUpdate = useCallback(() => {
    if (isSeeking) return
    const el = videoRef.current
    if (!el || !el.duration) return
    setProgress((el.currentTime / el.duration) * 100)
    setCurrentTime(el.currentTime)
    setDuration(el.duration)
  }, [isSeeking])

  const handleProgressClick = useCallback((e) => {
    const el = videoRef.current
    const bar = progressRef.current
    if (!el || !bar || !el.duration) return

    const rect = bar.getBoundingClientRect()
    const clientX = e.clientX ?? (e.touches && e.touches.length > 0 ? e.touches[0].clientX : 0)
    const percent = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width))
    el.currentTime = percent * el.duration
    setProgress(percent * 100)
  }, [])

  const handleProgressMouseDown = useCallback((e) => {
    setIsSeeking(true)
    handleProgressClick(e)

    const handlePointerMove = (ev) => handleProgressClick(ev)
    const handlePointerUp = () => {
      setIsSeeking(false)
      window.removeEventListener("pointermove", handlePointerMove)
      window.removeEventListener("pointerup", handlePointerUp)
      window.removeEventListener("pointercancel", handlePointerUp)
      window.removeEventListener("touchmove", handlePointerMove)
      window.removeEventListener("touchend", handlePointerUp)
    }
    
    window.addEventListener("pointermove", handlePointerMove)
    window.addEventListener("pointerup", handlePointerUp)
    window.addEventListener("pointercancel", handlePointerUp)
    window.addEventListener("touchmove", handlePointerMove, { passive: true })
    window.addEventListener("touchend", handlePointerUp)
  }, [handleProgressClick])

  return {
    videoRef,
    progressRef,
    containerRef,
    isPlaying,
    setIsPlaying,
    progress,
    currentTime,
    duration,
    isSeeking,
    isPlaybackMuted,
    hasVideo,
    isEffectivelyMuted,
    handlePlayPause,
    handleToggleMute,
    handleVolumeChange,
    handleTimeUpdate,
    handleProgressClick,
    handleProgressMouseDown,
  }
}
