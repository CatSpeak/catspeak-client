import React from "react"
import { useParams } from "react-router-dom"
import { useSelector } from "react-redux"
import {
  Gamepad2,
  History,
  Users,
  Split,
  Circle,
  Captions,
  Sparkles,
  UserCircle,
  MonitorUp,
  Settings,
  BarChart2,
  Clapperboard,
  AlertTriangle,
  Languages,
} from "lucide-react"
import { useGlobalVideoCall } from "@/features/video-call/context/GlobalVideoCallProvider"
import { useLanguage } from "@/shared/context/LanguageContext"
import { useGameControlStatus } from "@/features/games/hooks/useGameControlStatus"
import {
  isBreakoutSupported,
  isSpeakingTimeBalanceSupported,
} from "@/features/video-call/utils/roomTypeHelpers"
import MenuItem from "@/shared/components/ui/MenuItem"
import ProgressBar from "@/shared/components/ui/ProgressBar"
import { getLanguageFlag } from "./SubtitleLanguagePicker"

const MoreMenuDesktopView = ({
  setShowMoreMenu,
  setShowGameSetup,
  setShowGameHistory,
  setShowSubtitlePicker,
}) => {
  const { t } = useLanguage()
  const {
    showParticipants,
    setShowParticipants,
    showSpeakingTimeBalance,
    setShowSpeakingTimeBalance,
    showStudentSpeakingWidget,
    setShowStudentSpeakingWidget,
    showVirtualBackground,
    setShowVirtualBackground,
    showAvatarPicker,
    setShowAvatarPicker,
    showCC,
    setShowCC,
    isAISession,
    enterPiP,
    isPiPSupported,
    room,
    user,
    showBreakout,
    setShowBreakout,
    isRecording,
    isTogglingRecording,
    handleToggleRecording,
    confirmStopRecording,
    recordingStatus,
    setShowRoomSettings,
    setActiveSettingsTab,
    isSubtitleActive,
    isStartingSubtitles,
    isStoppingSubtitles,
    stopSubtitles,
    showWatchTogether,
    setShowWatchTogether,
    subtitleSelectedLanguage,
  } = useGlobalVideoCall()

  const { isBreakoutActive } = useSelector((s) => s.videoCall)
  const { isHost, canStartGame, gameDisabledReason } = useGameControlStatus()

  const {
    formattedTime = "00:00",
    totalUsedMb = 0,
    limitMb = null,
    usagePercent = 0,
    isDanger = false,
    isWarning = false,
  } = recordingStatus || {}

  return (
    <div className="hidden md:flex flex-col py-[2px]">
      <MenuItem
        onClick={() => {
          if (!canStartGame) return
          setShowMoreMenu(false)
          setShowGameSetup(true)
        }}
        disabled={!canStartGame}
        className={!canStartGame ? "opacity-50 cursor-not-allowed" : ""}
        icon={<Gamepad2 size={20} />}
        label={t?.rooms?.videoCall?.controls?.playGames || "Trò chơi"}
        title={gameDisabledReason || undefined}
      />

      <MenuItem
        onClick={() => {
          setShowMoreMenu(false)
          setShowGameHistory(true)
        }}
        icon={<History size={20} />}
        label={t.rooms?.game?.crackIt?.gameHistory || "Game History"}
      />

      <div className="border-t border-border dark:border-[#3F3F3F] my-[2px]"></div>

      <MenuItem
        onClick={() => {
          setShowParticipants(!showParticipants)
          setShowMoreMenu(false)
        }}
        icon={<Users size={20} />}
        label={t.rooms?.videoCall?.controls?.participants || "Participants"}
      />

      {!isAISession && isSpeakingTimeBalanceSupported(room) && (
        <MenuItem
          onClick={() => {
            if (isHost) {
              setShowSpeakingTimeBalance(!showSpeakingTimeBalance)
            } else {
              setShowStudentSpeakingWidget(!showStudentSpeakingWidget)
            }
            setShowMoreMenu(false)
          }}
          icon={<BarChart2 size={20} />}
          label={
            t?.rooms?.videoCall?.controls?.speakingTimeBalance ||
            "Speaking Time Balance"
          }
        />
      )}

      {!isAISession &&
        isBreakoutSupported(room?.roomType) &&
        (isHost || isBreakoutActive) && (
          <MenuItem
            onClick={() => {
              setShowBreakout(!showBreakout)
              setShowMoreMenu(false)
            }}
            icon={<Split size={20} />}
            label={
              t?.rooms?.breakoutRooms?.breakoutRoomOption || "Breakout Rooms"
            }
          />
        )}

      {!isAISession && isHost && (
        <MenuItem
          onClick={() => {
            setShowWatchTogether(!showWatchTogether)
            setShowMoreMenu(false)
          }}
          icon={<Clapperboard size={20} />}
          label={
            t?.rooms?.videoCall?.watchTogether?.toggleButton || "Watch together"
          }
        />
      )}

      <div className="flex flex-col">
        <MenuItem
          onClick={() => {
            if (isRecording) {
              confirmStopRecording()
            } else {
              handleToggleRecording()
            }
            setShowMoreMenu(false)
          }}
          disabled={isTogglingRecording}
          className={isTogglingRecording ? "opacity-50 cursor-not-allowed" : ""}
          icon={
            isRecording ? (
              <Circle
                size={20}
                className="text-red-600 fill-red-600 animate-pulse"
              />
            ) : (
              <Circle size={20} />
            )
          }
          label={
            isRecording
              ? t?.rooms?.videoCall?.controls?.recordOff || "Stop recording"
              : t?.rooms?.videoCall?.controls?.recordOn || "Start recording"
          }
          rightText={
            isRecording ? (
              <span className="font-semibold">{formattedTime}</span>
            ) : undefined
          }
        />
        {isRecording && (
          <div className="px-4 py-2.5">
            <div className="flex items-center justify-between text-xs text-secondary dark:text-[#AAAAAA] mb-1">
              <span>{t?.recordings?.storage?.title || "Storage"}</span>
              <span>
                {totalUsedMb.toFixed(1)}MB{" "}
                {limitMb != null && limitMb > 0
                  ? `/ ${limitMb.toFixed(0)}MB`
                  : "(Unlimited)"}
              </span>
            </div>

            <ProgressBar
              progress={usagePercent}
              heightClass="h-1"
              trackColorClass="bg-primaryBg dark:bg-[#272727]"
              colorClass={
                isDanger
                  ? "bg-red-500 animate-pulse"
                  : isWarning
                    ? "bg-amber-500"
                    : "bg-emerald-500"
              }
            />
            {isDanger && (
              <div className="flex items-center gap-1 text-xs text-red-600 font-bold mt-1 animate-pulse">
                <AlertTriangle size={18} />
                <span>Critical Space!</span>
              </div>
            )}
            {isWarning && !isDanger && (
              <div className="flex items-center gap-1 text-xs text-amber-600 font-semibold mt-1">
                <AlertTriangle size={18} />
                <span>Approaching Limit.</span>
              </div>
            )}
          </div>
        )}
      </div>

      <MenuItem
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
        icon={<Captions size={20} />}
        label={
          (isAISession ? showCC : isSubtitleActive)
            ? t?.rooms?.videoCall?.controls?.captionsOff || "Turn off captions"
            : t?.rooms?.videoCall?.controls?.captionsOn || "Turn on captions"
        }
        hasSubmenu={!isAISession && !isSubtitleActive}
      />

      {!isAISession && isSubtitleActive && (
        <MenuItem
          onClick={() => setShowSubtitlePicker(true)}
          disabled={isStartingSubtitles || isStoppingSubtitles}
          icon={<Languages size={20} />}
          label={
            t?.rooms?.videoCall?.controls?.selectSubtitleLanguage ||
            "Chọn ngôn ngữ phụ đề"
          }
          rightContent={
            getLanguageFlag(subtitleSelectedLanguage) ? (
              <span className="flex h-5 w-5 shrink-0 overflow-hidden rounded-full border border-border dark:border-[#3F3F3F]">
                <img
                  src={getLanguageFlag(subtitleSelectedLanguage)}
                  alt=""
                  className="block h-full w-full object-cover"
                  draggable={false}
                />
              </span>
            ) : undefined
          }
          rightText={
            t?.rooms?.videoCall?.subtitleLanguages?.[subtitleSelectedLanguage] ||
            subtitleSelectedLanguage
          }
          hasSubmenu={true}
        />
      )}

      <div className="border-t border-border dark:border-[#3F3F3F] my-[2px]"></div>

      <MenuItem
        onClick={() => {
          setShowVirtualBackground(!showVirtualBackground)
          setShowMoreMenu(false)
        }}
        icon={<Sparkles size={20} className="shrink-0" />}
        label={
          t?.rooms?.videoCall?.backgroundsAndEffects ||
          "Backgrounds and effects"
        }
      />

      <MenuItem
        onClick={() => {
          setShowAvatarPicker(!showAvatarPicker)
          setShowMoreMenu(false)
        }}
        icon={<UserCircle size={20} />}
        label={t?.rooms?.videoCall?.changeAvatar || "Change meeting avatar"}
      />

      {(isPiPSupported ?? "documentPictureInPicture" in window) && (
        <MenuItem
          onClick={() => {
            enterPiP?.()
            setShowMoreMenu(false)
          }}
          icon={<MonitorUp size={20} />}
          label={t?.rooms?.videoCall?.pictureInPicture || "Picture-in-Picture"}
        />
      )}

      {/* Q10: troubleshoot đã move ra RoomHeader, xóa khỏi More menu */}
      <MenuItem
        onClick={() => {
          setActiveSettingsTab?.("audio-video")
          setShowRoomSettings(true)
          setShowMoreMenu(false)
        }}
        icon={<Settings size={20} className="shrink-0" />}
        label={t?.rooms?.waitingScreen?.deviceSettings || "Cài đặt"}
      />
    </div>
  )
}

export default MoreMenuDesktopView
