import React from "react"
import {
  ChevronLeft,
  Gamepad2,
  History,
  Split,
  Sparkles,
  UserCircle,
  LayoutGrid,
  MonitorUp,
  Settings,
} from "lucide-react"
import { useGlobalVideoCall } from "@/features/video-call/context/GlobalVideoCallProvider"
import { useLanguage } from "@/shared/context/LanguageContext"
import { useGameControlStatus } from "@/features/games/hooks/useGameControlStatus"
import ListItem from "@/shared/components/ui/ListItem"

const MoreMenuMobileSettingsView = ({
  setShowMoreMenu,
  setShowMobileSettings,
  setShowGameSetup,
  setShowGameHistory,
  setShowChooseLayout,
}) => {
  const { t } = useLanguage()
  const {
    isAISession,
    showBreakout,
    setShowBreakout,
    showVirtualBackground,
    setShowVirtualBackground,
    showAvatarPicker,
    setShowAvatarPicker,
    setActiveSettingsTab,
    setShowRoomSettings,
    enterPiP,
    isPiPSupported,
  } = useGlobalVideoCall()

  const { canStartGame, gameDisabledReason } = useGameControlStatus()

  return (
    <>
      <ListItem
        onClick={() => setShowMobileSettings(false)}
        hoverEffect={true}
        leftContent={<ChevronLeft size={24} />}
        className="border-b border-border font-semibold"
      >
        {t?.rooms?.videoCall?.backBtn || "Back"}
      </ListItem>

      <div className="max-h-[300px] overflow-y-auto flex flex-col no-scrollbar pb-4 pb-safe">
        <ListItem
          onClick={() => {
            if (!canStartGame) return
            setShowMoreMenu(false)
            setShowGameSetup(true)
          }}
          disabled={!canStartGame}
          hoverEffect={true}
          className={!canStartGame ? "opacity-50 cursor-not-allowed" : ""}
          leftContent={<Gamepad2 size={24} />}
          title={gameDisabledReason || undefined}
        >
          {t?.rooms?.videoCall?.controls?.playGames || "Trò chơi"}
        </ListItem>

        <ListItem
          onClick={() => {
            setShowMoreMenu(false)
            setShowGameHistory(true)
          }}
          hoverEffect={true}
          leftContent={<History size={24} />}
        >
          {t.rooms?.game?.crackIt?.gameHistory || "Game History"}
        </ListItem>

        {!isAISession && (
          <ListItem
            onClick={() => {
              setShowBreakout(!showBreakout)
              setShowMoreMenu(false)
            }}
            hoverEffect={true}
            leftContent={<Split size={24} />}
          >
            {t?.rooms?.breakoutRooms?.breakoutRoomOption || "Breakout Rooms"}
          </ListItem>
        )}

        <ListItem
          onClick={() => {
            setShowVirtualBackground(!showVirtualBackground)
            setShowMoreMenu(false)
          }}
          hoverEffect={true}
          leftContent={<Sparkles size={24} />}
        >
          {t?.rooms?.videoCall?.backgroundsAndEffects ||
            "Backgrounds and effects"}
        </ListItem>

        <ListItem
          onClick={() => {
            setShowAvatarPicker(!showAvatarPicker)
            setShowMoreMenu(false)
          }}
          hoverEffect={true}
          leftContent={<UserCircle size={24} />}
        >
          {t?.rooms?.videoCall?.changeAvatar || "Change meeting avatar"}
        </ListItem>

        <ListItem
          onClick={() => {
            setShowChooseLayout?.(true)
            setShowMoreMenu(false)
          }}
          hoverEffect={true}
          leftContent={<LayoutGrid size={24} />}
        >
          {t?.rooms?.videoCall?.changeLayout?.title ||
            t?.rooms?.videoCall?.controls?.changeLayout ||
            "Điều chỉnh chế độ xem"}
        </ListItem>

        {(isPiPSupported ?? ("documentPictureInPicture" in window)) && (
          <ListItem
            onClick={() => {
              enterPiP?.()
              setShowMoreMenu(false)
            }}
            hoverEffect={true}
            leftContent={<MonitorUp size={24} />}
          >
            {t?.rooms?.videoCall?.pictureInPicture || "Picture-in-Picture"}
          </ListItem>
        )}

        <ListItem
          onClick={() => {
            setActiveSettingsTab?.("audio-video")
            setShowRoomSettings(true)
            setShowMoreMenu(false)
          }}
          hoverEffect={true}
          leftContent={<Settings size={24} />}
        >
          {t?.rooms?.waitingScreen?.deviceSettings || "Cài đặt"}
        </ListItem>
      </div>
    </>
  )
}

export default MoreMenuMobileSettingsView
