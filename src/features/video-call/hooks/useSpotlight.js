import { useState, useEffect, useRef } from "react"

export const useSpotlight = (screenShareTracks, participants) => {
  const [spotlightItem, setSpotlightItem] = useState(null)
  const autoSpottedRef = useRef(new Set())

  // Auto-spotlight new screen shares
  useEffect(() => {
    if (screenShareTracks?.length > 0) {
      const firstTrack = screenShareTracks[0]
      const trackSid = firstTrack.publication?.trackSid
      if (trackSid && !autoSpottedRef.current.has(trackSid)) {
        autoSpottedRef.current.add(trackSid)
        setSpotlightItem({ type: "screen", trackRef: firstTrack })
      }
    }
  }, [screenShareTracks])

  // Clear spotlight if the track/participant leaves
  useEffect(() => {
    if (spotlightItem?.type === "screen") {
      const stillExists = screenShareTracks?.some(
        (t) =>
          t.publication?.trackSid ===
          spotlightItem.trackRef.publication?.trackSid
      )
      if (!stillExists) setSpotlightItem(null)
    } else if (spotlightItem?.type === "video") {
      const stillExists = participants?.some(
        (p) => p.identity === spotlightItem.participant.identity
      )
      if (!stillExists) setSpotlightItem(null)
    }
  }, [screenShareTracks, participants, spotlightItem])

  const handleTileClick = (item) => {
    if (
      spotlightItem?.type === item.type &&
      spotlightItem?.type === "screen" &&
      spotlightItem.trackRef.publication?.trackSid ===
        item.trackRef.publication?.trackSid
    ) {
      setSpotlightItem(null) // toggle off
      return
    }
    if (
      spotlightItem?.type === item.type &&
      spotlightItem?.type === "video" &&
      spotlightItem.participant.identity === item.participant.identity
    ) {
      setSpotlightItem(null) // toggle off
      return
    }
    setSpotlightItem(item)
  }

  return {
    spotlightItem,
    setSpotlightItem,
    handleTileClick,
  }
}
