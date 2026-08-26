// src/features/video-call/processors/useCombinedProcessor.js
import { useRef, useState, useEffect, useCallback } from "react"
import { ProcessorWrapper } from "@livekit/track-processors"
import { useRoomContext, useLocalParticipant } from "@livekit/components-react"
import { Track, ParticipantEvent } from "livekit-client"
import toast from "react-hot-toast"
import { useLanguage } from "@/shared/context/LanguageContext"
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
  const { t } = useLanguage()
  const room = useRoomContext()
  const { isCameraEnabled } = useLocalParticipant()
  const processorRef = useRef(null)
  const attachedTrackRef = useRef(null)
  // Track identity of the currently-attached track so we can detect replacement.
  // Prefer LiveKit's own track.sid (stable across MediaStreamTrack swaps) over
  // mediaStreamTrack.id (which can be null during early lifecycle).
  const attachedTrackIdRef = useRef(null)
  // Prevent concurrent attach attempts (setProcessor is async)
  const attachingRef = useRef(false)

  const { data: bgData } = useGetCurrentBackgroundQuery()
  const activeBackgroundUrl =
    bgData?.activeBackgroundUrl ?? bgData?.data?.activeBackgroundUrl ?? null

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
        t.rooms?.beauty?.unsupported ||
          "Beauty effects unavailable — your device may not support video processing. Try using Chrome or Edge on desktop.",
        { id: "beauty-unsupported", duration: 8000 },
      )
    }
  }, [processorStatus, t])

  // Helper to destroy active processor instance cleanly
  const cleanupProcessor = useCallback(async () => {
    if (processorRef.current) {
      const old = processorRef.current
      processorRef.current = null
      try {
        await old.destroy()
      } catch {
        /* ignore cleanup errors */
      }
    }
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanupProcessor()
      attachedTrackRef.current = null
      attachedTrackIdRef.current = null
    }
  }, [cleanupProcessor])

  // ── Attach / detach processor to the camera track ──────────────────────────
  useEffect(() => {
    if (!ProcessorWrapper.isSupported) return

    const participant = room.localParticipant

    // Helper: try to attach right now. Returns true if it found a track to attach to.
    // The actual attachment is async; we guard against concurrent attempts via attachingRef.
    const tryAttach = async () => {
      // Prevent overlapping attach attempts
      if (attachingRef.current) return true

      const pub = participant.getTrackPublication(Track.Source.Camera)
      const track = pub?.track
      if (!track) return false

      // Build a stable identity: prefer track.sid (LiveKit internal), fall back to
      // mediaStreamTrack.id, and guard against both being null (e.g. early lifecycle).
      const trackId = track.sid ?? track.mediaStreamTrack?.id ?? null
      if (trackId && attachedTrackIdRef.current === trackId && processorRef.current) {
        // Already attached to this exact track with an active processor — nothing to do
        return true
      }

      attachingRef.current = true
      setProcessorStatus("initializing")

      try {
        // Clean up any old processor stream before creating a fresh one for the new track
        await cleanupProcessor()

        const newProcessor = new ProcessorWrapper(
          new CombinedVideoTransformer(),
          "combined-video-processor",
        )
        processorRef.current = newProcessor
        attachedTrackRef.current = track

        await track.setProcessor(newProcessor)

        console.log("[useCombinedProcessor] Processor attached to camera track")
        attachedTrackIdRef.current = track.sid ?? track.mediaStreamTrack?.id ?? null
        setProcessorStatus("attached")
        attachingRef.current = false

        // Apply any beauty options the user set before joining
        const stored = readStoredBeautyOptions()
        if (stored) {
          await newProcessor
            .updateTransformerOptions({ beautyOptions: stored })
            .catch(() => {})
        }

        // Apply virtual background if active
        if (activeBackgroundUrl) {
          await newProcessor
            .updateTransformerOptions({
              bgOptions: {
                backgroundDisabled: false,
                imagePath: activeBackgroundUrl,
                blurRadius: undefined,
              },
            })
            .catch(() => {})
        }
      } catch (err) {
        console.error("[useCombinedProcessor] Failed to attach processor:", err)
        await cleanupProcessor()
        attachedTrackRef.current = null
        attachedTrackIdRef.current = null
        attachingRef.current = false
        setProcessorStatus("error")
        toast.error(
          t.rooms?.beauty?.attachFailed ||
            "Beauty effects unavailable — your device may not support video processing.",
          { id: "beauty-attach-failed" },
        )
      }

      return true
    }

    // ── Camera enabled ────────────────────────────────────────────────
    if (isCameraEnabled) {
      // Try immediate attach first (handles the common case where the track
      // is already published by the time this effect runs).
      tryAttach().then((attached) => {
        if (!attached) {
          console.log("[useCombinedProcessor] Camera track not ready yet, waiting for trackPublished…")
          const handleTrackPublished = (pub) => {
            if (pub?.source === Track.Source.Camera) {
              queueMicrotask(() => {
                tryAttach().then((ok) => {
                  if (ok) {
                    participant.off(ParticipantEvent.LocalTrackPublished, handleTrackPublished)
                    participant.off("localTrackPublished", handleTrackPublished)
                    participant.off("trackPublished", handleTrackPublished)
                  }
                })
              })
            }
          }
          participant.on(ParticipantEvent.LocalTrackPublished, handleTrackPublished)
          participant.on("localTrackPublished", handleTrackPublished)
          participant.on("trackPublished", handleTrackPublished)

          // Safety timeout: if the track never appears, stop waiting
          const timeout = setTimeout(() => {
            participant.off(ParticipantEvent.LocalTrackPublished, handleTrackPublished)
            participant.off("localTrackPublished", handleTrackPublished)
            participant.off("trackPublished", handleTrackPublished)
            if (!attachedTrackRef.current) {
              console.error("[useCombinedProcessor] Timed out waiting for camera track publication")
              setProcessorStatus("error")
              toast.error(
                t.rooms?.beauty?.trackTimeout ||
                  "Could not attach beauty effects — camera track not found.",
                { id: "beauty-track-timeout" },
              )
            }
          }, 10000)

          return () => {
            clearTimeout(timeout)
            participant.off(ParticipantEvent.LocalTrackPublished, handleTrackPublished)
            participant.off("localTrackPublished", handleTrackPublished)
            participant.off("trackPublished", handleTrackPublished)
          }
        }
      })
      return
    }

    // ── Camera disabled ───────────────────────────────────────────────
    // When the user turns off their camera, destroy the dead processor pipeline so the next enable gets a fresh one
    cleanupProcessor()
    attachedTrackRef.current = null
    attachedTrackIdRef.current = null
    attachingRef.current = false
    setProcessorStatus("idle")
  }, [isCameraEnabled, room.localParticipant, cleanupProcessor, activeBackgroundUrl, t])

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
