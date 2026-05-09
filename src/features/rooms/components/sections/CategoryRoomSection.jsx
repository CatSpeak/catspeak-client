import React, { useState, useEffect, useRef, useMemo } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { AnimatePresence } from "framer-motion"
import { useGetRoomsQuery } from "@/store/api/roomsApi"
import RoomCard from "../RoomCard"
import EmptyRoomState from "../EmptyRoomState"
import FluentAnimation from "@/shared/components/ui/animations/FluentAnimation"
import colors from "@/shared/utils/colors"
import { useLanguage } from "@/shared/context/LanguageContext"
import useResponsiveItemsPerPage from "@/features/rooms/hooks/useResponsiveItemsPerPage"

const CategoryRoomSection = ({
  categoryKey,
  title,
  languageType,
  requiredLevels,
  topics,
  onSeeMore,
  onTotalCountLoaded,
}) => {
  const { t } = useLanguage()
  const itemsPerPage = useResponsiveItemsPerPage()
  const isMobile = itemsPerPage === null
  const pageSize = itemsPerPage ?? 4
  const [page, setPage] = useState(1)

  const {
    data: responseData,
    isLoading,
    isFetching,
  } = useGetRoomsQuery({
    page,
    pageSize,
    languageType,
    requiredLevels,
    topics,
    categories: [categoryKey],
  })

  const currentRooms = useMemo(() => responseData?.data ?? [], [responseData])
  const additionalData = responseData?.additionalData || {}
  const totalCount = additionalData.totalCount || 0
  const totalPages = additionalData.totalPages || 1
  const hasNextPage = additionalData.hasNextPage || false

  // Report totalCount to parent for sorting
  const lastReportedCount = useRef(null)
  useEffect(() => {
    if (onTotalCountLoaded && !isLoading && lastReportedCount.current !== totalCount) {
      lastReportedCount.current = totalCount
      onTotalCountLoaded(categoryKey, totalCount)
    }
  }, [totalCount, isLoading, onTotalCountLoaded, categoryKey])

  const [accumulatedRooms, setAccumulatedRooms] = useState([])
  const scrollContainerRef = useRef(null)

  useEffect(() => {
    if (page === 1) {
      setAccumulatedRooms(currentRooms)
    } else if (currentRooms.length > 0) {
      setAccumulatedRooms((prev) => {
        const existingIds = new Set(prev.map((r) => r.roomId))
        const newRooms = currentRooms.filter((r) => !existingIds.has(r.roomId))
        return [...prev, ...newRooms]
      })
    }
  }, [currentRooms, page])

  const roomsToDisplay = isMobile ? accumulatedRooms : currentRooms

  const goNext = () => setPage((prev) => Math.min(prev + 1, totalPages))
  const goPrev = () => setPage((prev) => Math.max(prev - 1, 1))
  const canGoNext = page < totalPages
  const canGoPrev = page > 1

  const handleScroll = () => {
    if (!scrollContainerRef.current) return
    const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current
    if (scrollLeft + clientWidth >= scrollWidth - 50) {
      if (hasNextPage && !isFetching) {
        setPage((prev) => prev + 1)
      }
    }
  }

  const renderHeader = () => {
    const showRightSide = totalCount > 0 || isLoading || isFetching

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

        {showRightSide && (
          <div className="flex items-center gap-2 pr-2">
            {!isMobile && (
              <button
                onClick={goPrev}
                disabled={!canGoPrev || isFetching}
                aria-label="Previous rooms"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-[#F8F8F8] shadow-sm border border-[#C6C6C6] transition-all duration-200 hover:bg-[#F0F0F0] active:scale-95 disabled:opacity-30 disabled:pointer-events-none"
              >
                <ChevronLeft />
              </button>
            )}

            {!isLoading && (
              <span className="text-sm font-medium text-[#606060] whitespace-nowrap">
                {totalCount}{" "}
                {totalCount === 1
                  ? t?.rooms?.filters?.room || "room"
                  : t?.rooms?.filters?.totalSuffix || "rooms"}
              </span>
            )}

            {!isMobile && (
              <button
                onClick={goNext}
                disabled={!canGoNext || isFetching}
                aria-label="Next rooms"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-[#F8F8F8] shadow-sm border border-[#C6C6C6] transition-all duration-200 hover:bg-[#F0F0F0] active:scale-95 disabled:opacity-30 disabled:pointer-events-none"
              >
                <ChevronRight />
              </button>
            )}
          </div>
        )}
      </div>
    )
  }

  if (!isLoading && totalCount === 0) {
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
        <div
          ref={scrollContainerRef}
          onScroll={handleScroll}
          className="flex gap-4 overflow-x-auto py-8 -my-8 px-2 -mx-2 snap-x snap-mandatory [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
        >
          {roomsToDisplay.map((room) => (
            <div
              key={room.roomId}
              className="w-[85%] flex-shrink-0 snap-center flex"
            >
              <RoomCard room={room} />
            </div>
          ))}
          {(isLoading || isFetching) &&
            Array.from({ length: 2 }).map((_, idx) => (
              <div
                key={`loading-${idx}`}
                className="h-[300px] w-[85%] flex-shrink-0 animate-pulse rounded-2xl bg-gray-200 snap-center"
              />
            ))}
        </div>
      </div>
    )
  }

  const gridCols = itemsPerPage === 2 ? "grid-cols-2" : "grid-cols-4"

  return (
    <div className="flex flex-col gap-2">
      {renderHeader()}

      <div className="w-full">
        <AnimatePresence mode="wait">
          <FluentAnimation
            key={page}
            animationKey={page}
            direction="none"
            duration={0.15}
            exit={true}
            className={`grid ${gridCols} gap-4 w-full`}
          >
            {isLoading || isFetching
              ? Array.from({ length: itemsPerPage }).map((_, idx) => (
                  <div
                    key={`desktop-loading-${idx}`}
                    className="h-[300px] w-full animate-pulse rounded-2xl bg-gray-200"
                  />
                ))
              : roomsToDisplay.map((room) => (
                  <RoomCard key={room.roomId} room={room} />
                ))}
          </FluentAnimation>
        </AnimatePresence>
      </div>
    </div>
  )
}

export default CategoryRoomSection
