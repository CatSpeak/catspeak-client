import React from "react"
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
  animationKey = "game-overlay"
}) => {
  const { gameState, gameType, countdown, currentUserId, leftPlayers } = useGame();
  
  const hasLeft = leftPlayers?.has(currentUserId?.toString())

  const matchesGameType = Array.isArray(expectedGameType) 
    ? expectedGameType.includes(gameType) 
    : gameType === expectedGameType;

  if (!matchesGameType || hasLeft) {
    return null
  }

  // Allow passing force_stopped if needed, but typically handle it inside overlays or wrapper
  if (gameState === "idle") {
    return null;
  }

  const content = (
    <GameLayoutOverlay
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
