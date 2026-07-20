import React, { useState, useEffect } from "react"
import ScreenShareTile from "../ScreenShareTile"
import VideoTile from "../VideoTile"
import useMediaQuery from "@/shared/hooks/useMediaQuery"

const scrollbarClasses =
  "[&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-cath-red-700 [&::-webkit-scrollbar-thumb]:bg-clip-padding [&::-webkit-scrollbar-thumb]:border-2 [&::-webkit-scrollbar-thumb:hover]:border-0 [&::-webkit-scrollbar-thumb]:border-solid [&::-webkit-scrollbar-thumb]:border-transparent [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar]:w-[6px] [&::-webkit-scrollbar]:h-[6px]"

const NormalVideoLayout = ({
  screenShareTracks,
  participants,
  handleTileClick,
  totalItems,
}) => {
  const isMobile = useMediaQuery("(max-width: 767px)")
  const [currentPage, setCurrentPage] = useState(0)

  // Reset page if total items change and current page is now invalid
  useEffect(() => {
    const maxPages = Math.ceil(totalItems / 6)
    if (currentPage >= maxPages && maxPages > 0) {
      setCurrentPage(maxPages - 1)
    }
  }, [totalItems, currentPage])

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

  const shouldPaginate = isMobile && totalItems > 6
  const itemsPerPage = 6
  const maxPages = Math.ceil(totalItems / itemsPerPage)

  const displayedItems = shouldPaginate
    ? allItems.slice(currentPage * itemsPerPage, (currentPage + 1) * itemsPerPage)
    : allItems

  const currentDisplayCount = displayedItems.length

  const getContainerLayout = (count) => {
    if (count === 1) return "flex flex-col items-center justify-center"
    return "flex flex-wrap items-center justify-center content-center"
  }

  const getItemClass = (count) => {
    if (count === 1) return "h-full w-full"

    // 2 items: Mobile -> 1 col 2 rows, Desktop -> 2 cols 1 row
    if (count === 2)
      return "w-full h-[calc(50%-2px)] md:w-[calc(50%-2px)] md:h-full flex-shrink-0"

    // 3, 4 items: 50% width, 50% height to perfectly fill the screen without scrolling
    if (count === 3 || count === 4)
      return "w-[calc(50%-2px)] h-[calc(50%-2px)] min-h-[250px] flex-shrink-0"

    // 5, 6 items: Mobile -> 2 cols 3 rows, Desktop -> 3 cols 2 rows
    if (count === 5 || count === 6)
      return "w-[calc(50%-2px)] md:w-[calc(33.333%-2.66px)] h-[calc(33.333%-2.66px)] md:h-[calc(50%-2px)] min-h-[150px] md:min-h-[200px] flex-shrink-0"

    // 7, 8 items: 4 columns, 2 rows
    if (count === 7 || count === 8)
      return "w-[calc(25%-3px)] h-[calc(50%-2px)] min-h-[150px] flex-shrink-0"

    // 9 items: 3 columns, 3 rows
    if (count === 9)
      return "w-[calc(33.333%-2.66px)] h-[calc(33.333%-2.66px)] min-h-[150px] flex-shrink-0"

    // 10, 11, 12 items: 4 columns, 3 rows
    if (count >= 10 && count <= 12)
      return "w-[calc(25%-3px)] h-[calc(33.333%-2.66px)] min-h-[150px] flex-shrink-0"

    // > 12 items: fallback to responsive wrapped flex
    return "w-[calc(25%-3px)] aspect-video min-w-[200px] min-h-[150px] flex-shrink-0"
  }

  return (
    <div className="relative flex h-full w-full flex-col overflow-hidden">
      <div
        className={`
          flex-1 w-full
          gap-1
          p-2
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
                      ? () => handleTileClick({ type: "screen", trackRef: item.data })
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
                      ? () => handleTileClick({ type: "video", participant: item.data })
                      : undefined
                  }
                />
              </div>
            )
          }
        })}
      </div>

      {shouldPaginate && maxPages > 1 && (
        <div className="flex w-full shrink-0 items-center justify-center gap-2 pb-2">
          {Array.from({ length: maxPages }).map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentPage(idx)}
              className={`h-2 w-2 rounded-full transition-colors ${currentPage === idx ? "bg-cath-red-700" : "bg-[#D9D9D9]"
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
