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

  // Toggle mic — probes getUserMedia first to surface permission errors cleanly.
  const toggleAudio = useCallback(async () => {
    if (isTogglingMic) return
    setIsTogglingMic(true)
    try {
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
    } finally {
      setIsTogglingMic(false)
    }
  }, [room, isMicrophoneEnabled, t, isTogglingMic])

  // Toggle webcam — probes getUserMedia first to surface permission errors.
  const toggleVideo = useCallback(async () => {
    if (isTogglingCam) return
    setIsTogglingCam(true)
    try {
      if (!isCameraEnabled) {
        let probe = null
        try {
          probe = await navigator.mediaDevices.getUserMedia({ video: true })
        } finally {
          probe?.getTracks().forEach((tr) => tr.stop())
        }
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
