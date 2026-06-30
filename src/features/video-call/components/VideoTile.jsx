import { Mic, MicOff, Video, VideoOff, MonitorUp, Hand } from "lucide-react"
import { useEffect, useRef, useReducer, useMemo } from "react"
import { useIsSpeaking } from "@livekit/components-react"
import { Track, ParticipantEvent } from "livekit-client"
import { motion } from "framer-motion"

import { getParticipantTheme } from "@/features/video-call/utils/participantTheme"
import { useLanguage } from "@/shared/context/LanguageContext"

/**
 * Maps user theme to Figma-style pastel background colors for tile bg.
 */
const THEME_BG_MAP = {
  "#DC2626": "#FFFBFC", // Red → light pink-white
  "#EA580C": "#FFF2EA", // Orange → light orange
  "#D97706": "#FFFBEA", // Yellow → light yellow
  "#16A34A": "#F1FFF8", // Green → light green
  "#2563EB": "#E8F2FF", // Blue → light blue
  "#4F46E5": "#EDE9FE", // Indigo → light indigo
  "#9333EA": "#F3E8FF", // Purple → light purple
  "#DB2777": "#FDF3FF", // Pink → light pink
  "#0D9488": "#F0FDFA", // Teal → light teal
  "#0284C7": "#E0F2FE", // Sky → light sky
  "#0891B2": "#ECFEFF", // Cyan → light cyan
  "#65A30D": "#F7FEE7", // Lime → light lime
  "#059669": "#ECFDF5", // Emerald → light emerald
  "#C026D3": "#FDF4FF", // Fuchsia → light fuchsia
  "#E11D48": "#FFF1F2", // Rose → light rose
  "#7C3AED": "#F5F3FF", // Violet → light violet
}

/**
 * Maps user theme to info pill border/bg colors.
 */
const THEME_PILL_MAP = {
  "#DC2626": { bg: "rgba(123,121,121,0.2)", border: "#7b7979" },
  "#EA580C": { bg: "rgba(255,175,122,0.2)", border: "#ffaf7a" },
  "#D97706": { bg: "rgba(194,158,19,0.2)", border: "#c29e13" },
  "#16A34A": { bg: "rgba(75,208,138,0.2)", border: "#4bd08a" },
  "#2563EB": { bg: "rgba(69,150,255,0.2)", border: "#4596ff" },
  "#4F46E5": { bg: "rgba(99,102,241,0.2)", border: "#6366f1" },
  "#9333EA": { bg: "rgba(168,85,247,0.2)", border: "#a855f7" },
  "#DB2777": { bg: "rgba(230,130,243,0.2)", border: "#e682f3" },
  "#0D9488": { bg: "rgba(20,184,166,0.2)", border: "#14b8a6" },
  "#0284C7": { bg: "rgba(56,189,248,0.2)", border: "#38bdf8" },
  "#0891B2": { bg: "rgba(6,182,212,0.2)", border: "#06b6d4" },
  "#65A30D": { bg: "rgba(132,204,22,0.2)", border: "#84cc16" },
  "#059669": { bg: "rgba(16,185,129,0.2)", border: "#10b981" },
  "#C026D3": { bg: "rgba(192,38,211,0.2)", border: "#c026d3" },
  "#E11D48": { bg: "rgba(255,161,171,0.2)", border: "#ffa1ab" },
  "#7C3AED": { bg: "rgba(124,58,237,0.2)", border: "#7c3aed" },
}

const DEFAULT_PILL = { bg: "rgba(123,121,121,0.2)", border: "#7b7979" }

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
