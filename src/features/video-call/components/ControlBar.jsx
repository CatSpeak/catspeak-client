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
} from "lucide-react"
import { useVideoCallContext } from "@/features/video-call/context/VideoCallContext"

const VideoCallControlBar = ({ unreadMessages }) => {
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

      <button
        onClick={handleLeaveSession}
        title="Leave call"
        className={`${buttonBaseClass} bg-[#d40018] text-white hover:bg-[#e7001a]`}
      >
        <Phone className="rotate-[135deg]" />
      </button>
    </div>
  )
}

export default VideoCallControlBar
