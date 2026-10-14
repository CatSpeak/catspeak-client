import {
  Phone,
  Mic,
  MicOff,
  Video,
  VideoOff,
  MonitorUp,
  MonitorOff,
} from "lucide-react"
import { IconButton } from "@/shared/components/ui/buttons"
import { useLanguage } from "@/shared/context/LanguageContext"

/**
 * CallBottomDock — Floating bottom pill containing media toggles
 * (microphone, camera, screen share) and call termination button.
 */
const CallBottomDock = ({
  isMicrophoneEnabled = false,
  toggleMic,
  isCameraEnabled = false,
  toggleCam,
  isScreenShareEnabled = false,
  toggleScreenShare,
  isMinimized = false,
  onEndCall,
}) => {
  const { t } = useLanguage()

  return (
    <div className="p-4 pt-0 bg-transparent flex items-center justify-center shrink-0 z-20">
      <div className="flex items-center gap-2 p-2 rounded-full bg-white border border-border shadow-xl">
        {/* Mic Toggle */}
        <IconButton
          onClick={toggleMic}
          size="sm"
          variant={isMicrophoneEnabled ? "filled" : "danger"}
          aria-label={
            isMicrophoneEnabled
              ? t?.chat?.call?.muteMic || "Mute microphone"
              : t?.chat?.call?.unmuteMic || "Unmute microphone"
          }
          title={
            isMicrophoneEnabled
              ? t?.chat?.call?.muteMic || "Mute microphone"
              : t?.chat?.call?.unmuteMic || "Unmute microphone"
          }
        >
          {isMicrophoneEnabled ? <Mic /> : <MicOff />}
        </IconButton>

        {/* Camera Toggle */}
        <IconButton
          onClick={toggleCam}
          size="sm"
          variant={isCameraEnabled ? "filled" : "secondary"}
          aria-label={
            isCameraEnabled
              ? t?.chat?.call?.turnCamOff || "Turn camera off"
              : t?.chat?.call?.turnCamOn || "Turn camera on"
          }
          title={
            isCameraEnabled
              ? t?.chat?.call?.turnCamOff || "Turn camera off"
              : t?.chat?.call?.turnCamOn || "Turn camera on"
          }
        >
          {isCameraEnabled ? <Video /> : <VideoOff />}
        </IconButton>

        {/* Screen Share Toggle */}
        {!isMinimized && (
          <IconButton
            onClick={toggleScreenShare}
            size="sm"
            variant={isScreenShareEnabled ? "primary" : "filled"}
            aria-label={
              isScreenShareEnabled
                ? t?.chat?.call?.stopSharing || "Stop sharing"
                : t?.chat?.call?.shareScreen || "Share screen"
            }
            title={
              isScreenShareEnabled
                ? t?.chat?.call?.stopSharing || "Stop sharing"
                : t?.chat?.call?.shareScreen || "Share screen"
            }
          >
            {isScreenShareEnabled ? <MonitorOff /> : <MonitorUp />}
          </IconButton>
        )}

        {/* Divider */}
        <div className="w-[1px] h-5 bg-border mx-0.5" />

        {/* End Call Button */}
        <IconButton
          onClick={onEndCall}
          size="sm"
          variant="danger"
          aria-label={t?.chat?.call?.endCall || "End call"}
          title={t?.chat?.call?.endCall || "End call"}
        >
          <Phone className="rotate-[135deg]" />
        </IconButton>
      </div>
    </div>
  )
}

export default CallBottomDock
