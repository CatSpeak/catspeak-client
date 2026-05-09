import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  MessageSquare,
  Maximize2,
  Phone,
} from "lucide-react"

/**
 * Compact control bar for the PiP widget.
 *
 * All click handlers call `e.stopPropagation()` to prevent
 * the drag handler from capturing button clicks.
 */
const PiPControlBar = ({
  micOn,
  cameraOn,
  unreadCount,
  onToggleMic,
  onToggleCam,
  onReturnToCall,
  onLeave,
}) => {
  return (
    <div className="pip-controls">
      {/* Mic */}
      <button
        className={`pip-btn ${micOn ? "pip-btn--active" : "pip-btn--default"}`}
        onClick={(e) => {
          e.stopPropagation()
          onToggleMic()
        }}
        title={micOn ? "Mute" : "Unmute"}
      >
        {micOn ? <Mic size={20} /> : <MicOff size={20} />}
      </button>

      {/* Camera */}
      <button
        className={`pip-btn ${cameraOn ? "pip-btn--active" : "pip-btn--default"}`}
        onClick={(e) => {
          e.stopPropagation()
          onToggleCam()
        }}
        title={cameraOn ? "Camera off" : "Camera on"}
      >
        {cameraOn ? <Video size={20} /> : <VideoOff size={20} />}
      </button>

      {/* Chat (tap → return to call) */}
      <div style={{ position: "relative" }}>
        <button
          className="pip-btn pip-btn--default"
          onClick={(e) => {
            e.stopPropagation()
            onReturnToCall()
          }}
          title="Open chat"
        >
          <MessageSquare size={20} />
        </button>
        {unreadCount > 0 && (
          <span className="pip-chat-badge">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </div>

      {/* Expand (return to call) */}
      <button
        className="pip-btn pip-btn--expand"
        onClick={(e) => {
          e.stopPropagation()
          onReturnToCall()
        }}
        title="Return to call"
        >
        <Maximize2 size={20} />
      </button>

      {/* Leave */}
      <button
        className="pip-btn pip-btn--leave"
        onClick={(e) => {
          e.stopPropagation()
          onLeave()
        }}
        title="Leave call"
      >
        <Phone size={20} className="rotate-[135deg]" />
      </button>
    </div>
  )
}

export default PiPControlBar
