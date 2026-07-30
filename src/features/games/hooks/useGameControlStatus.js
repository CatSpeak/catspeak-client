import { useGame } from "@/features/games/context/GameContext"
import { useGlobalVideoCall } from "@/features/video-call/context/GlobalVideoCallProvider"

/**
 * Custom hook to get room host status, game progress, and game launch permissions.
 */
export const useGameControlStatus = () => {
  const { gameState } = useGame()
  const { room, user } = useGlobalVideoCall()

  const isHost = Boolean(
    room?.creatorId != null &&
      user?.accountId != null &&
      String(room.creatorId) === String(user.accountId)
  )

  const isGameInProgress = Boolean(gameState && gameState !== "idle")
  const canStartGame = !isGameInProgress
  const gameDisabledReason = isGameInProgress
    ? "Đang có trò chơi trong phòng, không thể mở thêm"
    : null

  return {
    isHost,
    gameState,
    isGameInProgress,
    canStartGame,
    gameDisabledReason,
  }
}

export default useGameControlStatus
