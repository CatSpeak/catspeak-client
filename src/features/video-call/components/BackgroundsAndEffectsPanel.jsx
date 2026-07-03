import React, { useState } from "react"
import VirtualBackgroundPicker from "./VirtualBackgroundPicker"
import BeautyPicker from "./BeautyPicker"
import { useLanguage } from "@/shared/context/LanguageContext"
import { Tabs } from "@/shared/components/ui/navigation"
import { usePlanFeatures } from "@/shared/hooks/usePlanFeatures"
import { PLAN_FEATURES } from "@/shared/constants/planFeatures"

/**
 * Tab strip + content panel for Backgrounds / Beauty effects.
 * Used inside the room side panel (no modal wrapper or video preview).
 */
const BackgroundsAndEffectsPanel = () => {
  const { t } = useLanguage()
  const [activeTab, setActiveTab] = useState("backgrounds")
  const { hasFeature } = usePlanFeatures()

  const hasBeautyFilter = hasFeature(PLAN_FEATURES.BEAUTY_FILTER)

  const tabs = [
    { id: "backgrounds", label: t?.rooms?.videoCall?.tabBackgrounds || "Backgrounds" },
    ...(hasBeautyFilter ? [{ id: "beauty", label: t?.rooms?.beauty?.tabLabel || "Beauty" }] : [])
  ]

  const scrollbarClasses =
    "[&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-cath-red-700 [&::-webkit-scrollbar-thumb]:bg-clip-padding [&::-webkit-scrollbar-thumb]:border-2 [&::-webkit-scrollbar-thumb:hover]:border-0 [&::-webkit-scrollbar-thumb]:border-solid [&::-webkit-scrollbar-thumb]:border-transparent [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar]:w-[6px] [&::-webkit-scrollbar]:h-[6px]"

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Tab strip */}
      <Tabs
        tabs={tabs}
        activeTab={activeTab}
        onChange={setActiveTab}
      />

      {/* Tab content */}
      <div className={`flex-1 overflow-y-auto ${scrollbarClasses}`}>
        {activeTab === "backgrounds" ? (
          <VirtualBackgroundPicker />
        ) : (
          hasBeautyFilter && <BeautyPicker />
        )}
      </div>
    </div>
  )
}

export default BackgroundsAndEffectsPanel
