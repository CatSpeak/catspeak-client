import { useState, useRef, useEffect, useCallback } from "react"

/**
 * useGalleryAudio — Manages audio playback lifecycle, speed cycling,
 * scrubbing, and global pause synchronization for the SharedMediaGallery.
 */
export const useGalleryAudio = () => {
  const [activeAudio, setActiveAudio] = useState(null)
  const [isPlayingAudio, setIsPlayingAudio] = useState(false)
  const [audioCurrentTime, setAudioCurrentTime] = useState(0)
  const [audioDuration, setAudioDuration] = useState(0)
  const [playbackSpeed, setPlaybackSpeed] = useState(1)
  const audioInstanceRef = useRef(null)

  const handleTogglePlayAudio = useCallback(
    (item) => {
      const itemId = item.messageId || item.id
      const currentActiveId = activeAudio
        ? activeAudio.messageId || activeAudio.id
        : null

      if (currentActiveId === itemId) {
        if (isPlayingAudio) {
          audioInstanceRef.current?.pause()
          setIsPlayingAudio(false)
        } else {
          window.dispatchEvent(
            new CustomEvent("catspeak-voice-play", {
              detail: { source: audioInstanceRef.current },
            }),
          )
          audioInstanceRef.current?.play().catch(() => setIsPlayingAudio(false))
          setIsPlayingAudio(true)
        }
        return
      }

      if (audioInstanceRef.current) {
        audioInstanceRef.current.pause()
      }

      const audio = new Audio(item.mediaUrl)
      audio.playbackRate = playbackSpeed
      audioInstanceRef.current = audio
      const initialDur =
        Number.isFinite(item.audioDuration) && item.audioDuration > 0
          ? item.audioDuration
          : Number.isFinite(item.duration) && item.duration > 0
            ? item.duration
            : 0

      setActiveAudio(item)
      setAudioCurrentTime(0)
      setAudioDuration(initialDur)

      audio.ontimeupdate = () => {
        setAudioCurrentTime(audio.currentTime)
      }

      audio.onloadedmetadata = () => {
        if (Number.isFinite(audio.duration) && audio.duration > 0) {
          setAudioDuration(audio.duration)
        }
      }

      audio.onended = () => {
        setIsPlayingAudio(false)
        setAudioCurrentTime(0)
      }

      window.dispatchEvent(
        new CustomEvent("catspeak-voice-play", {
          detail: { source: audio },
        }),
      )

      audio
        .play()
        .then(() => setIsPlayingAudio(true))
        .catch(() => setIsPlayingAudio(false))
    },
    [activeAudio, isPlayingAudio, playbackSpeed],
  )

  const handleToggleDockedPlay = useCallback(() => {
    if (!audioInstanceRef.current) return
    if (isPlayingAudio) {
      audioInstanceRef.current.pause()
      setIsPlayingAudio(false)
    } else {
      window.dispatchEvent(
        new CustomEvent("catspeak-voice-play", {
          detail: { source: audioInstanceRef.current },
        }),
      )
      audioInstanceRef.current.play().catch(() => setIsPlayingAudio(false))
      setIsPlayingAudio(true)
    }
  }, [isPlayingAudio])

  const handleCycleSpeed = useCallback(() => {
    const nextSpeed =
      playbackSpeed === 1 ? 1.5 : playbackSpeed === 1.5 ? 2 : 1
    setPlaybackSpeed(nextSpeed)
    if (audioInstanceRef.current) {
      audioInstanceRef.current.playbackRate = nextSpeed
    }
  }, [playbackSpeed])

  const handleSeek = useCallback(
    (e) => {
      const rect = e.currentTarget.getBoundingClientRect()
      const clickX = e.clientX - rect.left
      const percent = Math.max(0, Math.min(1, clickX / rect.width))
      const total = audioDuration || activeAudio?.audioDuration || 1
      const targetTime = percent * total
      if (audioInstanceRef.current) {
        audioInstanceRef.current.currentTime = targetTime
        setAudioCurrentTime(targetTime)
      }
    },
    [audioDuration, activeAudio],
  )

  const handleCloseAudio = useCallback(() => {
    if (audioInstanceRef.current) {
      audioInstanceRef.current.pause()
      audioInstanceRef.current = null
    }
    setActiveAudio(null)
    setIsPlayingAudio(false)
    setAudioCurrentTime(0)
  }, [])

  // Global pause synchronization across chat bubbles and gallery
  useEffect(() => {
    const handleGlobalPause = (e) => {
      if (e.detail?.source !== audioInstanceRef.current && isPlayingAudio) {
        audioInstanceRef.current?.pause()
        setIsPlayingAudio(false)
      }
    }
    window.addEventListener("catspeak-voice-play", handleGlobalPause)
    return () => {
      window.removeEventListener("catspeak-voice-play", handleGlobalPause)
    }
  }, [isPlayingAudio])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (audioInstanceRef.current) {
        audioInstanceRef.current.pause()
        audioInstanceRef.current = null
      }
    }
  }, [])

  return {
    activeAudio,
    isPlayingAudio,
    audioCurrentTime,
    audioDuration,
    playbackSpeed,
    handleTogglePlayAudio,
    handleToggleDockedPlay,
    handleCycleSpeed,
    handleSeek,
    handleCloseAudio,
  }
}
