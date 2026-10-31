import React, { useState } from "react"
import { useSearchParams } from "react-router-dom"
import { ArrowLeft, X, SlidersHorizontal, Trash2 } from "lucide-react"
import { motion as Motion } from "framer-motion"
import CommunityRoomCard from "../CommunityRoomCard"
import EmptyRoomState from "../EmptyRoomState"
import { useLanguage } from "@/shared/context/LanguageContext"
import { categoryFriendlyNames } from "../../config/communicateTabConfig"
import Pagination from "@/shared/components/ui/navigation/Pagination"
import IconButton from "@/shared/components/ui/buttons/IconButton"
import PillButton from "@/shared/components/ui/buttons/PillButton"
import RoomFilterModal from "../navigation/RoomFilterModal"

const FilteredRoomsView = ({
  rooms = [],
  selectedCategories,
  page = 1,
  totalPages = 1,
  setPage,
  onBackToOverview,
  isLoading = false,
}) => {
  const { t, language } = useLanguage()
  const [searchParams, setSearchParams] = useSearchParams()
  const [isFilterOpen, setIsFilterOpen] = useState(false)

  const search = searchParams.get("search")?.trim()
  const topics = searchParams.getAll("topics")
  const requiredLevels = searchParams.getAll("requiredLevels")

  const categoriesParam = searchParams.get("categories")
  const categoriesList = categoriesParam
    ? categoriesParam
        .split(",")
        .map((c) => c.trim())
        .filter(Boolean)
    : selectedCategories || []

  const categoryTitle =
    categoriesList.length > 0
      ? categoriesList
          .map((catKey) => {
            const lowerKey = catKey.toLowerCase()
            return (
              t.rooms?.filters?.categories?.[lowerKey] ||
              t.rooms?.filters?.categories?.others ||
              categoryFriendlyNames[catKey] ||
              catKey
            )
          })
          .join(", ")
      : null

  // Show chips only when facet filters (categories, topics, levels) are active.
  const showChips =
    categoriesList.length > 0 || topics.length > 0 || requiredLevels.length > 0

  const handleRemoveCategory = (catToRemove) => {
    const updated = categoriesList.filter((c) => c !== catToRemove)
    const newParams = new URLSearchParams(searchParams)
    if (updated.length > 0) {
      newParams.set("categories", updated.join(","))
    } else {
      newParams.delete("categories")
    }
    newParams.set("page", "1")
    setSearchParams(newParams, { preventScrollReset: true })
  }

  const handleRemoveTopic = (topicToRemove) => {
    const newParams = new URLSearchParams(searchParams)
    newParams.delete("topics")
    topics
      .filter((top) => top !== topicToRemove)
      .forEach((top) => newParams.append("topics", top))
    newParams.set("page", "1")
    setSearchParams(newParams, { preventScrollReset: true })
  }

  const handleRemoveLevel = (levelToRemove) => {
    const newParams = new URLSearchParams(searchParams)
    newParams.delete("requiredLevels")
    requiredLevels
      .filter((lvl) => lvl !== levelToRemove)
      .forEach((lvl) => newParams.append("requiredLevels", lvl))
    newParams.set("page", "1")
    setSearchParams(newParams, { preventScrollReset: true })
  }

  const handleClearAll = () => {
    const newParams = new URLSearchParams(searchParams)
    newParams.delete("categories")
    newParams.delete("topics")
    newParams.delete("requiredLevels")
    newParams.set("page", "1")
    setSearchParams(newParams, { preventScrollReset: true })
    if (!search && onBackToOverview) {
      onBackToOverview()
    }
  }

  const resultsCountText = isLoading ? (
    <span className="inline-block w-24 h-4 bg-gray-200 dark:bg-[#272727] animate-pulse rounded mt-0.5" />
  ) : t.header?.resultsFound ? (
    t.header.resultsFound.replace("{{count}}", rooms.length)
  ) : language === "en" ? (
    `${rooms.length} ${rooms.length === 1 ? "room" : "rooms"} found`
  ) : (
    `Tìm thấy ${rooms.length} phòng`
  )

  return (
    <div className="w-full flex flex-col gap-4">
      {/* ── Search / Filter Header ── */}
      <div className="flex flex-col gap-4">
        {/* ── Context Title Row ── */}
        <div className="flex items-center gap-4 min-w-0">
          <IconButton
            variant="ghost"
            onClick={onBackToOverview}
            aria-label={t.common?.back || "Quay lại"}
            title={t.common?.back || "Quay lại"}
            className="shrink-0"
          >
            <ArrowLeft className="text-gray-700 dark:text-[#AAAAAA]" />
          </IconButton>

          <div className="min-w-0 flex-1">
            <h2 className="text-base font-bold dark:text-white truncate flex items-center gap-2">
              {search ? (
                <>
                  <span>{t.rooms?.filters?.search || "Tìm kiếm"}:</span>
                  <span className="text-cath-red-700 dark:text-cath-red-700">
                    &ldquo;{search}&rdquo;
                  </span>
                </>
              ) : categoryTitle ? (
                categoryTitle
              ) : (
                t.rooms?.filters?.title || "Danh sách phòng"
              )}
            </h2>
            <p className="text-sm text-secondary dark:text-[#AAAAAA]">
              {resultsCountText}
            </p>
          </div>
        </div>

        {/* ── Action Toolbar Row: Filter button & Xoá tất cả ── */}
        <div className="flex items-center gap-2 flex-wrap">
          <PillButton
            variant="secondary"
            onClick={() => setIsFilterOpen(true)}
            startIcon={<SlidersHorizontal size={20} />}
            className="shrink-0"
          >
            <span>{t.rooms?.filters?.filterTooltip || "Bộ lọc"}</span>
          </PillButton>

          {showChips && (
            <PillButton
              variant="secondary"
              onClick={handleClearAll}
              startIcon={<Trash2 size={20} />}
              className="shrink-0"
            >
              <span>{t.rooms?.filters?.clearAll || "Xoá tất cả"}</span>
            </PillButton>
          )}
        </div>

        {/* ── Active Filter Chips Row (Only when chips exist, with wrapping) ── */}
        {showChips && (
          <div className="flex items-center gap-2 flex-wrap">
            {categoriesList.map((catKey) => (
              <span
                key={catKey}
                className="inline-flex items-center gap-2 pl-4 pr-2 h-8 rounded-md text-sm bg-gray-100 dark:bg-[#272727] text-gray-700 dark:text-gray-300 border border-border dark:border-[#3F3F3F]"
              >
                <span>
                  {t.rooms?.filters?.categories?.[catKey.toLowerCase()] ||
                    categoryFriendlyNames[catKey] ||
                    catKey}
                </span>
                <button
                  type="button"
                  onClick={() => handleRemoveCategory(catKey)}
                  className="hover:text-cath-red-700 dark:hover:text-white transition-colors cursor-pointer"
                  aria-label={`Remove ${catKey} category`}
                >
                  <X size={18} />
                </button>
              </span>
            ))}

            {topics.map((topic) => (
              <span
                key={topic}
                className="inline-flex items-center gap-2 pl-4 pr-2 h-8 rounded-full text-sm bg-gray-100 dark:bg-[#272727] text-gray-700 dark:text-gray-300 border border-border dark:border-[#3F3F3F]"
              >
                <span>{topic}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveTopic(topic)}
                  className="hover:text-cath-red-700 dark:hover:text-white transition-colors cursor-pointer"
                  aria-label={`Remove ${topic} topic`}
                >
                  <X size={18} />
                </button>
              </span>
            ))}

            {requiredLevels.map((lvl) => (
              <span
                key={lvl}
                className="inline-flex items-center gap-2 pl-4 pr-2 h-8 rounded-full text-sm bg-gray-100 dark:bg-[#272727] text-gray-700 dark:text-gray-300 border border-border dark:border-[#3F3F3F]"
              >
                <span>{lvl}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveLevel(lvl)}
                  className="hover:text-cath-red-700 dark:hover:text-white transition-colors cursor-pointer"
                  aria-label={`Remove ${lvl} level`}
                >
                  <X size={18} />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* ── Room Cards Grid ── */}
      {isLoading && rooms.length === 0 ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, idx) => (
            <div
              key={`room-skeleton-${idx}`}
              className="w-full rounded-2xl overflow-hidden border border-border dark:border-[#3F3F3F] bg-white dark:bg-[#1E1E1E] flex flex-col"
            >
              <div className="aspect-video w-full bg-gray-200 dark:bg-[#272727] animate-pulse" />
              <div className="p-3 sm:p-4 flex flex-col gap-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-[#272727] animate-pulse shrink-0" />
                  <div className="flex-1 flex flex-col gap-1.5">
                    <div className="w-3/4 h-3.5 bg-gray-200 dark:bg-[#272727] animate-pulse rounded" />
                    <div className="w-1/2 h-3 bg-gray-200 dark:bg-[#272727] animate-pulse rounded" />
                  </div>
                </div>
                <div className="flex items-center justify-between pt-1">
                  <div className="w-16 h-4 bg-gray-200 dark:bg-[#272727] animate-pulse rounded" />
                  <div className="w-20 h-4 bg-gray-200 dark:bg-[#272727] animate-pulse rounded" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : rooms.length > 0 ? (
        <div
          className={`flex flex-col gap-6 transition-opacity duration-200 ${
            isLoading ? "opacity-60 pointer-events-none" : "opacity-100"
          }`}
        >
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {rooms.map((room, index) => (
              <Motion.div
                key={room.roomId || room.id || index}
                initial={{ opacity: 0, y: 16, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{
                  duration: 0.3,
                  ease: [0.22, 1, 0.36, 1],
                  delay: Math.min(index * 0.035, 0.25),
                }}
                className="w-full h-full"
              >
                <CommunityRoomCard room={room} />
              </Motion.div>
            ))}
          </div>

          {/* ── Unified Reusable Pagination ── */}
          <Pagination
            page={page}
            totalPages={totalPages}
            onChangePage={setPage}
          />
        </div>
      ) : (
        <Motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
        >
          <EmptyRoomState
            message={t.rooms?.filters?.noRoomsFound || "Không tìm thấy phòng nào"}
          />
        </Motion.div>
      )}

      {/* ── Room Filter Modal ── */}
      <RoomFilterModal
        open={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
      />
    </div>
  )
}

export default FilteredRoomsView
