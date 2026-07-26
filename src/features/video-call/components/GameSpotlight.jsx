import { useGame } from "@/features/games/context/GameContext"
import PictureITOverlay from "@/features/games/components/picture-it/components/PictureITOverlay"
import CrackItOverlay from "@/features/games/components/crack-it/CrackItOverlay"

const pickOverlay = (mode) => {
  const { gameType } = useGame()
  if (gameType === "picture_it" || gameType === "picture-it") {
    return <PictureITOverlay mode={mode} />
  }
  if (gameType === "crack_it" || gameType === "crack-it") {
    return <CrackItOverlay mode={mode} />
  }
  return null
}

/**
 * Render game overlay ở chế độ "embedded" để nhúng vào spotlight tile
 * trong VideoGrid (thay vì full screen overlay).
 *
 * - Khi game đang chạy: PictureITOverlay / CrackItOverlay sẽ tự render game
 *   trong container của tile được nhúng.
 * - Khi game idle: trả về null, để caller giữ spotlight bình thường (screen share, video).
 */
export const GameSpotlight = () => {
  const { gameState } = useGame()
  if (gameState === "idle") return null
  return pickOverlay("embedded")
}

/**
 * Render game overlay fullscreen (chế độ cũ) — dùng khi layout không phải spotlight
 * (ví dụ grid layout). Khi game idle: trả về null.
 */
export const GameFullscreenOverlay = () => {
  const { gameState } = useGame()
  if (gameState === "idle") return null
  return pickOverlay("fullscreen")
}

export default GameSpotlight
