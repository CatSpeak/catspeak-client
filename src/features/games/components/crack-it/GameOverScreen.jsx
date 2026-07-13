import React from "react"
import { AnimatePresence, motion } from "framer-motion"
import Confetti from "react-confetti"

const GameOverScreen = ({ gameState, finalResults, t, getPlayerName, exitGame }) => {
  return (
    <AnimatePresence>
      {gameState === "game_over" && finalResults && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-[#F9FAFB]"
        >
          <Confetti width={window.innerWidth} height={window.innerHeight} />

          <div className="relative z-10 bg-white p-6 md:p-8 rounded-[2rem] shadow-2xl max-w-lg w-full text-center border-4 border-gray-100 mx-4 flex flex-col max-h-[80vh]">
            <h2 className="text-4xl md:text-5xl font-black text-cath-red-600 mb-6 uppercase tracking-widest drop-shadow-sm shrink-0">
              {t.rooms?.game?.crackIt?.gameOver || "KẾT THÚC!"}
            </h2>

            <h3 className="text-xl md:text-2xl font-bold text-slate-800 mb-4 flex items-center justify-center gap-3 shrink-0">
              {t.rooms?.game?.crackIt?.finalLeaderboard || "Bảng Xếp Hạng Chung Cuộc"}
              <span className="text-cath-red-500">🏆</span>
            </h3>

            <div className="flex flex-col gap-4 mb-6 overflow-y-auto pr-2 min-h-0">
              {Object.entries(finalResults.final_scores)
                .sort(([, a], [, b]) => b - a)
                .map(([id, score], index) => (
                  <div key={id} className={`flex items-center justify-between p-4 rounded-xl border ${index === 0 ? "bg-yellow-50 border-yellow-200" : "bg-gray-50 border-gray-100"}`}>
                    <div className="flex items-center gap-4">
                      <div className="font-bold text-xl text-slate-400 w-8">
                        #{index + 1}
                      </div>
                      <div className="font-semibold text-slate-800 text-lg flex items-center gap-1">
                        <span className="truncate max-w-[120px] md:max-w-[200px]">{getPlayerName(id).name}</span>
                        {getPlayerName(id).isYou && (
                          <span className="font-normal text-slate-500 text-sm shrink-0">
                            ({t.rooms?.game?.crackIt?.you || "Bạn"})
                          </span>
                        )}
                        {index === 0 && <span className="ml-1">👑</span>}
                      </div>
                    </div>
                    <div className="font-bold text-cath-red-600 text-xl">
                      {score} pts
                    </div>
                  </div>
                ))}
            </div>

            <button
              onClick={exitGame}
              className="mt-4 shrink-0 w-full bg-cath-red-700 hover:bg-cath-red-800 text-white font-semibold h-12 rounded-full transition-colors"
            >
              {t.rooms?.game?.crackIt?.closeGame || "Đóng Game"}
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default GameOverScreen
