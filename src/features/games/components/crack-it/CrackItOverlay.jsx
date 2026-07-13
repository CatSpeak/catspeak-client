import React from "react"
import { useGame } from "@/features/games/context/GameContext"
import PuzzleCenter from "./PuzzleCenter"
import AnswerInput from "./AnswerInput"
import { useLanguage } from "@/shared/context/LanguageContext"
import { useParticipants } from "@livekit/components-react"

import BaseGameOverlay from "../shared/BaseGameOverlay"
import RoundResultOverlay from "../shared/RoundResultOverlay"
import GameOverScreen from "../shared/GameOverScreen"

const CrackItOverlay = () => {
  const { gameState, exitGame, roundResults, finalResults, currentUserId, playerNames, currentRound, isSpectator } = useGame();
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

  return (
    <BaseGameOverlay
      expectedGameType="crack_it"
      title={t.rooms?.game?.crackIt?.title || "Crack It"}
      waitingText={t.rooms?.game?.crackIt?.waitingStart || "Đang chuẩn bị ván đấu..."}
      gameContent={
        (gameState === "playing" || gameState === "result") ? (
          <div className="flex-1 flex flex-col gap-4 md:gap-6 min-h-0 relative items-center justify-start md:justify-center overflow-y-auto md:overflow-visible w-full pb-8 md:pb-4">
            <PuzzleCenter />
            {!isSpectator && (
              <div className="w-full mt-4 shrink-0">
                <AnswerInput />
              </div>
            )}
            
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
        <GameOverScreen
          gameState={gameState}
          finalResults={finalResults}
          t={t}
          getPlayerName={getPlayerName}
          exitGame={exitGame}
        />
      }
    />
  )
}

export default CrackItOverlay
