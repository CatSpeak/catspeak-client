import React from "react"
import { useSelector } from "react-redux"
import { toast } from "react-hot-toast"
import {
  Users,
  MessageSquare,
  MonitorUp,
  MonitorOff,
  Captions,
  Circle,
  Loader2,
  Copy,
  Info,
  Settings,
  BarChart2,
  Split,
} from "lucide-react"
import { useGlobalVideoCall } from "@/features/video-call/context/GlobalVideoCallProvider"
import { useLanguage } from "@/shared/context/LanguageContext"
import { useSessionTimer } from "../hooks/useSessionTimer"
import { getShareUrlWithVersion } from "@/shared/utils/shareUtils"
import { isBreakoutSupported } from "../utils/roomTypeHelpers"

const MoreMenuMobileGeneralView = ({
  setShowMoreMenu,
  setShowMobileSettings,
  setShowSubtitlePicker,
}) => {
  const { t } = useLanguage()
  const { isBreakoutActive } = useSelector((s) => s.videoCall)
  const {
    isHost,
    showParticipants,
    setShowParticipants,
    showChat,
    setShowChat,
    showSpeakingTimeBalance,
    setShowSpeakingTimeBalance,
    showStudentSpeakingWidget,
    setShowStudentSpeakingWidget,
    showBreakout,
    setShowBreakout,
    participants,
    unreadRoomChat,
    unreadAiChat,
    isLocalScreenShare,
    isTogglingScreenShare,
    handleToggleScreenShare,
    isAISession,
    showCC,
    setShowCC,
    isRecording,
    isTogglingRecording,
    handleToggleRecording,
    confirmStopRecording,
    showTroubleshoot,
    setShowTroubleshoot,
    room,
    closingRemainingSeconds,
    isSubtitleActive,
    stopSubtitles,
  } = useGlobalVideoCall()

  const { formattedRemaining, formattedMax, hasDuration } = useSessionTimer(
    room?.createDate,
    room?.duration,
    closingRemainingSeconds,
  )

  const unreadMessages = (unreadRoomChat || 0) + (unreadAiChat || 0)

  const handleCopyLink = () => {
    navigator.clipboard.writeText(getShareUrlWithVersion(window.location.href))
    toast.success(t?.rooms?.videoCall?.linkCopied || "Link copied!")
    setShowMoreMenu(false)
  }

  return (
    <>
      {hasDuration && (
        <div
          className={`flex items-center justify-center text-base font-medium rounded-xl py-2 px-5 h-12 w-full transition-all ${
            closingRemainingSeconds !== null && closingRemainingSeconds <= 60
              ? "bg-red-100 text-red-700 border border-red-300 font-bold animate-pulse shadow-sm"
              : closingRemainingSeconds !== null && closingRemainingSeconds <= 300
              ? "bg-amber-100 text-amber-900 border border-amber-300 font-bold animate-pulse shadow-sm"
              : "bg-[#F5F5F5] text-black"
          }`}
        >
          {t?.rooms?.videoCall?.remainingTime || "Thời gian còn lại"}:{" "}
          {formattedRemaining} / {formattedMax}
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => {
            setShowParticipants(!showParticipants)
            setShowMoreMenu(false)
          }}
          className={`h-14 rounded-xl flex items-center justify-center gap-2 font-medium transition-colors ${
            showParticipants
              ? "bg-red-100 text-red-600"
              : "bg-[#F5F5F5] text-black"
          }`}
        >
          <Users size={20} />
          <span>
            {t.rooms?.videoCall?.controls?.participants || "Participants"}
            {participants?.length > 0 ? ` (${participants.length})` : ""}
          </span>
        </button>

        <button
          onClick={() => {
            setShowChat(!showChat)
            setShowMoreMenu(false)
          }}
          className={`relative h-14 rounded-xl flex items-center justify-center gap-2 font-medium transition-colors ${
            showChat ? "bg-red-100 text-red-600" : "bg-[#F5F5F5] text-black"
          }`}
        >
          <MessageSquare size={20} />
          <span>{t.rooms?.videoCall?.controls?.chat || "Chat"}</span>
          {unreadMessages > 0 && (
            <span className="absolute top-2 right-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white shadow-sm">
              {unreadMessages > 9 ? "9+" : unreadMessages}
            </span>
          )}
        </button>
      </div>

      <div
        className={`grid ${
          !isAISession &&
          isBreakoutSupported(room?.roomType) &&
          (isHost || isBreakoutActive)
            ? "grid-cols-2"
            : "grid-cols-1"
        } gap-3`}
      >
        <button
          onClick={() => {
            if (isHost) {
              setShowSpeakingTimeBalance(!showSpeakingTimeBalance)
            } else {
              setShowStudentSpeakingWidget(!showStudentSpeakingWidget)
            }
            setShowMoreMenu(false)
          }}
          className={`h-14 rounded-xl flex items-center justify-center gap-2 font-medium transition-colors px-3 ${
            (isHost ? showSpeakingTimeBalance : showStudentSpeakingWidget)
              ? "bg-red-100 text-red-600"
              : "bg-[#F5F5F5] text-black"
          }`}
        >
          <BarChart2 size={20} className="shrink-0" />
          <span className="truncate">
            {t.rooms?.videoCall?.controls?.speakingTimeBalance ||
              "Speaking Time Balance"}
          </span>
        </button>

        {!isAISession &&
          isBreakoutSupported(room?.roomType) &&
          (isHost || isBreakoutActive) && (
            <button
              onClick={() => {
                setShowBreakout(!showBreakout)
                setShowMoreMenu(false)
              }}
              className={`h-14 rounded-xl flex items-center justify-center gap-2 font-medium transition-colors px-3 ${
                showBreakout
                  ? "bg-red-100 text-red-600"
                  : "bg-[#F5F5F5] text-black"
              }`}
            >
              <Split size={20} className="shrink-0" />
              <span className="truncate">
                {t?.rooms?.breakoutRooms?.breakoutRoomOption || "Breakout Rooms"}
              </span>
            </button>
          )}
      </div>

      <div className="grid grid-cols-3 gap-3">
        <button
          onClick={() => {
            handleToggleScreenShare()
            setShowMoreMenu(false)
          }}
          disabled={isTogglingScreenShare}
          className={`aspect-square rounded-xl flex items-center justify-center transition-colors ${
            isLocalScreenShare ? "bg-red-100 text-red-600" : "bg-[#F5F5F5]"
          }`}
        >
          {isLocalScreenShare ? (
            <MonitorOff size={24} />
          ) : (
            <MonitorUp size={24} />
          )}
        </button>

        <button
          onClick={() => {
            if (isAISession) {
              setShowCC(!showCC)
              setShowMoreMenu(false)
            } else {
              if (isSubtitleActive) {
                stopSubtitles()
                setShowMoreMenu(false)
              } else {
                setShowSubtitlePicker(true)
              }
            }
          }}
          className={`aspect-square rounded-xl flex items-center justify-center transition-colors ${
            (isAISession ? showCC : isSubtitleActive)
              ? "bg-red-100 text-red-600"
              : "bg-[#F5F5F5]"
          }`}
        >
          <Captions size={24} />
        </button>

        <button
          onClick={() => {
            if (isRecording) {
              confirmStopRecording()
            } else {
              handleToggleRecording()
            }
            setShowMoreMenu(false)
          }}
          disabled={isTogglingRecording}
          className={`aspect-square rounded-xl flex items-center justify-center transition-colors ${
            isRecording
              ? "bg-red-100 text-red-600 animate-pulse"
              : "bg-[#F5F5F5]"
          }`}
        >
          {isTogglingRecording ? (
            <Loader2 size={24} className="animate-spin" />
          ) : (
            <Circle
              size={24}
              className={isRecording ? "fill-red-600 text-red-600" : ""}
            />
          )}
        </button>
      </div>

      <button
        onClick={handleCopyLink}
        className="w-full h-16 bg-[#F5F5F5] rounded-xl flex items-center justify-center gap-2 font-medium"
      >
        <Copy size={20} />
        {t?.rooms?.videoCall?.copyLink || "Sao chép liên kết"}
      </button>

      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => {
            setShowTroubleshoot(!showTroubleshoot)
            setShowMoreMenu(false)
          }}
          className="h-16 bg-[#F5F5F5] rounded-xl flex items-center justify-center"
        >
          <Info size={24} />
        </button>

        <button
          onClick={() => setShowMobileSettings(true)}
          className="h-16 bg-[#F5F5F5] rounded-xl flex items-center justify-center"
        >
          <Settings size={24} />
        </button>
      </div>
    </>
  )
}

export default MoreMenuMobileGeneralView
