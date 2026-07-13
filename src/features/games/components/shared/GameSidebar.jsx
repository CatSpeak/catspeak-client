import React from "react"
import { useGame } from "@/features/games/context/GameContext"
import { useLanguage } from "@/shared/context/LanguageContext"
import { useAuth } from "@/features/auth"
import { Check, TrendingUp, Star } from "lucide-react"
import { useParticipants } from "@livekit/components-react"
import { motion, animate, AnimatePresence } from "framer-motion"

const AnimatedScore = ({ value, suffix }) => {
  const [displayValue, setDisplayValue] = React.useState(value)
  const prevValueRef = React.useRef(value)

  React.useEffect(() => {
    const controls = animate(prevValueRef.current, value, {
      duration: 1.5,
      ease: "easeOut",
      onUpdate(v) {
        setDisplayValue(Math.round(v))
        prevValueRef.current = v
      }
    })
    return () => controls.stop()
  }, [value])

  return (
    <span>{displayValue} {suffix}</span>
  )
}

const GameSidebar = () => {
  const { scores, correctPlayers, gameState, currentUserId, playerNames, leftPlayers, gameType, pictureIt, gamePlayers, spectatorIds } = useGame()
  const { t } = useLanguage()
  const { user } = useAuth()
  const participants = useParticipants()

  const isPictureIt = gameType === "picture_it" || gameType === "picture-it"

  const allPlayerIds = new Set()

  if (gameState !== "idle" && gamePlayers && gamePlayers.size > 0) {
    // Game active: only original players in leaderboard
    gamePlayers.forEach(id => allPlayerIds.add(id.toString()))
  } else {
    // Game idle: everyone is in the list
    if (currentUserId) allPlayerIds.add(currentUserId.toString())
    participants.forEach(p => {
      if (p.identity) allPlayerIds.add(p.identity)
    })
    Object.keys(scores).forEach(id => {
      allPlayerIds.add(id.toString())
    })
  }

  // Create an array of players
  const players = Array.from(allPlayerIds).map(idStr => {
    let name
    let score = 0
    const isYou = idStr === currentUserId?.toString()

    if (isPictureIt && pictureIt?.leaderboard) {
      const pData = pictureIt.leaderboard.find(p => p.id.toString() === idStr)
      score = pData ? pData.totalScore : 0
      
      if (pData && pData.name) {
        name = pData.name
      } else {
        const p = participants.find(p => p.identity === idStr)
        name = p?.name || `Người chơi ${idStr}`
      }
    } else {
      score = scores[idStr] || 0
      
      if (playerNames[idStr]) {
        name = playerNames[idStr]
      } else {
        const p = participants.find(p => p.identity === idStr)
        name = p?.name || (t.rooms?.game?.crackIt?.playerX ? t.rooms.game.crackIt.playerX.replace('{0}', idStr) : `Người chơi ${idStr}`)
      }
    }

    return {
      id: idStr,
      name,
      isYou,
      score,
      isCorrect: isPictureIt ? false : correctPlayers.has(idStr),
      hasLeft: leftPlayers?.has(idStr) || false,
    }
  }).sort((a, b) => b.score - a.score)

  const spectators = Array.from(spectatorIds).map(idStr => {
    const safeIdStr = String(idStr);
    const safeCurrentId = String(currentUserId || "");
    const isYou = safeIdStr === safeCurrentId;
    let name = playerNames[safeIdStr];
    if (!name) {
      const p = participants.find(p => String(p.identity) === safeIdStr);
      name = p?.name || `Người xem ${safeIdStr}`;
    }
    return {
      id: safeIdStr,
      name,
      isYou
    }
  });

  const title = isPictureIt ? (t.rooms?.game?.pictureIt?.leaderboard?.title || "Leaderboard") : (t.rooms?.game?.crackIt?.leaderboard || "Bảng xếp hạng")

  return (
    <div className="h-full w-full flex flex-col gap-4">
      {/* LEADERBOARD CARD */}
      <div className="flex-1 bg-white rounded-2xl md:rounded-3xl overflow-hidden shadow-sm border border-gray-100 p-4 md:p-6 flex flex-col min-h-0">
        <h3 className="text-lg font-black text-cath-red-700 mb-6 uppercase tracking-[0.2em] border-b border-gray-200 pb-4 shrink-0">
          {title}
        </h3>

        <div className="flex flex-col gap-4 overflow-y-auto pr-2 flex-1 min-h-0 relative">
          <AnimatePresence mode="popLayout">
            {players.map((player, index) => (
              <motion.div 
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.5, type: "spring", bounce: 0.3 }}
                key={player.id} 
                className="flex items-center gap-3 py-3 border-b border-gray-100 last:border-0 relative group bg-white z-10 rounded-xl px-2 -mx-2"
              >

                {/* Rank badge */}
              <div className="w-6 flex items-center justify-center shrink-0">
                {player.score === 0 ? (
                  <div className="w-5 h-5 rounded-full border border-dashed border-slate-300 flex items-center justify-center text-slate-400 font-bold text-[10px]">
                    ?
                  </div>
                ) : (
                  <div className="font-semibold text-sm text-slate-400 text-center">
                    {index + 1}
                  </div>
                )}
              </div>

              {/* Avatar placeholder */}
              <div className="w-9 h-9 rounded-full bg-red-100 flex items-center justify-center text-red-700 font-bold shrink-0">
                {(player.name || "?").charAt(0).toUpperCase()}
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
                <div className="text-slate-500 font-medium text-xs mt-0.5 flex items-center gap-1">
                  <AnimatedScore value={player.score} suffix={isPictureIt ? "" : "pts"} />
                  {isPictureIt && <Star size={12} className="text-yellow-400 fill-yellow-400 -mt-0.5" />}
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
                    <div className="text-green-500 flex items-center justify-center" title="+ Điểm">
                      <TrendingUp size={20} strokeWidth={2.5} />
                    </div>
                  )}
                </div>
              )}

            </motion.div>
          ))}
          </AnimatePresence>

          {players.length === 0 && (
            <div className="flex-1 flex items-center justify-center text-gray-500 font-medium text-sm text-center px-4">
              {t.rooms?.game?.crackIt?.waitingPlayers || "Đang đợi người chơi..."}
            </div>
          )}
        </div>
      </div>

      {/* SPECTATORS CARD */}
      {spectators.length > 0 && (
        <div className="shrink-0 max-h-[35%] bg-white rounded-2xl md:rounded-3xl overflow-hidden shadow-sm border border-gray-100 p-4 md:p-6 flex flex-col">
          <h4 className="text-xs font-black text-gray-400 mb-3 uppercase tracking-wider pl-2 shrink-0">
            Người xem ({spectators.length})
          </h4>
          <div className="flex flex-col gap-2 overflow-y-auto pr-2 min-h-0">
            {spectators.map(spectator => (
              <div key={spectator.id} className="flex items-center gap-3 py-2 px-2 rounded-lg hover:bg-gray-50">
                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 font-bold shrink-0 text-sm">
                  {(spectator.name || "?").charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-gray-600 truncate text-sm flex items-center gap-1">
                    <span className="truncate">{spectator.name}</span>
                    {spectator.isYou && (
                      <span className="font-normal text-gray-400 text-xs shrink-0">
                        ({t.rooms?.game?.crackIt?.you || "Bạn"})
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default GameSidebar
