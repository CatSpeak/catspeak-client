import { useRef, useEffect, useMemo } from "react"
import { Track } from "livekit-client"
import { useIsSpeaking } from "@livekit/components-react"
import { MonitorUp } from "lucide-react"
import Avatar from "@/shared/components/ui/Avatar"
import { getParticipantTheme } from "@/features/video-call/utils/participantTheme"

// ─── Dominant Speaker Video ─────────────────────────────────────────────────

const DominantVideo = ({ participant }) => {
  const videoRef = useRef(null)
  const isSpeaking = useIsSpeaking(participant)

  const cameraPub = participant?.getTrackPublication?.(Track.Source.Camera)
  const cameraTrack = cameraPub?.track
  const webcamOn = participant?.isCameraEnabled
  const isVideoVisible = webcamOn && !!cameraTrack

  const isLocal = participant?.isLocal
  const displayName = participant?.name || participant?.identity || "?"

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
    <>
      {isVideoVisible ? (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted={isLocal}
          className="pip-video"
        />
      ) : (
        <div className="pip-avatar-fallback" style={{ background: theme.bg }}>
          <Avatar size={48} name={displayName} speaking={isSpeaking} className={`!border-none ${theme.avatarClass}`} />
        </div>
      )}


    </>
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
        className="pip-video"
        style={{ objectFit: "contain", background: "#111" }}
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
    <div className="pip-avatar-fallback" style={{ background: theme.bg }}>
      <Avatar size={48} name="?" className={`!border-none ${theme.avatarClass}`} />
    </div>
  )
}

export default PiPVideoContent
