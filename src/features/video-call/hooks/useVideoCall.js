import { useCallback, useState } from "react"
import {
  useRoomContext,
  useLocalParticipant,
  useConnectionState,
} from "@livekit/components-react"
import { ConnectionState } from "livekit-client"
import toast from "react-hot-toast"
import { useCombinedProcessor } from "@/features/video-call/processors/useCombinedProcessor"

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
      if (room?.startAudio) {
        await room.startAudio().catch(() => {})
      }
      await room.localParticipant.setMicrophoneEnabled(!isMicrophoneEnabled)
    } finally {
      setIsTogglingMic(false)
    }
  }, [room, isMicrophoneEnabled, isTogglingMic])

  // Toggle webcam — direct LiveKit activation with WebAudio unlock for iOS Safari
  const toggleVideo = useCallback(async () => {
    if (isTogglingCam) return
    setIsTogglingCam(true)

    try {
      if (room?.startAudio) {
        await room.startAudio().catch(() => {})
      }
      await room.localParticipant.setCameraEnabled(!isCameraEnabled)
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
