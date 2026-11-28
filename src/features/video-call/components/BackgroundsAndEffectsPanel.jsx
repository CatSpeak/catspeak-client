import React, { useState } from "react"
import { X } from "lucide-react"
import VirtualBackgroundPicker from "./VirtualBackgroundPicker"
import BeautyPicker from "./BeautyPicker"
import { useLanguage } from "@/shared/context/LanguageContext"
import { Tabs, TabContent } from "@/shared/components/ui/navigation"
import { IconButton } from "@/shared/components/ui/buttons"
import { usePlanFeatures } from "@/shared/hooks/usePlanFeatures"
import { PLAN_FEATURES } from "@/shared/constants/planFeatures"

import { useGlobalVideoCall } from "@/features/video-call/context/GlobalVideoCallProvider"
import { isBeautyFilterSupported } from "@/features/video-call/utils/roomTypeHelpers"

/**
 * Tab strip + content panel for Backgrounds / Beauty effects.
 * Used inside the room side panel (no modal wrapper or video preview).
 */
const BackgroundsAndEffectsPanel = ({ onClose }) => {
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
      {/* Header: title + close */}
      {onClose && (
        <div className="flex shrink-0 items-center justify-between gap-2 pl-4 pr-1 min-h-[52px] border-b border-border dark:border-[#3F3F3F]">
          <span className="text-base font-bold truncate">
            {t?.rooms?.videoCall?.backgroundsAndEffects ||
              "Backgrounds and effects"}
          </span>
          <IconButton
            variant="ghost"
            onClick={onClose}
            title={t?.common?.close || "Đóng"}
            aria-label={t?.common?.close || "Đóng"}
            className="shrink-0"
          >
            <X />
          </IconButton>
        </div>
      )}

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
