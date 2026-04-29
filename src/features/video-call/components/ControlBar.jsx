import React from "react"
import {
  Video,
  VideoOff,
  MonitorUp,
  MonitorOff,
  MessageSquare,
  Users,
  Mic,
  MicOff,
  Phone,
  MoreVertical,
  Copy,
} from "lucide-react"
import { toast } from "react-hot-toast"
import { useLanguage } from "@/shared/context/LanguageContext"
import { useGlobalVideoCall as useVideoCallContext } from "@/features/video-call/context/GlobalVideoCallProvider"

const VideoCallControlBar = ({ unreadMessages }) => {
  const { t } = useLanguage()
  const {
    micOn,
    cameraOn,
    isLocalScreenShare,
    showChat,
    setShowChat,
    showParticipants,
    setShowParticipants,
    handleToggleMic,
    handleToggleCam,
    handleToggleScreenShare,
    handleLeaveSession,
  } = useVideoCallContext()

  const [showMoreMenu, setShowMoreMenu] = React.useState(false)

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href)
    toast.success(t?.rooms?.videoCall?.linkCopied || "Link copied!")
    setShowMoreMenu(false)
  }
  // Common button styles
  const buttonBaseClass =
    "flex items-center justify-center rounded-full transition-colors shadow-sm w-12 h-12"
  const inactiveClass =
    "bg-[#F2F2F2] text-gray-600 hover:bg-[#D9D9D9] hover:text-gray-900"
  const activeErrorClass = "bg-red-500 text-white hover:bg-red-600"
  const activeWarningClass = "bg-yellow-500 text-white hover:bg-yellow-600"
  const activeToggleClass = "bg-cath-red-600 text-white hover:bg-cath-red-700"

  return (
    <div className="flex w-full items-center justify-center gap-2 border-t border-[#C6C6C6] bg-white px-3 py-2 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] sm:gap-3 sm:px-6 sm:py-3">
      <div className="relative z-10 flex items-center justify-center">
        <button
          onClick={handleToggleMic}
          className={`relative z-10 flex h-12 w-12 items-center justify-center rounded-full transition shadow-sm ${
            micOn
              ? "bg-cath-red-600 text-white hover:bg-cath-red-700"
              : "bg-[#F2F2F2] text-gray-600 hover:bg-[#D9D9D9] hover:text-gray-900"
          }`}
        >
          {micOn ? <Mic /> : <MicOff />}
        </button>
      </div>

      <button
        onClick={handleToggleCam}
        title={cameraOn ? "Turn camera off" : "Turn camera on"}
        className={`${buttonBaseClass} ${
          cameraOn ? activeErrorClass : inactiveClass
        }`}
      >
        {cameraOn ? <Video /> : <VideoOff />}
      </button>

      {/* Screen Share Toggle */}
      <button
        onClick={handleToggleScreenShare}
        title={isLocalScreenShare ? "Stop sharing" : "Share screen"}
        className={`${buttonBaseClass} ${
          isLocalScreenShare ? activeWarningClass : inactiveClass
        }`}
      >
        {isLocalScreenShare ? <MonitorOff /> : <MonitorUp />}
      </button>

      {/* Participants Toggle */}
      <button
        onClick={() => {
          setShowParticipants(!showParticipants)
          setShowChat(false)
        }}
        title="Participants"
        className={`${buttonBaseClass} ${
          showParticipants ? activeToggleClass : inactiveClass
        }`}
      >
        <Users />
      </button>

      {/* Chat Toggle */}
      <div className="relative">
        <button
          onClick={() => {
            setShowChat(!showChat)
            setShowParticipants(false)
          }}
          title="Chat"
          className={`${buttonBaseClass} ${
            showChat ? activeToggleClass : inactiveClass
          }`}
        >
          <MessageSquare />
        </button>
        {unreadMessages > 0 && (
          <div className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white shadow-sm">
            {unreadMessages > 9 ? "9+" : unreadMessages}
          </div>
        )}
      </div>

      {/* More Toggle */}
      <div className="relative">
        <button
          onClick={() => setShowMoreMenu(!showMoreMenu)}
          title={t?.rooms?.videoCall?.moreOptions || "More options"}
          className={`${buttonBaseClass} ${
            showMoreMenu ? activeToggleClass : inactiveClass
          }`}
        >
          <MoreVertical />
        </button>

        {showMoreMenu && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setShowMoreMenu(false)}
            />
            <div className="absolute bottom-[110%] right-0 z-50 mb-2 w-56 rounded-xl bg-white py-1.5 shadow-lg ring-1 ring-black ring-opacity-5">
              <button
                onClick={handleCopyLink}
                className="flex w-full items-center gap-3 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-black transition-colors"
                style={{ textAlign: "left" }}
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-100">
                  <Copy className="h-4 w-4" />
                </span>
                {t?.rooms?.videoCall?.copyLink || "Copy meeting link"}
              </button>
            </div>
          </>
        )}
      </div>

      <button
        onClick={handleLeaveSession}
        title={t?.rooms?.videoCall?.leaveCall || "Leave call"}
        className={`${buttonBaseClass} bg-[#d40018] text-white hover:bg-[#e7001a]`}
      >
        <Phone className="rotate-[135deg]" />
      </button>
    </div>
  )
}

export default VideoCallControlBar
