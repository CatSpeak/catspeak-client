import React, { useState, useEffect, useRef, useMemo } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { AnimatePresence, motion as Motion } from "framer-motion"
import { useGetRoomsQuery } from "@/store/api/roomsApi"
import CommunityRoomCard from "../CommunityRoomCard"
import { useLanguage } from "@/shared/context/LanguageContext"
import useResponsiveItemsPerPage from "@/features/rooms/hooks/useResponsiveItemsPerPage"
import { IconButton } from "@/shared/components/ui/buttons"

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

  const isOther = categoryKey === "Other"

  const {
    data: responseData,
    isLoading,
    isFetching,
  } = useGetRoomsQuery({
    page: isOther ? 1 : page,
    pageSize: isOther ? 1000 : pageSize,
    languageType,
    requiredLevels,
    topics,
    categories: isOther ? undefined : [categoryKey],
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
    {
      skip:
        isOther ||
        !(
          responseData?.pagination?.hasNextPage ??
          responseData?.additionalData?.hasNextPage
        ),
    },
  )

  const { currentRooms, totalCount, totalPages, hasNextPage } = useMemo(() => {
    let fetched = responseData?.items ?? []
    const pagination = responseData?.pagination || {}

    // Sort by currentParticipantCount descending (rooms with most people first)
    const sortByParticipants = (rooms) => {
      return [...rooms].sort(
        (a, b) =>
          (b.currentParticipantCount || 0) - (a.currentParticipantCount || 0),
      )
    }

    if (isOther) {
      const known = ["Knowledge", "Culture", "Lifestyle", "Growth"]
      const filtered = fetched.filter((r) => {
        if (!r.categories || r.categories === "[]" || r.categories.length === 0)
          return true
        if (r.categories.includes("Other")) return true

        const hasKnown = Array.isArray(r.categories)
          ? known.some((c) => r.categories.includes(c))
          : known.some((c) => r.categories.includes(c))
        return !hasKnown
      })

      const sorted = sortByParticipants(filtered)
      const start = (page - 1) * pageSize
      return {
        currentRooms: sorted.slice(start, start + pageSize),
        totalCount: sorted.length,
        totalPages: Math.max(1, Math.ceil(sorted.length / pageSize)),
        hasNextPage: start + pageSize < sorted.length,
      }
    }

    return {
      currentRooms: sortByParticipants(fetched),
      totalCount: pagination.totalCount || 0,
      totalPages: pagination.totalPages || 1,
      hasNextPage: pagination.hasNextPage || false,
    }
  }, [responseData, isOther, page, pageSize])

  const [displayRooms, setDisplayRooms] = useState([])
  const [visualPage, setVisualPage] = useState(page)
  const [slideDirection, setSlideDirection] = useState(1)
  const [accumulatedRooms, setAccumulatedRooms] = useState([])
  const scrollContainerRef = useRef(null)

  useEffect(() => {
    if (!isFetching && currentRooms.length > 0) {
      queueMicrotask(() => {
        setDisplayRooms(currentRooms)
        setVisualPage(page)
      })
    }
  }, [currentRooms, isFetching, page])

  useEffect(() => {
    if (page === 1) {
      queueMicrotask(() => {
        setAccumulatedRooms(currentRooms)
      })
    } else if (currentRooms.length > 0) {
      queueMicrotask(() => {
        setAccumulatedRooms((prev) => {
          const existingIds = new Set(prev.map((r) => r.roomId))
          const newRooms = currentRooms.filter(
            (r) => !existingIds.has(r.roomId),
          )
          return [...prev, ...newRooms]
        })
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
    setSlideDirection(1)
    setPage((prev) => Math.min(prev + 1, totalPages))
  }
  const goPrev = () => {
    setSlideDirection(-1)
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
          const { scrollLeft, scrollWidth, clientWidth } =
            scrollContainerRef.current
          if (scrollLeft + clientWidth >= scrollWidth - 50) {
            if (hasNextPage && !isFetching) {
              setSlideDirection(1)
              setPage((prev) => prev + 1)
            }
          }
        }
        tickingRef.current = false
      })
      tickingRef.current = true
    }
  }

  // Keep page within bounds if totalPages shrinks on resize or data update
  useEffect(() => {
    if (page > totalPages && totalPages > 0) {
      setPage(totalPages)
    }
  }, [page, totalPages])

  const renderHeader = () => {
    const showRightSide = isMobile
      ? !isLoading && totalCount > 0
      : totalCount > 0 || isLoading || isFetching

    return (
      <div className="relative z-10 flex w-full items-end justify-between">
        <button
          type="button"
          onClick={() => onSeeMore(categoryKey)}
          className="group flex w-fit items-center text-black dark:text-white cursor-pointer select-none transition-opacity duration-150 active:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border rounded-lg"
        >
          <h3 className="text-xl font-bold tracking-tight">{title}</h3>
          <ChevronRight className="transition-transform duration-150 ease-out group-hover:translate-x-1 group-active:-translate-x-0.5 group-active:duration-75" />
        </button>

        {showRightSide && (
          <div className="flex items-center gap-2">
            {!isMobile && (
              <IconButton
                onClick={goPrev}
                disabled={!canGoPrev || isFetching}
                aria-label="Previous rooms"
                variant="secondary"
              >
                <ChevronLeft />
              </IconButton>
            )}

            {!isLoading && (
              <span className="text-sm whitespace-nowrap dark:text-[#AAAAAA]">
                {totalCount}{" "}
                {totalCount === 1
                  ? t?.rooms?.filters?.room || "room"
                  : t?.rooms?.filters?.totalSuffix || "rooms"}
              </span>
            )}

            {!isMobile && (
              <IconButton
                onClick={goNext}
                disabled={!canGoNext || isFetching}
                aria-label="Next rooms"
                variant="secondary"
              >
                <ChevronRight />
              </IconButton>
            )}
          </div>
        )}
      </div>
    )
  }

  if (!isLoading && totalCount === 0) {
    return null
  }

  // ── Mobile (≤640px): touch scroll, edge-to-edge bleed, no pagination buttons ──
  if (isMobile) {
    return (
      <div className="flex flex-col gap-2">
        {renderHeader()}
        <div
          ref={scrollContainerRef}
          onScroll={handleScroll}
          className="flex gap-4 overflow-x-auto py-4 -my-4 -mx-4 px-4 scroll-px-4 snap-x snap-mandatory scrollbar-hidden [-ms-overflow-style:none] [scrollbar-width:none]"
        >
          {roomsToDisplay.map((room) => (
            <div
              key={room.roomId}
              className="w-[85%] sm:w-[45%] flex-shrink-0 snap-start flex"
            >
              <CommunityRoomCard room={room} />
            </div>
          ))}
          {(isLoading || isFetching) &&
            Array.from({ length: 3 }).map((_, idx) => (
              <div
                key={`loading-${idx}`}
                className="h-[280px] w-[85%] sm:w-[45%] flex-shrink-0 animate-pulse rounded-2xl bg-gray-200 dark:bg-[#272727] snap-start"
              />
            ))}
          {/* Trailing spacer so the last card has padding when scrolled to the end */}
          <div className="w-0.5 flex-shrink-0" aria-hidden="true" />
        </div>
      </div>
    )
  }

  const gridCols =
    itemsPerPage === 1
      ? "grid-cols-1"
      : itemsPerPage === 2
        ? "grid-cols-2"
        : "grid-cols-4"

  const slideVariants = {
    enter: (dir) => ({
      x: dir > 0 ? "100%" : "-100%",
      opacity: 0.9,
    }),
    center: {
      x: 0,
      opacity: 1,
      zIndex: 1,
    },
    exit: (dir) => ({
      x: dir < 0 ? "100%" : "-100%",
      opacity: 0.9,
      zIndex: 0,
    }),
  }

  return (
    <div className="flex flex-col gap-2">
      {renderHeader()}

      <div className="w-full relative min-h-[280px] overflow-hidden -my-2 py-2">
        <AnimatePresence
          mode="popLayout"
          initial={false}
          custom={slideDirection}
        >
          <Motion.div
            key={visualPage}
            custom={slideDirection}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.6, ease: [0.32, 0.72, 0, 1] }}
            className={`grid ${gridCols} gap-2 w-full transition-opacity duration-300 ${isFetching && !isLoading ? "opacity-40 pointer-events-none" : "opacity-100"}`}
          >
            {isLoading || (displayRooms.length === 0 && isFetching)
              ? Array.from({ length: itemsPerPage }).map((_, idx) => (
                  <div
                    key={`desktop-loading-${idx}`}
                    className="h-[280px] w-full animate-pulse rounded-2xl bg-gray-200 dark:bg-[#272727]"
                  />
                ))
              : displayRooms
                  .slice(0, itemsPerPage)
                  .map((room) => (
                    <CommunityRoomCard key={room.roomId} room={room} />
                  ))}
          </Motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}

export default CategoryRoomSection
