import React from "react";
import { useGame } from "../../../context/GameContext";
import { useLanguage } from "@/shared/context/LanguageContext";
import { useAuth } from "@/features/auth";
import { Check, X } from "lucide-react";
import { useParticipants } from "@livekit/components-react";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";

const GameSidebar = () => {
  const { scores, correctPlayers, gameState, currentUserId, playerNames, leftPlayers } = useGame();
  const { t } = useLanguage();
  const { user } = useAuth();
  const participants = useParticipants();
  
  // Create an array of players from the scores object
  const players = Object.keys(scores).map(id => {
    const idStr = id.toString();
    let name;
    const isYou = idStr === currentUserId?.toString();
    
    if (playerNames[idStr]) {
      name = playerNames[idStr];
    } else {
      const p = participants.find(p => p.identity === idStr);
      name = p?.name || (t.rooms?.game?.crackIt?.playerX ? t.rooms.game.crackIt.playerX.replace('{0}', idStr) : `Người chơi ${idStr}`);
    }
    
    return {
      id: idStr,
      name,
      isYou,
      score: scores[id] || 0,
      isCorrect: correctPlayers.has(idStr),
      hasLeft: leftPlayers?.has(idStr) || false,
    };
  }).sort((a, b) => b.score - a.score);

  return (
    <div className="h-full bg-white rounded-l-3xl lg:rounded-3xl shadow-2xl lg:shadow-md border-y border-l lg:border border-gray-100 p-6 flex flex-col">
      <h3 className="text-lg font-black text-cath-red-700 mb-6 uppercase tracking-[0.2em] border-b border-gray-200 pb-4">
        {t.rooms?.game?.crackIt?.leaderboard || "Bảng xếp hạng"}
      </h3>

      <div className="flex flex-col gap-4 overflow-y-auto pr-2">
        {players.map((player, index) => (
          <div key={player.id} className="flex items-center gap-3 py-3 border-b border-gray-100 last:border-0 relative transition-all group">
            
            {/* Rank badge */}
            <div className="w-6 font-semibold text-sm text-slate-400 shrink-0 text-center">
              {index + 1}
            </div>

            {/* Avatar placeholder */}
            <div className="w-9 h-9 rounded-full bg-red-100 flex items-center justify-center text-red-700 font-bold shrink-0">
              {player.name.charAt(0).toUpperCase()}
            </div>

            {/* Info */}
            <div className={`flex-1 min-w-0 ${player.hasLeft ? 'opacity-40' : ''}`}>
              <div className="font-semibold text-slate-800 truncate text-sm flex items-center gap-1">
                <span className="truncate">{player.name}</span>
                {player.isYou && (
                  <span className="font-normal text-slate-500 text-xs shrink-0">
                    ({t.rooms?.game?.crackIt?.you || "Bạn"})
                  </span>
                )}
              </div>
              <div className="text-slate-500 font-medium text-xs mt-0.5">
                {player.score} pts
              </div>
            </div>

            {/* Status Icon */}
            {gameState === "playing" && !player.hasLeft && (
              <div className="shrink-0 ml-2">
                {player.isCorrect && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="text-green-500"
                  >
                    <Check size={18} strokeWidth={3} />
                  </motion.div>
                )}
              </div>
            )}
            
            {player.hasLeft && (
              <div className="shrink-0 ml-2">
                <div className="px-2 py-0.5 bg-gray-100 text-gray-500 rounded text-[10px] font-bold uppercase tracking-wider">
                  Thoát
                </div>
              </div>
            )}
            
            {/* Round result marks */}
            {gameState === "result" && (
               <div className="shrink-0 ml-2">
               {player.isCorrect && (
                 <div className="text-green-500 font-bold text-sm">+ Điểm</div>
               )}
             </div>
            )}

          </div>
        ))}

        {players.length === 0 && (
          <div className="flex-1 flex items-center justify-center text-gray-500 font-medium text-sm text-center px-4">
            {t.rooms?.game?.crackIt?.waitingPlayers || "Đang đợi người chơi..."}
          </div>
        )}
      </div>
    </div>
  );
};

export default GameSidebar;
