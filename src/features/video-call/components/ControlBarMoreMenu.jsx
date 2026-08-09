import React, { useState } from "react"
import { useParams } from "react-router-dom"
import { useGlobalVideoCall } from "@/features/video-call/context/GlobalVideoCallProvider"
import { useSubtitleControls } from "@/features/video-call/hooks/useSubtitleControls"
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
  const { isAISession, subtitleSupportedLangs, subtitleSelectedLanguage } =
    useGlobalVideoCall()
  const { isSubtitleActive, startSubtitles, changeSubtitleLanguage } =
    useSubtitleControls()

  const [showGameSetup, setShowGameSetup] = useState(false)
  const [showGameHistory, setShowGameHistory] = useState(false)
  const [showMobileSettings, setShowMobileSettings] = useState(false)
  const [showSubtitlePicker, setShowSubtitlePicker] = useState(false)
  const [showChooseLayout, setShowChooseLayout] = useState(false)

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
              className="fixed inset-x-0 bottom-0 md:absolute md:inset-x-auto md:bottom-[110%] md:right-0 z-50 md:mb-2 md:min-w-56 md:max-w-72 w-full"
            >
              <div className="w-full overflow-hidden rounded-t-[24px] md:rounded-lg border border-[#E5E5E5] bg-white shadow-lg pb-safe md:pb-0">
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
                        className="w-full bg-[#FFFFFF]"
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
