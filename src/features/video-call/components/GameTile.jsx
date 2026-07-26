import React from "react"
import { Gamepad2 } from "lucide-react"
import { useGame } from "@/features/games/context/GameContext"
import { useLanguage } from "@/shared/context/LanguageContext"
import GameSpotlight from "./GameSpotlight"

/**
 * GameTile — render game content trong 1 tile spotlight-style.
 *
 * Layout bắt chước ScreenShareTile:
 * - Container bg-neutral-900, rounded-2xl + border.
 * - Preview (hình game) dùng object-cover để giữ tỷ lệ khung hình.
 * - Label bottom-left dùng icon Gamepad2 và tên "Màn hình của [Tên Game]".
 *
 * Khi `isMain=true`: nhúng GameSpotlight (overlay đầy đủ, tương tác được).
 * Khi `isMain=false`: chỉ preview thu nhỏ — click để promote lên main.
 */
const GameTile = ({ isMain = true, onClick }) => {
  const { t } = useLanguage()
  const { gameType, currentRound, pictureIt, puzzle } = useGame()

  const isPictureIt = gameType === "picture_it" || gameType === "picture-it"

  const gameName = isPictureIt
    ? (t.rooms?.game?.pictureIt?.title || "Picture IT")
    : (t.rooms?.game?.crackIt?.title || "Crack It")

  const labelText = t.rooms?.videoCall?.screenShareLabel?.replace(
    "{{name}}",
    gameName,
  ) || `Màn hình của ${gameName}`

  // Preview image: Hỗ trợ cả Picture IT và Crack IT
  const previewImageUrl =
    pictureIt?.imageUrlFull ||
    pictureIt?.imageUrl ||
    puzzle?.image_url ||
    puzzle?.imageUrl ||
    null

  const showImagePreview = !!previewImageUrl

  const roundText = currentRound ? `${currentRound.round}/${currentRound.total}` : null

  // ─── MAIN — tile chính, nhúng game overlay đầy đủ ───
  if (isMain) {
    return (
      <div
        className="relative h-full w-full bg-neutral-900 flex items-center justify-center overflow-hidden rounded-2xl border border-[#E5E5E5]"
      >
        {/* Game overlay (mode main) */}
        <div className="absolute inset-0">
          <GameSpotlight isMain={true} />
        </div>
      </div>
    )
  }

  // ─── SIDEBAR — tile thu nhỏ, chỉ preview ───
  return (
    <div
      onClick={onClick}
      className="relative h-full w-full bg-neutral-900 overflow-hidden rounded-2xl border border-[#E5E5E5] cursor-pointer hover:border-cath-red-400 transition-colors group"
      title={`${labelText} — click to expand`}
    >
      {showImagePreview ? (
        <img
          src={previewImageUrl}
          alt={gameName}
          className="absolute inset-0 h-full w-full object-cover"
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center text-white/50 bg-neutral-800">
          <Gamepad2 size={32} />
        </div>
      )}

      {/* Label giống ScreenShareTile — bottom-left */}
      <div className="absolute bottom-2 left-2 z-10 flex items-center gap-1.5 bg-black/50 backdrop-blur-md rounded-full px-2.5 py-1 text-white max-w-[calc(100%-16px)] pointer-events-none shadow-sm">
        <Gamepad2 size={14} className="shrink-0 text-white" />
        <span className="font-medium text-xs truncate">{labelText}</span>
        {roundText && (
          <span className="text-[11px] text-white/70 ml-1 shrink-0">{roundText}</span>
        )}
      </div>
    </div>
  )
}

export default GameTile