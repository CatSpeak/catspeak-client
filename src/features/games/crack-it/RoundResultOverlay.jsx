import React from "react";
import { AnimatePresence, motion } from "framer-motion";

const RoundResultOverlay = ({ gameState, roundResults, currentRound, t, getPlayerName }) => {
  const isFinalRound = currentRound?.round === currentRound?.total;
  
  return (
    <AnimatePresence>
      {gameState === "result" && roundResults && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 z-40 bg-white/95 flex flex-col items-center justify-center text-slate-900 rounded-3xl backdrop-blur-sm border border-gray-100 shadow-2xl"
        >
          <h2 className="text-2xl font-black text-slate-800 uppercase tracking-wider mb-2 drop-shadow-sm text-center">
            {t.rooms?.game?.crackIt?.roundResult || "Đáp án chính xác là"}:
          </h2>
          <div className="text-4xl md:text-5xl lg:text-6xl font-black text-green-600 mb-6 md:mb-10 tracking-widest drop-shadow-md text-center px-4 break-words w-full">
            {roundResults.correct_answer}
          </div>

          {/* Bảng xếp hạng thu nhỏ của Round */}
          <div className="w-full max-w-lg bg-gray-50 rounded-3xl p-6 border border-gray-200 shadow-xl mb-8 flex flex-col min-h-0 max-h-[50vh]">
            <h3 className="text-xl font-bold mb-4 text-center text-slate-700 shrink-0">
              {t.rooms?.game?.crackIt?.roundLeaderboard || "Thành tích ván này"}
            </h3>
            <div className="flex flex-col gap-3 overflow-y-auto pr-2 min-h-0">
              {Object.keys(roundResults.cumulative_scores || {})
                .sort((a, b) => roundResults.cumulative_scores[b] - roundResults.cumulative_scores[a])
                .map((id, index) => {
                  const score = roundResults.cumulative_scores[id];
                  const delta = roundResults.scores_delta?.[id] || 0;
                  return (
                    <div key={id} className="flex items-center justify-between bg-white shadow-sm border border-gray-100 px-4 py-3 rounded-2xl">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center font-bold text-sm text-slate-500">
                          #{index + 1}
                        </div>
                        <div className="font-semibold text-lg text-slate-800 flex items-center gap-1">
                          <span className="truncate max-w-[150px] md:max-w-[200px]">{getPlayerName(id).name}</span>
                          {getPlayerName(id).isYou && (
                            <span className="font-normal text-slate-500 text-sm shrink-0">
                              ({t.rooms?.game?.crackIt?.you || "Bạn"})
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        {delta > 0 && (
                          <div className="text-green-600 font-bold text-lg">
                            +{delta}
                          </div>
                        )}
                        <div className="text-cath-red-600 font-bold text-2xl w-16 text-right">
                          {score}
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>

          <p className="text-slate-500 font-medium animate-pulse mt-4">
            {isFinalRound 
              ? (t.rooms?.game?.crackIt?.tallyingFinalResults || "Đang tổng hợp kết quả chung cuộc...")
              : (t.rooms?.game?.crackIt?.nextRoundIn || "Ván tiếp theo sẽ bắt đầu sau ít giây...")}
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default RoundResultOverlay;
