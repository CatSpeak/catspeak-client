import { useGlobalVideoCall as useVideoCallContext } from "@/features/video-call/context/GlobalVideoCallProvider"
import { useSpotlight } from "@/features/video-call/hooks/useSpotlight"
import SpotlightLayout from "./layouts/SpotlightLayout"
import NormalVideoLayout from "./layouts/NormalVideoLayout"

/**
 * Renders a responsive grid of VideoTile and ScreenShareTile components.
 * Supports clicking any tile to elevate it into a Spotlight, moving others
 * to a sidebar (desktop) or bottom scroll row (mobile).
 */
const VideoGrid = () => {
  const { participants, screenShareTracks } = useVideoCallContext()

  const { spotlightItem, handleTileClick } = useSpotlight(
    screenShareTracks,
    participants,
  )

  const totalItems = (screenShareTracks?.length || 0) + (participants?.length || 0)

  if (spotlightItem) {
    return (
      <SpotlightLayout
        spotlightItem={spotlightItem}
        screenShareTracks={screenShareTracks}
        participants={participants}
        handleTileClick={handleTileClick}
        totalItems={totalItems}
      />
    )
  }

  return (
    <NormalVideoLayout
      screenShareTracks={screenShareTracks}
      participants={participants}
      handleTileClick={handleTileClick}
      totalItems={totalItems}
    />
  )
}

export default VideoGrid
