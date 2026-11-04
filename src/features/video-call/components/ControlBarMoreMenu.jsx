import React, { useState, useEffect } from "react"
import { useParams } from "react-router-dom"
import { useGlobalVideoCall } from "@/features/video-call/context/GlobalVideoCallProvider"
import { useLanguage } from "@/shared/context/LanguageContext"
import FluentAnimation from "@/shared/components/ui/animations/FluentAnimation"
import { AnimatePresence } from "framer-motion"
import SubtitleLanguagePicker from "./SubtitleLanguagePicker"
import GameSetupModal from "@/features/games/components/shared/GameSetupModal"
import GameHistoryModal from "@/features/games/components/shared/GameHistoryModal"
import ChooseLayoutModal from "./ChooseLayoutModal"
import MoreMenuDesktopView from "./MoreMenuDesktopView"
import MoreMenuMobileView from "./MoreMenuMobileView"

const ControlBarMoreMenu = ({
  showMoreMenu,
  setShowMoreMenu,
  setShowGameModal,
}) => {
  const { id: roomId } = useParams()
  const { t } = useLanguage()
  const {
    isAISession,
    subtitleSupportedLangs,
    subtitleSelectedLanguage,
    isSubtitleActive,
    startSubtitles,
    changeSubtitleLanguage,
  } = useGlobalVideoCall()

  const [showGameSetup, setShowGameSetup] = useState(false)
  const [showGameHistory, setShowGameHistory] = useState(false)
  const [showMobileSettings, setShowMobileSettings] = useState(false)
  const [showSubtitlePicker, setShowSubtitlePicker] = useState(false)
  const [showChooseLayout, setShowChooseLayout] = useState(false)

  // Reset inner submenus when menu is closed
  useEffect(() => {
    if (!showMoreMenu) {
      setShowSubtitlePicker(false)
      setShowMobileSettings(false)
    }
  }, [showMoreMenu])

  return (
    <>
      <AnimatePresence>
        {showMoreMenu && (
          <>
            <div
              className="fixed inset-0 z-40 bg-black/40 md:bg-transparent"
              onClick={() => setShowMoreMenu(false)}
            />
            <FluentAnimation
              animationKey="more-menu"
              direction="up"
              distance={15}
              exit={true}
              duration={0.2}
              className="fixed inset-x-0 bottom-0 md:absolute md:inset-x-auto md:bottom-[110%] md:right-0 z-50 md:mb-2 md:min-w-64 md:max-w-80 w-full"
            >
              <div className="w-full overflow-hidden rounded-t-3xl md:rounded-xl border border-border dark:border-[#3F3F3F] bg-white dark:bg-[#1A1A1A] text-foreground dark:text-white shadow-lg pb-safe md:pb-0">
                <AnimatePresence mode="wait" initial={false}>
                  {!showSubtitlePicker ? (
                    <FluentAnimation
                      key="main-menu"
                      animationKey="main-menu"
                      direction="right"
                      distance={15}
                      exit={true}
                      duration={0.2}
                      className="w-full"
                    >
                      <MoreMenuDesktopView
                        setShowMoreMenu={setShowMoreMenu}
                        setShowGameSetup={setShowGameSetup}
                        setShowGameHistory={setShowGameHistory}
                        setShowSubtitlePicker={setShowSubtitlePicker}
                      />

                      <MoreMenuMobileView
                        setShowMoreMenu={setShowMoreMenu}
                        showMobileSettings={showMobileSettings}
                        setShowMobileSettings={setShowMobileSettings}
                        setShowGameSetup={setShowGameSetup}
                        setShowGameHistory={setShowGameHistory}
                        setShowSubtitlePicker={setShowSubtitlePicker}
                        setShowChooseLayout={setShowChooseLayout}
                      />
                    </FluentAnimation>
                  ) : (
                    <FluentAnimation
                      key="subtitle-picker"
                      animationKey="subtitle-picker"
                      direction="left"
                      distance={15}
                      exit={true}
                      duration={0.2}
                      className="flex w-full flex-col"
                    >
                      <SubtitleLanguagePicker
                        languages={subtitleSupportedLangs}
                        selectedLanguage={subtitleSelectedLanguage}
                        label={
                          t?.rooms?.videoCall?.controls?.selectSubtitleLanguage
                        }
                        languageNames={t?.rooms?.videoCall?.subtitleLanguages}
                        onSelect={(lang) => {
                          if (isSubtitleActive) {
                            changeSubtitleLanguage(lang)
                          } else {
                            startSubtitles(lang)
                          }
                          setShowSubtitlePicker(false)
                          setShowMoreMenu(false)
                        }}
                        onBack={() => setShowSubtitlePicker(false)}
                        backLabel={
                          t?.rooms?.videoCall?.controls?.back || "Back"
                        }
                        onClose={() => setShowSubtitlePicker(false)}
                        className="w-full bg-transparent text-foreground dark:text-white"
                      />
                    </FluentAnimation>
                  )}
                </AnimatePresence>
              </div>
            </FluentAnimation>
          </>
        )}
      </AnimatePresence>

      <GameSetupModal
        open={showGameSetup}
        onClose={() => setShowGameSetup(false)}
      />

      <GameHistoryModal
        open={showGameHistory}
        onClose={() => setShowGameHistory(false)}
        roomName={roomId}
      />

      <ChooseLayoutModal
        open={showChooseLayout}
        onClose={() => setShowChooseLayout(false)}
      />
    </>
  )
}

export default ControlBarMoreMenu
