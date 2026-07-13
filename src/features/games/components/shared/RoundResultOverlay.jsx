import React from "react"
import { AnimatePresence, motion } from "framer-motion"
import CountdownCircle from "./CountdownCircle"
import { useLanguage } from "@/shared/context/LanguageContext"

const RoundResultOverlay = ({ gameState, roundResults, currentRound, t: propT, getPlayerName, image, title, children, maxWidthClass = "max-w-2xl", countdownDuration = 5 }) => {
  const { t: contextT } = useLanguage()
  const t = propT || contextT

  const isFinalRound = currentRound?.round === currentRound?.total

  // Allow custom title or fallback to "Đáp án chính xác là"
  const displayTitle = title || t.rooms?.game?.crackIt?.roundResult || "Kết quả"

  return (
    <AnimatePresence>
      {gameState === "result" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-[1300] flex items-center justify-center p-4 bg-black/60"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -12 }}
            transition={{ duration: 0.4, ease: [0.175, 0.885, 0.32, 1.275] }}
            className={`relative w-full ${maxWidthClass} max-h-[90vh] overflow-y-auto scrollbar-app-transparent rounded-3xl p-6 md:p-8 flex flex-col gap-6`}
            style={{
              background: "rgba(255, 255, 255, 0.92)",
              backdropFilter: "blur(24px) saturate(180%)",
              WebkitBackdropFilter: "blur(24px) saturate(180%)",
              border: "1px solid rgba(255,255,255,0.6)",
              boxShadow: "0 24px 64px rgba(0,0,0,0.25), 0 0 0 1px rgba(255,255,255,0.1)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-center">
              <CountdownCircle
                duration={countdownDuration}
                label={isFinalRound
                  ? (t.rooms?.game?.crackIt?.tallyingFinalResults || "Đang tổng hợp kết quả chung cuộc...")
                  : (t.rooms?.game?.crackIt?.nextRoundIn || "Ván tiếp theo sẽ bắt đầu sau...")}
              />
            </div>

            {image && (
              <div className="flex justify-center">
                <img src={image} alt="Round Result" className="max-h-48 rounded-xl object-contain shadow-sm" />
              </div>
            )}

            {roundResults?.correct_answer && (
              <div className="flex flex-col items-center mb-2">
                <h2 className="text-xl font-black text-slate-800 uppercase tracking-wider mb-2 drop-shadow-sm text-center">
                  {displayTitle}:
                </h2>
                <div className="text-4xl md:text-5xl font-black text-green-600 mb-2 tracking-widest drop-shadow-md text-center px-4 break-words w-full">
                  {roundResults.correct_answer}
                </div>
              </div>
            )}

            {children}

            {/* Bảng xếp hạng thu nhỏ của Round */}
            {roundResults?.cumulative_scores && (
              <div className="w-full bg-gray-50/50 rounded-2xl p-4 md:p-6 border border-gray-200/60 shadow-inner flex flex-col min-h-0 max-h-[40vh]">
                <h3 className="text-lg font-bold mb-4 text-center text-slate-700 shrink-0">
                  {t.rooms?.game?.crackIt?.roundLeaderboard || "Thành tích ván này"}
                </h3>
                <div className="flex flex-col gap-2.5 overflow-y-auto pr-2 min-h-0 scrollbar-app-hover">
                  {Object.keys(roundResults.cumulative_scores)
                    .sort((a, b) => roundResults.cumulative_scores[b] - roundResults.cumulative_scores[a])
                    .map((id, index) => {
                      const score = roundResults.cumulative_scores[id]
                      const delta = roundResults.scores_delta?.[id] || 0
                      const player = getPlayerName(id)
                      return (
                        <div key={id} className="flex items-center gap-2 md:gap-4 bg-white shadow-sm border border-gray-100 px-3 md:px-4 py-3 rounded-xl min-w-0">
                          <div className="w-6 h-6 md:w-7 md:h-7 shrink-0 rounded-full bg-slate-100 flex items-center justify-center font-bold text-xs md:text-sm text-slate-500">
                            #{index + 1}
                          </div>

                          <div className="font-semibold text-sm md:text-base text-slate-800 flex items-center gap-1 flex-1 min-w-0">
                            <span className="truncate">{player.name}</span>
                            {player.isYou && (
                              <span className="font-normal text-slate-500 text-[10px] md:text-xs shrink-0 bg-slate-100 px-1.5 md:px-2 py-0.5 rounded-full ml-0.5">
                                {t.rooms?.game?.crackIt?.you || "Bạn"}
                              </span>
                            )}
                          </div>

                          <div className="flex items-center justify-end gap-1.5 md:gap-3 shrink-0 ml-1">
                            {delta > 0 && (
                              <div className="text-green-600 font-bold text-sm md:text-base bg-green-50 px-1.5 md:px-2 py-0.5 rounded-md">
                                +{delta}
                              </div>
                            )}
                            <div className="text-cath-red-600 font-bold text-lg md:text-xl w-9 md:w-14 text-right shrink-0">
                              {score}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                </div>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default RoundResultOverlay
