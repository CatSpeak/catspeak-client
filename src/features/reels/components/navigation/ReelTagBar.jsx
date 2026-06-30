import React, { memo } from "react"
import { Trophy, Home, ChartNoAxesColumn } from "lucide-react"
import { useLanguage } from "@/shared/context/LanguageContext"
import TabButton from "./TabButton"

/**
 * Three-filter tabs bar for Reels Page.
 */
const ReelTagBar = memo(function ReelTagBar({
  activeFilter,
  onSelectFilter,
}) {
  const { t } = useLanguage()

  const handleFilterClick = (filterType) => {
    onSelectFilter(filterType, null)
  }

  return (
    <div className="flex  items-center  z-30 border-b border-gray-200 mb-8">
      <TabButton
        id="foryou"
        label={t.catSpeak.reels.foryou || "Dành cho bạn"}
        icon={Home}
        isActive={activeFilter === "foryou"}
        onClick={handleFilterClick}
      />
      <TabButton
        id="challenges"
        label={t.catSpeak.reels.challenges || "Thử thách"}
        icon={Trophy}
        isActive={activeFilter === "challenges"}
        onClick={handleFilterClick}
      />
      <TabButton
        id="leaderboard"
        label={t.catSpeak.reels.leaderboard?.title || "Bảng xếp hạng"}
        icon={ChartNoAxesColumn}
        isActive={activeFilter === "leaderboard"}
        onClick={handleFilterClick}
      />
    </div>
  )
})

export default ReelTagBar

