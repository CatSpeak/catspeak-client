import { Mic, MicOff, Video, VideoOff, Maximize2, Phone } from "lucide-react"

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
}) => {
  const baseBtnClass =
    "flex shrink-0 items-center justify-center w-12 h-12 rounded-full border-none cursor-pointer transition-all duration-150 pointer-events-auto"
  const defaultBtnClass = "bg-gray-100 text-gray-700 hover:bg-gray-200"
  const activeBtnClass = "bg-[#990011] text-white hover:bg-[#b3001b]"
  const leaveBtnClass = "bg-[#d40018] text-white hover:bg-[#e7001a]"
  const expandBtnClass = "bg-gray-100 text-gray-700 hover:bg-gray-200"

  return (
    <div className="flex items-center justify-center gap-2 p-2 bg-white">
      {/* Mic */}
      <button
        className={`${baseBtnClass} ${micOn ? activeBtnClass : defaultBtnClass}`}
        onClick={(e) => {
          e.stopPropagation()
          onToggleMic()
        }}
        title={micOn ? "Mute" : "Unmute"}
      >
        {micOn ? <Mic size={24} /> : <MicOff size={24} />}
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
        {cameraOn ? <Video size={24} /> : <VideoOff size={24} />}
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
          <Maximize2 size={24} />
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
        <Phone size={24} className="rotate-[135deg]" />
      </button>
    </div>
  )
}

export default PiPControlBar
