import { useGame } from "@/features/games/context/GameContext"
import { useGlobalVideoCall } from "@/features/video-call/context/GlobalVideoCallProvider"
import { isRoomHost } from "@/features/video-call/utils/roomTypeHelpers"
import { useGetGamePolicyQuery } from "@/store/api/roomsApi"

/**
 * Custom hook to get room host status, game progress, and game launch permissions.
 * Ticket 01: when game policy is off, new games are blocked with GAME_DISABLED (host sees switch, others see disabled button + tooltip).
 */
export const useGameControlStatus = () => {
  const { gameState } = useGame()
  const { room, user, isHost: isHostFromContext, id: roomId } = useGlobalVideoCall()
  const currentRoomId = room?.id || roomId

  const isHost = isHostFromContext ?? isRoomHost(room, user)

  const { data: gamePolicyData } = useGetGamePolicyQuery(currentRoomId, { skip: !currentRoomId })
  const allowGame = gamePolicyData?.data?.allowGame ?? gamePolicyData?.allowGame ?? true

  const isGameInProgress = Boolean(gameState && gameState !== "idle")
  let canStartGame = !isGameInProgress
  let gameDisabledReason = isGameInProgress
    ? "Đang có trò chơi trong phòng, không thể mở thêm"
    : null

  if (!allowGame) {
    canStartGame = false
    gameDisabledReason = isGameInProgress ? gameDisabledReason : "Trò chơi đã bị tắt bởi Host."
  }

  return {
    isHost,
    gameState,
    isGameInProgress,
    canStartGame,
    gameDisabledReason,
    allowGame,
  }
}

export default useGameControlStatus
