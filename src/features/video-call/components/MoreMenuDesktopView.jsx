import React from "react"
import { useParams } from "react-router-dom"
import { useSelector } from "react-redux"
import {
  Gamepad2,
  History,
  Users,
  Split,
  Loader2,
  Circle,
  Captions,
  Sparkles,
  UserCircle,
  MonitorUp,
  Settings,
  RefreshCcw,
} from "lucide-react"
import { useGlobalVideoCall } from "@/features/video-call/context/GlobalVideoCallProvider"
import { useLanguage } from "@/shared/context/LanguageContext"
import { useSubtitleControls } from "@/features/video-call/hooks/useSubtitleControls"
import { useRecordingStatus } from "@/features/video-call/hooks/useRecordingStatus"
import { useGame } from "@/features/games/context/GameContext"
import { isBreakoutSupported } from "@/features/video-call/utils/roomTypeHelpers"
import MenuItem from "@/shared/components/ui/MenuItem"
import ProgressBar from "@/shared/components/ui/ProgressBar"

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
    showVirtualBackground,
    setShowVirtualBackground,
    showAvatarPicker,
    setShowAvatarPicker,
    showCC,
    setShowCC,
    isAISession,
    enterPiP,
    showTroubleshoot,
    setShowTroubleshoot,
    room,
    user,
    showBreakout,
    setShowBreakout,
    isRecording,
    isTogglingRecording,
    handleToggleRecording,
    confirmStopRecording,
    setShowRoomSettings,
    setActiveSettingsTab,
  } = useGlobalVideoCall()

  const { isBreakoutActive } = useSelector((s) => s.videoCall)
  const { gameState } = useGame()
  const isGameInProgress = gameState && gameState !== "idle"

  const {
    isSubtitleActive,
    isStarting,
    stopSubtitles,
  } = useSubtitleControls()

  const {
    formattedTime,
    totalUsedMb,
    limitMb,
    usagePercent,
    isDanger,
    isWarning,
  } = useRecordingStatus(isRecording, confirmStopRecording)

  const isHost =
    room?.creatorId != null &&
    user?.accountId != null &&
    String(room.creatorId) === String(user.accountId)

  const canStartGame = isHost && !isGameInProgress
  const gameDisabledReason = isGameInProgress
    ? "Đang có trò chơi trong phòng, không thể mở thêm"
    : !isHost
      ? "Chỉ host của phòng mới có thể bắt đầu trò chơi"
      : null

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

      <div className="border-t border-[#E5E5E5] my-[2px]"></div>

      <MenuItem
        onClick={() => {
          setShowParticipants(!showParticipants)
          setShowMoreMenu(false)
        }}
        icon={<Users size={20} />}
        label={t.rooms?.videoCall?.controls?.participants || "Participants"}
      />

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
          icon={
            isTogglingRecording ? (
              <Loader2 size={20} className="animate-spin" />
            ) : isRecording ? (
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
              <span className="font-semibold text-red-600">{formattedTime}</span>
            ) : undefined
          }
        />
        {isRecording && (
          <div className="px-4 pb-2 pt-1">
            <div className="flex items-center justify-between text-[10px] text-gray-500 mb-1">
              <span>Storage</span>
              <span>
                {totalUsedMb.toFixed(1)}MB / {limitMb.toFixed(0)}MB
              </span>
            </div>
            <ProgressBar
              progress={usagePercent}
              heightClass="h-1.5"
              trackColorClass="bg-[#F2F2F2]"
              colorClass={
                isDanger
                  ? "bg-red-500 animate-pulse"
                  : isWarning
                    ? "bg-amber-500"
                    : "bg-emerald-500"
              }
            />
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
              setShowSubtitlePicker((v) => !v)
            }
          }
        }}
        disabled={!isAISession && isStarting}
        icon={
          !isAISession && isStarting ? (
            <Loader2 size={20} className="animate-spin" />
          ) : (
            <Captions size={20} />
          )
        }
        label={
          (isAISession ? showCC : isSubtitleActive)
            ? t?.rooms?.videoCall?.controls?.captionsOff || "Turn off captions"
            : t?.rooms?.videoCall?.controls?.captionsOn || "Turn on captions"
        }
      />

      <div className="border-t border-[#E5E5E5] my-[2px]"></div>

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
        label={
          t?.rooms?.videoCall?.changeAvatar || "Change meeting avatar"
        }
      />

      {"documentPictureInPicture" in window && (
        <MenuItem
          onClick={() => {
            enterPiP?.()
            setShowMoreMenu(false)
          }}
          icon={<MonitorUp size={20} />}
          label={
            t?.rooms?.videoCall?.pictureInPicture || "Picture-in-Picture"
          }
        />
      )}

      <MenuItem
        onClick={() => {
          setShowTroubleshoot(!showTroubleshoot)
          setShowMoreMenu(false)
        }}
        icon={<RefreshCcw size={20} className="shrink-0" />}
        label={
          t?.rooms?.videoCall?.reconnect || "Troubleshoot connection"
        }
      />

      <MenuItem
        onClick={() => {
          setActiveSettingsTab?.("audio-video")
          setShowRoomSettings(true)
          setShowMoreMenu(false)
        }}
        icon={<Settings size={20} className="shrink-0" />}
        label={
          t?.rooms?.waitingScreen?.deviceSettings || "Cài đặt"
        }
      />
    </div>
  )
}

export default MoreMenuDesktopView
