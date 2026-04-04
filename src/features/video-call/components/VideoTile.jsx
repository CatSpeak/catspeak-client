import { MicOff, VideoOff, MonitorUp } from "lucide-react"
import Avatar from "@/shared/components/ui/Avatar"
import { useEffect, useRef } from "react"
import { useIsSpeaking } from "@livekit/components-react"
import { Track } from "livekit-client"

/**
 * Renders a single participant's video tile using LiveKit.
 *
 * @param {{ participant: import('livekit-client').Participant }} props
 */
const VideoTile = ({ participant, onClick }) => {
  const isSpeaking = useIsSpeaking(participant)

  const displayName = participant.name || participant.identity || "?"
  const isLocal = participant.isLocal
  const micOn = participant.isMicrophoneEnabled
  const webcamOn = participant.isCameraEnabled
  const screenShareOn = participant.isScreenShareEnabled

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

  // For remote participants, also attach audio
  const micPub = participant.getTrackPublication(Track.Source.Microphone)
  const audioTrack = micPub?.track
  const audioRef = useRef(null)

  useEffect(() => {
    const el = audioRef.current
    if (!el || isLocal) return

    if (audioTrack) {
      audioTrack.attach(el)
    }

    return () => {
      if (audioTrack) {
        audioTrack.detach(el)
      }
    }
  }, [audioTrack, isLocal])

  return (
    <div
      onClick={onClick}
      className={`relative h-full w-full min-h-[100px] overflow-hidden rounded-lg bg-white border border-solid transition-[border-color,box-shadow] duration-200 ease-in-out [container-type:inline-size] ${
        isSpeaking
          ? "border-green-600 shadow-[0_0_15px_rgba(46,125,50,0.4)]"
          : "border-[#C6C6C6] shadow-sm"
      } ${onClick ? "cursor-pointer" : ""}`}
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

      {/* Hidden audio element for remote audio */}
      {!isLocal && (
        <audio
          ref={audioRef}
          autoPlay
          playsInline
          style={{ display: "none" }}
        />
      )}

      {/* Avatar fallback when no video */}
      {!isVideoVisible && (
        <div className="flex h-full w-full items-center justify-center">
          <Avatar
            size={64}
            name={displayName || "?"}
            speaking={isSpeaking}
            className="!w-[20cqi] !h-[20cqi] !max-w-[128px] !max-h-[128px] !min-w-[48px] !min-h-[48px] !text-[clamp(0.875rem,8cqi,2rem)]"
          />
        </div>
      )}

      {/* Name */}
      <div className="absolute bottom-3 left-3 flex max-w-[90%] items-center gap-2">
        <div className="min-w-0 truncate font-medium text-black text-sm">
          {displayName} {isLocal && "(You)"}
        </div>
      </div>

      {/* Mic / cam / screenshare status icons */}
      <div className="absolute top-3 right-3 flex items-center gap-3 drop-shadow-md">
        {screenShareOn && <MonitorUp size={20} className="text-yellow-500" />}
        {!micOn && <MicOff size={20} />}
        {!webcamOn && <VideoOff size={20} />}
      </div>
    </div>
  )
}

export default VideoTile
