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
  // Guard against overlapping toggle operations — iPhone Safari is slow to
  // start/stop tracks and a second toggle before the first completes left
  // stale (ended) tracks attached => black preview.
  const busyRef = useRef(false)

  const { data: bgData } = useGetCurrentBackgroundQuery(undefined, {
    refetchOnMountOrArgChange: true,
  })
  const activeBackgroundUrl =
    bgData === undefined
      ? undefined
      : (bgData?.activeBackgroundUrl ?? bgData?.data?.activeBackgroundUrl ?? null)

  // Latest bg url ref avoids stale closure when tryAttach runs before a
  // re-render that brings the fresh bg url.
  const activeBackgroundUrlRef = useRef(activeBackgroundUrl)
  useEffect(() => {
    activeBackgroundUrlRef.current = activeBackgroundUrl
  }, [activeBackgroundUrl])

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
  // On LiveKit tracks the processor is owned by the track — we must go
  // through track.stopProcessor() so LiveKit can swap the sender back to
  // the raw track and re-attach elements. Directly destroying the wrapper
  // (old behavior) left track.processor pointing at a destroyed wrapper
  // with an ended processedTrack => black screen on next enable (iPhone).
  const cleanupProcessor = useCallback(async () => {
    const participant = room?.localParticipant
    const pub = participant?.getTrackPublication?.(Track.Source.Camera)
    const track = pub?.track
    // If LiveKit still holds the processor, use its API to cleanly detach.
    // This is the correct way to remove a processor from a published track.
    if (track?.processor && track.stopProcessor) {
      try {
        await track.stopProcessor()
      } catch {
        /* ignore — fall through to direct destroy */
      }
    }
    if (processorRef.current) {
      const old = processorRef.current
      processorRef.current = null
      try {
        await old.destroy()
      } catch {
        /* ignore cleanup errors */
      }
    } else if (track?.processor) {
      // Edge case: wrapper was already destroyed but track still thinks it has one
      processorRef.current = null
    }
  }, [room])

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
    let cancelled = false
    let timeoutId = null
    const handleTrackPublished = (pub) => {
      if (pub?.source === Track.Source.Camera) {
        queueMicrotask(() => {
          if (cancelled) return
          tryAttach().then((ok) => {
            if (ok) {
              participant.off(ParticipantEvent.LocalTrackPublished, handleTrackPublished)
              participant.off("localTrackPublished", handleTrackPublished)
              participant.off("trackPublished", handleTrackPublished)
              if (timeoutId) clearTimeout(timeoutId)
            }
          })
        })
      }
    }

    // Helper: try to attach right now. Returns true if it found a track to attach to.
    // The actual attachment is async; we guard against concurrent attempts via attachingRef.
    const tryAttach = async () => {
      // Prevent overlapping attach attempts
      if (attachingRef.current) return true
      if (busyRef.current) {
        console.log("[useCombinedProcessor] busy, deferring attach")
        return false
      }

      const pub = participant.getTrackPublication(Track.Source.Camera)
      const track = pub?.track
      if (!track) return false

      // iPhone Safari: after mute/unmute the publication still exists but the
      // underlying MediaStreamTrack may be ended or muted if the hardware was
      // released. Attaching a processor to an ended track yields a black
      // preview. Treat non-live tracks as "not ready" and wait for a fresh
      // publication (same pattern as waiting-room fix).
      const rawTrack = track.mediaStreamTrack // may be processedTrack if already attached
      const underlying = track._mediaStreamTrack ?? rawTrack
      if (underlying?.readyState !== "live") {
        console.warn("[useCombinedProcessor] Camera track not live (readyState:", underlying?.readyState, ") — waiting for fresh track")
        return false
      }
      // If track is still muted/enabled false, LiveKit hasn't unmuted yet
      if (track.isMuted) {
        console.log("[useCombinedProcessor] Track still muted, deferring attach")
        return false
      }

      // Build a stable identity: prefer track.sid (LiveKit internal), fall back to
      // mediaStreamTrack.id, and guard against both being null (e.g. early lifecycle).
      const trackId = track.sid ?? track.mediaStreamTrack?.id ?? null
      if (trackId && attachedTrackIdRef.current === trackId && processorRef.current) {
        // Already attached to this exact track with an active processor — nothing to do
        return true
      }

      busyRef.current = true
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

        // Verify the processed track is actually live — on iPhone the
        // MediaStreamTrackProcessor fallback can stall if video element play()
        // is blocked (NotAllowedError). If the processedTrack is ended we
        // fall back to raw track instead of showing black.
        const outTrack = track.mediaStreamTrack
        if (outTrack?.readyState !== "live") {
          console.warn("[useCombinedProcessor] Processed track not live after setProcessor, falling back to raw")
          try { await track.stopProcessor() } catch {}
          processorRef.current = null
          attachedTrackRef.current = null
          attachedTrackIdRef.current = null
          setProcessorStatus("error")
          toast.error(
            t.rooms?.beauty?.attachFailed ||
              "Beauty effects unavailable — camera will continue without effects.",
            { id: "beauty-attach-failed" },
          )
          return true
        }

        console.log("[useCombinedProcessor] Processor attached to camera track")
        attachedTrackIdRef.current = track.sid ?? track.mediaStreamTrack?.id ?? null
        setProcessorStatus("attached")

        // Apply any beauty options the user set before joining
        const stored = readStoredBeautyOptions()
        if (stored) {
          await newProcessor
            .updateTransformerOptions({ beautyOptions: stored })
            .catch(() => {})
        }

        // Apply virtual background if active (use ref for latest value, handle
        // undefined = still loading -> skip, null = explicitly None -> disable).
        const currentBgUrl = activeBackgroundUrlRef.current
        if (currentBgUrl !== undefined) {
          const bgOptions = currentBgUrl
            ? { backgroundDisabled: false, imagePath: currentBgUrl, blurRadius: undefined }
            : { backgroundDisabled: true, imagePath: undefined, blurRadius: undefined }
          await newProcessor
            .updateTransformerOptions({ bgOptions })
            .catch(() => {})
        }
      } catch (err) {
        console.error("[useCombinedProcessor] Failed to attach processor:", err)
        await cleanupProcessor()
        attachedTrackRef.current = null
        attachedTrackIdRef.current = null
        setProcessorStatus("error")
        toast.error(
          t.rooms?.beauty?.attachFailed ||
            "Beauty effects unavailable — your device may not support video processing.",
          { id: "beauty-attach-failed" },
        )
      } finally {
        attachingRef.current = false
        busyRef.current = false
      }

      return true
    }

    // ── Camera enabled ────────────────────────────────────────────────
    if (isCameraEnabled) {
      // Try immediate attach first (handles the common case where the track
      // is already published by the time this effect runs).
      tryAttach().then((attached) => {
        if (!attached && !cancelled) {
          console.log("[useCombinedProcessor] Camera track not ready yet, waiting for trackPublished…")
          participant.on(ParticipantEvent.LocalTrackPublished, handleTrackPublished)
          participant.on("localTrackPublished", handleTrackPublished)
          participant.on("trackPublished", handleTrackPublished)

          // Safety timeout: if the track never appears, stop waiting
          timeoutId = setTimeout(() => {
            participant.off(ParticipantEvent.LocalTrackPublished, handleTrackPublished)
            participant.off("localTrackPublished", handleTrackPublished)
            participant.off("trackPublished", handleTrackPublished)
            if (!attachedTrackRef.current && !cancelled) {
              console.error("[useCombinedProcessor] Timed out waiting for camera track publication")
              setProcessorStatus("error")
              toast.error(
                t.rooms?.beauty?.trackTimeout ||
                  "Could not attach beauty effects — camera track not found.",
                { id: "beauty-track-timeout" },
              )
            }
          }, 10000)
        }
      })
    } else {
      // ── Camera disabled ───────────────────────────────────────────────
      // When the user turns off their camera, destroy the dead processor pipeline so the next enable gets a fresh one
      busyRef.current = false
      cleanupProcessor()
      attachedTrackRef.current = null
      attachedTrackIdRef.current = null
      attachingRef.current = false
      setProcessorStatus("idle")
    }

    return () => {
      cancelled = true
      if (timeoutId) clearTimeout(timeoutId)
      participant.off(ParticipantEvent.LocalTrackPublished, handleTrackPublished)
      participant.off("localTrackPublished", handleTrackPublished)
      participant.off("trackPublished", handleTrackPublished)
    }
  }, [isCameraEnabled, room.localParticipant, cleanupProcessor, activeBackgroundUrl, t])

  // ── Sync background URL from Redux into the processor ─────────────────────
  // Depends on processorStatus so that a bg already known before the
  // processor existed is applied after attach (previous bug: effect aborted
  // when processor null, then never retried because url didn't change).
  useEffect(() => {
    if (!processorRef.current) return
    if (activeBackgroundUrl === undefined) return // still loading

    let bgOptions
    if (activeBackgroundUrl) {
      bgOptions = { backgroundDisabled: false, imagePath: activeBackgroundUrl, blurRadius: undefined }
    } else {
      bgOptions = { backgroundDisabled: true, imagePath: undefined, blurRadius: undefined }
    }

    processorRef.current
      .updateTransformerOptions({ bgOptions })
      .catch((err) => console.error("[useCombinedProcessor] Failed to update bg:", err))
  }, [activeBackgroundUrl, processorStatus])

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
