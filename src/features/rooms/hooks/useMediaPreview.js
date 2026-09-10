import { useState, useEffect, useRef, useCallback } from "react"
import { useLanguage } from "@/shared/context/LanguageContext"
import { handleMediaError } from "@/shared/utils/mediaErrorUtils"
import { unlockAudioContext } from "@/shared/utils/audioUnlockUtils"
import {
  buildAudioConstraint,
  buildVideoConstraint,
} from "@/shared/utils/mediaConstraintUtils"
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
  // Tracked as state (not just a ref) so consumers (VideoPreview) re-attach the
  // correct LiveKit track whenever it is rebuilt on device/processor changes.
  const [lkVideoTrack, setLkVideoTrack] = useState(null)

  const streamRef = useRef(null)
  const lkVideoTrackRef = useRef(null)
  const rawVideoTrackRef = useRef(null)
  const processorRef = useRef(null)
  // Guards against overlapping async toggle/device operations that could leave
  // stale (stopped) tracks attached — a common cause of black previews.
  const busyRef = useRef(false)

  // Track last applied beauty options for polling diff
  const lastAppliedBeautyRef = useRef(null)

  // Diagnostic status for on-screen indicators (mirrors useCombinedProcessor)
  const [processorStatus, setProcessorStatus] = useState(
    ProcessorWrapper.isSupported ? "idle" : "unsupported",
  )

  const { data: bgData } = useGetCurrentBackgroundQuery(undefined, {
    refetchOnMountOrArgChange: true,
  })
  // bgData === undefined => still loading (don't touch processor yet).
  // bgData === null/object with null url => explicit "None" (disabled).
  const virtualBackgroundUrl =
    bgData === undefined
      ? undefined
      : (bgData?.activeBackgroundUrl ?? bgData?.data?.activeBackgroundUrl ?? null)

  // Keep latest bg url in a ref so getMediaStream never captures a stale
  // closure (React re-creates getMediaStream each render, but an already-running
  // async getMediaStream would still see the old value).
  const virtualBackgroundUrlRef = useRef(virtualBackgroundUrl)
  useEffect(() => {
    virtualBackgroundUrlRef.current = virtualBackgroundUrl
  }, [virtualBackgroundUrl])

  // Update background if it changes OR when processor becomes ready.
  // Previously this effect only watched virtualBackgroundUrl, so if the url
  // was already known before the processor existed, the effect aborted
  // (processor null) and never retried — the re-enter bug.
  useEffect(() => {
    if (!processorRef.current) return
    if (virtualBackgroundUrl === undefined) return // still loading
    let bgOptions
    if (virtualBackgroundUrl) {
      bgOptions = { backgroundDisabled: false, imagePath: virtualBackgroundUrl, blurRadius: undefined }
    } else {
      bgOptions = { backgroundDisabled: true, imagePath: undefined, blurRadius: undefined }
    }
    processorRef.current
      .updateTransformerOptions({ bgOptions })
      .catch((err) => console.error("[useMediaPreview] Failed to update bg:", err))
  }, [virtualBackgroundUrl, processorStatus])

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

  const safeStopMediaTrack = (t) => {
    try {
      t?.stop?.()
    } catch {
      /* already stopped — ignore */
    }
  }

  // Tears down the LiveKit video pipeline (processor → LocalVideoTrack → raw
  // track). Every step is guarded so a half-torn-down pipeline can never throw
  // an unhandled rejection (one suspected cause of the full-page reload).
  const teardownVideoPipeline = useCallback(async () => {
    const processor = processorRef.current
    processorRef.current = null
    if (processor?.destroy) {
      try {
        await processor.destroy()
      } catch {
        /* ignore cleanup errors */
      }
    }
    const lkTrack = lkVideoTrackRef.current
    lkVideoTrackRef.current = null
    if (lkTrack) {
      try {
        lkTrack.stop()
      } catch {
        /* ignore */
      }
      try {
        lkTrack.detach?.()
      } catch {
        /* ignore */
      }
    }
    const raw = rawVideoTrackRef.current
    rawVideoTrackRef.current = null
    safeStopMediaTrack(raw)
    setLkVideoTrack(null)
    setProcessorStatus((s) => (s === "unsupported" ? s : "idle"))
  }, [])

  const stopAllPreviewTracks = useCallback(() => {
    busyRef.current = false
    if (streamRef.current) {
      try {
        streamRef.current.getTracks().forEach(safeStopMediaTrack)
      } catch {
        /* ignore */
      }
      streamRef.current = null
    }
    // Fire-and-forget is safe here because teardownVideoPipeline never rejects.
    teardownVideoPipeline()
    setLocalStream(null)
    setMicOn(false)
    setCameraOn(false)
  }, [teardownVideoPipeline])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopAllPreviewTracks()
    }
  }, [stopAllPreviewTracks])

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
        unlockAudioContext()
        constraints.audio = buildAudioConstraint(customAudioId)
      }
      if (video) {
        constraints.video = buildVideoConstraint(customVideoId)
      }
      const stream = await navigator.mediaDevices.getUserMedia(constraints)

      // Apply beauty + virtual background to video track (via CombinedVideoTransformer)
      if (video && ProcessorWrapper.isSupported) {
        const rawVideoTrack = stream.getVideoTracks()[0]
        if (rawVideoTrack) {
          // Fully tear down any previous pipeline first so a stale (stopped)
          // processor/track can never linger and render black.
          await teardownVideoPipeline()

          rawVideoTrackRef.current = rawVideoTrack

          let lkTrack = null
          try {
            lkTrack = new LocalVideoTrack(rawVideoTrack)
          } catch (err) {
            console.error("[useMediaPreview] LocalVideoTrack creation failed:", err)
            safeStopMediaTrack(rawVideoTrack)
            rawVideoTrackRef.current = null
            return stream
          }
          lkVideoTrackRef.current = lkTrack
          setLkVideoTrack(lkTrack)

          const transformer = new CombinedVideoTransformer()
          const newProcessor = new ProcessorWrapper(transformer, "preview-combined-processor")
          processorRef.current = newProcessor
          setProcessorStatus("initializing")

          try {
            await lkTrack.setProcessor(newProcessor)
          } catch (err) {
            // Processor attach failed (e.g. browser lost hardware mid-toggle).
            // Fall back to the raw camera track instead of a black preview.
            console.error("[useMediaPreview] setProcessor failed, using raw track:", err)
            processorRef.current = null
            setProcessorStatus("error")
            return stream
          }
          setProcessorStatus("attached")

          // Apply stored beauty options from localStorage (pre-join settings)
          const storedBeauty = readStoredBeautyOptions()
          if (storedBeauty) {
            lastAppliedBeautyRef.current = storedBeauty
            await newProcessor
              .updateTransformerOptions({ beautyOptions: storedBeauty })
              .catch(() => {})
          }

          // Apply virtual background if one is already active.
          // Use the ref (latest value) instead of the closure-captured
          // virtualBackgroundUrl to avoid stale closure when getMediaStream
          // was invoked before a re-render that brought the bg url.
          const currentBgUrl = virtualBackgroundUrlRef.current
          if (currentBgUrl !== undefined) {
            const bgOptions = currentBgUrl
              ? { backgroundDisabled: false, imagePath: currentBgUrl, blurRadius: undefined }
              : { backgroundDisabled: true, imagePath: undefined, blurRadius: undefined }
            await newProcessor
              .updateTransformerOptions({ bgOptions })
              .catch(() => {})
          }

          try {
            stream.removeTrack(rawVideoTrack)
          } catch {
            /* ignore */
          }
          try {
            if (lkTrack.mediaStreamTrack) stream.addTrack(lkTrack.mediaStreamTrack)
          } catch {
            /* ignore */
          }
        }
      }

      if (!streamRef.current) {
        streamRef.current = new MediaStream()
      }

      // If we're fetching a new device for an active stream, we should not duplicate tracks.
      // We will handle track replacement in the callers (useEffect or toggleMic/toggleCamera).

      return stream
    } catch (err) {
      console.error("[useMediaPreview] getMediaStream error:", {
        name: err?.name,
        message: err?.message,
        stack: err?.stack,
        err,
      })
      handleMediaError(err, device === "mic" ? "mic" : "camera", t)
      return null
    }
  }

  // Toggle mic
  const toggleMic = async () => {
    if (busyRef.current) return false
    busyRef.current = true
    try {
      console.log("[useMediaPreview] Toggling mic...")
      // NOTE: side effects live outside the state updater (updaters must stay
      // pure — React StrictMode double-invokes them, which previously caused
      // double-stop / torn-down streams).
      const next = !micOn

      if (next) {
        let audioTracks = []
        try {
          audioTracks = streamRef.current?.getAudioTracks()?.filter((t) => t.readyState === "live") || []
        } catch {
          audioTracks = []
        }

        if (audioTracks.length === 0) {
          const stream = await getMediaStream({
            audio: true,
            video: false,
            device: "mic",
            customAudioId: audioDeviceId,
          })
          audioTracks = stream?.getAudioTracks() || []

          if (stream && audioTracks.length > 0) {
            if (!streamRef.current) streamRef.current = new MediaStream()
            audioTracks.forEach((t) => {
              try {
                if (!streamRef.current.getTrackById(t.id)) streamRef.current.addTrack(t)
              } catch {
                /* ignore */
              }
            })
            setLocalStream(new MediaStream(streamRef.current.getTracks()))
          }
        } else {
          audioTracks.forEach((t) => {
            try {
              t.enabled = true
            } catch {
              /* ignore */
            }
          })
        }

        if (audioTracks.length === 0) {
          console.warn("[useMediaPreview] Toggle mic failed: no audio tracks acquired")
          return false
        }
        console.log("[useMediaPreview] Mic toggled to:", true)
        setMicOn(true)
      } else {
        // Stop mic tracks completely if turning off
        let audioTracks = []
        try {
          audioTracks = streamRef.current?.getAudioTracks() || []
        } catch {
          audioTracks = []
        }
        audioTracks.forEach(safeStopMediaTrack)
        // Remove stopped tracks from streamRef (keep only video)
        try {
          const videoOnly = streamRef.current?.getVideoTracks() || []
          streamRef.current = new MediaStream(videoOnly)
          setLocalStream(new MediaStream(streamRef.current.getTracks()))
        } catch {
          /* ignore */
        }
        console.log("[useMediaPreview] Mic toggled to:", false)
        setMicOn(false)
      }

      return true
    } finally {
      busyRef.current = false
    }
  }

  // Toggle camera
  const toggleCamera = async () => {
    if (busyRef.current) return false
    busyRef.current = true
    try {
      console.log("[useMediaPreview] Toggling camera...")
      const next = !cameraOn

      if (next) {
        // Only reuse a live track; a stopped ("ended") track renders black.
        let videoTracks = []
        try {
          videoTracks = streamRef.current?.getVideoTracks()?.filter((t) => t.readyState === "live") || []
        } catch {
          videoTracks = []
        }

        if (videoTracks.length === 0) {
          const stream = await getMediaStream({
            audio: false,
            video: true,
            device: "camera",
            customVideoId: videoDeviceId,
          })
          videoTracks = stream?.getVideoTracks()?.filter((t) => t.readyState !== "ended") || []

          if (stream && videoTracks.length > 0) {
            if (!streamRef.current) streamRef.current = new MediaStream()
            videoTracks.forEach((t) => {
              try {
                if (!streamRef.current.getTrackById(t.id)) streamRef.current.addTrack(t)
              } catch {
                /* ignore */
              }
            })
            setLocalStream(new MediaStream(streamRef.current.getTracks()))
          }
        } else {
          videoTracks.forEach((t) => {
            try {
              t.enabled = true
            } catch {
              /* ignore */
            }
          })
        }

        if (videoTracks.length === 0) {
          console.warn("[useMediaPreview] Toggle camera failed: no video tracks acquired")
          return false
        }
        console.log("[useMediaPreview] Camera toggled to:", true)
        setCameraOn(true)
      } else {
        try {
          streamRef.current?.getVideoTracks()?.forEach(safeStopMediaTrack)
        } catch {
          /* ignore */
        }

        await teardownVideoPipeline()

        // Remove stopped tracks from streamRef (keep only mic)
        try {
          const audioOnly = streamRef.current?.getAudioTracks()?.filter((t) => t.readyState === "live") || []
          streamRef.current = new MediaStream(audioOnly)
          setLocalStream(new MediaStream(streamRef.current.getTracks()))
        } catch {
          /* ignore */
        }
        console.log("[useMediaPreview] Camera toggled to:", false)
        setCameraOn(false)
      }

      return true
    } finally {
      busyRef.current = false
    }
  }

  // Handle device changes on the fly
  useEffect(() => {
    if (micOn && audioDeviceId) {
      ;(async () => {
        if (busyRef.current) return
        busyRef.current = true
        try {
          const stream = await getMediaStream({
            audio: true,
            video: false,
            device: "mic",
            customAudioId: audioDeviceId,
          })
          if (stream && streamRef.current) {
            const oldAudio = streamRef.current?.getAudioTracks() || []
            oldAudio.forEach((t) => {
              safeStopMediaTrack(t)
              try {
                streamRef.current.removeTrack(t)
              } catch {
                /* ignore */
              }
            })
            stream.getAudioTracks().forEach((t) => {
              try {
                if (!streamRef.current.getTrackById(t.id)) streamRef.current.addTrack(t)
              } catch {
                /* ignore */
              }
            })
            setLocalStream(new MediaStream(streamRef.current.getTracks()))
          }
        } finally {
          busyRef.current = false
        }
      })()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [audioDeviceId])

  useEffect(() => {
    if (cameraOn && videoDeviceId) {
      ;(async () => {
        if (busyRef.current) return
        busyRef.current = true
        try {
          const stream = await getMediaStream({
            audio: false,
            video: true,
            device: "camera",
            customVideoId: videoDeviceId,
          })
          if (stream && streamRef.current) {
            const newVideo = stream.getVideoTracks() || []
            // getMediaStream already tore down the old pipeline; only swap the
            // container tracks here so no stopped track stays attached.
            const oldVideo = streamRef.current?.getVideoTracks() || []
            oldVideo.forEach((t) => {
              if (!newVideo.some((n) => n.id === t.id)) {
                safeStopMediaTrack(t)
                try {
                  streamRef.current.removeTrack(t)
                } catch {
                  /* ignore */
                }
              }
            })
            newVideo.forEach((t) => {
              try {
                if (!streamRef.current.getTrackById(t.id)) streamRef.current.addTrack(t)
              } catch {
                /* ignore */
              }
            })
            setLocalStream(new MediaStream(streamRef.current.getTracks()))
          }
        } finally {
          busyRef.current = false
        }
      })()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    lkVideoTrack,
    toggleMic,
    toggleCamera,
    switchBeauty,
    processorStatus,
    stopAllPreviewTracks,
  }
}
