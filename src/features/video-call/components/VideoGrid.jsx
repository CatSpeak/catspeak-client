import { useGlobalVideoCall as useVideoCallContext } from "@/features/video-call/context/GlobalVideoCallProvider"
import { useSpotlight } from "@/features/video-call/hooks/useSpotlight"
import SpotlightLayout from "./layouts/SpotlightLayout"
import NormalVideoLayout from "./layouts/NormalVideoLayout"
import PiPLayout from "./layouts/PiPLayout"

/**
 * Renders a responsive grid of VideoTile and ScreenShareTile components.
 * Supports clicking any tile to elevate it into a Spotlight, moving others
 * to a sidebar (desktop) or bottom scroll row (mobile).
 *
 * layoutMode from context:
 *  - "auto"      → original behavior (spotlight on click / screen share)
 *  - "grid"      → always NormalVideoLayout
 *  - "spotlight"  → PiPLayout (for 2 items) or full-screen first participant
 *  - "sidebar"   → always SpotlightLayout with first item as spotlight
 */
const VideoGrid = () => {
  const { participants, screenShareTracks, layoutMode, setLayoutMode, maxTiles, hideEmptyTiles } = useVideoCallContext()

  const { spotlightItem, handleTileClick } = useSpotlight(
    screenShareTracks,
    participants,
  )

  const filteredParticipants = hideEmptyTiles
    ? participants.filter((p) => p.isLocal || p.isCameraEnabled)
    : participants

  const totalItems = (screenShareTracks?.length || 0) + (filteredParticipants?.length || 0)

  // Build a default spotlight item for forced layouts (sidebar/spotlight)
  const getDefaultSpotlightItem = () => {
    // Prefer screen share as spotlight
    if (screenShareTracks?.length > 0) {
      return { type: "screen", trackRef: screenShareTracks[0] }
    }
    // Otherwise use the first participant
    if (filteredParticipants?.length > 0) {
      return { type: "video", participant: filteredParticipants[0] }
    }
    return null
  }

  const handleSpotlightTileClick = (item) => {
    const isCurrentSpotlight =
      spotlightItem &&
      spotlightItem.type === item.type &&
      (item.type === "video"
        ? spotlightItem.participant?.identity === item.participant?.identity
        : spotlightItem.trackRef?.publication?.trackSid === item.trackRef?.publication?.trackSid)

    handleTileClick(item)

    if (isCurrentSpotlight) {
      setLayoutMode("grid")
    }
  }

  // ── "grid" mode: always NormalVideoLayout ──
  if (layoutMode === "grid") {
    const handleGridTileClick = (item) => {
      handleTileClick(item)
      setLayoutMode("sidebar")
    }

    return (
      <NormalVideoLayout
        screenShareTracks={screenShareTracks}
        participants={filteredParticipants}
        handleTileClick={handleGridTileClick}
        totalItems={totalItems}
        maxTiles={maxTiles}
      />
    )
  }

  // ── "spotlight" mode: PiPLayout ──
  if (layoutMode === "spotlight") {
    const forcedSpotlight = spotlightItem || getDefaultSpotlightItem()
    return (
      <PiPLayout
        spotlightItem={forcedSpotlight}
        screenShareTracks={screenShareTracks}
        participants={filteredParticipants}
        handleTileClick={handleSpotlightTileClick}
      />
    )
  }

  // ── "sidebar" mode: always SpotlightLayout ──
  if (layoutMode === "sidebar") {
    const forcedSpotlight = spotlightItem || getDefaultSpotlightItem()

    if (forcedSpotlight && totalItems > 1) {
      return (
        <SpotlightLayout
          spotlightItem={forcedSpotlight}
          screenShareTracks={screenShareTracks}
          participants={filteredParticipants}
          handleTileClick={handleSpotlightTileClick}
          totalItems={totalItems}
        />
      )
    }

    // Fallback for 1 item: just show the normal layout
    return (
      <NormalVideoLayout
        screenShareTracks={screenShareTracks}
        participants={filteredParticipants}
        handleTileClick={handleSpotlightTileClick}
        totalItems={totalItems}
        maxTiles={maxTiles}
      />
    )
  }

  // ── "auto" mode: original behavior ──
  if (spotlightItem) {
    if (totalItems === 2) {
      return (
        <PiPLayout
          spotlightItem={spotlightItem}
          screenShareTracks={screenShareTracks}
          participants={filteredParticipants}
          handleTileClick={handleTileClick}
        />
      )
    }

    return (
      <SpotlightLayout
        spotlightItem={spotlightItem}
        screenShareTracks={screenShareTracks}
        participants={filteredParticipants}
        handleTileClick={handleTileClick}
        totalItems={totalItems}
      />
    )
  }

  return (
    <NormalVideoLayout
      screenShareTracks={screenShareTracks}
      participants={filteredParticipants}
      handleTileClick={handleTileClick}
      totalItems={totalItems}
      maxTiles={maxTiles}
    />
  )
}

export default VideoGrid
