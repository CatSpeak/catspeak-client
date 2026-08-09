import React from "react"
// eslint-disable-next-line no-unused-vars
import { AnimatePresence, motion } from "framer-motion"
import { useGame } from "@/features/games/context/GameContext"
import GameLayoutOverlay from "./GameLayoutOverlay"
import { FluentAnimation } from "@/shared/components/ui/animations"

const BaseGameOverlay = ({
  expectedGameType,
  title,
  waitingText,
  gameContent,
  overlays,
  useFluentAnimation = false,
  animationKey = "game-overlay",
  /**
   * "fullscreen" (mặc định): chiếm full viewport, dùng khi render độc lập ngoài VideoCallRoom.
   * "embedded": render gọn trong 1 container, dùng khi nhúng vào spotlight tile hoặc tile khác.
   */
  mode = "fullscreen",
}) => {
  const { gameState, gameType, countdown } = useGame();

  const normalizeType = (t) => t?.toLowerCase()?.replace(/-/g, "_")
  const normCurrent = normalizeType(gameType)

  const matchesGameType = Array.isArray(expectedGameType)
    ? expectedGameType.map(normalizeType).includes(normCurrent)
    : normalizeType(expectedGameType) === normCurrent;

  if (!matchesGameType) {
    return null
  }

  // Khi user đã từng out (`leftPlayers` chứa họ) nhưng game vẫn đang chơi,
  // nghĩa là user vừa reconnect vào phòng có ván đang diễn ra → vẫn cho xem overlay
  // (với tư cách spectator) thay vì màn hình đen.
  // Chỉ ẩn khi game thực sự kết thúc (idle / force_stopped).
  if (gameState === "idle" || gameState === "force_stopped") {
    return null;
  }

  const content = (
    <GameLayoutOverlay
      embedded={mode === "embedded"}
      gameContentComponent={gameContent}
      overlays={
        <>
          {/* GAME_SETUP & COUNTDOWN */}
          <AnimatePresence>
            {gameState === "setup" && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-white/95 text-slate-900"
              >
                <h1 className="text-4xl font-bold mb-8 text-cath-red-700">
                  {title}
                </h1>
                {countdown !== null && countdown !== undefined ? (
                  <motion.div
                    key={countdown}
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 1.5, opacity: 0 }}
                    transition={{ duration: 0.5 }}
                    className="text-8xl font-black text-cath-red-500"
                  >
                    {countdown}
                  </motion.div>
                ) : (
                  <div className="text-xl text-slate-600 font-medium">
                    {waitingText || "Đang chuẩn bị ván đấu..."}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {overlays}
        </>
      }
    />
  );

  // Embedded mode: render gọn trong container của caller, không fixed, không fullscreen.
  if (mode === "embedded") {
    return <div className="relative w-full h-full overflow-hidden rounded-2xl bg-gray-50">{content}</div>;
  }

  return (
    <AnimatePresence>
      {useFluentAnimation ? (
        <FluentAnimation
          key={animationKey}
          direction="up"
          exit
          className="fixed inset-0 z-[100] w-full h-[100dvh]"
        >
          {content}
        </FluentAnimation>
      ) : (
        content
      )}
    </AnimatePresence>
  )
}

export default BaseGameOverlay
