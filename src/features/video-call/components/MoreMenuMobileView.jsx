import React from "react"
import { AnimatePresence } from "framer-motion"
import FluentAnimation from "@/shared/components/ui/animations/FluentAnimation"
import MoreMenuMobileGeneralView from "./MoreMenuMobileGeneralView"
import MoreMenuMobileSettingsView from "./MoreMenuMobileSettingsView"

const MoreMenuMobileView = ({
  setShowMoreMenu,
  showMobileSettings,
  setShowMobileSettings,
  setShowGameSetup,
  setShowGameHistory,
  setShowSubtitlePicker,
  setShowChooseLayout,
}) => {
  return (
    <div className="flex md:hidden flex-col pt-2 w-full">
      <div
        className="w-full flex justify-center pb-4 px-4 cursor-pointer shrink-0"
        onClick={() => setShowMoreMenu(false)}
      >
        <div className="w-10 h-1.5 bg-[#D9D9D9] rounded-full" />
      </div>

      <AnimatePresence mode="wait" initial={false}>
        {!showMobileSettings ? (
          <FluentAnimation
            key="mobile-main-view"
            animationKey="mobile-main-view"
            direction="right"
            distance={15}
            exit={true}
            duration={0.2}
            className="flex flex-col gap-3 px-4 pb-6"
          >
            <MoreMenuMobileGeneralView
              setShowMoreMenu={setShowMoreMenu}
              setShowMobileSettings={setShowMobileSettings}
              setShowSubtitlePicker={setShowSubtitlePicker}
            />
          </FluentAnimation>
        ) : (
          <FluentAnimation
            key="mobile-settings-view"
            animationKey="mobile-settings-view"
            direction="left"
            distance={15}
            exit={true}
            duration={0.2}
            className="flex flex-col"
          >
            <MoreMenuMobileSettingsView
              setShowMoreMenu={setShowMoreMenu}
              setShowMobileSettings={setShowMobileSettings}
              setShowGameSetup={setShowGameSetup}
              setShowGameHistory={setShowGameHistory}
              setShowChooseLayout={setShowChooseLayout}
            />
          </FluentAnimation>
        )}
      </AnimatePresence>
    </div>
  )
}

export default MoreMenuMobileView

