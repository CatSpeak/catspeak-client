import { useState, useRef, useCallback, useEffect } from "react"
import toast from "react-hot-toast"
import { useLanguage } from "@/shared/context/LanguageContext"

/**
 * Generate aesthetically pleasing organic waveform bars for preview when stopped.
 */
const generateReviewBars = (capturedBars, barCount = 20) => {
  const bars = []
  const hasSignal = capturedBars && capturedBars.some((v) => v > 25)
  if (hasSignal && capturedBars.length > 0) {
    for (let i = 0; i < barCount; i++) {
      const idx = Math.floor((i / barCount) * capturedBars.length)
      const val = capturedBars[idx] || 30
      bars.push(Math.max(20, Math.min(95, val)))
    }
  } else {
    for (let i = 0; i < barCount; i++) {
      const pseudo = Math.abs(
        Math.sin((i + 1) * 0.5) * 0.7 + Math.cos((i + 1) * 0.3) * 0.3,
      )
      bars.push(Math.max(25, Math.min(90, Math.round(pseudo * 85) + 20)))
    }
  }
  return bars
}

/**
 * Custom hook managing voice audio recording, Web Audio API frequency analysis,
 * dynamic audio waveform visualizer loop, MediaRecorder lifecycle, audio review & playback, and cleanup.
 *
 * @param {object} params
 * @param {Function} [params.onSendVoice] - Callback when audio blob is ready
 * @param {Function} [params.onSend] - Fallback callback if onSendVoice is not provided
 * @returns {object} Voice recorder controls and state
 */
export default function useVoiceRecorder({ onSendVoice, onSend } = {}) {
  const { t } = useLanguage()

  const [isRecording, setIsRecording] = useState(false)
  const [isReviewing, setIsReviewing] = useState(false)
  const [recordingSeconds, setRecordingSeconds] = useState(0)
  const [visualizerBars, setVisualizerBars] = useState([
    25, 40, 65, 45, 80, 55, 35, 70, 50, 85, 60, 40, 75, 45, 30, 55, 70, 45,
    60, 35,
  ])
  const [reviewBars, setReviewBars] = useState([])
  const [isPlaying, setIsPlaying] = useState(false)
  const [playbackCurrentTime, setPlaybackCurrentTime] = useState(0)

  const mediaRecorderRef = useRef(null)
  const audioContextRef = useRef(null)
  const analyserRef = useRef(null)
  const animationFrameRef = useRef(null)
  const recordTimerRef = useRef(null)
  const audioChunksRef = useRef([])
  const streamRef = useRef(null)
  const recordingSecondsRef = useRef(0)
  const lastVisualizerBarsRef = useRef([])
  const stopIntentRef = useRef("review") // "review" | "send" | "cancel"

  // Audio preview refs
  const audioPreviewRef = useRef(null)
  const recordedBlobRef = useRef(null)
  const recordedAudioUrlRef = useRef(null)
  const recordedDurationRef = useRef(0)

  // Dispatch message sending helper
  const dispatchSend = useCallback(
    (audioBlob, duration) => {
      if (onSendVoice) {
        onSendVoice(audioBlob, duration)
      } else if (onSend) {
        const file = new File([audioBlob], `voice_${Date.now()}.webm`, {
          type: audioBlob.type || "audio/webm",
        })
        onSend("", file, {
          audioDuration: duration,
          messageType: "Audio",
        })
      }
    },
    [onSend, onSendVoice],
  )

  // Clean up audio preview instance & object URL
  const cleanupAudioPreview = useCallback(() => {
    if (audioPreviewRef.current) {
      audioPreviewRef.current.pause()
      audioPreviewRef.current.ontimeupdate = null
      audioPreviewRef.current.onended = null
      audioPreviewRef.current.src = ""
      audioPreviewRef.current = null
    }
    if (recordedAudioUrlRef.current) {
      URL.revokeObjectURL(recordedAudioUrlRef.current)
      recordedAudioUrlRef.current = null
    }
    recordedBlobRef.current = null
    recordedDurationRef.current = 0
    setIsPlaying(false)
    setPlaybackCurrentTime(0)
    setIsReviewing(false)
    setReviewBars([])
  }, [])

  // Clean up live recording resources (stream, timer, audioContext, rAF)
  const cleanupRecording = useCallback(() => {
    if (recordTimerRef.current) {
      clearInterval(recordTimerRef.current)
      recordTimerRef.current = null
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current)
      animationFrameRef.current = null
    }
    if (audioContextRef.current && audioContextRef.current.state !== "closed") {
      audioContextRef.current.close().catch(() => {})
      audioContextRef.current = null
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }
    analyserRef.current = null
    mediaRecorderRef.current = null
    setIsRecording(false)
  }, [])

  // Global pause coordination with other playing audios
  useEffect(() => {
    const handleGlobalPause = (e) => {
      if (e.detail?.source !== audioPreviewRef.current && isPlaying) {
        audioPreviewRef.current?.pause()
        setIsPlaying(false)
      }
    }
    window.addEventListener("catspeak-voice-play", handleGlobalPause)
    return () => {
      window.removeEventListener("catspeak-voice-play", handleGlobalPause)
    }
  }, [isPlaying])

  // Full teardown on unmount
  useEffect(() => {
    return () => {
      cleanupRecording()
      cleanupAudioPreview()
    }
  }, [cleanupRecording, cleanupAudioPreview])

  const startRecording = useCallback(async () => {
    try {
      cleanupAudioPreview()
      cleanupRecording()

      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        toast.error(
          t?.chat?.voiceNotSupported ||
            "Audio recording is not supported in this browser.",
        )
        return
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream

      // Setup Web Audio API Analyser for live wave visualization
      const AudioCtx = window.AudioContext || window.webkitAudioContext
      const audioCtx = new AudioCtx()
      audioContextRef.current = audioCtx
      const source = audioCtx.createMediaStreamSource(stream)
      const analyser = audioCtx.createAnalyser()
      analyser.fftSize = 64
      source.connect(analyser)
      analyserRef.current = analyser

      // Determine best audio mime type
      const mimeTypes = [
        "audio/webm;codecs=opus",
        "audio/webm",
        "audio/ogg;codecs=opus",
        "audio/mp4",
      ]
      let selectedMimeType = ""
      for (const mime of mimeTypes) {
        if (MediaRecorder.isTypeSupported(mime)) {
          selectedMimeType = mime
          break
        }
      }

      const recorder = new MediaRecorder(
        stream,
        selectedMimeType ? { mimeType: selectedMimeType } : undefined,
      )
      mediaRecorderRef.current = recorder
      audioChunksRef.current = []
      stopIntentRef.current = "review"

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          audioChunksRef.current.push(e.data)
        }
      }

      recorder.onstop = () => {
        const intent = stopIntentRef.current

        if (intent === "cancel") {
          cleanupRecording()
          cleanupAudioPreview()
          return
        }

        const mime = recorder.mimeType || "audio/webm"
        const audioBlob = new Blob(audioChunksRef.current, { type: mime })
        const duration = Math.max(1, recordingSecondsRef.current)

        if (intent === "send") {
          dispatchSend(audioBlob, duration)
          cleanupRecording()
          cleanupAudioPreview()
          return
        }

        // intent === "review"
        // 1. Immediately turn off hardware mic track
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((track) => track.stop())
          streamRef.current = null
        }
        // 2. Close audioContext & stop animation
        if (
          audioContextRef.current &&
          audioContextRef.current.state !== "closed"
        ) {
          audioContextRef.current.close().catch(() => {})
          audioContextRef.current = null
        }
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current)
          animationFrameRef.current = null
        }
        if (recordTimerRef.current) {
          clearInterval(recordTimerRef.current)
          recordTimerRef.current = null
        }

        // 3. Create audio URL & preview
        const url = URL.createObjectURL(audioBlob)
        recordedAudioUrlRef.current = url
        recordedBlobRef.current = audioBlob
        recordedDurationRef.current = duration

        const capturedBars = generateReviewBars(
          lastVisualizerBarsRef.current,
          20,
        )
        setReviewBars(capturedBars)

        const audio = new Audio(url)
        audioPreviewRef.current = audio

        audio.ontimeupdate = () => {
          if (audio.currentTime >= duration && duration > 0) {
            audio.pause()
            audio.currentTime = 0
            setIsPlaying(false)
            setPlaybackCurrentTime(0)
          } else {
            setPlaybackCurrentTime(audio.currentTime)
          }
        }

        audio.onended = () => {
          setIsPlaying(false)
          setPlaybackCurrentTime(0)
        }

        setIsRecording(false)
        setIsReviewing(true)
        setRecordingSeconds(duration)
        setPlaybackCurrentTime(0)
        setIsPlaying(false)
      }

      recorder.start(100) // collect chunks every 100ms
      setIsRecording(true)
      setIsReviewing(false)
      setRecordingSeconds(0)
      recordingSecondsRef.current = 0

      // Recording timer
      recordTimerRef.current = setInterval(() => {
        setRecordingSeconds((prev) => {
          const next = prev + 1
          recordingSecondsRef.current = next
          return next
        })
      }, 1000)

      // Dynamic Audio Visualizer Loop
      const dataArray = new Uint8Array(analyser.frequencyBinCount)
      const updateVisualizer = () => {
        if (!analyserRef.current) return
        analyserRef.current.getByteFrequencyData(dataArray)

        const barsCount = 20
        const step = Math.floor(dataArray.length / barsCount) || 1
        const newBars = []
        for (let i = 0; i < barsCount; i++) {
          const val = dataArray[i * step] || 0
          const height = Math.max(
            15,
            Math.min(95, Math.round((val / 255) * 85) + 15),
          )
          newBars.push(height)
        }
        lastVisualizerBarsRef.current = newBars
        setVisualizerBars(newBars)
        animationFrameRef.current = requestAnimationFrame(updateVisualizer)
      }
      animationFrameRef.current = requestAnimationFrame(updateVisualizer)
    } catch (err) {
      console.error("Failed to start voice recording:", err)
      toast.error(
        t?.chat?.micPermissionDenied ||
          "Microphone access denied. Please allow microphone permissions.",
      )
      cleanupRecording()
      cleanupAudioPreview()
    }
  }, [cleanupAudioPreview, cleanupRecording, dispatchSend, t])

  // Stop recording to enter review mode
  const stopRecording = useCallback(() => {
    const recorder = mediaRecorderRef.current
    if (recorder && recorder.state !== "inactive") {
      stopIntentRef.current = "review"
      recorder.stop()
    }
  }, [])

  // Discard recording (from either active recording or review)
  const cancelRecording = useCallback(() => {
    const recorder = mediaRecorderRef.current
    if (recorder && recorder.state !== "inactive") {
      stopIntentRef.current = "cancel"
      recorder.stop()
    }
    cleanupRecording()
    cleanupAudioPreview()
  }, [cleanupAudioPreview, cleanupRecording])

  // Send voice note (from either active recording or review)
  const sendVoiceRecording = useCallback(() => {
    if (isReviewing && recordedBlobRef.current) {
      const audioBlob = recordedBlobRef.current
      const duration = Math.max(1, recordedDurationRef.current)
      dispatchSend(audioBlob, duration)
      cleanupRecording()
      cleanupAudioPreview()
      return
    }

    const recorder = mediaRecorderRef.current
    if (recorder && recorder.state !== "inactive") {
      stopIntentRef.current = "send"
      recorder.stop()
    }
  }, [cleanupAudioPreview, cleanupRecording, dispatchSend, isReviewing])

  // Audio preview playback controls
  const togglePlayPreview = useCallback(() => {
    const audio = audioPreviewRef.current
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
      if (
        audio.currentTime >= recordedDurationRef.current &&
        recordedDurationRef.current > 0
      ) {
        audio.currentTime = 0
      }
      audio
        .play()
        .then(() => setIsPlaying(true))
        .catch((err) => {
          console.warn("Audio preview playback failed:", err)
          setIsPlaying(false)
        })
    }
  }, [isPlaying])

  const seekPreview = useCallback((percent) => {
    const audio = audioPreviewRef.current
    if (!audio) return

    const duration = recordedDurationRef.current || 1
    const targetTime = percent * duration
    audio.currentTime = targetTime
    setPlaybackCurrentTime(targetTime)
  }, [])

  return {
    isRecording,
    isReviewing,
    recordingSeconds,
    visualizerBars,
    reviewBars,
    isPlaying,
    playbackCurrentTime,
    startRecording,
    stopRecording,
    cancelRecording,
    sendVoiceRecording,
    togglePlayPreview,
    seekPreview,
  }
}
