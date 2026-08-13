import { useCallback, useState } from "react"
import {
  useRoomContext,
  useLocalParticipant,
  useConnectionState,
} from "@livekit/components-react"
import { ConnectionState } from "livekit-client"
import { useCombinedProcessor } from "@/features/video-call/processors/useCombinedProcessor"
import { unlockAudioContext } from "@/shared/utils/audioUnlockUtils"

/**
 * Handles local mic/cam state + toggle actions using LiveKit.
 * Connection lifecycle is managed by <LiveKitRoom> — no manual join/leave.
 * Background and beauty processing is managed by useCombinedProcessor.
 *
 * @param {Object} t - Translation object (from useLanguage)
 */
export const useVideoCall = (t) => {
  const room = useRoomContext()
  const { isMicrophoneEnabled, isCameraEnabled } = useLocalParticipant()
  const connectionState = useConnectionState()

  const isJoined = connectionState === ConnectionState.Connected

  const [isTogglingMic, setIsTogglingMic] = useState(false)
  const [isTogglingCam, setIsTogglingCam] = useState(false)

  const { switchBeauty, processorStatus } = useCombinedProcessor()

  // Toggle mic — direct LiveKit activation with WebAudio unlock for iOS Safari
  const toggleAudio = useCallback(async () => {
    if (isTogglingMic) return
    setIsTogglingMic(true)

    try {
      unlockAudioContext()
      if (room?.startAudio) {
        await room.startAudio().catch((err) =>
          console.warn("[useVideoCall] startAudio warning:", err),
        )
      }
      await room.localParticipant.setMicrophoneEnabled(!isMicrophoneEnabled)
    } catch (err) {
      console.error("[useVideoCall] Mic toggle failed:", err?.name, err?.message, err)
      throw err
    } finally {
      setIsTogglingMic(false)
    }
  }, [room, isMicrophoneEnabled, isTogglingMic])

  // Toggle webcam — direct LiveKit activation with WebAudio unlock for iOS Safari
  const toggleVideo = useCallback(async () => {
    if (isTogglingCam) return
    setIsTogglingCam(true)

    try {
      unlockAudioContext()
      if (room?.startAudio) {
        await room.startAudio().catch((err) =>
          console.warn("[useVideoCall] startAudio warning:", err),
        )
      }
      await room.localParticipant.setCameraEnabled(!isCameraEnabled)
    } catch (err) {
      console.error("[useVideoCall] Cam toggle failed:", err?.name, err?.message, err)
      throw err
    } finally {
      setIsTogglingCam(false)
    }
  }, [room, isCameraEnabled, isTogglingCam])

  const leaveMeeting = useCallback(async () => {
    await room.disconnect()
  }, [room])

  return {
    micOn: isMicrophoneEnabled ?? false,
    cameraOn: isCameraEnabled ?? false,
    isTogglingMic,
    isTogglingCam,
    toggleAudio,
    toggleVideo,
    leaveMeeting,
    isJoined,
    switchBeauty,
    processorStatus,
  }
}
