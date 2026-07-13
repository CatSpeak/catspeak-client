import React, { useState } from "react"
// eslint-disable-next-line no-unused-vars
import { AnimatePresence, motion } from "framer-motion"
import { useGame } from "@/features/video-call/context/GameContext"
import PuzzleCenter from "./PuzzleCenter"
import AnswerInput from "./AnswerInput"
import { useLanguage } from "@/shared/context/LanguageContext"
import { useParticipants } from "@livekit/components-react"

import GameLayoutOverlay from "../GameLayoutOverlay"
import RoundResultOverlay from "./RoundResultOverlay"
import GameOverScreen from "./GameOverScreen"

const CrackItOverlay = () => {
  const { gameState, gameType, exitGame, countdown, roundResults, finalResults, currentUserId, playerNames, currentRound, leftPlayers } = useGame();
  const { t } = useLanguage()
  const participants = useParticipants()

  const getPlayerName = (id) => {
    let name = ""
    if (playerNames?.[id]) name = playerNames[id]
    else {
      const p = participants.find(p => p.identity === id.toString())
      if (p && p.name) name = p.name
      else name = t.rooms?.game?.crackIt?.playerX ? t.rooms.game.crackIt.playerX.replace('{0}', id) : `Người chơi ${id}`
    }

    return {
      name,
      isYou: id.toString() === currentUserId?.toString()
    }
  }

  const hasLeft = leftPlayers?.has(currentUserId?.toString())

  if (gameState === "idle" || gameType !== "crack_it" || hasLeft) {
    return null
  }

  return (
    <AnimatePresence>
      <GameLayoutOverlay
        gameContentComponent={
          (gameState === "playing" || gameState === "result") ? (
            <div className="flex-1 flex flex-col gap-4 md:gap-6 min-h-0 relative items-center justify-start md:justify-center overflow-y-auto md:overflow-visible w-full pb-8 md:pb-4">
              <PuzzleCenter />
              <div className="w-full max-w-2xl mt-4 shrink-0">
                <AnswerInput />
              </div>

              {/* ROUND RESULT OVERLAY */}
              <RoundResultOverlay
                gameState={gameState}
                roundResults={roundResults}
                currentRound={currentRound}
                t={t}
                getPlayerName={getPlayerName}
              />
            </div>
          ) : (
            <div className="flex-1" />
          )
        }
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
                    {t.rooms?.game?.crackIt?.title || "Crack It"}
                  </h1>
                  {countdown !== null ? (
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
                      {t.rooms?.game?.crackIt?.waitingStart || "Đang chuẩn bị ván đấu..."}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* GAME OVER STATE */}
            <GameOverScreen
              gameState={gameState}
              finalResults={finalResults}
              t={t}
              getPlayerName={getPlayerName}
              exitGame={exitGame}
            />
          </>
        }
      />
    </AnimatePresence>
  )
}

export default CrackItOverlay
