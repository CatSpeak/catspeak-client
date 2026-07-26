import React, { useState, useEffect } from "react"
import ScreenShareTile from "../ScreenShareTile"
import VideoTile from "../VideoTile"

const scrollbarClasses =
  "[&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-cath-red-700 [&::-webkit-scrollbar-thumb]:bg-clip-padding [&::-webkit-scrollbar-thumb]:border-2 [&::-webkit-scrollbar-thumb:hover]:border-0 [&::-webkit-scrollbar-thumb]:border-solid [&::-webkit-scrollbar-thumb]:border-transparent [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar]:w-[6px] [&::-webkit-scrollbar]:h-[6px]"

const NormalVideoLayout = ({
  screenShareTracks,
  participants,
  handleTileClick,
  totalItems,
  maxTiles = 16,
}) => {
  const [currentPage, setCurrentPage] = useState(0)

  // Reset page if total items change and current page is now invalid
  useEffect(() => {
    const itemsPerPage = maxTiles
    const maxPages = Math.ceil(totalItems / itemsPerPage)
    if (currentPage >= maxPages && maxPages > 0) {
      setCurrentPage(maxPages - 1)
    }
  }, [totalItems, currentPage, maxTiles])

  const allItems = [
    ...(screenShareTracks || []).map((t) => ({
      type: "screen",
      data: t,
      // eslint-disable-next-line react-hooks/purity
      key: t.publication?.trackSid || Math.random(),
    })),
    ...(participants || []).map((p) => ({
      type: "video",
      data: p,
      key: p.identity,
    })),
  ]

  const itemsPerPage = maxTiles
  const shouldPaginate = totalItems > itemsPerPage
  const maxPages = Math.ceil(totalItems / itemsPerPage)

  const displayedItems = shouldPaginate
    ? allItems.slice(
        currentPage * itemsPerPage,
        (currentPage + 1) * itemsPerPage,
      )
    : allItems

  const currentDisplayCount = displayedItems.length

  const getContainerLayout = (count) => {
    if (count === 1) return "flex flex-col items-center justify-center"
    // 6+ on mobile: stack list (single column scroll). sm+ restores the grid.
    if (count > 5)
      return "flex flex-col items-stretch sm:flex-row sm:flex-wrap sm:items-center justify-center content-center"
    return "flex flex-wrap items-center justify-center content-center"
  }

  const getItemClass = (count) => {
    if (count === 1) return "h-full w-full"

    // 2 items: Mobile → 1 col 2 rows, md → 2 cols 1 row
    if (count === 2)
      return "w-full h-[calc(50%-2px)] md:w-[calc(50%-2px)] md:h-full flex-shrink-0"

    // 3 items: Mobile → 1 col 3 rows, md → 2 cols 2 rows
    if (count === 3)
      return "w-full h-[calc(33.333%-2.66px)] md:w-[calc(50%-2px)] md:h-[calc(50%-2px)] md:min-h-[200px] flex-shrink-0"

    // 4 items: Mobile → 2×2, same on all sizes
    if (count === 4)
      return "w-[calc(50%-2px)] h-[calc(50%-2px)] min-h-[120px] md:min-h-[200px] flex-shrink-0"

    // 5 items: Mobile → 2 cols 3 rows, lg → 3 cols 2 rows
    if (count === 5)
      return "w-[calc(50%-2px)] lg:w-[calc(33.333%-2.66px)] h-[calc(33.333%-2.66px)] lg:h-[calc(50%-2px)] min-h-[100px] lg:min-h-[160px] flex-shrink-0"

    // 6+ items on mobile → full-width stack with aspect-video (scrollable).
    // sm+ restores the original grid layout.

    // 6 items: sm → 2 cols 3 rows, lg → 3 cols 2 rows
    if (count === 6)
      return "w-full aspect-video flex-shrink-0 sm:w-[calc(50%-2px)] sm:aspect-auto sm:h-[calc(33.333%-2.66px)] lg:w-[calc(33.333%-2.66px)] lg:h-[calc(50%-2px)] lg:min-h-[160px]"

    // 7–8 items: sm → 3 cols, lg → 4 cols 2 rows
    if (count === 7 || count === 8)
      return "w-full aspect-video flex-shrink-0 sm:w-[calc(33.333%-2.66px)] sm:aspect-auto sm:h-[calc(33.333%-2.66px)] lg:w-[calc(25%-3px)] lg:h-[calc(50%-2px)]"

    // 9 items: sm → 3×3
    if (count === 9)
      return "w-full aspect-video flex-shrink-0 sm:w-[calc(33.333%-2.66px)] sm:aspect-auto sm:h-[calc(33.333%-2.66px)]"

    // 10–12 items: sm → 3 cols, lg → 4×3
    if (count >= 10 && count <= 12)
      return "w-full aspect-video flex-shrink-0 sm:w-[calc(33.333%-2.66px)] sm:aspect-auto sm:h-[calc(33.333%-2.66px)] lg:w-[calc(25%-3px)] lg:h-[calc(25%-3px)]"

    // >12 items: Mobile → stack scroll, lg → 3 cols scroll
    return "w-full aspect-video flex-shrink-0 lg:w-[calc(33.333%-2.66px)]"
  }

  return (
    <div className="relative flex h-full w-full flex-col overflow-hidden">
      <div
        className={`
          flex-1 w-full
          gap-1
          p-1 sm:p-2
          ${!shouldPaginate ? "overflow-y-auto" : "overflow-hidden"}
          [align-content:safe_center]
          [justify-content:safe_center]
          ${getContainerLayout(currentDisplayCount)}
          ${scrollbarClasses}
        `}
      >
        {displayedItems.map((item) => {
          if (item.type === "screen") {
            return (
              <div
                key={item.key}
                className={`relative ${getItemClass(currentDisplayCount)}`}
              >
                <ScreenShareTile
                  trackRef={item.data}
                  presenterDisplayName={
                    item.data.participant?.name ||
                    item.data.participant?.identity ||
                    "Unknown"
                  }
                  isLocal={item.data.participant?.isLocal}
                  onClick={
                    totalItems >= 2
                      ? () =>
                          handleTileClick({
                            type: "screen",
                            trackRef: item.data,
                          })
                      : undefined
                  }
                />
              </div>
            )
          } else {
            return (
              <div
                key={item.key}
                className={`relative ${getItemClass(currentDisplayCount)}`}
              >
                <VideoTile
                  participant={item.data}
                  onClick={
                    totalItems >= 2
                      ? () =>
                          handleTileClick({
                            type: "video",
                            participant: item.data,
                          })
                      : undefined
                  }
                />
              </div>
            )
          }
        })}
      </div>

      {shouldPaginate && maxPages > 1 && (
        <div className="flex w-full shrink-0 items-center justify-center gap-2 mt-2 md:mb-1.5 md:mt-0">
          {Array.from({ length: maxPages }).map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentPage(idx)}
              className={`h-2 w-2 rounded-full transition-colors ${
                currentPage === idx ? "bg-cath-red-700" : "bg-[#D9D9D9]"
              }`}
              aria-label={`Page ${idx + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default NormalVideoLayout
