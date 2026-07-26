import React from "react"
import { useGame } from "@/features/games/context/GameContext"
import PuzzleCenter from "./PuzzleCenter"
import AnswerInput from "./AnswerInput"
import { useLanguage } from "@/shared/context/LanguageContext"
import { useParticipants } from "@livekit/components-react"

import BaseGameOverlay from "../shared/BaseGameOverlay"
import RoundResultOverlay from "../shared/RoundResultOverlay"
import GameOverScreen from "../shared/GameOverScreen"

const CrackItOverlay = ({ mode = "fullscreen", isMain = true }) => {
  const { gameState, exitGame, roundResults, finalResults, currentUserId, playerNames, currentRound } = useGame();
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
      mode={mode}
      gameContent={
        (gameState === "playing" || gameState === "result") ? (
          <div className="flex-1 flex flex-col gap-2 md:gap-6 min-h-0 relative items-center justify-start md:justify-center overflow-hidden w-full pb-2 md:pb-4">
            <PuzzleCenter />
            <div className="w-full mt-2 md:mt-4 shrink-0">
              <AnswerInput isMain={isMain} />
            </div>
          </div>
        ) : (
          <div className="flex-1" />
        )
      }
      overlays={
        <>
          <RoundResultOverlay
            gameState={gameState}
            roundResults={roundResults}
            currentRound={currentRound}
            t={t}
            getPlayerName={getPlayerName}
          />
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
  )
}

export default CrackItOverlay
