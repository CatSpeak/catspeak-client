import ScreenShareTile from "../ScreenShareTile"
import VideoTile from "../VideoTile"

const scrollbarClasses =
  "[&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-cath-red-700 [&::-webkit-scrollbar-thumb]:bg-clip-padding [&::-webkit-scrollbar-thumb]:border-2 [&::-webkit-scrollbar-thumb:hover]:border-0 [&::-webkit-scrollbar-thumb]:border-solid [&::-webkit-scrollbar-thumb]:border-transparent [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar]:w-[6px] [&::-webkit-scrollbar]:h-[6px]"

const SpotlightLayout = ({
  spotlightItem,
  screenShareTracks,
  participants,
  handleTileClick,
  totalItems,
}) => {
  const sidebarScreenShares = (screenShareTracks ?? []).filter((trackRef) => {
    if (spotlightItem.type !== "screen") return true
    return (
      trackRef.publication?.trackSid !==
      spotlightItem.trackRef.publication?.trackSid
    )
  })

  const sidebarParticipants =
    spotlightItem.type === "screen"
      ? participants
      : participants.filter(
        (p) => p.identity !== spotlightItem.participant.identity,
      )

  const hasSidebarItems =
    sidebarScreenShares.length > 0 || sidebarParticipants.length > 0

  const getSidebarItemClass = () => {
    if (totalItems <= 5) {
      return "flex-shrink-0 w-[160px] aspect-video md:w-full md:flex-1 md:aspect-auto md:h-auto relative"
    }
    return "flex-shrink-0 w-[160px] md:w-full aspect-video md:flex-shrink-0 relative"
  }

  return (
    <div className="flex h-full w-full flex-col gap-1 md:flex-row overflow-hidden p-2">
      {/* Main: spotlighted tile */}
      <div className="flex-[3] md:flex-[4] min-h-0 min-w-0">
        {spotlightItem.type === "screen" ? (
          <div className="h-full w-full">
            <ScreenShareTile
              trackRef={spotlightItem.trackRef}
              presenterDisplayName={
                spotlightItem.trackRef.participant?.name ||
                spotlightItem.trackRef.participant?.identity ||
                "Unknown"
              }
              isLocal={spotlightItem.trackRef.participant?.isLocal}
              onClick={() => handleTileClick(spotlightItem)}
            />
          </div>
        ) : (
          <div className="h-full w-full">
            <VideoTile
              participant={spotlightItem.participant}
              onClick={() => handleTileClick(spotlightItem)}
            />
          </div>
        )}
      </div>

      {/* Sidebar: all other tiles */}
      {hasSidebarItems && (
        <div className="flex flex-1 min-h-0 min-w-0">
          <div
            className={`
              flex flex-1 gap-1 min-h-0 min-w-0
              flex-row overflow-x-auto
              md:flex-col md:overflow-y-auto md:overflow-x-hidden 
              ${scrollbarClasses}
            `}
          >
            {sidebarScreenShares.map((trackRef) => (
              <div
                key={trackRef.publication?.trackSid}
                className={getSidebarItemClass()}
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
            {sidebarParticipants.map((participant) => (
              <div key={participant.identity} className={getSidebarItemClass()}>
                <VideoTile
                  participant={participant}
                  onClick={() =>
                    handleTileClick({ type: "video", participant })
                  }
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default SpotlightLayout
