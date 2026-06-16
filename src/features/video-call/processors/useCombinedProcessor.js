// src/features/video-call/processors/useCombinedProcessor.js
import { useRef, useEffect, useCallback } from "react"
import { supportsBackgroundProcessors, ProcessorWrapper } from "@livekit/track-processors"
import { useRoomContext, useLocalParticipant } from "@livekit/components-react"
import { Track } from "livekit-client"
import { useGetCurrentBackgroundQuery } from "@/store/api/userApi"
import { CombinedVideoTransformer } from "./CombinedVideoTransformer"

/**
 * Owns the single ProcessorWrapper<CombinedVideoTransformer> for the active call.
 *
 * - Attaches the processor to the camera track when it becomes available.
 * - Watches the user's saved background URL (from Redux) and applies it automatically.
 * - Exposes switchBeauty() for the beauty toggle UI.
 *
 * Returns no-op functions on browsers that don't support track processors.
 */
export const useCombinedProcessor = () => {
  const room = useRoomContext()
  const { isCameraEnabled } = useLocalParticipant()
  const processorRef = useRef(null)
  const attachedTrackRef = useRef(null)

  const { data: bgData } = useGetCurrentBackgroundQuery()
  const activeBackgroundUrl = bgData?.data?.activeBackgroundUrl ?? null

  // Initialize processor once on mount and destroy on unmount
  useEffect(() => {
    if (supportsBackgroundProcessors()) {
      processorRef.current = new ProcessorWrapper(
        new CombinedVideoTransformer(),
        "combined-video-processor",
      )
    }
    return () => {
      processorRef.current?.destroy().catch(() => {})
      processorRef.current = null
    }
  }, [])

  // Attach processor to the camera track when camera is enabled
  useEffect(() => {
    if (!processorRef.current || !isCameraEnabled) return

    const pub = room.localParticipant.getTrackPublication(Track.Source.Camera)
    const track = pub?.track

    if (track && attachedTrackRef.current !== track) {
      attachedTrackRef.current = track
      track.setProcessor(processorRef.current).catch((err) => {
        console.error("[useCombinedProcessor] Failed to attach processor:", err)
      })
    }
  }, [isCameraEnabled, room.localParticipant])

  // Sync background URL from Redux into the processor
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

  const switchBeauty = useCallback((beautyOptions) => {
    if (!processorRef.current) return
    processorRef.current
      .updateTransformerOptions({ beautyOptions })
      .catch((err) => console.error("[useCombinedProcessor] Failed to update beauty:", err))
  }, [])

  return { switchBeauty }
}
