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

  const getContainerClass = (count) => {
    if (count === 1) return "flex items-center justify-center pr-1"
    if (count === 2)
      return "grid grid-cols-1 sm:grid-cols-2 gap-1 pr-1 auto-rows-max"
    if (count <= 4)
      return "grid grid-cols-2 gap-1 pr-1 auto-rows-max"
    if (count <= 6)
      return "grid grid-cols-2 lg:grid-cols-3 gap-1 pr-1 auto-rows-max"
    if (count <= 9)
      return "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-1 pr-1 auto-rows-max"
    return "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-1 pr-1 auto-rows-max"
  }

  const getItemClass = (count) => {
    if (count === 1) return "w-full h-full"
    return "w-full aspect-video"
  }

  return (
    <div className="relative h-full w-full overflow-hidden">
      {/* Centralized Vertical Scrollable Grid for both Mobile and Desktop */}
      <div
        className={`h-full w-full overflow-y-auto ${getContainerClass(
          totalItems,
        )} ${scrollbarClasses}`}
      >
        {allItems.map((item) => {
          if (item.type === "screen") {
            return (
              <div
                key={item.key}
                className={`relative flex-shrink-0 overflow-hidden rounded-xl ${getItemClass(
                  totalItems,
                )}`}
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
                className={`relative flex-shrink-0 overflow-hidden rounded-xl ${getItemClass(
                  totalItems,
                )}`}
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
    </div>
  )
}

export default NormalVideoLayout
