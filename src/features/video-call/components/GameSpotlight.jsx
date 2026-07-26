import { useGame } from "@/features/games/context/GameContext"
import PictureITOverlay from "@/features/games/components/picture-it/components/PictureITOverlay"
import CrackItOverlay from "@/features/games/components/crack-it/CrackItOverlay"

const pickOverlay = (mode, isMain) => {
  const { gameType } = useGame()
  if (gameType === "picture_it" || gameType === "picture-it") {
    return <PictureITOverlay mode={mode} isMain={isMain} />
  }
  if (gameType === "crack_it" || gameType === "crack-it") {
    return <CrackItOverlay mode={mode} isMain={isMain} />
  }
  return null
}

/**
 * Render game overlay ở chế độ "embedded" để nhúng vào spotlight tile.
 *
 * - Khi game đang chạy: PictureITOverlay / CrackItOverlay sẽ tự render game.
 *   isMain=true → tương tác đầy đủ. isMain=false → chỉ xem (overlay lược bỏ action).
 * - Khi game idle: trả về null.
 */
export const GameSpotlight = ({ isMain = true }) => {
  const { gameState } = useGame()
  if (gameState === "idle") return null
  return pickOverlay("embedded", isMain)
}

/**
 * Render game overlay fullscreen (chế độ cũ) — dùng khi layout không phải spotlight.
 * Khi game idle: trả về null. Luôn ở chế độ main.
 */
export const GameFullscreenOverlay = () => {
  const { gameState } = useGame()
  if (gameState === "idle") return null
  return pickOverlay("fullscreen", true)
}

export default GameSpotlight