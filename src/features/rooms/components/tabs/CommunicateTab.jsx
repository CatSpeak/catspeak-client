import React, { useState, useCallback, useMemo } from "react"
import { useSearchParams } from "react-router-dom"
import CategoryRoomSection from "../sections/CategoryRoomSection"
import EmptyRoomState from "../EmptyRoomState"
import { useLanguage } from "@/shared/context/LanguageContext"
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
  isLoading = false,
}) => {
  const [searchParams, setSearchParams] = useSearchParams()
  const { t } = useLanguage()

  const handleCategoryClick = (categoryKey) => {
    const newParams = new URLSearchParams(searchParams)
    newParams.set("categories", categoryKey)
    newParams.set("page", "1")
    setSearchParams(newParams, { preventScrollReset: true })
  }

  const handleBackToOverview = () => {
    const newParams = new URLSearchParams(searchParams)
    newParams.delete("categories")
    newParams.delete("topics")
    newParams.delete("requiredLevels")
    newParams.delete("search")
    newParams.delete("page")
    setSearchParams(newParams, { preventScrollReset: true })
  }

  const search = searchParams.get("search")

  const isFilteredView =
    (selectedCategories && selectedCategories.length > 0) ||
    (topics && topics.length > 0) ||
    (requiredLevels && requiredLevels.length > 0) ||
    !!search

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

  const allCategoriesLoaded =
    sortedSections.length > 0 &&
    sortedSections.every((s) => categoryCounts[s.key] !== undefined)
  const isAllCategoriesEmpty =
    allCategoriesLoaded &&
    sortedSections.every((s) => categoryCounts[s.key] === 0)

  return (
    <div className="w-full relative">
      {isFilteredView ? (
        <FilteredRoomsView
          rooms={rooms}
          selectedCategories={selectedCategories}
          page={page}
          totalPages={totalPages}
          setPage={setPage}
          onBackToOverview={handleBackToOverview}
          isLoading={isLoading}
        />
      ) : (
        <div className="w-full flex flex-col gap-4">
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

          {isAllCategoriesEmpty && (
            <div className="py-4">
              <EmptyRoomState
                message={
                  t?.rooms?.filters?.noRoomsFound ||
                  "No active rooms available right now"
                }
              />
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default CommunicateTab
