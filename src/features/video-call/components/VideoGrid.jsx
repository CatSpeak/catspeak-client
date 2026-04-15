import VideoTile from "./VideoTile"
import ScreenShareTile from "./ScreenShareTile"
import { useGlobalVideoCall as useVideoCallContext } from "@/features/video-call/context/GlobalVideoCallProvider"
import { useSpotlight } from "@/features/video-call/hooks/useSpotlight"

/**
 * Renders a responsive grid of VideoTile and ScreenShareTile components.
 * Supports clicking any tile to elevate it into a Spotlight, moving others to a bottom scroll row.
 */
const VideoGrid = () => {
  const { participants: contextParticipants, screenShareTracks } =
    useVideoCallContext()

  const participants = contextParticipants ?? []

  const { spotlightItem, handleTileClick } = useSpotlight(
    screenShareTracks,
    participants,
  )

  const hasScreenShare = screenShareTracks && screenShareTracks.length > 0

  const gridClass = "min-[426px]:grid-cols-[repeat(auto-fit,minmax(260px,1fr))]"
  const scrollbarClasses =
    "[&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-[#990011] [&::-webkit-scrollbar-track]:bg-gray-200 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar]:h-1.5"

  if (spotlightItem && hasScreenShare) {
    // ─── Spotlight layout ───
    return (
      <div className="flex h-full w-full flex-col p-5 overflow-hidden">
        {/* Main: spotlighted tile */}
        <div className="flex-1 min-h-0 min-w-0">
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
                onClick={
                  hasScreenShare
                    ? () => handleTileClick(spotlightItem)
                    : undefined
                }
              />
            </div>
          ) : (
            <div className="h-full w-full">
              <VideoTile
                participant={spotlightItem.participant}
                onClick={
                  hasScreenShare
                    ? () => handleTileClick(spotlightItem)
                    : undefined
                }
              />
            </div>
          )}
        </div>
      </div>
    )
  }

  // ─── Normal grid layout (everyone) ───
  return (
    <div
      className={`
    flex flex-col min-[426px]:grid h-full w-full
    gap-4
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
            onClick={
              hasScreenShare
                ? () => handleTileClick({ type: "screen", trackRef })
                : undefined
            }
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
            onClick={
              hasScreenShare
                ? () => handleTileClick({ type: "video", participant })
                : undefined
            }
          />
        </div>
      ))}
    </div>
  )
}

export default VideoGrid
