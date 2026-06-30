import { Mic, MicOff, Video, VideoOff, MonitorUp, Hand } from "lucide-react"
import { useEffect, useRef, useReducer, useMemo } from "react"
import { useIsSpeaking } from "@livekit/components-react"
import { Track, ParticipantEvent } from "livekit-client"
import { motion } from "framer-motion"

import { getParticipantTheme } from "@/features/video-call/utils/participantTheme"
import { THEME_BG_MAP, THEME_PILL_MAP, DEFAULT_PILL } from "@/features/video-call/utils/videoTileConstants"
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
  const isHandRaised = meta.handRaised === true
  const avatarUrl = meta.avatarUrl

  const theme = useMemo(
    () => getParticipantTheme(participant.identity),
    [participant.identity],
  )

  // Derive pastel tile background and pill colors from the theme gradient
  const tileBg = useMemo(() => {
    const gradientColor = theme.bg.match(/#[0-9A-Fa-f]{6}/)?.[0]
    return THEME_BG_MAP[gradientColor] || "#FFFBFC"
  }, [theme.bg])

  const pillStyle = useMemo(() => {
    const gradientColor = theme.bg.match(/#[0-9A-Fa-f]{6}/)?.[0]
    return THEME_PILL_MAP[gradientColor] || DEFAULT_PILL
  }, [theme.bg])

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
      className={`group relative h-full w-full min-h-[100px] overflow-hidden rounded-xl transition-all duration-200 ease-in-out drop-shadow-[0px_2px_1px_rgba(0,0,0,0.25)] ${
        isSpeaking && webcamOn
          ? "ring-2 ring-[#3D9E60] ring-inset"
          : isHandRaised
            ? "ring-[1.5px] ring-[#f3b403] ring-inset"
            : "ring-0 ring-transparent"
      } ${onClick ? "cursor-pointer" : ""}`}
      style={{
        background: isVideoVisible ? undefined : tileBg,
      }}
    >
      {/* Video element for camera track */}
      <video
        autoPlay
        playsInline
        muted={isLocal}
        ref={videoRef}
        className={`h-full w-full object-cover ${
          isVideoVisible ? "block" : "hidden"
        }`}
      />

      {/* Avatar fallback when no video */}
      {!webcamOn && (
        <div className="flex h-full w-full items-center justify-center">
          <div
            className="flex items-center justify-center rounded-full"
            style={{
              width: 45,
              height: 45,
              background: theme.bg,
            }}
          >
            <span
              className="font-bold text-white"
              style={{ fontSize: 16, lineHeight: 1.4 }}
            >
              {(displayName || "?").charAt(0).toUpperCase()}
            </span>
          </div>
        </div>
      )}

      {/* Raised Hand Icon — top right */}
      {isHandRaised && (
        <div className="absolute top-1 right-1 flex shrink-0 items-end p-1 rounded-full bg-[#f3b403] pointer-events-auto z-50">
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
            <Hand size={16} className="text-white" />
          </motion.div>
        </div>
      )}

      {/* Bottom Info Pill */}
      <div className="absolute bottom-1.5 left-2 right-2 flex items-center pointer-events-none">
        <div
          className="flex items-center gap-1.5 px-1 py-0.5 rounded-full pointer-events-auto"
          style={{
            background: pillStyle.bg,
            border: `0.2px solid ${pillStyle.border}`,
          }}
        >
          <div className="flex flex-shrink-0 items-center gap-1">
            {screenShareOn && (
              <MonitorUp size={16} className="text-[#1a1a1a]" />
            )}
            {micOn ? (
              <Mic size={16} className="text-[#1a1a1a]" />
            ) : (
              <MicOff size={16} className="text-[#1a1a1a]" />
            )}
            {webcamOn ? (
              <Video size={16} className="text-[#1a1a1a]" />
            ) : (
              <VideoOff size={16} className="text-[#1a1a1a]" />
            )}
          </div>
          <span className="text-xs font-medium text-[#1a1a1a] whitespace-nowrap leading-[1.4]">
            {displayName}
            {isLocal && (t.rooms?.videoCall?.participantList?.youSuffix || " (You)")}
          </span>
        </div>
      </div>
    </div>
  )
}

export default VideoTile
