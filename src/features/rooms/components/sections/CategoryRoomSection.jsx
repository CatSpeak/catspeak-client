import React, { useState, useEffect, useRef, useMemo } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { AnimatePresence, motion  } from "framer-motion"
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

  // Prefetch next page in the background so there's no delay when user clicks "Next"
  useGetRoomsQuery(
    {
      page: page + 1,
      pageSize,
      languageType,
      requiredLevels,
      topics,
      categories: [categoryKey],
    },
    { skip: !responseData?.additionalData?.hasNextPage }
  )

  const currentRooms = useMemo(() => responseData?.data ?? [], [responseData])
  const additionalData = responseData?.additionalData || {}
  const totalCount = additionalData.totalCount || 0
  const totalPages = additionalData.totalPages || 1
  const hasNextPage = additionalData.hasNextPage || false

  const [displayRooms, setDisplayRooms] = useState([])
  const [visualPage, setVisualPage] = useState(page)
  const [slideDirection, setSlideDirection] = useState("left")
  const [accumulatedRooms, setAccumulatedRooms] = useState([])
  const scrollContainerRef = useRef(null)

  useEffect(() => {
    if (!isFetching && currentRooms.length > 0) {
      setDisplayRooms(currentRooms)
      setVisualPage(page)
    }
  }, [currentRooms, isFetching, page])

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

  // Report totalCount to parent for sorting
  const lastReportedCount = useRef(null)
  useEffect(() => {
    if (
      onTotalCountLoaded &&
      !isLoading &&
      lastReportedCount.current !== totalCount
    ) {
      lastReportedCount.current = totalCount
      onTotalCountLoaded(categoryKey, totalCount)
    }
  }, [totalCount, isLoading, onTotalCountLoaded, categoryKey])

  const goNext = () => {
    setSlideDirection("left")
    setPage((prev) => Math.min(prev + 1, totalPages))
  }
  const goPrev = () => {
    setSlideDirection("right")
    setPage((prev) => Math.max(prev - 1, 1))
  }
  const canGoNext = page < totalPages
  const canGoPrev = page > 1

  const tickingRef = useRef(false)
  const handleScroll = () => {
    if (!scrollContainerRef.current) return
    if (!tickingRef.current) {
      window.requestAnimationFrame(() => {
        if (scrollContainerRef.current) {
          const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current
          if (scrollLeft + clientWidth >= scrollWidth - 50) {
            if (hasNextPage && !isFetching) {
              setSlideDirection("left")
              setPage((prev) => prev + 1)
            }
          }
        }
        tickingRef.current = false
      })
      tickingRef.current = true
    }
  }

  const renderHeader = () => {
    const showRightSide = totalCount > 0 || isLoading || isFetching

    return (
      <div className="relative z-10 flex w-full items-center justify-between">
        <button
          onClick={() => onSeeMore(categoryKey)}
          className="group w-fit flex h-10 items-center gap-1.5 sm:gap-2 rounded-md hover:bg-[#E5E5E5] pr-4 sm:pr-6 border-none"
        >
          <div className="flex items-center gap-1.5 sm:gap-2 transition-transform duration-300 group-hover:translate-x-2 sm:group-hover:translate-x-4">
            <h6 className="text-lg sm:text-xl font-bold text-cath-red-700">
              {title}
            </h6>
            <ChevronRight className="text-cath-red-700 w-5 h-5 sm:w-6 sm:h-6" strokeWidth={3} />
          </div>
        </button>

        {showRightSide && (
          <div className="flex items-center gap-1.5 sm:gap-2 pr-1 sm:pr-2">
            {!isMobile && (
              <button
                onClick={goPrev}
                disabled={!canGoPrev || isFetching}
                aria-label="Previous rooms"
                className="flex h-7 w-7 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-[#F8F8F8] shadow-sm border border-[#C6C6C6] transition-all duration-200 hover:bg-[#F0F0F0] active:scale-95 disabled:opacity-30 disabled:pointer-events-none"
              >
                <ChevronLeft className="w-4 h-4 sm:w-6 sm:h-6" />
              </button>
            )}

            {!isLoading && (
              <span className="text-sm sm:text-base font-medium text-[#606060] whitespace-nowrap">
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
                className="flex h-7 w-7 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-[#F8F8F8] shadow-sm border border-[#C6C6C6] transition-all duration-200 hover:bg-[#F0F0F0] active:scale-95 disabled:opacity-30 disabled:pointer-events-none"
              >
                <ChevronRight className="w-4 h-4 sm:w-6 sm:h-6" />
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
          className="flex gap-4 overflow-x-auto py-8 -my-8 -mx-6 px-6 snap-x snap-mandatory scrollbar-hidden [-ms-overflow-style:none] [scrollbar-width:none]"
        >
          {roomsToDisplay.map((room) => (
            <div
              key={room.roomId}
              className="w-[85%] sm:w-[45%] md:w-[320px] flex-shrink-0 snap-center sm:snap-start flex"
            >
              <RoomCard room={room} />
            </div>
          ))}
          {(isLoading || isFetching) &&
            Array.from({ length: 3 }).map((_, idx) => (
              <div
                key={`loading-${idx}`}
                className="h-[280px] w-[85%] sm:w-[45%] md:w-[320px] flex-shrink-0 animate-pulse rounded-2xl bg-gray-200 snap-center sm:snap-start"
              />
            ))}
        </div>
      </div>
    )
  }

  const gridCols = itemsPerPage === 1 ? "grid-cols-1" : itemsPerPage === 2 ? "grid-cols-2" : "grid-cols-4"

  const slideVariants = {
    enter: (direction) => ({
      x: direction === "left" ? 60 : -60,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction) => ({
      x: direction === "left" ? -60 : 60,
      opacity: 0,
    }),
  }

  return (
    <div className="flex flex-col gap-2">
      {renderHeader()}

      <div className="w-full relative min-h-[280px]">
        <AnimatePresence mode="popLayout" initial={false} custom={slideDirection}>
          <motion.div
            key={visualPage}
            custom={slideDirection}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className={`grid ${gridCols} gap-3 w-full transition-opacity duration-300 ${isFetching && !isLoading ? 'opacity-40 pointer-events-none' : 'opacity-100'}`}
          >
            {isLoading || (displayRooms.length === 0 && isFetching)
              ? Array.from({ length: itemsPerPage }).map((_, idx) => (
                  <div
                    key={`desktop-loading-${idx}`}
                    className="h-[280px] w-full animate-pulse rounded-2xl bg-gray-200"
                  />
                ))
              : displayRooms.map((room) => (
                  <RoomCard key={room.roomId} room={room} />
                ))}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}

export default CategoryRoomSection
