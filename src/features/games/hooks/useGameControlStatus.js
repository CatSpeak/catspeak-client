import { useGame } from "@/features/games/context/GameContext"
import { useGlobalVideoCall } from "@/features/video-call/context/GlobalVideoCallProvider"
import { isRoomHost } from "@/features/video-call/utils/roomTypeHelpers"
import { useGetRoomStateQuery } from "@/store/api/roomsApi"

/**
 * Custom hook to get room host status, game progress, and game launch permissions.
 * Ticket 03: game is host-only (co-host neither sees nor operates it) and the
 * allowGame policy is read from the RoomState cache (no standalone GET).
 */
export const useGameControlStatus = () => {
  const { gameState } = useGame()
  const { room, user, isHost: isHostFromContext, id: roomId } = useGlobalVideoCall()
  const currentRoomId = room?.id || roomId

  const isHost = isHostFromContext ?? isRoomHost(room, user)

  const { data: roomState } = useGetRoomStateQuery(currentRoomId, { skip: !currentRoomId })
  const roomStatePayload = roomState?.data ?? roomState
  const allowGame = roomStatePayload?.settings?.allowGame ?? true

  const isGameInProgress = Boolean(gameState && gameState !== "idle")
  // Ticket 03: host-only; a co-host must not see or operate games.
  let canStartGame = isHost && !isGameInProgress
  let gameDisabledReason = isGameInProgress
    ? "Đang có trò chơi trong phòng, không thể mở thêm"
    : (!isHost ? "Chỉ chủ phòng mới có thể bắt đầu trò chơi." : null)

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
