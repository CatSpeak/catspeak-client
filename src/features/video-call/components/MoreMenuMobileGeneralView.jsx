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
  Settings,
  BarChart2,
  Split,
  Clapperboard,
  Lock,
} from "lucide-react"
import { useGlobalVideoCall } from "@/features/video-call/context/GlobalVideoCallProvider"
import { useLanguage } from "@/shared/context/LanguageContext"
import { useSessionTimer } from "../hooks/useSessionTimer"
import { getShareUrlWithVersion } from "@/shared/utils/shareUtils"
import {
  isBreakoutSupported,
  isSpeakingTimeBalanceSupported,
} from "@/features/video-call/utils/roomTypeHelpers"
import { useGameControlStatus } from "@/features/games/hooks/useGameControlStatus"

const MoreMenuMobileGeneralView = ({
  setShowMoreMenu,
  setShowMobileSettings,
  setShowSubtitlePicker,
}) => {
  const { t } = useLanguage()
  const { isBreakoutActive } = useSelector((s) => s.videoCall)
  const {
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
    canShareScreen = true,
    isAISession,
    showCC,
    setShowCC,
    isRecording,
    isTogglingRecording,
    hasPersonalRecordPrivilege = true,
    handleToggleRecording,
    confirmStopRecording,
    room,
    closingRemainingSeconds,
    isSubtitleActive,
    isStartingSubtitles,
    isStoppingSubtitles,
    stopSubtitles,
    showWatchTogether,
    setShowWatchTogether,
  } = useGlobalVideoCall()

  const { isHost } = useGameControlStatus()

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
              : "bg-[#F5F5F5] dark:bg-[#272727] text-black dark:text-white"
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
              ? "bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400"
              : "bg-[#F5F5F5] dark:bg-[#272727] text-black dark:text-white"
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
            showChat ? "bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400" : "bg-[#F5F5F5] dark:bg-[#272727] text-black dark:text-white"
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

      {(!isAISession && (isSpeakingTimeBalanceSupported(room) || (isBreakoutSupported(room?.roomType) && (isHost || isBreakoutActive)))) && (
        <div
          className={`grid ${
            isSpeakingTimeBalanceSupported(room) &&
            isBreakoutSupported(room?.roomType) &&
            (isHost || isBreakoutActive)
              ? "grid-cols-2"
              : "grid-cols-1"
          } gap-3`}
        >
          {isSpeakingTimeBalanceSupported(room) && (
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
                  ? "bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400"
                  : "bg-[#F5F5F5] dark:bg-[#272727] text-black dark:text-white"
              }`}
            >
              <BarChart2 size={20} className="shrink-0" />
              <span className="truncate">
                {t.rooms?.videoCall?.controls?.speakingTimeBalance ||
                  "Speaking Time Balance"}
              </span>
            </button>
          )}

          {isBreakoutSupported(room?.roomType) &&
            (isHost || isBreakoutActive) && (
              <button
                onClick={() => {
                  setShowBreakout(!showBreakout)
                  setShowMoreMenu(false)
                }}
                className={`h-14 rounded-xl flex items-center justify-center gap-2 font-medium transition-colors px-3 ${
                  showBreakout
                    ? "bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400"
                    : "bg-[#F5F5F5] dark:bg-[#272727] text-black dark:text-white"
                }`}
              >
                <Split size={20} className="shrink-0" />
                <span className="truncate">
                  {t?.rooms?.breakoutRooms?.breakoutRoomOption || "Breakout Rooms"}
                </span>
              </button>
            )}
        </div>
      )}

      <div className={`grid gap-2 ${!isAISession && isBreakoutSupported(room?.roomType) && isHost ? 'grid-cols-4' : 'grid-cols-3'}`}>
        <button
          type="button"
          onClick={() => {
            handleToggleScreenShare()
            setShowMoreMenu(false)
          }}
          disabled={isTogglingScreenShare || !canShareScreen}
          title={
            !canShareScreen
              ? t.rooms?.videoCall?.participantList?.shareDeniedNoPerm ||
                "Bạn không có quyền chia sẻ màn hình."
              : isLocalScreenShare
                ? t?.rooms?.videoCall?.controls?.shareOff || "Dừng chia sẻ"
                : t?.rooms?.videoCall?.controls?.shareOn || "Chia sẻ màn hình"
          }
          aria-label={
            isLocalScreenShare
              ? t?.rooms?.videoCall?.controls?.shareOff || "Dừng chia sẻ"
              : t?.rooms?.videoCall?.controls?.shareOn || "Chia sẻ màn hình"
          }
          className={`min-h-[68px] py-2.5 px-2 rounded-xl flex flex-col items-center justify-center gap-1 text-center transition-colors ${
            isLocalScreenShare ? "bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400" : "bg-[#F5F5F5] dark:bg-[#272727] text-neutral-800 dark:text-white hover:bg-neutral-200 dark:hover:bg-[#3D3D3D]"
          } ${!canShareScreen ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          {isLocalScreenShare ? (
            <MonitorOff size={24} />
          ) : (
            <MonitorUp size={24} />
          )}
          <span className="text-[11px] font-medium leading-tight line-clamp-2 break-words">
            {isLocalScreenShare
              ? t?.rooms?.videoCall?.controls?.shareOff || "Dừng chia sẻ"
              : t?.rooms?.videoCall?.controls?.shareOn || "Chia sẻ màn hình"}
          </span>
        </button>

        {!isAISession && isHost && (
          <button
            type="button"
            onClick={() => {
              setShowWatchTogether(!showWatchTogether)
              setShowMoreMenu(false)
            }}
            title={
              t?.rooms?.videoCall?.watchTogether?.toggleButton ||
              "Watch together"
            }
            aria-label={
              t?.rooms?.videoCall?.watchTogether?.toggleButton ||
              "Watch together"
            }
            className={`min-h-[68px] py-2.5 px-2 rounded-xl flex flex-col items-center justify-center gap-1 text-center transition-colors ${
              showWatchTogether ? "bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400" : "bg-[#F5F5F5] dark:bg-[#272727] text-neutral-800 dark:text-white hover:bg-neutral-200 dark:hover:bg-[#3D3D3D]"
            }`}
          >
            <Clapperboard size={24} />
            <span className="text-[11px] font-medium leading-tight line-clamp-2 break-words">
              {t?.rooms?.videoCall?.watchTogether?.toggleButton ||
                "Watch together"}
            </span>
          </button>
        )}

        <button
          type="button"
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
          disabled={!isAISession && (isStartingSubtitles || isStoppingSubtitles)}
          title={t?.rooms?.videoCall?.subtitles || "Phụ đề"}
          aria-label={t?.rooms?.videoCall?.subtitles || "Phụ đề"}
          className={`min-h-[68px] py-2.5 px-2 rounded-xl flex flex-col items-center justify-center gap-1 text-center transition-colors ${
            (isAISession ? showCC : isSubtitleActive)
              ? "bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400"
              : "bg-[#F5F5F5] dark:bg-[#272727] text-neutral-800 dark:text-white hover:bg-neutral-200 dark:hover:bg-[#3D3D3D]"
          } ${!isAISession && (isStartingSubtitles || isStoppingSubtitles) ? "opacity-70 cursor-not-allowed" : ""}`}
        >
          <Captions size={24} />
          <span className="text-[11px] font-medium leading-tight line-clamp-2 break-words">
            {t?.rooms?.videoCall?.subtitles || "Phụ đề"}
          </span>
        </button>

        <button
          type="button"
          onClick={() => {
            if (isRecording) {
              confirmStopRecording()
            } else {
              handleToggleRecording()
            }
            setShowMoreMenu(false)
          }}
          disabled={isTogglingRecording}
          title={
            isRecording
              ? t?.rooms?.videoCall?.controls?.recordOff || "Stop recording"
              : t?.rooms?.videoCall?.controls?.recordOn || "Start recording"
          }
          aria-label={
            isRecording
              ? t?.rooms?.videoCall?.controls?.recordOff || "Stop recording"
              : t?.rooms?.videoCall?.controls?.recordOn || "Start recording"
          }
          className={`relative min-h-[68px] py-2.5 px-2 rounded-xl flex flex-col items-center justify-center gap-1 text-center transition-colors ${
            isRecording
              ? "bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400 animate-pulse"
              : "bg-[#F5F5F5] dark:bg-[#272727] text-neutral-800 dark:text-white hover:bg-neutral-200 dark:hover:bg-[#3D3D3D]"
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
          <span className="text-[11px] font-medium leading-tight line-clamp-2 break-words">
            {isRecording
              ? t?.rooms?.videoCall?.controls?.recordOff || "Stop recording"
              : t?.rooms?.videoCall?.controls?.recordOn || "Start recording"}
          </span>
          {!isRecording && !hasPersonalRecordPrivilege && (
            <span className="absolute top-2 right-2 inline-flex items-center justify-center w-5 h-5 rounded-full bg-[#990011] text-white">
              <Lock size={11} aria-hidden="true" />
            </span>
          )}
        </button>
      </div>

      <button
        type="button"
        onClick={handleCopyLink}
        className="w-full h-16 bg-[#F5F5F5] dark:bg-[#272727] text-black dark:text-white hover:bg-neutral-200 dark:hover:bg-[#3D3D3D] rounded-xl flex items-center justify-center gap-2 font-medium transition-colors"
      >
        <Copy size={20} />
        {t?.rooms?.videoCall?.copyLink || "Sao chép liên kết"}
      </button>

      {/* Q10: troubleshoot đã move ra RoomHeader, xóa khỏi More menu */}
      <div className="grid grid-cols-1 gap-3">
        <button
          type="button"
          onClick={() => setShowMobileSettings(true)}
          title={t?.common?.settings || "Cài đặt"}
          aria-label={t?.common?.settings || "Cài đặt"}
          className="h-16 bg-[#F5F5F5] dark:bg-[#272727] text-black dark:text-white hover:bg-neutral-200 dark:hover:bg-[#3D3D3D] rounded-xl flex items-center justify-center gap-2 font-medium transition-colors"
        >
          <Settings size={24} />
          <span>{t?.common?.settings || "Cài đặt"}</span>
        </button>
      </div>
    </>
  )
}

export default MoreMenuMobileGeneralView
