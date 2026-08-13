import React, { useMemo } from "react"
import ScreenShareTile from "../ScreenShareTile"
import VideoTile from "../VideoTile"
import GameTile from "../GameTile"
import OverflowTile from "../OverflowTile"
import { useGame } from "@/features/games/context/GameContext"
import { useGridParticipants } from "@/features/video-call/hooks/useGridParticipants"

// Identifier cho spotlight item = game. Dùng string literal để track ở redux/video state.
export const GAME_SPOTLIGHT_TYPE = "game"

const SpotlightLayout = ({
  spotlightItem,
  screenShareTracks,
  participants,
  handleTileClick,
  totalItems,
}) => {
  const { gameState, gameType } = useGame()
  const isGameActive = gameState !== "idle" && !!gameType

  const isSpotlightGame =
    isGameActive && spotlightItem?.type === GAME_SPOTLIGHT_TYPE

  // Filter sidebar items
  const sidebarScreenShares = useMemo(() => {
    if (isSpotlightGame) return screenShareTracks ?? []
    return (screenShareTracks ?? []).filter((trackRef) => {
      if (spotlightItem?.type !== "screen") return true
      return (
        trackRef.publication?.trackSid !==
        spotlightItem.trackRef?.publication?.trackSid
      )
    })
  }, [isSpotlightGame, screenShareTracks, spotlightItem])

  const sidebarParticipants = useMemo(() => {
    if (isSpotlightGame || spotlightItem?.type === "screen") {
      return participants ?? []
    }
    if (spotlightItem?.type === "video") {
      return (participants ?? []).filter(
        (p) => p.identity !== spotlightItem?.participant?.identity,
      )
    }
    return participants ?? []
  }, [isSpotlightGame, participants, spotlightItem])

  const showGameInSidebar = isGameActive && !isSpotlightGame

  // Combine sidebar items into single array for useGridParticipants
  const sidebarAllItems = useMemo(() => {
    const list = []
    if (showGameInSidebar) {
      list.push({ type: GAME_SPOTLIGHT_TYPE, key: GAME_SPOTLIGHT_TYPE })
    }
    sidebarScreenShares.forEach((t) => {
      list.push({
        type: "screen",
        data: t,
        key: `screen-${t.publication?.trackSid || t.participant?.identity}`,
      })
    })
    sidebarParticipants.forEach((p) => {
      list.push({
        type: "video",
        data: p,
        key: `video-${p.identity}`,
      })
    })
    return list
  }, [showGameInSidebar, sidebarScreenShares, sidebarParticipants])

  // Limit sidebar items: max 3 tiles on mobile (<640px), max 5 on desktop
  const { visibleItems, overflowItems, overflowCount } = useGridParticipants(
    sidebarAllItems,
    5,
  )

  const hasSidebarItems = sidebarAllItems.length > 0

  const renderSidebarItem = (item) => {
    if (item.type === GAME_SPOTLIGHT_TYPE) {
      return (
        <div key={item.key} className="relative h-full w-full min-h-0 min-w-0">
          <GameTile
            isMain={false}
            onClick={() => handleTileClick({ type: GAME_SPOTLIGHT_TYPE })}
          />
        </div>
      )
    }

    if (item.type === "screen") {
      return (
        <div key={item.key} className="relative h-full w-full min-h-0 min-w-0">
          <ScreenShareTile
            trackRef={item.data}
            presenterDisplayName={
              item.data.participant?.name ||
              item.data.participant?.identity ||
              "Unknown"
            }
            isLocal={item.data.participant?.isLocal}
            onClick={() => handleTileClick({ type: "screen", trackRef: item.data })}
          />
        </div>
      )
    }

    return (
      <div key={item.key} className="relative h-full w-full min-h-0 min-w-0">
        <VideoTile
          participant={item.data}
          onClick={() => handleTileClick({ type: "video", participant: item.data })}
        />
      </div>
    )
  }

  return (
    <div className="flex h-full w-full flex-col gap-1 md:flex-row overflow-hidden p-0">
      {/* Main spotlight tile */}
      <div className="flex-[3] md:flex-[4] min-h-0 min-w-0 relative overflow-hidden rounded-xl">
        {isSpotlightGame ? (
          <GameTile isMain={true} />
        ) : spotlightItem?.type === "screen" ? (
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
        ) : spotlightItem?.participant ? (
          <div className="h-full w-full">
            <VideoTile
              participant={spotlightItem.participant}
              onClick={() => handleTileClick(spotlightItem)}
            />
          </div>
        ) : isGameActive ? (
          <GameTile isMain={true} />
        ) : null}
      </div>

      {/* Sidebar: non-spotlighted tiles without scrollbars */}
      {hasSidebarItems && (
        <div
          className={`min-h-0 min-w-0 ${isGameActive ? "hidden md:flex flex-1" : "flex flex-1"}`}
        >
          <div className="flex flex-1 gap-1 min-h-0 min-w-0 flex-row md:flex-col overflow-hidden">
            {visibleItems.map((item) => renderSidebarItem(item))}
            {overflowCount > 0 && (
              <div className="relative h-full w-full min-h-0 min-w-0 overflow-hidden rounded-xl">
                <OverflowTile
                  overflowItems={overflowItems}
                  overflowCount={overflowCount}
                />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default SpotlightLayout

