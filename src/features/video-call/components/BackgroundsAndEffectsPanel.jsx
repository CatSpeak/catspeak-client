import React, { useState } from "react"
import VirtualBackgroundPicker from "./VirtualBackgroundPicker"
import BeautyPicker from "./BeautyPicker"
import { useLanguage } from "@/shared/context/LanguageContext"
import { Tabs, TabContent } from "@/shared/components/ui/navigation"
import { usePlanFeatures } from "@/shared/hooks/usePlanFeatures"
import { PLAN_FEATURES } from "@/shared/constants/planFeatures"

import { useGlobalVideoCall } from "@/features/video-call/context/GlobalVideoCallProvider"
import { isBeautyFilterSupported } from "@/features/video-call/utils/roomTypeHelpers"

/**
 * Tab strip + content panel for Backgrounds / Beauty effects.
 * Used inside the room side panel (no modal wrapper or video preview).
 */
const BackgroundsAndEffectsPanel = () => {
  const { t } = useLanguage()
  const { room } = useGlobalVideoCall()
  const [activeTab, setActiveTab] = useState("backgrounds")
  const { hasFeature, isPro } = usePlanFeatures()

  const userHasProPlan = Boolean(isPro || hasFeature(PLAN_FEATURES.BEAUTY_FILTER))

  const isBeautyAllowed =
    userHasProPlan &&
    isBeautyFilterSupported(room?.roomType, userHasProPlan)

  const tabs = [
    { id: "backgrounds", label: t?.rooms?.videoCall?.tabBackgrounds || "Backgrounds" },
    ...(isBeautyAllowed ? [{ id: "beauty", label: t?.rooms?.beauty?.tabLabel || "Beauty" }] : [])
  ]

  const handleTabChange = (nextTab) => {
    setActiveTab(nextTab)
  }

  const scrollbarClasses =
    "[&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-cath-red-700 dark:[&::-webkit-scrollbar-thumb]:bg-cath-red-1000 [&::-webkit-scrollbar-thumb]:bg-clip-padding [&::-webkit-scrollbar-thumb]:border-2 [&::-webkit-scrollbar-thumb:hover]:border-0 [&::-webkit-scrollbar-thumb]:border-solid [&::-webkit-scrollbar-thumb]:border-transparent [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar]:w-[6px] [&::-webkit-scrollbar]:h-[6px]"

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Tab strip */}
      <Tabs
        tabs={tabs}
        activeTab={activeTab}
        onChange={handleTabChange}
      />

      {/* Tab content */}
      <div className={`flex-1 overflow-y-auto overflow-x-hidden ${scrollbarClasses}`}>
        <div className="p-4">
          <TabContent
            activeTab={activeTab}
            tabs={tabs}
            className="w-full"
          >
            {activeTab === "backgrounds" ? (
              <VirtualBackgroundPicker />
            ) : (
              isBeautyAllowed && <BeautyPicker />
            )}
          </TabContent>
        </div>
      </div>
    </div>
  )
}

export default BackgroundsAndEffectsPanel
