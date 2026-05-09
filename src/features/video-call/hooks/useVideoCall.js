import { useCallback, useState } from "react"
import {
  useRoomContext,
  useLocalParticipant,
  useConnectionState,
} from "@livekit/components-react"
import { ConnectionState, Track } from "livekit-client"
import toast from "react-hot-toast"
import { useGetCurrentBackgroundQuery } from "@/store/api/authApi"
import { useEffect, useRef } from "react"
import { BackgroundProcessor, supportsBackgroundProcessors } from "@livekit/track-processors"

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

  const [isTogglingMic, setIsTogglingMic] = useState(false)
  const [isTogglingCam, setIsTogglingCam] = useState(false)

  // -- Virtual Background Logic --
  const { data: bgData } = useGetCurrentBackgroundQuery()
  const virtualBackgroundUrl = bgData?.data?.activeBackgroundUrl

  // Parse LiveKit token metadata as a fallback for initial join
  let initialBgUrl = null
  try {
    const meta = JSON.parse(room.localParticipant.metadata || "{}")
    initialBgUrl = meta.virtualBackgroundUrl || meta.VirtualBackgroundUrl || meta.virtualbackgroundurl
  } catch (e) {
    // Ignore JSON parse errors
  }

  const activeBgUrl = virtualBackgroundUrl !== undefined ? virtualBackgroundUrl : initialBgUrl
  const processorRef = useRef(null)
  const processedTrackRef = useRef(null)

  // 1. Initialize processor
  if (!processorRef.current && supportsBackgroundProcessors()) {
    processorRef.current = BackgroundProcessor({ mode: "disabled" })
  }

  // 2. Attach processor to track when camera is enabled
  useEffect(() => {
    if (!processorRef.current || !isCameraEnabled) return

    const pub = room.localParticipant.getTrackPublication(Track.Source.Camera)
    const track = pub?.track

    if (track && processedTrackRef.current !== track) {
      processedTrackRef.current = track
      track.setProcessor(processorRef.current).catch((err) => {
        console.error("Failed to attach processor to track:", err)
      })
    }
  }, [isCameraEnabled, room.localParticipant])

  // 3. Switch mode when active background URL changes
  useEffect(() => {
    const updateMode = async () => {
      if (!processorRef.current) return

      try {
        if (activeBgUrl) {
          await processorRef.current.switchTo({
            mode: "virtual-background",
            imagePath: activeBgUrl,
          })
        } else {
          await processorRef.current.switchTo({ mode: "disabled" })
        }
      } catch (err) {
        console.error("Failed to apply virtual background:", err)
      }
    }

    updateMode()
  }, [activeBgUrl])
  // -----------------------------

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
  }
}
