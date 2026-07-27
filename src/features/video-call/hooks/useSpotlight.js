import { useState, useEffect, useRef } from "react"
import { useGame } from "@/features/games/context/GameContext"

export const GAME_SPOTLIGHT_TYPE = "game"

export const useSpotlight = (screenShareTracks, participants) => {
  const [spotlightItem, setSpotlightItem] = useState(null)
  const autoSpottedRef = useRef(new Set())
  const { gameState, gameType } = useGame()
  const isGameActive = gameState !== "idle" && !!gameType

  // Khi game đang chạy: auto-promote game lên main spotlight.
  // Khi game idle: clear spotlight (để VideoGrid giữ default).
  useEffect(() => {
    if (isGameActive) {
      setSpotlightItem((prev) =>
        prev?.type === GAME_SPOTLIGHT_TYPE ? prev : { type: GAME_SPOTLIGHT_TYPE },
      )
    } else {
      setSpotlightItem((prev) =>
        prev?.type === GAME_SPOTLIGHT_TYPE ? null : prev,
      )
    }
  }, [isGameActive])

  // Auto-spotlight new screen shares (chỉ khi game không active)
  useEffect(() => {
    if (isGameActive) return
    if (screenShareTracks?.length > 0) {
      const firstTrack = screenShareTracks[0]
      const trackSid = firstTrack.publication?.trackSid
      if (trackSid && !autoSpottedRef.current.has(trackSid)) {
        autoSpottedRef.current.add(trackSid)
        setSpotlightItem({ type: "screen", trackRef: firstTrack })
      }
    }
  }, [screenShareTracks, isGameActive])

  // Clear spotlight if the track/participant leaves
  useEffect(() => {
    if (spotlightItem?.type === "screen") {
      const stillExists = screenShareTracks?.some(
        (t) =>
          t.publication?.trackSid ===
          spotlightItem.trackRef.publication?.trackSid,
      )
      if (!stillExists) setSpotlightItem(null)
    } else if (spotlightItem?.type === "video") {
      const stillExists = participants?.some(
        (p) => p.identity === spotlightItem.participant.identity,
      )
      if (!stillExists) setSpotlightItem(null)
    }
  }, [screenShareTracks, participants, spotlightItem])

  const handleTileClick = (item) => {
    if (!item) return
    // Game tile: luôn spotlight game (toggle cũng giữ nguyên vì game là spot chính khi active)
    if (item.type === GAME_SPOTLIGHT_TYPE) {
      setSpotlightItem({ type: GAME_SPOTLIGHT_TYPE })
      return
    }
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