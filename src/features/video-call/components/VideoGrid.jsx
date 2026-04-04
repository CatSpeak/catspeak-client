import VideoTile from "./VideoTile"
import ScreenShareTile from "./ScreenShareTile"
import { useVideoCallContext } from "@/features/video-call/context/VideoCallContext"
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
    participants
  )

  const gridClass = "min-[426px]:grid-cols-[repeat(auto-fit,minmax(260px,1fr))]"
  const scrollbarClasses =
    "[&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-[#990011] [&::-webkit-scrollbar-track]:bg-gray-200 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar]:h-1.5"

  if (spotlightItem) {
    // ─── Spotlight layout ───
    return (
      <div className="flex h-full w-full flex-col gap-4 p-5 overflow-hidden">
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

        {/* Bottom row: other tiles */}
        <div
          className={`
            flex gap-4 overflow-x-auto overflow-y-hidden
            h-28 shrink-0
            ${scrollbarClasses}
          `}
        >
          {screenShareTracks?.map((trackRef) => {
            if (
              spotlightItem.type === "screen" &&
              spotlightItem.trackRef.publication?.trackSid ===
                trackRef.publication?.trackSid
            ) {
              return null // already spotlighted
            }
            return (
              <div
                key={trackRef.publication?.trackSid}
                className="shrink-0 h-full aspect-video rounded-lg overflow-hidden"
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
            )
          })}
          {participants.map((participant) => {
            if (
              spotlightItem.type === "video" &&
              spotlightItem.participant.identity === participant.identity
            ) {
              return null // already spotlighted
            }
            return (
              <div
                key={participant.identity}
                className="shrink-0 h-full aspect-video rounded-lg overflow-hidden"
              >
                <VideoTile
                  participant={participant}
                  onClick={() => handleTileClick({ type: "video", participant })}
                />
              </div>
            )
          })}
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
