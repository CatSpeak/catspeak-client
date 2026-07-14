import React from "react"
import { useGame } from "@/features/games/context/GameContext"
import { useLanguage } from "@/shared/context/LanguageContext"
import { useAuth } from "@/features/auth"
import { Check, TrendingUp, Star, SlidersHorizontal } from "lucide-react"
import { useParticipants, useIsSpeaking } from "@livekit/components-react"
import { motion, animate, AnimatePresence } from "framer-motion"
import { ParticipantVolumePopover } from "@/features/video-call/components/ParticipantVolumePopover"

const AnimatedScore = ({ value, suffix }) => {
  const safeValue = typeof value === 'number' && !isNaN(value) ? value : 0;
  const [displayValue, setDisplayValue] = React.useState(safeValue)
  const prevValueRef = React.useRef(safeValue)

  React.useEffect(() => {
    const controls = animate(prevValueRef.current, safeValue, {
      duration: 1.5,
      ease: "easeOut",
      onUpdate(v) {
        setDisplayValue(Math.round(v))
        prevValueRef.current = v
      }
    })
    return () => controls.stop()
  }, [safeValue])

  return (
    <span>{displayValue} {suffix}</span>
  )
}

const SpeakingAvatar = ({ participant, name }) => {
  const isSpeaking = useIsSpeaking(participant)
  return (
    <div className={`w-9 h-9 rounded-full bg-red-100 flex items-center justify-center text-red-700 font-bold shrink-0 transition-all duration-200 ${isSpeaking ? "ring-2 ring-[#3D9E60] ring-offset-1 ring-offset-white" : "ring-0 ring-transparent"}`}>
      {(name || "?").charAt(0).toUpperCase()}
    </div>
  )
}

const PlayerItemContent = ({ player, index, gameState, t, isPictureIt, participant }) => {
  return (
    <>
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
      {participant ? (
        <SpeakingAvatar participant={participant} name={player.name} />
      ) : (
        <div className="w-9 h-9 rounded-full bg-red-100 flex items-center justify-center text-red-700 font-bold shrink-0 transition-all duration-200 ring-0 ring-transparent">
          {(player.name || "?").charAt(0).toUpperCase()}
        </div>
      )}

      {/* Info */}
      <div className={`flex-1 min-w-0 ${player.hasLeft ? 'opacity-40' : ''}`}>
        <div className="font-semibold text-slate-800 text-sm flex items-center gap-1 min-w-0">
          <span className="truncate min-w-0 max-w-full">{player.name}</span>
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
          <span className="text-[10px] uppercase font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded-md">
            {t.rooms?.game?.crackIt?.out || "Thoát"}
          </span>
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
    </>
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
      <div className="flex-1 bg-white rounded-2xl md:rounded-3xl overflow-hidden shadow-sm border border-gray-100 py-4 px-2 md:py-6 md:px-3 flex flex-col min-h-0">
        <div className="px-2 md:px-3 shrink-0">
          <h3 className="text-lg font-black text-cath-red-700 mb-6 uppercase tracking-[0.2em] border-b border-gray-200 pb-4">
            {title}
          </h3>
        </div>

        <div className="flex flex-col overflow-y-auto flex-1 min-h-0 relative">
          <AnimatePresence mode="popLayout">
            {players.map((player, index) => {
              const participant = player.hasLeft ? undefined : participants.find(p => String(p.identity) === player.id)

              const innerContent = (
                <PlayerItemContent
                  player={player}
                  index={index}
                  gameState={gameState}
                  t={t}
                  isPictureIt={isPictureIt}
                  participant={participant}
                />
              )

              return (
                <motion.div 
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.5, type: "spring", bounce: 0.3 }}
                  key={player.id} 
                  className="w-full"
                >
                  {participant && !player.isYou && !player.hasLeft ? (
                    <ParticipantVolumePopover participant={participant}>
                      <div className="group flex items-center gap-3 py-3 px-3 md:px-4 border-b border-transparent last:border-0 w-full h-full cursor-pointer transition-colors border-b-gray-100 hover:border-transparent relative rounded-xl">
                        {innerContent}
                        <div className="absolute right-3 md:right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity flex items-center pointer-events-none">
                          <div className="w-4 h-8 bg-gradient-to-r from-transparent to-[#F2F2F2]"></div>
                          <div className="bg-[#F2F2F2] h-8 flex items-center text-gray-500 pr-1">
                            <SlidersHorizontal size={18} />
                          </div>
                        </div>
                      </div>
                    </ParticipantVolumePopover>
                  ) : (
                    <div className="flex items-center gap-3 py-3 px-3 md:px-4 border-b border-gray-100 last:border-0 w-full h-full relative rounded-xl">
                      {innerContent}
                    </div>
                  )}
                </motion.div>
              )
            })}
          </AnimatePresence>

          {players.length === 0 && (
            <div className="flex-1 flex items-center justify-center text-gray-500 font-medium text-sm text-center px-2 md:px-3">
              {t.rooms?.game?.crackIt?.waitingPlayers || "Đang đợi người chơi..."}
            </div>
          )}
        </div>
      </div>

      {/* SPECTATORS CARD */}
      {spectators.length > 0 && (
        <div className="shrink-0 max-h-[35%] bg-white rounded-2xl md:rounded-3xl overflow-hidden shadow-sm border border-gray-100 p-4 md:p-6 flex flex-col">
          <h4 className="text-xs font-black text-gray-400 mb-3 uppercase tracking-wider pl-2 shrink-0">
            {t.rooms?.game?.crackIt?.spectators || "Người xem"} ({spectators.length})
          </h4>
          <div className="flex flex-col gap-2 overflow-y-auto pr-2 min-h-0">
            {spectators.map(spectator => {
              const participant = participants.find(p => String(p.identity) === spectator.id)

              const innerContent = (
                <>
                  {participant ? (
                    <SpeakingAvatar participant={participant} name={spectator.name} />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 font-bold shrink-0 text-sm">
                      {(spectator.name || "?").charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-gray-600 text-sm flex items-center gap-1 min-w-0">
                      <span className="truncate min-w-0 max-w-full">{spectator.name}</span>
                      {spectator.isYou && (
                        <span className="font-normal text-gray-400 text-xs shrink-0">
                          ({t.rooms?.game?.crackIt?.you || "Bạn"})
                        </span>
                      )}
                    </div>
                  </div>
                </>
              )

              return (
                <div key={spectator.id}>
                  {participant && !spectator.isYou ? (
                    <ParticipantVolumePopover participant={participant}>
                      <div className="group flex items-center gap-3 py-2 px-2 rounded-lg hover:bg-gray-50 cursor-pointer relative">
                        {innerContent}
                        <div className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity flex items-center pointer-events-none">
                          <div className="w-4 h-8 bg-gradient-to-r from-transparent to-[#F9FAFB]"></div>
                          <div className="bg-[#F9FAFB] h-8 flex items-center text-gray-400 pr-1">
                            <SlidersHorizontal size={14} />
                          </div>
                        </div>
                      </div>
                    </ParticipantVolumePopover>
                  ) : (
                    <div className="flex items-center gap-3 py-2 px-2 rounded-lg hover:bg-gray-50 relative">
                      {innerContent}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

export default GameSidebar
