import React, { useMemo } from "react"
import ScreenShareTile from "../ScreenShareTile"
import VideoTile from "../VideoTile"
import OverflowTile from "../OverflowTile"
import { useGridParticipants } from "@/features/video-call/hooks/useGridParticipants"

const NormalVideoLayout = ({
  screenShareTracks,
  participants,
  handleTileClick,
  totalItems,
  maxTiles,
}) => {
  const allItems = useMemo(
    () => [
      ...(screenShareTracks || []).map((t) => ({
        type: "screen",
        data: t,
        key: `screen-${t.publication?.trackSid || t.participant?.identity}`,
      })),
      ...(participants || []).map((p) => ({
        type: "video",
        data: p,
        key: `video-${p.identity}`,
      })),
    ],
    [screenShareTracks, participants],
  )

  const { visibleItems, overflowItems, overflowCount } = useGridParticipants(
    allItems,
    maxTiles,
  )

  const renderTile = (item, extraClass = "") => {
    const isClickable = totalItems >= 2
    if (item.type === "screen") {
      return (
        <div
          key={item.key}
          className={`relative overflow-hidden rounded-xl ${extraClass}`}
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
              isClickable
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
    }

    return (
      <div
        key={item.key}
        className={`relative overflow-hidden rounded-xl ${extraClass}`}
      >
        <VideoTile
          participant={item.data}
          onClick={
            isClickable
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

  const displayCount = visibleItems.length + (overflowCount > 0 ? 1 : 0)

  const getGridClass = () => {
    if (displayCount <= 1) return "grid grid-cols-1 grid-rows-1"
    if (displayCount === 2)
      return "grid grid-cols-1 sm:grid-cols-2 grid-rows-2 sm:grid-rows-1"
    if (displayCount === 3)
      return "grid grid-cols-1 sm:grid-cols-3 grid-rows-3 sm:grid-rows-1"
    if (displayCount === 4) return "grid grid-cols-2 grid-rows-2"
    if (displayCount <= 6)
      return "grid grid-cols-2 sm:grid-cols-3 grid-rows-3 sm:grid-rows-2"
    if (displayCount <= 9) return "grid grid-cols-3 grid-rows-3"
    if (displayCount <= 12)
      return "grid grid-cols-3 sm:grid-cols-4 grid-rows-4 sm:grid-rows-3"
    return "grid grid-cols-4 grid-rows-4"
  }

  return (
    <div className="relative h-full w-full overflow-hidden p-0">
      <div className={`h-full w-full gap-1 ${getGridClass()}`}>
        {visibleItems.map((item) =>
          renderTile(item, "w-full h-full min-h-0 min-w-0"),
        )}
        {overflowCount > 0 && (
          <div className="relative overflow-hidden rounded-xl w-full h-full min-h-0 min-w-0">
            <OverflowTile
              overflowItems={overflowItems}
              overflowCount={overflowCount}
            />
          </div>
        )}
      </div>
    </div>
  )
}

export default NormalVideoLayout
