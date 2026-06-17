// src/features/video-call/processors/useCombinedProcessor.js
import { useRef, useState, useEffect, useCallback } from "react"
import { ProcessorWrapper } from "@livekit/track-processors"
import { useRoomContext, useLocalParticipant } from "@livekit/components-react"
import { Track } from "livekit-client"
import toast from "react-hot-toast"
import { useGetCurrentBackgroundQuery } from "@/store/api/userApi"
import { CombinedVideoTransformer, DEFAULT_BEAUTY_OPTIONS } from "./CombinedVideoTransformer"

const BEAUTY_STORAGE_KEY = "catspeak:beautyOptions"

/**
 * Migrate boolean (legacy) beauty options to intensity-based numbers.
 * - false → 0  (off)
 * - true  → 50 (default intensity for previously-enabled filters)
 *
 * Handles partial objects (some keys boolean, some already numeric)
 * and objects with missing keys (fills from DEFAULT_BEAUTY_OPTIONS).
 */
const migrateBeautyOptions = (stored) => {
  if (!stored || typeof stored !== "object") return { ...DEFAULT_BEAUTY_OPTIONS }

  const migrated = {}
  for (const [key, val] of Object.entries(DEFAULT_BEAUTY_OPTIONS)) {
    const storedVal = stored[key]
    if (typeof storedVal === "boolean") {
      migrated[key] = storedVal ? 50 : 0
    } else if (typeof storedVal === "number" && !Number.isNaN(storedVal)) {
      migrated[key] = Math.max(0, Math.min(100, Math.round(storedVal)))
    } else {
      migrated[key] = DEFAULT_BEAUTY_OPTIONS[key]
    }
  }
  return migrated
}

const readStoredBeautyOptions = () => {
  try {
    const raw = localStorage.getItem(BEAUTY_STORAGE_KEY)
    if (raw) return migrateBeautyOptions(JSON.parse(raw))
  } catch { /* ignore corrupt data */ }
  return { ...DEFAULT_BEAUTY_OPTIONS }
}

const persistBeautyOptions = (opts) => {
  try {
    localStorage.setItem(BEAUTY_STORAGE_KEY, JSON.stringify(opts))
  } catch { /* quota exceeded — silently drop */ }
}

/**
 * Owns the single ProcessorWrapper<CombinedVideoTransformer> for the active call.
 *
 * Uses ProcessorWrapper.isSupported (Canvas 2D + stream APIs) rather than
 * supportsBackgroundProcessors() (which also requires WebGL2 + MediaPipe).
 * Beauty effects only need Canvas 2D, so they work on a wider range of browsers.
 * BackgroundTransformer (MediaPipe) is lazy-initialized only when a background
 * effect is actually requested.
 */
export const useCombinedProcessor = () => {
  const room = useRoomContext()
  const { isCameraEnabled } = useLocalParticipant()
  const processorRef = useRef(null)
  const attachedTrackRef = useRef(null)
  // Track identity of the currently-attached track so we can detect replacement
  const attachedTrackIdRef = useRef(null)

  const { data: bgData } = useGetCurrentBackgroundQuery()
  const activeBackgroundUrl = bgData?.data?.activeBackgroundUrl ?? null

  // ── Diagnostic status for on-screen indicators ────────────────────────────
  const [processorStatus, setProcessorStatus] = useState(
    ProcessorWrapper.isSupported ? "idle" : "unsupported",
  )

  // One-time toast when browser/OS unsupported (e.g. iOS Safari)
  const unsupportedToastedRef = useRef(false)
  useEffect(() => {
    if (processorStatus === "unsupported" && !unsupportedToastedRef.current) {
      unsupportedToastedRef.current = true
      toast.error(
        "Beauty effects unavailable — your device may not support video processing. Try using Chrome or Edge on desktop.",
        { id: "beauty-unsupported", duration: 8000 },
      )
    }
  }, [processorStatus])

  // Initialize processor once on mount and destroy on unmount
  useEffect(() => {
    if (ProcessorWrapper.isSupported) {
      processorRef.current = new ProcessorWrapper(
        new CombinedVideoTransformer(),
        "combined-video-processor",
      )
    }
    return () => {
      processorRef.current?.destroy().catch(() => {})
      processorRef.current = null
      attachedTrackRef.current = null
      attachedTrackIdRef.current = null
    }
  }, [])

  // ── Attach / detach processor to the camera track ──────────────────────────
  useEffect(() => {
    const processor = processorRef.current
    if (!processor) return

    const participant = room.localParticipant

    // Helper: try to attach right now. Returns true if it succeeded.
    const tryAttach = () => {
      const pub = participant.getTrackPublication(Track.Source.Camera)
      const track = pub?.track
      if (!track) return false

      if (attachedTrackIdRef.current === track.mediaStreamTrack?.id) {
        // Already attached to this exact track — nothing to do
        return true
      }

      attachedTrackRef.current = track
      attachedTrackIdRef.current = track.mediaStreamTrack?.id ?? null

      setProcessorStatus("initializing")

      track
        .setProcessor(processor)
        .then(() => {
          console.log("[useCombinedProcessor] Processor attached to camera track")
          setProcessorStatus("attached")
          toast.success("Beauty effects active", { id: "beauty-attached", duration: 2000 })
          // Apply any beauty options the user set before joining
          const stored = readStoredBeautyOptions()
          if (stored) {
            processor
              .updateTransformerOptions({ beautyOptions: stored })
              .catch(() => {})
          }
        })
        .catch((err) => {
          console.error("[useCombinedProcessor] Failed to attach processor:", err)
          setProcessorStatus("error")
          toast.error("Beauty effects unavailable — your device may not support video processing.", {
            id: "beauty-attach-failed",
          })
        })

      return true
    }

    // ── Camera enabled ────────────────────────────────────────────────
    if (isCameraEnabled) {
      // Try immediate attach first (handles the common case where the track
      // is already published by the time this effect runs).
      if (tryAttach()) {
        // Still subscribe to trackPublished in case the track is replaced
        // later (e.g. device switch).
        const handleTrackPublished = (pub) => {
          if (pub.source === Track.Source.Camera) {
            // Small delay — LiveKit may not have set pub.track synchronously
            // in all versions. A microtask is enough.
            queueMicrotask(() => tryAttach())
          }
        }
        participant.on("trackPublished", handleTrackPublished)
        return () => {
          participant.off("trackPublished", handleTrackPublished)
        }
      }

      // Immediate attach failed — the track isn't ready yet. Listen for the
      // trackPublished event and retry when the camera track appears.
      console.log("[useCombinedProcessor] Camera track not ready yet, waiting for trackPublished…")
      const handleTrackPublished = (pub) => {
        if (pub.source === Track.Source.Camera) {
          queueMicrotask(() => {
            if (tryAttach()) {
              // Successfully attached — we can stop listening
              participant.off("trackPublished", handleTrackPublished)
            }
          })
        }
      }
      participant.on("trackPublished", handleTrackPublished)

      // Safety timeout: if the track never appears, stop waiting
      const timeout = setTimeout(() => {
        participant.off("trackPublished", handleTrackPublished)
        if (!attachedTrackRef.current) {
          console.error("[useCombinedProcessor] Timed out waiting for camera track publication")
          setProcessorStatus("error")
          toast.error("Could not attach beauty effects — camera track not found.", {
            id: "beauty-track-timeout",
          })
        }
      }, 10000)

      return () => {
        clearTimeout(timeout)
        participant.off("trackPublished", handleTrackPublished)
      }
    }

    // ── Camera disabled ───────────────────────────────────────────────
    // When the user turns off their camera we clear the attachment refs so
    // the next enable will attach to the new track.
    if (attachedTrackRef.current) {
      // The track will be unpublished by LiveKit; the processor pipeline
      // tears itself down automatically when the source track ends.
    }
    attachedTrackRef.current = null
    attachedTrackIdRef.current = null

    // Reset status so the next camera-enable re-runs the attach lifecycle
    if (processorRef.current) {
      setProcessorStatus("idle")
    }

    // Still listen for trackPublished in case camera is toggled back on
    // during this effect's lifetime (but the effect will re-run when
    // isCameraEnabled changes, so this is just a belt-and-suspenders).
  }, [isCameraEnabled, room.localParticipant])

  // ── Sync background URL from Redux into the processor ─────────────────────
  useEffect(() => {
    if (!processorRef.current) return

    let bgOptions
    if (activeBackgroundUrl) {
      bgOptions = { backgroundDisabled: false, imagePath: activeBackgroundUrl, blurRadius: undefined }
    } else {
      bgOptions = { backgroundDisabled: true, imagePath: undefined, blurRadius: undefined }
    }

    processorRef.current
      .updateTransformerOptions({ bgOptions })
      .catch((err) => console.error("[useCombinedProcessor] Failed to update bg:", err))
  }, [activeBackgroundUrl])

  // ── switchBeauty — called from in-call BeautyPicker, persists to localStorage ──
  const switchBeauty = useCallback((beautyOptions) => {
    // Clamp to 0-100 range before persisting
    const clamped = {}
    for (const [key, val] of Object.entries(beautyOptions)) {
      clamped[key] = typeof val === "number" ? Math.max(0, Math.min(100, Math.round(val))) : val
    }
    persistBeautyOptions(clamped)
    if (!processorRef.current) return
    processorRef.current
      .updateTransformerOptions({ beautyOptions: clamped })
      .catch((err) => console.error("[useCombinedProcessor] Failed to update beauty:", err))
  }, [])

  return { switchBeauty, processorStatus }
}
