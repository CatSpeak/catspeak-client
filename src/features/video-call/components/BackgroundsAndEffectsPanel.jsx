// src/features/video-call/components/BackgroundsAndEffectsPanel.jsx
import React, { useState } from "react"
import VirtualBackgroundPicker from "./VirtualBackgroundPicker"
import BeautyPicker from "./BeautyPicker"
import { useLanguage } from "@/shared/context/LanguageContext"

const TABS = ["backgrounds", "beauty"]

/**
 * Tab strip + content panel for Backgrounds / Beauty effects.
 * Used inside the room side panel (no modal wrapper or video preview).
 */
const BackgroundsAndEffectsPanel = () => {
  const { t } = useLanguage()
  const [activeTab, setActiveTab] = useState("backgrounds")

  const tabLabel = (tab) => {
    if (tab === "backgrounds")
      return t?.rooms?.videoCall?.tabBackgrounds || "Backgrounds"
    return t?.rooms?.beauty?.tabLabel || "Beauty"
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Tab strip */}
      <div className="flex border-b border-[#E5E5E5] shrink-0">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px ${
              activeTab === tab
                ? "border-cath-red-600 text-cath-red-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            {tabLabel(tab)}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === "backgrounds" ? (
          <VirtualBackgroundPicker />
        ) : (
          <BeautyPicker />
        )}
      </div>
    </div>
  )
}

export default BackgroundsAndEffectsPanel
