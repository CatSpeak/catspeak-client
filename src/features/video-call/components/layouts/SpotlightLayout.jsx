import ScreenShareTile from "../ScreenShareTile"
import VideoTile from "../VideoTile"
import GameSpotlight from "../GameSpotlight"
import GameTile from "../GameTile"
import { useGame } from "@/features/games/context/GameContext"

const scrollbarClasses =
  "[&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-cath-red-700 [&::-webkit-scrollbar-thumb]:bg-clip-padding [&::-webkit-scrollbar-thumb]:border-2 [&::-webkit-scrollbar-thumb:hover]:border-0 [&::-webkit-scrollbar-thumb]:border-solid [&::-webkit-scrollbar-thumb]:border-transparent [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar]:w-[6px] [&::-webkit-scrollbar]:h-[6px]"

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

  // Khi game là main spotlight: tất cả screen share + participants xuống sidebar.
  // Khi spotlight là screen share/video: tất cả những thứ còn lại xuống sidebar.
  // Khi game active nhưng không phải main: chỉ game xuống sidebar.
  let sidebarScreenShares = []
  let sidebarParticipants = []

  if (isSpotlightGame) {
    sidebarScreenShares = screenShareTracks ?? []
    sidebarParticipants = participants
  } else {
    // Loại bỏ spotlight screen share khỏi sidebar (nếu spotlight là screen share).
    sidebarScreenShares = (screenShareTracks ?? []).filter((trackRef) => {
      if (spotlightItem?.type !== "screen") return true
      return (
        trackRef.publication?.trackSid !==
        spotlightItem.trackRef.publication?.trackSid
      )
    })

    if (spotlightItem?.type === "screen") {
      sidebarParticipants = participants
    } else if (spotlightItem?.type === "video") {
      sidebarParticipants = participants.filter(
        (p) => p.identity !== spotlightItem?.participant?.identity,
      )
    } else {
      sidebarParticipants = participants
    }
  }

  // Game tile chỉ xuất hiện trong sidebar khi nó KHÔNG phải spotlight chính.
  const showGameInSidebar = isGameActive && !isSpotlightGame

  const hasSidebarItems =
    sidebarScreenShares.length > 0 ||
    sidebarParticipants.length > 0 ||
    showGameInSidebar

  const getSidebarItemClass = () => {
    if (totalItems <= 5) {
      return "flex-shrink-0 w-[160px] aspect-video md:w-full md:flex-1 md:aspect-auto md:h-auto relative"
    }
    return "flex-shrink-0 w-[160px] md:w-full aspect-video md:flex-shrink-0 relative"
  }

  return (
    <div className="flex h-full w-full flex-col gap-1 md:flex-row overflow-hidden p-2">
      {/* Main: spotlighted tile */}
      <div className="flex-[3] md:flex-[4] min-h-0 min-w-0 relative">
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

      {/* Sidebar: all other tiles — ẩn trên mobile khi game đang active */}
      {hasSidebarItems && (
        <div className={`min-h-0 min-w-0 ${isGameActive ? "hidden md:flex flex-1" : "flex flex-1"}`}>
          <div
            className={`
              flex flex-1 gap-1 min-h-0 min-w-0
              flex-row overflow-x-auto
              md:flex-col md:overflow-y-auto md:overflow-x-hidden
              ${scrollbarClasses}
            `}
          >
            {/* Game tile khi nó không phải main spotlight */}
            {showGameInSidebar && (
              <div className={getSidebarItemClass()}>
                <GameTile
                  isMain={false}
                  onClick={() =>
                    handleTileClick({ type: GAME_SPOTLIGHT_TYPE })
                  }
                />
              </div>
            )}

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