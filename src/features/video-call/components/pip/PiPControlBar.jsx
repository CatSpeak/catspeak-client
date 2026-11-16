import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  Maximize2,
  Phone,
  Hand,
  MessageSquare,
  MonitorOff,
} from "lucide-react"
import IconButton from "@/shared/components/ui/buttons/IconButton"

/**
 * Compact control bar for the PiP widget.
 * Streamlined to core glance & participation actions with flex-nowrap to prevent row wrapping.
 *
 * All click handlers call `e.stopPropagation()` to prevent
 * the drag handler from capturing button clicks.
 */
const PiPControlBar = ({
  isNativeWindow,
  micOn,
  cameraOn,
  onToggleMic,
  onToggleCam,
  onReturnToCall,
  onLeave,
  isHandRaised,
  onToggleHand,
  unreadMessages,
  onOpenChat,
  isPiPChatOpen,
  isLocalScreenShare,
  onToggleScreenShare,
}) => {
  return (
    <div className="flex flex-nowrap items-center justify-center gap-2 px-4 py-1 min-h-[56px] bg-white dark:bg-[#1A1A1A] overflow-hidden">
      {/* Mic */}
      <IconButton
        variant={micOn ? "controlActive" : "control"}
        onClick={(e) => {
          e.stopPropagation()
          onToggleMic()
        }}
        title={micOn ? "Mute" : "Unmute"}
      >
        {micOn ? <Mic /> : <MicOff />}
      </IconButton>

      {/* Camera */}
      <IconButton
        variant={cameraOn ? "controlActive" : "control"}
        onClick={(e) => {
          e.stopPropagation()
          onToggleCam()
        }}
        title={cameraOn ? "Camera off" : "Camera on"}
      >
        {cameraOn ? <Video /> : <VideoOff />}
      </IconButton>

      {/* Screen Share — only shown when actively presenting to allow stopping from PiP */}
      {isLocalScreenShare && (
        <IconButton
          variant="controlActive"
          onClick={(e) => {
            e.stopPropagation()
            onToggleScreenShare()
          }}
          title="Stop sharing"
        >
          <MonitorOff />
        </IconButton>
      )}

      {/* Raise Hand */}
      <IconButton
        variant={isHandRaised ? "controlActive" : "control"}
        onClick={(e) => {
          e.stopPropagation()
          onToggleHand()
        }}
        title={isHandRaised ? "Lower hand" : "Raise hand"}
      >
        <Hand />
      </IconButton>

      {/* Chat / Return to Call */}
      <IconButton
        variant={isPiPChatOpen ? "controlActive" : "control"}
        onClick={(e) => {
          e.stopPropagation()
          onOpenChat()
        }}
        title={isPiPChatOpen ? "Close chat" : "Open chat"}
        badge={
          !isPiPChatOpen && unreadMessages > 0 ? (
            <div className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white shadow-sm pointer-events-none">
              {unreadMessages > 9 ? "9+" : unreadMessages}
            </div>
          ) : null
        }
      >
        <MessageSquare />
      </IconButton>

      {/* Expand (return to call) - Only needed for fallback widget, Document PiP has native title bar button */}
      {!isNativeWindow && (
        <IconButton
          variant="control"
          onClick={(e) => {
            e.stopPropagation()
            onReturnToCall()
          }}
          title="Return to call"
        >
          <Maximize2 />
        </IconButton>
      )}

      {/* Leave */}
      <IconButton
        variant="danger"
        onClick={(e) => {
          e.stopPropagation()
          onLeave()
        }}
        title="Leave call"
      >
        <Phone className="rotate-[135deg]" />
      </IconButton>
    </div>
  )
}

export default PiPControlBar
