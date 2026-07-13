import React from "react"
import { AnimatePresence, motion } from "framer-motion"
import Confetti from "react-confetti"
import { useLanguage } from "@/shared/context/LanguageContext"

const GameOverScreen = ({ gameState, finalResults, t: propT, getPlayerName, exitGame, children, title, scoreUnit }) => {
  const { t: contextT } = useLanguage()
  const t = propT || contextT
  return (
    <AnimatePresence>
      {gameState === "game_over" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 z-[1400] flex flex-col items-center justify-center bg-black/50 backdrop-blur-sm"
        >
          <Confetti width={window.innerWidth} height={window.innerHeight} />

          <motion.div 
            initial={{ opacity: 0, scale: 0.94, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            transition={{ duration: 0.4, ease: [0.175, 0.885, 0.32, 1.275] }}
            className="relative z-10 bg-white p-6 md:p-8 rounded-[2rem] shadow-2xl max-w-lg w-full text-center border border-gray-100 mx-4 flex flex-col max-h-[85vh]"
          >
            <div className="flex flex-col items-center gap-1 text-center mt-2 mb-6">
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5, ease: [0.175, 0.885, 0.32, 1.275] }}
                className="relative flex items-center justify-center"
              >
                <div className="absolute w-12 h-12 bg-yellow-500/20 rounded-full blur-xl animate-pulse" />
                <span className="text-3xl md:text-5xl">🏆</span>
              </motion.div>
              <h2 className="text-2xl md:text-4xl font-black text-cath-red-600 mt-2 uppercase tracking-widest drop-shadow-sm shrink-0">
                {title || t.rooms?.game?.crackIt?.gameOver || "KẾT THÚC!"}
              </h2>
            </div>

            {finalResults?.final_scores && (
              <>
                <h3 className="text-base md:text-xl font-bold text-slate-800 mb-4 flex items-center justify-center gap-2 shrink-0 border-b border-gray-100 pb-3">
                  {t.rooms?.game?.crackIt?.finalLeaderboard || "Bảng Xếp Hạng Chung Cuộc"}
                </h3>

                <div className="flex flex-col gap-3 mb-6 overflow-y-auto pr-2 min-h-0 scrollbar-app-hover">
                  {Object.entries(finalResults.final_scores)
                    .sort(([, a], [, b]) => b - a)
                    .map(([id, score], index) => {
                  const player = getPlayerName(id)
                  const isWinner = index === 0
                  
                  return (
                    <motion.div 
                      key={id} 
                      initial={{ opacity: 0, x: 16 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.35, delay: 0.2 + index * 0.05 }}
                      className={`flex items-center justify-between p-4 rounded-2xl border-2 transition-all ${
                        isWinner 
                          ? "bg-yellow-50 border-yellow-400 shadow-[0_0_15px_rgba(250,204,21,0.2)]" 
                          : "bg-gray-50 border-gray-100"
                      }`}
                    >
                      <div className="flex items-center gap-3 md:gap-4 flex-1 min-w-0">
                        <div className={`font-bold text-lg md:text-xl w-6 md:w-8 shrink-0 text-center ${isWinner ? 'text-yellow-600' : 'text-slate-400'}`}>
                          {index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : `#${index + 1}`}
                        </div>
                        <div className="font-semibold text-slate-800 text-base md:text-lg flex items-center flex-1 min-w-0 gap-2">
                          <span className="truncate min-w-0 max-w-full">{player.name}</span>
                          {player.isYou && (
                            <span className="font-normal text-slate-500 text-xs bg-slate-200/60 px-2 py-0.5 rounded-full shrink-0 ml-auto">
                              {t.rooms?.game?.crackIt?.you || "Bạn"}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className={`font-bold text-xl md:text-2xl shrink-0 ml-2 ${isWinner ? 'text-yellow-600' : 'text-cath-red-600'}`}>
                        {score} <span className="text-xs md:text-sm font-semibold opacity-70">{scoreUnit || "pts"}</span>
                      </div>
                    </motion.div>
                  )
                })}
            </div>
              </>
            )}

            {children}

            <button
              onClick={exitGame}
              className="mt-2 shrink-0 w-full bg-cath-red-700 hover:bg-cath-red-800 text-white font-bold h-14 rounded-full transition-all active:scale-95 shadow-lg shadow-cath-red-900/20 text-lg"
            >
              {t.rooms?.game?.crackIt?.closeGame || "Đóng Game"}
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default GameOverScreen
