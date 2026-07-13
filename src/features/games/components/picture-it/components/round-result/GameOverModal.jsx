import React from "react"
import { useLanguage } from "@/shared/context/LanguageContext"
import GameOverScreen from "@/features/games/components/shared/GameOverScreen"
import { useGame } from "@/features/games/context/GameContext"

const GameOverModal = ({ open, onClose, result }) => {
  const { t } = useLanguage();
  const { currentUserId } = useGame();
  const go = t.rooms?.game?.pictureIt?.gameOver || {};

  if (!result) return null

  // Convert picture-it leaderboard to crack-it finalResults format
  const final_scores = {};
  result.leaderboard?.forEach(player => {
    final_scores[player.id] = player.totalScore || 0;
  });

  const getPlayerName = (id) => {
    const player = result.leaderboard?.find(p => p.id.toString() === id.toString());
    return {
      name: player?.name || `Người chơi ${id}`,
      isYou: id.toString() === currentUserId?.toString()
    };
  };

  return (
    <GameOverScreen
      gameState={open ? "game_over" : "idle"}
      exitGame={onClose}
      title={go.title || "Game Finished"}
      finalResults={{ final_scores }}
      getPlayerName={getPlayerName}
      scoreUnit="sao"
    />
  )
}

export default GameOverModal
