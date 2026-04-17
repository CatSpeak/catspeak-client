import { useCallback } from "react"
import {
  useRoomContext,
  useLocalParticipant,
  useConnectionState,
} from "@livekit/components-react"
import { ConnectionState } from "livekit-client"
import toast from "react-hot-toast"

/**
 * Handles local mic/cam state + toggle actions using LiveKit.
 * Connection lifecycle is managed by <LiveKitRoom> — no manual join/leave.
 *
 * @param {Object} t - Translation object (from useLanguage)
 */
export const useVideoCall = (t) => {
  const room = useRoomContext()
  const { isMicrophoneEnabled, isCameraEnabled } = useLocalParticipant()
  const connectionState = useConnectionState()

  const isJoined = connectionState === ConnectionState.Connected

  // Toggle mic — probes getUserMedia first to surface permission errors cleanly.
  const toggleAudio = useCallback(async () => {
    if (!isMicrophoneEnabled) {
      let probe = null
      try {
        probe = await navigator.mediaDevices.getUserMedia({ audio: true })
        const audioTrack = probe.getAudioTracks()[0]

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
            toast.error(
              t?.rooms?.waitingScreen?.micInUse ??
                "Microphone is in use by another app.",
            )
            return
          }
        }
      } finally {
        probe?.getTracks().forEach((tr) => tr.stop())
      }
    }

    await room.localParticipant.setMicrophoneEnabled(!isMicrophoneEnabled)
  }, [room, isMicrophoneEnabled, t])

  // Toggle webcam — probes getUserMedia first to surface permission errors.
  const toggleVideo = useCallback(async () => {
    if (!isCameraEnabled) {
      let probe = null
      try {
        probe = await navigator.mediaDevices.getUserMedia({ video: true })
      } finally {
        probe?.getTracks().forEach((tr) => tr.stop())
      }
    }

    await room.localParticipant.setCameraEnabled(!isCameraEnabled)
  }, [room, isCameraEnabled])

  const leaveMeeting = useCallback(async () => {
    await room.disconnect()
  }, [room])

  return {
    micOn: isMicrophoneEnabled ?? false,
    cameraOn: isCameraEnabled ?? false,
    toggleAudio,
    toggleVideo,
    leaveMeeting,
    isJoined,
  }
}
