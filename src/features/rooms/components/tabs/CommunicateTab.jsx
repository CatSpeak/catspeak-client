import React, { useState, useCallback, useMemo } from "react"

import { useSearchParams } from "react-router-dom"
import CategoryRoomSection from "../sections/CategoryRoomSection"
import { useLanguage } from "@/shared/context/LanguageContext"
import { AnimatePresence } from "framer-motion"
import { FadeAnimation } from "@/shared/components/ui/animations"
import FilteredRoomsView from "../views/FilteredRoomsView"
import { getSections } from "../../config/communicateTabConfig"

const CommunicateTab = ({
  rooms = [], // Only used in Filtered View
  selectedCategories,
  page, // Global page (only for filtered view)
  totalPages, // Global totalPages (only for filtered view)
  setPage, // Global setPage (only for filtered view)
  languageType,
  requiredLevels,
  topics,
}) => {
  const [searchParams, setSearchParams] = useSearchParams()
  const { t } = useLanguage()

  const handleCategoryClick = (categoryKey) => {
    const newParams = new URLSearchParams(searchParams)
    newParams.set("categories", categoryKey)
    newParams.set("page", 1) // Reset to page 1
    setSearchParams(newParams, { preventScrollReset: true })

    // If setPage is provided (it should be in filtered view, but might be needed to reset parent state)
    if (setPage) setPage(1)
  }

  const handleBackToOverview = () => {
    const newParams = new URLSearchParams(searchParams)
    newParams.delete("categories")
    newParams.delete("page")
    setSearchParams(newParams, { preventScrollReset: true })
    if (setPage) setPage(1)
  }

  const isFilteredView = selectedCategories && selectedCategories.length > 0

  const [categoryCounts, setCategoryCounts] = useState({})

  const handleTotalCountLoaded = useCallback((categoryKey, count) => {
    setCategoryCounts((prev) => {
      if (prev[categoryKey] === count) return prev
      return { ...prev, [categoryKey]: count }
    })
  }, [])

  const sortedSections = useMemo(() => {
    return getSections(t).sort((a, b) => {
      const countA = categoryCounts[a.key] ?? -1
      const countB = categoryCounts[b.key] ?? -1
      return countB - countA
    })
  }, [t, categoryCounts])

  return (
    <div className="w-full relative px-6">
      <AnimatePresence mode="wait">
        <FadeAnimation
          key={isFilteredView ? "filtered" : "overview"}
          className="w-full"
        >
          {isFilteredView ? (
            <FilteredRoomsView
              rooms={rooms}
              selectedCategories={selectedCategories}
              page={page}
              totalPages={totalPages}
              setPage={setPage}
              onBackToOverview={handleBackToOverview}
            />
          ) : (
            <div className="w-full flex flex-col gap-10">
              {sortedSections.map((section) => (
                <CategoryRoomSection
                  key={section.key}
                  categoryKey={section.key}
                  title={section.title}
                  languageType={languageType}
                  requiredLevels={requiredLevels}
                  topics={topics}
                  onSeeMore={handleCategoryClick}
                  onTotalCountLoaded={handleTotalCountLoaded}
                />
              ))}
            </div>
          )}
        </FadeAnimation>
      </AnimatePresence>
    </div>
  )
}

export default CommunicateTab
