import React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { AnimatePresence } from "framer-motion"
import { useGetRoomsQuery } from "@/store/api/roomsApi"
import RoomCard from "../RoomCard"
import EmptyRoomState from "../EmptyRoomState"
import FluentAnimation from "@/shared/components/ui/animations/FluentAnimation"
import colors from "@/shared/utils/colors"
import { useLanguage } from "@/shared/context/LanguageContext"
import useRoomCarousel from "@/features/rooms/hooks/useRoomCarousel"
import useResponsiveItemsPerPage from "@/features/rooms/hooks/useResponsiveItemsPerPage"

const PAGE_SIZE = 8

const CategoryRoomSection = ({
  categoryKey,
  title,
  languageType,
  requiredLevels,
  topics,
  onSeeMore,
}) => {
  const { t } = useLanguage()
  const itemsPerPage = useResponsiveItemsPerPage()
  const isMobile = itemsPerPage === null

  const { data: responseData, isLoading } = useGetRoomsQuery({
    page: 1,
    pageSize: PAGE_SIZE,
    languageType,
    requiredLevels,
    topics,
    categories: [categoryKey],
  })

  const rooms = responseData?.data ?? []

  // Hook always runs (rules of hooks) — uses fallback of 4 on mobile (unused)
  const {
    visibleItems,
    currentPage,
    direction,
    goNext,
    goPrev,
    canGoNext,
    canGoPrev,
  } = useRoomCarousel(rooms, itemsPerPage ?? 4)

  const renderHeader = (showNavButtons = false) => {
    const shouldShowNav =
      showNavButtons && (rooms.length > itemsPerPage || isLoading)

    return (
      <div className="relative z-10 flex w-full items-center justify-between">
        <button
          onClick={() => onSeeMore(categoryKey)}
          className="group w-fit flex h-10 items-center gap-2 rounded-md hover:bg-[#E5E5E5] pr-6 border-none"
        >
          <div className="flex items-center gap-2 transition-transform duration-300 group-hover:translate-x-4">
            <h6
              className="text-xl font-bold"
              style={{ color: colors.headingColor }}
            >
              {title}
            </h6>
            <ChevronRight color="#990011" />
          </div>
        </button>

        {shouldShowNav && (
          <div className="flex items-center gap-2 pr-2">
            <button
              onClick={goPrev}
              disabled={!canGoPrev}
              aria-label="Previous rooms"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm border border-[#C6C6C6] transition-all duration-200 hover:bg-gray-50 active:scale-95 disabled:opacity-30 disabled:pointer-events-none"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={goNext}
              disabled={!canGoNext}
              aria-label="Next rooms"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm border border-[#C6C6C6] transition-all duration-200 hover:bg-gray-50 active:scale-95 disabled:opacity-30 disabled:pointer-events-none"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        )}
      </div>
    )
  }

  if (!isLoading && rooms.length === 0) {
    return (
      <div className="flex flex-col gap-2">
        {renderHeader()}

        <EmptyRoomState
          message={
            t?.rooms?.filters?.noRoomsFoundCategory ||
            "No rooms found in this category"
          }
        />
      </div>
    )
  }

  // ── Mobile (≤425px): touch scroll, no buttons ──────────────────────────────
  if (isMobile) {
    return (
      <div className="flex flex-col gap-2">
        {renderHeader()}
        <div className="flex gap-4 overflow-x-auto py-8 -my-8 px-2 -mx-2 snap-x snap-mandatory [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {isLoading
            ? Array.from({ length: 2 }).map((_, idx) => (
                <div
                  key={idx}
                  className="h-[300px] min-w-[85%] flex-shrink-0 animate-pulse rounded-2xl bg-gray-200 snap-center"
                />
              ))
            : rooms.map((room) => (
                <div
                  key={room.roomId}
                  className="min-w-[80%] flex-shrink-0 snap-center"
                >
                  <RoomCard room={room} />
                </div>
              ))}
        </div>
      </div>
    )
  }

  const gridCols = itemsPerPage === 2 ? "grid-cols-2" : "grid-cols-4"

  return (
    <div className="flex flex-col gap-2">
      {renderHeader(true)}

      <div className="w-full">
        <AnimatePresence mode="wait">
          <FluentAnimation
            key={currentPage}
            animationKey={currentPage}
            direction="none"
            duration={0.15}
            exit={true}
            className={`grid ${gridCols} gap-4 w-full`}
          >
            {isLoading
              ? Array.from({ length: itemsPerPage }).map((_, idx) => (
                  <div
                    key={idx}
                    className="h-[300px] w-full animate-pulse rounded-2xl bg-gray-200"
                  />
                ))
              : visibleItems.map((room) => (
                  <RoomCard key={room.roomId} room={room} />
                ))}
          </FluentAnimation>
        </AnimatePresence>
      </div>
    </div>
  )
}

export default CategoryRoomSection
