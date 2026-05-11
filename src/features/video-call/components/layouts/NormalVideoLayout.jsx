import ScreenShareTile from "../ScreenShareTile"
import VideoTile from "../VideoTile"

const gridClass = "min-[426px]:grid-cols-[repeat(auto-fit,minmax(max(260px,calc(25%-3px)),1fr))]"
const scrollbarClasses =
  "[&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-[#990011] [&::-webkit-scrollbar-thumb]:bg-clip-padding [&::-webkit-scrollbar-thumb]:border-2 [&::-webkit-scrollbar-thumb:hover]:border-0 [&::-webkit-scrollbar-thumb]:border-solid [&::-webkit-scrollbar-thumb]:border-transparent [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar]:w-[6px] [&::-webkit-scrollbar]:h-[6px]"

const NormalVideoLayout = ({
  screenShareTracks,
  participants,
  handleTileClick,
  totalItems,
}) => {
  const getContainerLayout = () => {
    if (totalItems === 1) return "flex flex-col items-center justify-center"
    if (totalItems >= 2 && totalItems <= 6) return "flex flex-wrap items-center justify-center content-center"
    return `flex flex-col min-[426px]:grid ${gridClass}`
  }

  const getItemClass = () => {
    if (totalItems === 1) return "h-full w-full"
    
    // 2 items: 50% width, aspect-video to prevent them from becoming too tall and skinny
    if (totalItems === 2) return "w-full min-[426px]:w-[calc(50%-2px)] aspect-video flex-shrink-0"
    
    // 3, 4 items: 50% width, 50% height to perfectly fill the screen without scrolling
    if (totalItems === 3 || totalItems === 4) return "w-full min-[426px]:w-[calc(50%-2px)] min-[426px]:h-[calc(50%-2px)] min-h-[250px] flex-shrink-0"
    
    // 5, 6 items: 33.3% width, 50% height
    if (totalItems === 5 || totalItems === 6) return "w-full min-[426px]:w-[calc(33.333%-2.66px)] min-[426px]:h-[calc(50%-2px)] min-h-[200px] flex-shrink-0"
    
    return "w-full aspect-video"
  }

  return (
    <div className="relative h-full w-full py-5 overflow-hidden">
      <div
        className={`
      h-full w-full
      gap-1
      px-5
      overflow-y-auto
      [align-content:safe_center]
      [justify-content:safe_center]
      ${getContainerLayout()}
      ${scrollbarClasses}
    `}
      >
        {screenShareTracks?.map((trackRef) => (
          <div
            key={trackRef.publication?.trackSid}
            className={`relative ${getItemClass()}`}
          >
            <ScreenShareTile
              trackRef={trackRef}
              presenterDisplayName={
                trackRef.participant?.name ||
                trackRef.participant?.identity ||
                "Unknown"
              }
              isLocal={trackRef.participant?.isLocal}
              onClick={() => handleTileClick({ type: "screen", trackRef })}
            />
          </div>
        ))}
        {participants.map((participant) => (
          <div
            key={participant.identity}
            className={`relative ${getItemClass()}`}
          >
            <VideoTile
              participant={participant}
              onClick={() => handleTileClick({ type: "video", participant })}
            />
          </div>
        ))}
      </div>
    </div>
  )
}

export default NormalVideoLayout
