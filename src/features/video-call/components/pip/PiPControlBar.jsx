import { Mic, MicOff, Video, VideoOff, Maximize2, Phone, Hand, MessageSquare, MonitorUp, MonitorOff } from "lucide-react"

/**
 * Compact control bar for the PiP widget.
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
  const baseBtnClass =
    "flex shrink-0 items-center justify-center w-10 h-10 rounded-full border-none cursor-pointer transition-all duration-150 pointer-events-auto"
  const defaultBtnClass = "bg-gray-100 text-gray-700 hover:bg-gray-200"
  const activeBtnClass = "bg-[#990011] text-white hover:bg-[#b3001b]"
  const leaveBtnClass = "bg-[#d40018] text-white hover:bg-[#e7001a]"
  const expandBtnClass = "bg-gray-100 text-gray-700 hover:bg-gray-200"

  return (
    <div className="flex flex-wrap items-center justify-center gap-2 p-2 bg-white">
      {/* Mic */}
      <button
        className={`${baseBtnClass} ${micOn ? activeBtnClass : defaultBtnClass}`}
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
        className={`${baseBtnClass} ${cameraOn ? activeBtnClass : defaultBtnClass}`}
        onClick={(e) => {
          e.stopPropagation()
          onToggleCam()
        }}
        title={cameraOn ? "Camera off" : "Camera on"}
      >
        {cameraOn ? <Video size={20} /> : <VideoOff size={20} />}
      </button>

      {/* Screen Share */}
      <button
        className={`${baseBtnClass} ${isLocalScreenShare ? activeBtnClass : defaultBtnClass}`}
        onClick={(e) => {
          e.stopPropagation()
          onToggleScreenShare()
        }}
        title={isLocalScreenShare ? "Stop sharing" : "Share screen"}
      >
        {isLocalScreenShare ? <MonitorOff size={20} /> : <MonitorUp size={20} />}
      </button>

      {/* Raise Hand */}
      <button
        className={`${baseBtnClass} ${isHandRaised ? activeBtnClass : defaultBtnClass}`}
        onClick={(e) => {
          e.stopPropagation()
          onToggleHand()
        }}
        title={isHandRaised ? "Lower hand" : "Raise hand"}
      >
        <Hand size={20} />
      </button>

      {/* Chat / Return to Call */}
      <button
        className={`${baseBtnClass} ${isPiPChatOpen ? activeBtnClass : defaultBtnClass} relative`}
        onClick={(e) => {
          e.stopPropagation()
          onOpenChat()
        }}
        title={isPiPChatOpen ? "Close chat" : "Open chat"}
      >
        <MessageSquare size={20} />
        {!isPiPChatOpen && unreadMessages > 0 && (
          <div className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white shadow-sm pointer-events-none">
            {unreadMessages > 9 ? "9+" : unreadMessages}
          </div>
        )}
      </button>

      {/* Expand (return to call) - Only needed for fallback widget */}
      {!isNativeWindow && (
        <button
          className={`${baseBtnClass} ${expandBtnClass}`}
          onClick={(e) => {
            e.stopPropagation()
            onReturnToCall()
          }}
          title="Return to call"
        >
          <Maximize2 size={20} />
        </button>
      )}

      {/* Leave */}
      <button
        className={`${baseBtnClass} ${leaveBtnClass}`}
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
