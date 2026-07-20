import { MicOff, VideoOff, MonitorUp, Hand } from "lucide-react"
import Avatar from "@/shared/components/ui/Avatar"
import { useEffect, useRef, useReducer, useMemo } from "react"
import { useIsSpeaking } from "@livekit/components-react"
import { Track, ParticipantEvent } from "livekit-client"
import { motion } from "framer-motion"

import { getParticipantTheme } from "@/features/video-call/utils/participantTheme"
import { useLanguage } from "@/shared/context/LanguageContext"

/**
 * Renders a single participant's video tile using LiveKit.
 *
 * Subscribes to participant track events so that when tracks are
 * renegotiated (e.g. during screen-share) the audio/video elements
 * are re-attached to the current, live track objects.
 *
 * @param {{ participant: import('livekit-client').Participant }} props
 */
const VideoTile = ({ participant, onClick }) => {
  const { t } = useLanguage()
  const isSpeaking = useIsSpeaking(participant)

  // Force re-render whenever tracks change on this participant so that
  // getTrackPublication() returns the latest track references.
  const [, forceUpdate] = useReducer((x) => x + 1, 0)

  useEffect(() => {
    const events = [
      ParticipantEvent.TrackSubscribed,
      ParticipantEvent.TrackUnsubscribed,
      ParticipantEvent.TrackMuted,
      ParticipantEvent.TrackUnmuted,
      ParticipantEvent.TrackPublished,
      ParticipantEvent.TrackUnpublished,
      ParticipantEvent.MetadataChanged,
    ]

    events.forEach((evt) => participant.on(evt, forceUpdate))

    return () => {
      events.forEach((evt) => participant.off(evt, forceUpdate))
    }
  }, [participant])

  const displayName = participant.name || participant.identity || "?"
  const isLocal = participant.isLocal
  const micOn = participant.isMicrophoneEnabled
  const webcamOn = participant.isCameraEnabled
  const screenShareOn = participant.isScreenShareEnabled

  const parseMetadata = (metadata) => {
    if (!metadata) return {}
    try {
      return JSON.parse(metadata)
    } catch {
      return {}
    }
  }
  const meta = parseMetadata(participant.metadata)
  // console.log("Participant Metadata [VideoTile]:", meta)
  const isHandRaised = meta.handRaised === true
  const avatarUrl = meta.avatarImageUrl

  const theme = useMemo(
    () => getParticipantTheme(participant.identity),
    [participant.identity],
  )

  // Get the camera track publication
  const cameraPub = participant.getTrackPublication(Track.Source.Camera)
  const cameraTrack = cameraPub?.track
  const isVideoVisible = webcamOn && !!cameraTrack

  const videoRef = useRef(null)

  // Attach / detach the camera track to the <video> element
  useEffect(() => {
    const el = videoRef.current
    if (!el) return

    if (cameraTrack) {
      cameraTrack.attach(el)
    }

    return () => {
      if (cameraTrack) {
        cameraTrack.detach(el)
      }
    }
  }, [cameraTrack])

  return (
    <div
      onClick={onClick}
      className={`group relative h-full w-full min-h-[100px] overflow-hidden rounded-xl transition-all duration-200 ease-in-out [container-type:inline-size] ${isVideoVisible ? "bg-neutral-900" : ""
        } ${onClick ? "cursor-pointer" : ""}`}
    >
      {/* Speaking Indicator Overlay */}
      <div
        className={`pointer-events-none absolute inset-0 z-10 rounded-2xl transition-all duration-200 ${isSpeaking
          ? "border-2 border-solid border-[#3D9E60] ring-1 ring-inset ring-[#F3F3F3]"
          : "border-2 border-solid border-transparent shadow-sm"
          }`}
      />
      {/* Video element for camera track */}
      <video
        autoPlay
        playsInline
        muted={isLocal}
        ref={videoRef}
        className={`h-full w-full object-contain ${isVideoVisible ? "block" : "hidden"
          }`}
      />

      {/* Avatar fallback when no video */}
      {!webcamOn && (
        <div
          className={`flex h-full w-full items-center justify-center ${avatarUrl ? "relative overflow-hidden" : ""}`}
          style={{ background: theme.bg }}
        >
          {avatarUrl && (
            <>
              <div className="absolute inset-0 z-0 bg-neutral-900" />
              <img
                src={avatarUrl}
                alt=""
                className="absolute inset-0 z-0 h-full w-full object-cover blur-[40px] scale-125 opacity-60"
                onError={(e) => {
                  e.target.style.display = "none"
                  e.target.previousSibling.style.display = "none"
                }}
              />
            </>
          )}
          <div
            className={`${avatarUrl ? "relative z-10" : ""} flex items-center justify-center`}
          >
            <Avatar
              size={64}
              name={displayName || "?"}
              src={avatarUrl}
              speaking={false}
              className={`!w-[20cqi] !h-[20cqi] !max-w-[128px] !max-h-[128px] !min-w-[48px] !min-h-[48px] !text-[clamp(0.875rem,8cqi,2rem)] !border-none ${avatarUrl ? "shadow-xl" : ""
                } ${theme.avatarClass}`}
            />
          </div>
        </div>
      )}

      {/* Bottom Controls Overlay */}
      <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between gap-1 pointer-events-none z-20">
        {/* Status icons and Name */}
        <div className="flex min-w-0 items-center gap-1.5 rounded-full bg-black/40 px-3 py-2 text-white backdrop-blur-sm pointer-events-auto">
          <div className="flex flex-shrink-0 items-center gap-1">
            {screenShareOn && <MonitorUp size={16} />}
            {!micOn && <MicOff size={16} />}
            {!webcamOn && <VideoOff size={16} />}
          </div>
          <div className="min-w-0 truncate font-medium text-sm">
            {displayName}{" "}
            {isLocal &&
              (t.rooms?.videoCall?.participantList?.youSuffix || "(You)")}
          </div>
        </div>

        {/* Raised Hand Icon */}
        {isHandRaised && (
          <div className="flex shrink-0 h-9 w-9 items-center justify-center rounded-full bg-yellow-500/90 text-white shadow-md backdrop-blur-sm pointer-events-auto">
            <motion.div
              animate={{ rotate: [0, 20, -10, 20, -10, 0] }}
              transition={{
                repeat: Infinity,
                duration: 1.5,
                ease: "easeInOut",
                repeatDelay: 1,
              }}
              style={{ originX: 0.7, originY: 0.7 }}
              className="flex flex-shrink-0 items-center justify-center"
            >
              <Hand size={16} />
            </motion.div>
          </div>
        )}
      </div>
    </div>
  )
}

export default VideoTile
