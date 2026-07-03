import { useState, useEffect, useRef, useCallback } from "react"
import { toast } from "react-hot-toast"
import { useLanguage } from "@/shared/context/LanguageContext"
import { handleMediaError } from "@/shared/utils/mediaErrorUtils"
import { useGetCurrentBackgroundQuery } from "@/store/api/userApi"
import { LocalVideoTrack } from "livekit-client"
import { ProcessorWrapper } from "@livekit/track-processors"
import { CombinedVideoTransformer } from "@/features/video-call/processors/CombinedVideoTransformer"

// ── Beauty localStorage helpers (mirrored from useCombinedProcessor) ──

const BEAUTY_STORAGE_KEY = "catspeak:beautyOptions"

const readStoredBeautyOptions = () => {
  try {
    const raw = localStorage.getItem(BEAUTY_STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch { /* ignore corrupt data */ }
  return null
}

const persistBeautyOptions = (opts) => {
  try {
    localStorage.setItem(BEAUTY_STORAGE_KEY, JSON.stringify(opts))
  } catch { /* quota exceeded — silently drop */ }
}

export const useMediaPreview = ({ audioDeviceId, videoDeviceId } = {}) => {
  const { t } = useLanguage()
  const [micOn, setMicOn] = useState(false)
  const [cameraOn, setCameraOn] = useState(false)
  const [localStream, setLocalStream] = useState(null)

  const streamRef = useRef(null)
  const lkVideoTrackRef = useRef(null)
  const rawVideoTrackRef = useRef(null)
  const processorRef = useRef(null)

  // Track last applied beauty options for polling diff
  const lastAppliedBeautyRef = useRef(null)

  // Diagnostic status for on-screen indicators (mirrors useCombinedProcessor)
  const [processorStatus, setProcessorStatus] = useState(
    ProcessorWrapper.isSupported ? "idle" : "unsupported",
  )

  const { data: bgData } = useGetCurrentBackgroundQuery()
  const virtualBackgroundUrl = bgData?.data?.activeBackgroundUrl

  // Update background if it changes (via CombinedVideoTransformer.updateTransformerOptions)
  useEffect(() => {
    if (!processorRef.current) return
    let bgOptions
    if (virtualBackgroundUrl) {
      bgOptions = { backgroundDisabled: false, imagePath: virtualBackgroundUrl, blurRadius: undefined }
    } else {
      bgOptions = { backgroundDisabled: true, imagePath: undefined, blurRadius: undefined }
    }
    processorRef.current
      .updateTransformerOptions({ bgOptions })
      .catch((err) => console.error("[useMediaPreview] Failed to update bg:", err))
  }, [virtualBackgroundUrl])

  // ── Poll localStorage for beauty changes ─────────────────────────────
  // The pre-join BeautyPicker only persists to localStorage; we can't alter
  // the VirtualBackgroundModal → BeautyPicker prop chain, so we poll here
  // to pick up slider adjustments and apply them to the processor.
  useEffect(() => {
    if (processorStatus !== "attached") return
    const interval = setInterval(() => {
      if (!processorRef.current) return
      const stored = readStoredBeautyOptions()
      if (!stored) return
      // Diff against last applied to skip no-op updates
      const prev = lastAppliedBeautyRef.current
      if (prev) {
        const keys = Object.keys(stored)
        if (keys.every((k) => stored[k] === prev[k])) return
      }
      lastAppliedBeautyRef.current = stored
      processorRef.current
        .updateTransformerOptions({ beautyOptions: stored })
        .catch(() => {})
    }, 300)
    return () => clearInterval(interval)
  }, [processorStatus])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach((t) => t.stop())
      if (processorRef.current?.destroy) processorRef.current.destroy()
      if (lkVideoTrackRef.current) lkVideoTrackRef.current.stop()
      if (rawVideoTrackRef.current) rawVideoTrackRef.current.stop()
    }
  }, [])

  // Helper to request media
  const getMediaStream = async ({
    audio,
    video,
    device,
    customAudioId,
    customVideoId,
  }) => {
    try {
      const constraints = {}
      if (audio) {
        constraints.audio = customAudioId
          ? { deviceId: { exact: customAudioId } }
          : true
      }
      if (video) {
        constraints.video = customVideoId
          ? { deviceId: { exact: customVideoId } }
          : true
      }
      const stream = await navigator.mediaDevices.getUserMedia(constraints)

      // When another app (e.g. Google Meet) holds exclusive mic access,
      // getUserMedia succeeds but the audio track's `muted` property is true
      // — meaning no audio data is flowing from the hardware.
      if (audio && device === "mic") {
        const audioTrack = stream.getAudioTracks()[0]
        if (audioTrack?.muted) {
          const unmuted = await new Promise((resolve) => {
            const onUnmute = () => resolve(true)
            audioTrack.addEventListener("unmute", onUnmute, { once: true })
            setTimeout(() => {
              audioTrack.removeEventListener("unmute", onUnmute)
              resolve(false)
            }, 2000)
          })
          if (!unmuted) {
            console.warn(
              "[useMediaPreview] 🔇 Mic track is muted — another app likely holds exclusive access",
            )
            stream.getTracks().forEach((t) => t.stop())
            toast.error(
              t.rooms?.waitingScreen?.micInUse ??
                "Microphone is in use by another app.",
            )
            return null
          }
        }
      }

      // Apply beauty + virtual background to video track (via CombinedVideoTransformer)
      if (video && ProcessorWrapper.isSupported) {
        const rawVideoTrack = stream.getVideoTracks()[0]
        if (rawVideoTrack) {
          if (lkVideoTrackRef.current) lkVideoTrackRef.current.stop()
          if (rawVideoTrackRef.current) rawVideoTrackRef.current.stop()

          rawVideoTrackRef.current = rawVideoTrack

          const lkTrack = new LocalVideoTrack(rawVideoTrack)
          lkVideoTrackRef.current = lkTrack

          if (!processorRef.current) {
            const transformer = new CombinedVideoTransformer()
            processorRef.current = new ProcessorWrapper(transformer, "preview-combined-processor")
            setProcessorStatus("initializing")
          }

          await lkTrack.setProcessor(processorRef.current)
          setProcessorStatus("attached")

          // Apply stored beauty options from localStorage (pre-join settings)
          const storedBeauty = readStoredBeautyOptions()
          if (storedBeauty) {
            lastAppliedBeautyRef.current = storedBeauty
            await processorRef.current
              .updateTransformerOptions({ beautyOptions: storedBeauty })
              .catch(() => {})
          }

          // Apply virtual background if one is already active
          if (virtualBackgroundUrl) {
            await processorRef.current
              .updateTransformerOptions({
                bgOptions: { backgroundDisabled: false, imagePath: virtualBackgroundUrl, blurRadius: undefined },
              })
              .catch(() => {})
          }

          stream.removeTrack(rawVideoTrack)
          stream.addTrack(lkTrack.mediaStreamTrack)
        }
      }

      if (!streamRef.current) {
        streamRef.current = new MediaStream()
      }

      // If we're fetching a new device for an active stream, we should not duplicate tracks.
      // We will handle track replacement in the callers (useEffect or toggleMic/toggleCamera).

      return stream
    } catch (err) {
      handleMediaError(err, device === "mic" ? "mic" : "camera", t)
      return null
    }
  }

  // Toggle mic
  const toggleMic = async () => {
    let audioTracks = streamRef.current?.getAudioTracks() || []

    if (audioTracks.length === 0) {
      const stream = await getMediaStream({
        audio: true,
        video: false,
        device: "mic",
        customAudioId: audioDeviceId,
      })
      audioTracks = stream?.getAudioTracks() || []

      if (stream) {
        if (!streamRef.current) streamRef.current = new MediaStream()
        audioTracks.forEach((t) => streamRef.current.addTrack(t))
        setLocalStream(new MediaStream(streamRef.current.getTracks()))
      }
    }

    if (audioTracks.length === 0) return false

    setMicOn((prev) => {
      const next = !prev

      if (next) {
        audioTracks.forEach((t) => (t.enabled = true))
      } else {
        // Stop mic tracks completely if turning off
        audioTracks.forEach((t) => t.stop())
        // Remove stopped tracks from streamRef
        streamRef.current = new MediaStream(
          streamRef.current.getVideoTracks(), // keep only video
        )
        setLocalStream(streamRef.current)
      }

      return next
    })

    return true
  }

  // Toggle camera
  const toggleCamera = async () => {
    let videoTracks = streamRef.current?.getVideoTracks() || []

    if (videoTracks.length === 0) {
      const stream = await getMediaStream({
        audio: false,
        video: true,
        device: "camera",
        customVideoId: videoDeviceId,
      })
      videoTracks = stream?.getVideoTracks() || []

      if (stream) {
        if (!streamRef.current) streamRef.current = new MediaStream()
        videoTracks.forEach((t) => streamRef.current.addTrack(t))
        setLocalStream(new MediaStream(streamRef.current.getTracks()))
      }
    }

    if (videoTracks.length === 0) return false

    setCameraOn((prev) => {
      const next = !prev

      if (next) {
        videoTracks.forEach((t) => (t.enabled = true))
      } else {
        videoTracks.forEach((t) => t.stop())

        if (lkVideoTrackRef.current) {
          lkVideoTrackRef.current.stop()
          lkVideoTrackRef.current = null
        }

        if (rawVideoTrackRef.current) {
          rawVideoTrackRef.current.stop()
          rawVideoTrackRef.current = null
        }

        // Remove stopped tracks from streamRef
        streamRef.current = new MediaStream(
          streamRef.current.getAudioTracks(), // keep only mic
        )
        setLocalStream(streamRef.current)
      }

      return next
    })

    return true
  }

  // Handle device changes on the fly
  useEffect(() => {
    if (micOn && audioDeviceId) {
      ;(async () => {
        const stream = await getMediaStream({
          audio: true,
          video: false,
          device: "mic",
          customAudioId: audioDeviceId,
        })
        if (stream) {
          const oldAudio = streamRef.current?.getAudioTracks() || []
          oldAudio.forEach((t) => {
            t.stop()
            streamRef.current.removeTrack(t)
          })
          stream.getAudioTracks().forEach((t) => streamRef.current.addTrack(t))
          setLocalStream(new MediaStream(streamRef.current.getTracks()))
        }
      })()
    }
  }, [audioDeviceId])

  useEffect(() => {
    if (cameraOn && videoDeviceId) {
      ;(async () => {
        const stream = await getMediaStream({
          audio: false,
          video: true,
          device: "camera",
          customVideoId: videoDeviceId,
        })
        if (stream) {
          const oldVideo = streamRef.current?.getVideoTracks() || []
          oldVideo.forEach((t) => {
            t.stop()
            streamRef.current.removeTrack(t)
          })
          stream.getVideoTracks().forEach((t) => streamRef.current.addTrack(t))
          setLocalStream(new MediaStream(streamRef.current.getTracks()))
        }
      })()
    }
  }, [videoDeviceId])

  // ── switchBeauty — called when beauty options change (mirrors useCombinedProcessor) ──
  const switchBeauty = useCallback((beautyOptions) => {
    // Clamp to 0–100 range before persisting
    const clamped = {}
    for (const [key, val] of Object.entries(beautyOptions)) {
      clamped[key] = typeof val === "number" ? Math.max(0, Math.min(100, Math.round(val))) : val
    }
    persistBeautyOptions(clamped)
    if (!processorRef.current) return
    lastAppliedBeautyRef.current = clamped
    processorRef.current
      .updateTransformerOptions({ beautyOptions: clamped })
      .catch((err) => console.error("[useMediaPreview] Failed to update beauty:", err))
  }, [])

  return {
    micOn,
    cameraOn,
    localStream,
    lkVideoTrack: lkVideoTrackRef.current,
    toggleMic,
    toggleCamera,
    switchBeauty,
    processorStatus,
  }
}
