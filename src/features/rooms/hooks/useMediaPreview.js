import { useState, useEffect, useRef } from "react"
import { toast } from "react-hot-toast"
import { useLanguage } from "@/shared/context/LanguageContext"
import { handleMediaError } from "@/shared/utils/mediaErrorUtils"
import { useGetCurrentBackgroundQuery } from "@/store/api/userApi"
import { LocalVideoTrack } from "livekit-client"
import {
  BackgroundProcessor,
  supportsBackgroundProcessors,
} from "@livekit/track-processors"

export const useMediaPreview = ({ audioDeviceId, videoDeviceId } = {}) => {
  const { t } = useLanguage()
  const [micOn, setMicOn] = useState(false)
  const [cameraOn, setCameraOn] = useState(false)
  const [localStream, setLocalStream] = useState(null)

  const streamRef = useRef(null)
  const lkVideoTrackRef = useRef(null)
  const rawVideoTrackRef = useRef(null)
  const processorRef = useRef(null)

  const { data: bgData } = useGetCurrentBackgroundQuery()
  const virtualBackgroundUrl = bgData?.data?.activeBackgroundUrl

  // Update background if it changes
  useEffect(() => {
    const updateBg = async () => {
      if (!processorRef.current) return
      try {
        if (virtualBackgroundUrl) {
          await processorRef.current.switchTo({
            mode: "virtual-background",
            imagePath: virtualBackgroundUrl,
          })
        } else {
          await processorRef.current.switchTo({ mode: "disabled" })
        }
      } catch (err) {
        console.error("Failed to update background processor:", err)
      }
    }
    updateBg()
  }, [virtualBackgroundUrl])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach((t) => t.stop())
      if (processorRef.current?.destroy) processorRef.current.destroy()
      if (lkVideoTrackRef.current) lkVideoTrackRef.current.stop()
      if (rawVideoTrackRef.current) rawVideoTrackRef.current.stop()
    }
  }, [])

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
        constraints.audio = customAudioId
          ? { deviceId: { exact: customAudioId } }
          : true
      }
      if (video) {
        constraints.video = customVideoId
          ? { deviceId: { exact: customVideoId } }
          : true
      }
      const stream = await navigator.mediaDevices.getUserMedia(constraints)

      // When another app (e.g. Google Meet) holds exclusive mic access,
      // getUserMedia succeeds but the audio track's `muted` property is true
      // — meaning no audio data is flowing from the hardware.
      if (audio && device === "mic") {
        const audioTrack = stream.getAudioTracks()[0]
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
            console.warn(
              "[useMediaPreview] 🔇 Mic track is muted — another app likely holds exclusive access",
            )
            stream.getTracks().forEach((t) => t.stop())
            toast.error(
              t.rooms?.waitingScreen?.micInUse ??
                "Microphone is in use by another app.",
            )
            return null
          }
        }
      }

      // Apply virtual background to video track
      if (video && supportsBackgroundProcessors()) {
        const rawVideoTrack = stream.getVideoTracks()[0]
        if (rawVideoTrack) {
          if (lkVideoTrackRef.current) lkVideoTrackRef.current.stop()
          if (rawVideoTrackRef.current) rawVideoTrackRef.current.stop()

          rawVideoTrackRef.current = rawVideoTrack

          const lkTrack = new LocalVideoTrack(rawVideoTrack)
          lkVideoTrackRef.current = lkTrack

          if (!processorRef.current) {
            processorRef.current = BackgroundProcessor({ mode: "disabled" })
          }

          await lkTrack.setProcessor(processorRef.current)

          if (virtualBackgroundUrl) {
            await processorRef.current.switchTo({
              mode: "virtual-background",
              imagePath: virtualBackgroundUrl,
            })
          }

          stream.removeTrack(rawVideoTrack)
          stream.addTrack(lkTrack.mediaStreamTrack)
        }
      }

      if (!streamRef.current) {
        streamRef.current = new MediaStream()
      }

      // If we're fetching a new device for an active stream, we should not duplicate tracks.
      // We will handle track replacement in the callers (useEffect or toggleMic/toggleCamera).

      return stream
    } catch (err) {
      handleMediaError(err, device === "mic" ? "mic" : "camera", t)
      return null
    }
  }

  // Toggle mic
  const toggleMic = async () => {
    let audioTracks = streamRef.current?.getAudioTracks() || []

    if (audioTracks.length === 0) {
      const stream = await getMediaStream({
        audio: true,
        video: false,
        device: "mic",
        customAudioId: audioDeviceId,
      })
      audioTracks = stream?.getAudioTracks() || []

      if (stream) {
        if (!streamRef.current) streamRef.current = new MediaStream()
        audioTracks.forEach((t) => streamRef.current.addTrack(t))
        setLocalStream(new MediaStream(streamRef.current.getTracks()))
      }
    }

    if (audioTracks.length === 0) return false

    setMicOn((prev) => {
      const next = !prev

      if (next) {
        audioTracks.forEach((t) => (t.enabled = true))
      } else {
        // Stop mic tracks completely if turning off
        audioTracks.forEach((t) => t.stop())
        // Remove stopped tracks from streamRef
        streamRef.current = new MediaStream(
          streamRef.current.getVideoTracks(), // keep only video
        )
        setLocalStream(streamRef.current)
      }

      return next
    })

    return true
  }

  // Toggle camera
  const toggleCamera = async () => {
    let videoTracks = streamRef.current?.getVideoTracks() || []

    if (videoTracks.length === 0) {
      const stream = await getMediaStream({
        audio: false,
        video: true,
        device: "camera",
        customVideoId: videoDeviceId,
      })
      videoTracks = stream?.getVideoTracks() || []

      if (stream) {
        if (!streamRef.current) streamRef.current = new MediaStream()
        videoTracks.forEach((t) => streamRef.current.addTrack(t))
        setLocalStream(new MediaStream(streamRef.current.getTracks()))
      }
    }

    if (videoTracks.length === 0) return false

    setCameraOn((prev) => {
      const next = !prev

      if (next) {
        videoTracks.forEach((t) => (t.enabled = true))
      } else {
        videoTracks.forEach((t) => t.stop())

        if (lkVideoTrackRef.current) {
          lkVideoTrackRef.current.stop()
          lkVideoTrackRef.current = null
        }

        if (rawVideoTrackRef.current) {
          rawVideoTrackRef.current.stop()
          rawVideoTrackRef.current = null
        }

        // Remove stopped tracks from streamRef
        streamRef.current = new MediaStream(
          streamRef.current.getAudioTracks(), // keep only mic
        )
        setLocalStream(streamRef.current)
      }

      return next
    })

    return true
  }

  // Handle device changes on the fly
  useEffect(() => {
    if (micOn && audioDeviceId) {
      ;(async () => {
        const stream = await getMediaStream({
          audio: true,
          video: false,
          device: "mic",
          customAudioId: audioDeviceId,
        })
        if (stream) {
          const oldAudio = streamRef.current?.getAudioTracks() || []
          oldAudio.forEach((t) => {
            t.stop()
            streamRef.current.removeTrack(t)
          })
          stream.getAudioTracks().forEach((t) => streamRef.current.addTrack(t))
          setLocalStream(new MediaStream(streamRef.current.getTracks()))
        }
      })()
    }
  }, [audioDeviceId])

  useEffect(() => {
    if (cameraOn && videoDeviceId) {
      ;(async () => {
        const stream = await getMediaStream({
          audio: false,
          video: true,
          device: "camera",
          customVideoId: videoDeviceId,
        })
        if (stream) {
          const oldVideo = streamRef.current?.getVideoTracks() || []
          oldVideo.forEach((t) => {
            t.stop()
            streamRef.current.removeTrack(t)
          })
          stream.getVideoTracks().forEach((t) => streamRef.current.addTrack(t))
          setLocalStream(new MediaStream(streamRef.current.getTracks()))
        }
      })()
    }
  }, [videoDeviceId])

  return {
    micOn,
    cameraOn,
    localStream,
    lkVideoTrack: lkVideoTrackRef.current,
    toggleMic,
    toggleCamera,
  }
}
