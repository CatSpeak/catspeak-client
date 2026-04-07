import React from "react"

import { useSearchParams } from "react-router-dom"
import RoomCard from "../RoomCard"
import CategoryRoomSection from "../sections/CategoryRoomSection"
import EmptyRoomState from "../EmptyRoomState"
import LevelFilter from "../filters/LevelFilter"
import TopicFilter from "../filters/TopicFilter"
import { useLanguage } from "@/shared/context/LanguageContext"
import { AnimatePresence } from "framer-motion"
import { FadeAnimation } from "@/shared/components/ui/animations"
import Breadcrumb from "@/shared/components/ui/navigation/Breadcrumb"
import {
  categoryFriendlyNames,
  getSections,
} from "../../config/communicateTabConfig"

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

  const sections = getSections(t)

  return (
    <div className="w-full relative">
      <AnimatePresence mode="wait">
        <FadeAnimation
          key={isFilteredView ? "filtered" : "overview"}
          className="w-full"
        >
          {isFilteredView ? (
            <div className="w-full flex flex-col gap-3">
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <Breadcrumb
                  items={[
                    {
                      label: t.rooms.filters.breadcrumb,
                      onClick: handleBackToOverview,
                    },
                    {
                      label: selectedCategories
                        .map((catKey) => {
                          const lowerKey = catKey.toLowerCase()
                          return (
                            t.rooms.filters.categories?.[lowerKey] ||
                            t.rooms.filters.categories?.others ||
                            categoryFriendlyNames[catKey] ||
                            catKey
                          )
                        })
                        .join(", "),
                    },
                  ]}
                />
              </div>

              <div className="flex flex-wrap items-center gap-4">
                <LevelFilter />
                <TopicFilter />
              </div>

              {rooms.length > 0 ? (
                <div className="flex flex-col gap-6">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {rooms.map((room) => (
                      <div key={room.roomId} className="w-full">
                        <RoomCard room={room} />
                      </div>
                    ))}
                  </div>
                  <div className="mt-6 flex justify-center items-center gap-4 text-sm font-medium">
                    <button
                      disabled={page <= 1}
                      onClick={() => setPage(page - 1)}
                      className="px-4 py-2 border rounded-full disabled:opacity-50 hover:bg-gray-50 text-gray-700"
                    >
                      Previous
                    </button>
                    <span className="text-gray-600">
                      Page {page} of {totalPages || 1}
                    </span>
                    <button
                      disabled={page >= totalPages}
                      onClick={() => setPage(page + 1)}
                      className="px-4 py-2 border rounded-full disabled:opacity-50 hover:bg-gray-50 text-gray-700"
                    >
                      Next
                    </button>
                  </div>
                </div>
              ) : (
                <EmptyRoomState message={t.rooms.filters.noRoomsFound} />
              )}
            </div>
          ) : (
            <div className="w-full flex flex-col gap-10">
              {sections.map((section) => (
                <CategoryRoomSection
                  key={section.key}
                  categoryKey={section.key}
                  title={section.title}
                  languageType={languageType}
                  requiredLevels={requiredLevels}
                  topics={topics}
                  onSeeMore={handleCategoryClick}
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
