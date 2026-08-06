import React from "react"
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
} from "lucide-react"
import { useGlobalVideoCall } from "@/features/video-call/context/GlobalVideoCallProvider"
import { useLanguage } from "@/shared/context/LanguageContext"
import { useSessionTimer } from "../hooks/useSessionTimer"
import { getShareUrlWithVersion } from "@/shared/utils/shareUtils"

const MoreMenuMobileGeneralView = ({
  setShowMoreMenu,
  setShowMobileSettings,
  setShowSubtitlePicker,
}) => {
  const { t } = useLanguage()
  const {
    showParticipants,
    setShowParticipants,
    showChat,
    setShowChat,
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
        <div className="flex items-center justify-center text-lg font-medium text-black md:text-base bg-[#F5F5F5] rounded-xl py-2 px-5 h-12 w-full">
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
            showChat
              ? "bg-red-100 text-red-600"
              : "bg-[#F5F5F5] text-black"
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

      <div className="grid grid-cols-3 gap-3">
        <button
          onClick={() => {
            handleToggleScreenShare()
            setShowMoreMenu(false)
          }}
          disabled={isTogglingScreenShare}
          className={`aspect-square rounded-xl flex items-center justify-center transition-colors ${
            isLocalScreenShare
              ? "bg-red-100 text-red-600"
              : "bg-[#F5F5F5]"
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
