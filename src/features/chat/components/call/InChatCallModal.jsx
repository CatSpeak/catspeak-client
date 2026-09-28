import { useState, useEffect, useRef } from "react"
import {
  LiveKitRoom,
  RoomAudioRenderer,
  useParticipants,
  useLocalParticipant,
  useIsSpeaking,
} from "@livekit/components-react"
import {
  PhoneOff,
  Mic,
  MicOff,
  Video,
  VideoOff,
  Minimize2,
  Maximize2,
  Users,
} from "lucide-react"
import Avatar from "@/shared/components/ui/Avatar"
import { getParticipantTheme } from "@/features/video-call/utils/participantTheme"
import { useLanguage } from "@/shared/context/LanguageContext"
import toast from "react-hot-toast"

/**
 * ParticipantVideoTile — Renders camera video or fallback avatar for each participant.
 */
const ParticipantVideoTile = ({ participant, isLocal = false }) => {
  const videoRef = useRef(null)
  const isSpeaking = useIsSpeaking(participant)
  const theme = getParticipantTheme(participant.identity || participant.name || "")
  const [hasVideo, setHasVideo] = useState(false)

  useEffect(() => {
    if (!participant) return

    let currentTrack = null
    const videoEl = videoRef.current

    const checkTrack = () => {
      const pub = Array.from(participant.videoTrackPublications.values())[0]
      if (pub && pub.track && !pub.isMuted) {
        currentTrack = pub.track
        if (videoEl) {
          currentTrack.attach(videoEl)
          setHasVideo(true)
        }
      } else {
        setHasVideo(false)
      }
    }

    checkTrack()

    // Listen to track state changes
    participant.on("trackSubscribed", checkTrack)
    participant.on("trackUnsubscribed", checkTrack)
    participant.on("trackMuted", checkTrack)
    participant.on("trackUnmuted", checkTrack)

    return () => {
      participant.off("trackSubscribed", checkTrack)
      participant.off("trackUnsubscribed", checkTrack)
      participant.off("trackMuted", checkTrack)
      participant.off("trackUnmuted", checkTrack)
      if (currentTrack && videoEl) {
        currentTrack.detach(videoEl)
      }
    }
  }, [participant])

  return (
    <div
      className={`relative w-full h-full min-h-[140px] rounded-2xl overflow-hidden bg-neutral-900 flex items-center justify-center border-2 transition-all ${
        isSpeaking
          ? "border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.35)]"
          : "border-neutral-800"
      }`}
    >
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted={isLocal}
        className={`w-full h-full object-cover ${hasVideo ? "block" : "hidden"}`}
      />

      {!hasVideo && (
        <div className="flex flex-col items-center gap-2">
          <div className="relative">
            {isSpeaking && (
              <span className="absolute inset-0 rounded-full bg-emerald-500/30 animate-ping scale-125" />
            )}
            <Avatar
              size={64}
              name={participant.name || participant.identity}
              className={`relative z-10 ${theme.avatarClass}`}
            />
          </div>
          <span className="text-xs text-neutral-300 font-medium">
            {participant.name || participant.identity} {isLocal && "(You)"}
          </span>
        </div>
      )}

      {/* Name tag pill */}
      <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-xs text-[11px] text-white font-medium flex items-center gap-1.5">
        <span className="truncate max-w-[120px]">
          {participant.name || participant.identity} {isLocal && "(You)"}
        </span>
      </div>
    </div>
  )
}

/**
 * CallControlsInner — Renders in-call media controllers and participant grid.
 */
const CallControlsInner = ({
  onEndCall,
  isMinimized,
  onToggleMinimize,
  callType,
}) => {
  const { t } = useLanguage()
  const participants = useParticipants()
  const { isMicrophoneEnabled, isCameraEnabled, localParticipant } =
    useLocalParticipant()

  const [callDuration, setCallDuration] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setCallDuration((d) => d + 1)
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const formatDuration = (sec) => {
    const m = Math.floor(sec / 60)
    const s = sec % 60
    return `${m < 10 ? "0" : ""}${m}:${s < 10 ? "0" : ""}${s}`
  }

  const toggleMic = async () => {
    try {
      if (localParticipant) {
        await localParticipant.setMicrophoneEnabled(!isMicrophoneEnabled)
      }
    } catch (err) {
      console.error("Failed to toggle mic:", err)
      toast.error(t?.chat?.call?.micError || "Failed to toggle microphone")
    }
  }

  const toggleCam = async () => {
    try {
      if (localParticipant) {
        await localParticipant.setCameraEnabled(!isCameraEnabled)
      }
    } catch (err) {
      console.error("Failed to toggle camera:", err)
      toast.error(t?.chat?.call?.camError || "Failed to toggle camera")
    }
  }

  return (
    <div className="flex flex-col h-full w-full justify-between bg-neutral-950 text-white select-none">
      {/* Top Bar */}
      <div className="flex items-center justify-between px-4 py-3 bg-neutral-900/80 backdrop-blur-md border-b border-neutral-800 shrink-0">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-mono font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            {formatDuration(callDuration)}
          </div>
          <div className="flex items-center gap-1 text-xs text-neutral-400">
            <Users size={14} />
            <span>{participants.length}</span>
          </div>
        </div>

        <button
          type="button"
          onClick={onToggleMinimize}
          className="p-1.5 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-lg transition-colors cursor-pointer"
          title={isMinimized ? "Maximize" : "Minimize"}
        >
          {isMinimized ? <Maximize2 size={16} /> : <Minimize2 size={16} />}
        </button>
      </div>

      {/* Main Grid View */}
      <div className="flex-1 p-3 overflow-y-auto min-h-0 flex items-center justify-center">
        <div
          className={`w-full h-full grid gap-2.5 ${
            participants.length <= 1
              ? "grid-cols-1"
              : participants.length <= 4
              ? "grid-cols-2"
              : "grid-cols-2 sm:grid-cols-3"
          }`}
        >
          {participants.map((p) => (
            <ParticipantVideoTile
              key={p.identity}
              participant={p}
              isLocal={p === localParticipant}
            />
          ))}
        </div>
      </div>

      {/* Bottom Controls Bar */}
      <div className="flex items-center justify-center gap-4 px-4 py-3 bg-neutral-900/90 backdrop-blur-md border-t border-neutral-800 shrink-0">
        {/* Mic Toggle */}
        <button
          type="button"
          onClick={toggleMic}
          className={`w-11 h-11 rounded-full flex items-center justify-center transition-all cursor-pointer ${
            isMicrophoneEnabled
              ? "bg-neutral-800 hover:bg-neutral-700 text-white"
              : "bg-red-500 hover:bg-red-600 text-white"
          }`}
          title={isMicrophoneEnabled ? "Mute Microphone" : "Unmute Microphone"}
        >
          {isMicrophoneEnabled ? <Mic size={20} /> : <MicOff size={20} />}
        </button>

        {/* Cam Toggle */}
        {callType === "video" && (
          <button
            type="button"
            onClick={toggleCam}
            className={`w-11 h-11 rounded-full flex items-center justify-center transition-all cursor-pointer ${
              isCameraEnabled
                ? "bg-neutral-800 hover:bg-neutral-700 text-white"
                : "bg-red-500 hover:bg-red-600 text-white"
            }`}
            title={isCameraEnabled ? "Turn Off Camera" : "Turn On Camera"}
          >
            {isCameraEnabled ? <Video size={20} /> : <VideoOff size={20} />}
          </button>
        )}

        {/* End Call Button */}
        <button
          type="button"
          onClick={onEndCall}
          className="w-12 h-12 rounded-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center shadow-lg transition-transform active:scale-95 cursor-pointer"
          title="End Call"
        >
          <PhoneOff size={22} />
        </button>
      </div>
    </div>
  )
}

/**
 * InChatCallModal — Main wrapper orchestrating LiveKit connection and
 * rendering full or floating PiP call window.
 */
const InChatCallModal = ({
  open,
  onClose,
  callSession,
  onEndCall,
}) => {
  const [isMinimized, setIsMinimized] = useState(false)

  if (!open || !callSession?.token) return null

  const livekitServerUrl =
    callSession.serverUrl ||
    callSession.liveKitServerUrl ||
    import.meta.env.VITE_LIVEKIT_URL ||
    "wss://livekit.catspeak.com.vn"

  const callType = callSession.callType || "video"

  const containerClasses = isMinimized
    ? "fixed bottom-5 right-5 z-50 w-72 h-80 rounded-2xl shadow-2xl overflow-hidden border border-neutral-700 animate-in zoom-in-95 duration-200"
    : "fixed inset-4 sm:inset-10 md:inset-16 z-50 rounded-3xl shadow-2xl overflow-hidden border border-neutral-800 animate-in fade-in zoom-in-95 duration-200"

  return (
    <>
      {/* Backdrop for full view */}
      {!isMinimized && (
        <div
          className="fixed inset-0 z-40 bg-black/75 backdrop-blur-xs animate-in fade-in duration-200"
          onClick={() => setIsMinimized(true)}
        />
      )}

      <div className={containerClasses}>
        <LiveKitRoom
          serverUrl={livekitServerUrl}
          token={callSession.token}
          connect={true}
          audio={true}
          video={callType === "video"}
          onDisconnected={onClose}
          className="w-full h-full flex flex-col"
        >
          <RoomAudioRenderer />
          <CallControlsInner
            onEndCall={onEndCall}
            isMinimized={isMinimized}
            onToggleMinimize={() => setIsMinimized((prev) => !prev)}
            callType={callType}
          />
        </LiveKitRoom>
      </div>
    </>
  )
}

export default InChatCallModal
