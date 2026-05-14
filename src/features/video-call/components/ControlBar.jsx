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
  Circle,
  Loader2,
  MoreVertical,
  Hand,
} from "lucide-react"
import { useRaiseHandMutation } from "@/store/api/livekitApi"
import { useGlobalVideoCall as useVideoCallContext } from "@/features/video-call/context/GlobalVideoCallProvider"
import ControlBarMoreMenu from "./ControlBarMoreMenu"
import StopRecordingModal from "./StopRecordingModal"
import { useLanguage } from "@/shared/context/LanguageContext"

const VideoCallControlBar = () => {
  const { t } = useLanguage()
  const {
    micOn,
    cameraOn,
    isLocalScreenShare,
    isTogglingMic,
    isTogglingCam,
    isTogglingScreenShare,
    showChat,
    setShowChat,
    showParticipants,
    setShowParticipants,
    showVirtualBackground,
    setShowVirtualBackground,
    handleToggleMic,
    handleToggleCam,
    handleToggleScreenShare,
    handleLeaveSession,
    // Recording
    isRecording,
    isTogglingRecording,
    handleToggleRecording,
    showStopModal,
    confirmStopRecording,
    cancelStopRecording,
    unreadRoomChat,
    unreadAiChat,
    isHandRaised,
    sessionId,
  } = useVideoCallContext()

  const [raiseHand, { isLoading: isTogglingHand }] = useRaiseHandMutation()

  const handleToggleHand = async () => {
    console.log("Toggle hand clicked. SessionId:", sessionId, "isHandRaised:", isHandRaised)
    if (!sessionId) {
      console.warn("Cannot raise hand: sessionId is missing in context!")
      return
    }
    try {
      await raiseHand({ sessionId, isRaised: !isHandRaised }).unwrap()
    } catch (error) {
      console.error("Failed to toggle hand raise:", error)
    }
  }

  const unreadMessages = unreadRoomChat + unreadAiChat

  const [showMoreMenu, setShowMoreMenu] = React.useState(false)

  // Common button styles
  const buttonBaseClass =
    "flex items-center justify-center rounded-full transition-colors shadow-sm w-12 h-12 min-[769px]:w-10 min-[769px]:h-10 relative overflow-hidden"
  const inactiveClass = "bg-[#F2F2F2] hover:bg-[#D9D9D9] text-black"
  const activeToggleClass = "bg-cath-red-600 hover:bg-cath-red-700 text-white"
  const iconClass = "w-6 h-6 min-[769px]:w-5 min-[769px]:h-5"

  return (
    <div className="flex w-full items-center justify-center gap-2 border-t border-[#E5E5E5] bg-white px-3 py-2 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] sm:gap-3 sm:px-6 sm:py-3">
      <div className="relative z-10 flex items-center justify-center">
        <button
          onClick={handleToggleMic}
          disabled={isTogglingMic}
          title={
            micOn
              ? t.rooms?.videoCall?.controls?.micOff || "Turn microphone off"
              : t.rooms?.videoCall?.controls?.micOn || "Turn microphone on"
          }
          className={`relative z-10 ${buttonBaseClass} ${
            isTogglingMic
              ? "cursor-not-allowed opacity-70 bg-[#F2F2F2] text-black"
              : micOn
                ? activeToggleClass
                : inactiveClass
          }`}
        >
          {isTogglingMic ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <Loader2 className={`animate-spin origin-center ${iconClass}`} />
            </div>
          ) : micOn ? (
            <Mic className={iconClass} />
          ) : (
            <MicOff className={iconClass} />
          )}
        </button>
      </div>

      <button
        onClick={handleToggleCam}
        disabled={isTogglingCam}
        title={
          cameraOn
            ? t.rooms?.videoCall?.controls?.camOff || "Turn camera off"
            : t.rooms?.videoCall?.controls?.camOn || "Turn camera on"
        }
        className={`${buttonBaseClass} ${
          isTogglingCam
            ? "cursor-not-allowed opacity-70 bg-[#F2F2F2] text-black"
            : cameraOn
              ? activeToggleClass
              : inactiveClass
        }`}
      >
        {isTogglingCam ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <Loader2 className={`animate-spin origin-center ${iconClass}`} />
          </div>
        ) : cameraOn ? (
          <Video className={iconClass} />
        ) : (
          <VideoOff className={iconClass} />
        )}
      </button>

      {/* Screen Share Toggle */}
      <button
        onClick={handleToggleScreenShare}
        disabled={isTogglingScreenShare}
        title={
          isLocalScreenShare
            ? t.rooms?.videoCall?.controls?.shareOff || "Stop sharing"
            : t.rooms?.videoCall?.controls?.shareOn || "Share screen"
        }
        className={`${buttonBaseClass} hidden min-[769px]:flex ${
          isTogglingScreenShare
            ? "cursor-not-allowed opacity-70 bg-[#F2F2F2] text-black"
            : isLocalScreenShare
              ? activeToggleClass
              : inactiveClass
        }`}
      >
        {isTogglingScreenShare ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <Loader2 className={`animate-spin origin-center ${iconClass}`} />
          </div>
        ) : isLocalScreenShare ? (
          <MonitorOff className={iconClass} />
        ) : (
          <MonitorUp className={iconClass} />
        )}
      </button>

      {/* ── Record Toggle ──────── */}
      <div className="relative hidden min-[769px]:block">
        <button
          onClick={handleToggleRecording}
          disabled={isTogglingRecording}
          title={
            isRecording
              ? t.rooms?.videoCall?.controls?.recordOff || "Stop recording"
              : t.rooms?.videoCall?.controls?.recordOn || "Start recording"
          }
          className={`${buttonBaseClass} relative overflow-hidden transition-all ${
            isTogglingRecording
              ? "cursor-not-allowed opacity-70 bg-[#F2F2F2] text-black"
              : isRecording
                ? "bg-red-600 hover:bg-red-700 text-white"
                : inactiveClass
          }`}
        >
          {isTogglingRecording ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <Loader2 className={`animate-spin origin-center ${iconClass}`} />
            </div>
          ) : (
            <Circle
              className={`${iconClass} ${isRecording ? "fill-white" : "fill-none"}`}
            />
          )}
        </button>

        {isRecording && !isTogglingRecording && (
          <span className="pointer-events-none absolute inset-0 rounded-full animate-ping bg-red-500 opacity-30" />
        )}
      </div>

      {/* Participants Toggle */}
      <button
        onClick={() => {
          setShowParticipants(!showParticipants)
          setShowChat(false)
          if (setShowVirtualBackground) setShowVirtualBackground(false)
        }}
        title={t.rooms?.videoCall?.controls?.participants || "Participants"}
        className={`${buttonBaseClass} hidden min-[426px]:flex ${
          showParticipants ? activeToggleClass : inactiveClass
        }`}
      >
        <Users className={iconClass} />
      </button>

      {/* Raise Hand Toggle */}
      <button
        onClick={handleToggleHand}
        disabled={isTogglingHand}
        title={isHandRaised ? "Lower hand" : "Raise hand"}
        className={`${buttonBaseClass} ${
          isTogglingHand
            ? "cursor-not-allowed opacity-70 bg-[#F2F2F2] text-black"
            : isHandRaised
              ? activeToggleClass
              : inactiveClass
        }`}
      >
        {isTogglingHand ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <Loader2 className={`animate-spin origin-center ${iconClass}`} />
          </div>
        ) : (
          <Hand className={iconClass} />
        )}
      </button>

      {/* Chat Toggle */}
      <div className="relative">
        <button
          onClick={() => {
            setShowChat(!showChat)
            setShowParticipants(false)
            if (setShowVirtualBackground) setShowVirtualBackground(false)
          }}
          title={t.rooms?.videoCall?.controls?.chat || "Chat"}
          className={`${buttonBaseClass} ${
            showChat ? activeToggleClass : inactiveClass
          }`}
        >
          <MessageSquare className={iconClass} />
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
          <MoreVertical className={iconClass} />
        </button>

        <ControlBarMoreMenu
          showMoreMenu={showMoreMenu}
          setShowMoreMenu={setShowMoreMenu}
        />
      </div>

      <button
        onClick={handleLeaveSession}
        title={t?.rooms?.videoCall?.leaveCall || "Leave call"}
        className={`${buttonBaseClass} bg-[#d40018] text-white hover:bg-[#e7001a]`}
      >
        <Phone
          className={`rotate-[135deg] w-6 h-6 min-[769px]:w-5 min-[769px]:h-5`}
        />
      </button>

      {/* Stop Recording Confirmation Modal */}
      {showStopModal && (
        <StopRecordingModal
          open={showStopModal}
          onClose={cancelStopRecording}
          onConfirm={confirmStopRecording}
        />
      )}
    </div>
  )
}

export default VideoCallControlBar
