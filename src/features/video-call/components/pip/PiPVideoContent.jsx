import { useRef, useEffect, useMemo } from "react"
import { Track } from "livekit-client"
import { useIsSpeaking } from "@livekit/components-react"
import { MonitorUp, MicOff, VideoOff } from "lucide-react"
import Avatar from "@/shared/components/ui/Avatar"
import { getParticipantTheme } from "@/features/video-call/utils/participantTheme"
import { useLanguage } from "@/shared/context/LanguageContext"

// ─── Dominant Speaker Video ─────────────────────────────────────────────────

const DominantVideo = ({ participant }) => {
  const videoRef = useRef(null)
  const isSpeaking = useIsSpeaking(participant)
  const { t } = useLanguage()

  const cameraPub = participant?.getTrackPublication?.(Track.Source.Camera)
  const cameraTrack = cameraPub?.track
  const webcamOn = participant?.isCameraEnabled
  const micOn = participant?.isMicrophoneEnabled
  const screenShareOn = participant?.isScreenShareEnabled
  const isVideoVisible = webcamOn && !!cameraTrack

  const isLocal = participant?.isLocal
  const displayName = participant?.name || participant?.identity || "?"

  const parseMetadata = (metadata) => {
    if (!metadata) return {}
    try {
      return JSON.parse(metadata)
    } catch {
      return {}
    }
  }

  const meta = parseMetadata(participant?.metadata)
  console.log("Participant Metadata [PiPVideoContent]:", meta)
  const avatarUrl = meta?.avatarUrl

  const theme = useMemo(
    () => getParticipantTheme(participant?.identity, displayName),
    [participant?.identity, displayName],
  )

  useEffect(() => {
    const el = videoRef.current
    if (!el || !cameraTrack) return
    cameraTrack.attach(el)
    return () => cameraTrack.detach(el)
  }, [cameraTrack])



  return (
    <div className="relative w-full h-full [container-type:inline-size]">
      {isVideoVisible ? (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted={isLocal}
          className="w-full h-full object-cover"
        />
      ) : (
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
          <div className={`${avatarUrl ? "relative z-10" : ""} flex items-center justify-center`}>
            <Avatar
              size={64}
              src={avatarUrl}
              name={displayName || "?"}
              speaking={isSpeaking}
              className={`!w-[20cqi] !h-[20cqi] !max-w-[128px] !max-h-[128px] !min-w-[48px] !min-h-[48px] !text-[clamp(0.875rem,8cqi,2rem)] !border-none ${
                avatarUrl ? "shadow-xl" : ""
              } ${theme.avatarClass}`}
            />
          </div>
        </div>
      )}

      {/* Bottom Controls Overlay */}
      <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between gap-1 pointer-events-none">
        {/* Status icons and Name */}
        <div className="flex min-w-0 items-center gap-1.5 rounded-full bg-black/40 px-2 py-1 text-white backdrop-blur-sm pointer-events-auto">
          <div className="flex flex-shrink-0 items-center gap-1">
            {screenShareOn && <MonitorUp size={14} />}
            {!micOn && <MicOff size={14} />}
            {!webcamOn && <VideoOff size={14} />}
          </div>
          <div className="min-w-0 truncate font-medium text-xs">
            {displayName}{" "}
            {isLocal &&
              (t?.rooms?.videoCall?.participantList?.youSuffix || "(You)")}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Screen Share Video ─────────────────────────────────────────────────────

const ScreenShareVideo = ({ trackRef }) => {
  const videoRef = useRef(null)

  useEffect(() => {
    const el = videoRef.current
    const track = trackRef?.publication?.track
    if (!el || !track) return
    track.attach(el)
    return () => track.detach(el)
  }, [trackRef?.publication?.track])

  return (
    <>
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="w-full h-full object-contain bg-[#111]"
      />
      <div
        style={{
          position: "absolute",
          top: 8,
          right: 8,
          pointerEvents: "none",
        }}
      >
        <MonitorUp size={14} className="text-yellow-400 drop-shadow" />
      </div>
    </>
  )
}

// ─── Composite: picks what to show ──────────────────────────────────────────

/**
 * Renders the appropriate video content for the PiP widget.
 *
 * Priority: screen share → dominant speaker → avatar fallback
 */
const PiPVideoContent = ({ activeScreenShare, dominant }) => {
  if (activeScreenShare) {
    return <ScreenShareVideo trackRef={activeScreenShare} />
  }

  if (dominant) {
    return <DominantVideo participant={dominant} />
  }

  const theme = getParticipantTheme("", "?")
  return (
    <div className="flex items-center justify-center w-full h-full bg-gradient-to-br from-[#2d2d2d] to-[#1a1a1a] [container-type:inline-size]" style={{ background: theme.bg }}>
      <Avatar
        size={64}
        name="?"
        className={`!w-[20cqi] !h-[20cqi] !max-w-[128px] !max-h-[128px] !min-w-[48px] !min-h-[48px] !text-[clamp(0.875rem,8cqi,2rem)] !border-none ${theme.avatarClass}`}
      />
    </div>
  )
}

export default PiPVideoContent
