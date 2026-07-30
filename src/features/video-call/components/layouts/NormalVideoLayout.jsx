import React from "react"
import ScreenShareTile from "../ScreenShareTile"
import VideoTile from "../VideoTile"

const scrollbarClasses =
  "[&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-cath-red-700 [&::-webkit-scrollbar-thumb]:bg-clip-padding [&::-webkit-scrollbar-thumb]:border-2 [&::-webkit-scrollbar-thumb:hover]:border-0 [&::-webkit-scrollbar-thumb]:border-solid [&::-webkit-scrollbar-thumb]:border-transparent [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar]:w-[6px] [&::-webkit-scrollbar]:h-[6px]"

const NormalVideoLayout = ({
  screenShareTracks,
  participants,
  handleTileClick,
  totalItems,
}) => {
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

  // 1 Participant: Full Container
  if (totalItems === 1 && allItems.length === 1) {
    return (
      <div className="relative h-full w-full overflow-hidden">
        {renderTile(allItems[0], "w-full h-full")}
      </div>
    )
  }

  // 2 Participants: Side by side (Desktop) / Stacked (Mobile)
  if (totalItems === 2 && allItems.length === 2) {
    return (
      <div className="relative h-full w-full overflow-hidden grid grid-cols-1 sm:grid-cols-2 gap-2">
        {allItems.map((item) => renderTile(item, "w-full h-full"))}
      </div>
    )
  }

  // 3 Participants: 3 Equal Columns (Desktop) / Stacked (Mobile)
  if (totalItems === 3 && allItems.length === 3) {
    return (
      <div className="relative h-full w-full overflow-hidden grid grid-cols-1 sm:grid-cols-3 gap-2">
        {allItems.map((item) => renderTile(item, "w-full h-full"))}
      </div>
    )
  }

  // 4 Participants: 2x2 Grid
  if (totalItems === 4 && allItems.length === 4) {
    return (
      <div className="relative h-full w-full overflow-hidden grid grid-cols-2 grid-rows-2 gap-2">
        {allItems.map((item) => renderTile(item, "w-full h-full"))}
      </div>
    )
  }

  // 5 Participants: Top 3, Bottom 2 centered
  if (totalItems === 5 && allItems.length === 5) {
    return (
      <div className="relative h-full w-full overflow-hidden flex flex-col gap-2">
        <div className="grid grid-cols-3 gap-2 h-1/2 w-full">
          {allItems
            .slice(0, 3)
            .map((item) => renderTile(item, "w-full h-full"))}
        </div>
        <div className="flex gap-2 h-1/2 w-full justify-center">
          {allItems
            .slice(3, 5)
            .map((item) =>
              renderTile(
                item,
                "w-full sm:w-[calc(33.333%-0.5rem)] h-full flex-1 sm:flex-initial",
              ),
            )}
        </div>
      </div>
    )
  }

  // > 5 Participants: Scrollable Grid
  return (
    <div className="relative h-full w-full overflow-hidden">
      <div
        className={`h-full w-full overflow-y-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 auto-rows-max ${scrollbarClasses}`}
      >
        {allItems.map((item) => renderTile(item, "w-full aspect-video"))}
      </div>
    </div>
  )
}

export default NormalVideoLayout
