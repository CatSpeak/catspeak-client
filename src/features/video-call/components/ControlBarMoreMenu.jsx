import React, { useState, useEffect } from "react"
import { useParams } from "react-router-dom"
import { useGlobalVideoCall } from "@/features/video-call/context/GlobalVideoCallProvider"
import { useLanguage } from "@/shared/context/LanguageContext"
import FluentAnimation from "@/shared/components/ui/animations/FluentAnimation"
import { AnimatePresence, motion as Motion } from "framer-motion"
import SubtitleLanguagePicker from "./SubtitleLanguagePicker"
import GameSetupModal from "@/features/games/components/shared/GameSetupModal"
import GameHistoryModal from "@/features/games/components/shared/GameHistoryModal"
import ChooseLayoutModal from "./ChooseLayoutModal"
import MoreMenuDesktopView from "./MoreMenuDesktopView"
import MoreMenuMobileView from "./MoreMenuMobileView"

// M3 vertical unroll dropdown variants matching ProfileDropdown.jsx (originating from bottom)
const moreMenuVariants = {
  initial: { opacity: 0, scaleY: 0, transformOrigin: "bottom" },
  animate: {
    opacity: 1,
    scaleY: 1,
    transformOrigin: "bottom",
    transition: {
      duration: 0.2,
      ease: [0.25, 1, 0.5, 1],
    },
  },
  exit: {
    opacity: 0,
    scaleY: 0,
    transformOrigin: "bottom",
    transition: {
      duration: 0.15,
      ease: [0.25, 1, 0.5, 1],
    },
  },
}

const ControlBarMoreMenu = ({ showMoreMenu, setShowMoreMenu }) => {
  const { id: roomId } = useParams()
  const { t } = useLanguage()
  const {
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
  const [wasMoreMenuOpen, setWasMoreMenuOpen] = useState(showMoreMenu)

  // Reset inner submenus when the menu closes, adjusted during render so the
  // reset never triggers a cascading effect render.
  if (showMoreMenu !== wasMoreMenuOpen) {
    setWasMoreMenuOpen(showMoreMenu)
    if (!showMoreMenu) {
      setShowSubtitlePicker(false)
      setShowMobileSettings(false)
    }
  }

  // ISS-86: Escape closes the innermost open view, then the menu itself
  useEffect(() => {
    if (!showMoreMenu) return undefined
    const handleKeyDown = (event) => {
      if (event.key !== "Escape") return
      if (showSubtitlePicker) {
        setShowSubtitlePicker(false)
        return
      }
      if (showMobileSettings) {
        setShowMobileSettings(false)
        return
      }
      setShowMoreMenu(false)
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [
    showMoreMenu,
    showSubtitlePicker,
    showMobileSettings,
    setShowMoreMenu,
  ])

  return (
    <>
      <AnimatePresence>
        {showMoreMenu && (
          <>
            <Motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="fixed inset-0 z-40 bg-black/40 md:bg-transparent"
              onClick={() => setShowMoreMenu(false)}
            />
            <Motion.div
              variants={moreMenuVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="fixed inset-x-0 bottom-0 md:absolute md:inset-x-auto md:bottom-[110%] md:right-0 z-50 md:mb-2 md:min-w-64 md:max-w-80 w-full origin-bottom"
            >
              <div className="w-full max-h-[82dvh] overflow-y-auto overflow-x-hidden md:max-h-[calc(100dvh-140px)] rounded-t-3xl md:rounded-xl border border-border dark:border-[#3F3F3F] bg-white dark:bg-[#1A1A1A] text-foreground dark:text-white shadow-lg pb-safe md:pb-0">
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
            </Motion.div>
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
