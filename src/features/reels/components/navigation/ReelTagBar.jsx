import React, { memo } from "react"
import { useLanguage } from "@/shared/context/LanguageContext"
import Tabs from "@/shared/components/ui/navigation/Tabs"
import { getReelTabsConfig } from "../../config/tabs"

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

  const tabsConfig = getReelTabsConfig(t)

  return (
    <Tabs
      tabs={tabsConfig}
      activeTab={activeFilter}
      onChange={handleFilterClick}
      className="mb-8"
    />
  )
})

export default ReelTagBar
