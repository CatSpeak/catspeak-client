import VideoTile from "./VideoTile"
import ScreenShareTile from "./ScreenShareTile"
import { useGlobalVideoCall as useVideoCallContext } from "@/features/video-call/context/GlobalVideoCallProvider"
import { useSpotlight } from "@/features/video-call/hooks/useSpotlight"

/**
 * Renders a responsive grid of VideoTile and ScreenShareTile components.
 * Supports clicking any tile to elevate it into a Spotlight, moving others
 * to a sidebar (desktop) or bottom scroll row (mobile).
 */
const VideoGrid = () => {
  const { participants: contextParticipants, screenShareTracks } =
    useVideoCallContext()

  const participants = contextParticipants ?? []

  const { spotlightItem, handleTileClick } = useSpotlight(
    screenShareTracks,
    participants,
  )

  const gridClass = "min-[426px]:grid-cols-[repeat(auto-fit,minmax(260px,1fr))]"
  const scrollbarClasses =
    "[&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-[#990011] [&::-webkit-scrollbar-track]:bg-gray-200 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar]:h-1.5"

  if (spotlightItem) {
    // ─── Unified Spotlight layout ───
    // Sidebar contains everything NOT currently spotlighted.
    // When a screen share is spotlighted, all participants (including the
    // screen sharer) still appear so they can see their own webcam tile.

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

    return (
      <div className="flex h-full w-full flex-col md:flex-row gap-2 p-5 overflow-hidden">
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

        {/* Sidebar: all other tiles
            Mobile  → horizontal scroll row at the bottom (h-28)
            Desktop → vertical scroll column on the right  */}
        {hasSidebarItems && (
          <div
            className={`
              flex flex-1 gap-2 min-h-0 min-w-0
              flex-row overflow-x-auto
              md:flex-col md:overflow-y-auto md:overflow-x-hidden
              ${scrollbarClasses}
            `}
          >
            {sidebarScreenShares.map((trackRef) => (
              <div
                key={trackRef.publication?.trackSid}
                className="flex-1 basis-0 min-w-[160px] md:min-w-0 md:min-h-[160px] relative"
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
              <div
                key={participant.identity}
                className="flex-1 basis-0 min-w-[160px] md:min-w-0 md:min-h-[160px] relative"
              >
                <VideoTile
                  participant={participant}
                  onClick={() =>
                    handleTileClick({ type: "video", participant })
                  }
                />
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }

  // ─── Normal grid layout (everyone) ───
  return (
    <div
      className={`
    flex flex-col min-[426px]:grid h-full w-full
    gap-2
    p-5
    overflow-y-auto
    min-[426px]:place-content-center
    min-[426px]:auto-rows-fr
    ${gridClass}
    ${scrollbarClasses}
  `}
    >
      {screenShareTracks?.map((trackRef) => (
        <div
          key={trackRef.publication?.trackSid}
          className="relative h-full w-full max-w-full max-[425px]:min-h-[300px] max-[425px]:flex-1 max-[425px]:shrink-0"
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
          className="relative h-full w-full max-w-full max-[425px]:min-h-[300px] max-[425px]:flex-1 max-[425px]:shrink-0"
        >
          <VideoTile
            participant={participant}
            onClick={() => handleTileClick({ type: "video", participant })}
          />
        </div>
      ))}
    </div>
  )
}

export default VideoGrid
