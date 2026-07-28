import React from "react"
import { X } from "lucide-react"
import { useGame } from "@/features/games/context/GameContext"
import { useLanguage } from "@/shared/context/LanguageContext"
import { Check, TrendingUp, Star, SlidersHorizontal } from "lucide-react"
import { useParticipants, useIsSpeaking } from "@livekit/components-react"
// eslint-disable-next-line no-unused-vars
import { motion, animate, AnimatePresence } from "framer-motion"
import { ParticipantVolumePopover } from "@/features/video-call/components/ParticipantVolumePopover"
import Avatar from "@/shared/components/ui/Avatar"
import { getImageUrl } from "@/shared/utils/imageUtils"

// Try to read meetingAvatarUrl / avatarUrl from participant metadata JSON.
const getParticipantAvatar = (participant) => {
  if (!participant?.metadata) return null
  try {
    const meta = JSON.parse(participant.metadata)
    return meta.meetingAvatarUrl || meta.avatarImageUrl || meta.avatarUrl || null
  } catch {
    return null
  }
}

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

const SpeakingAvatar = ({ participant, name, embedded = false }) => {
  const isSpeaking = useIsSpeaking(participant)
  const avatarUrl = getParticipantAvatar(participant)
  const size = embedded ? 40 : 36

  return (
    <Avatar
      size={size}
      src={avatarUrl ? getImageUrl(avatarUrl) : null}
      name={name}
      speaking={isSpeaking}
      className="shrink-0"
    />
  )
}

const PlayerItemContent = ({ player, index, gameState, t, isPictureIt, participant, fallbackAvatarUrl, embedded = false }) => {
  return (
    <>
      {/* Rank badge */}
      <div className={embedded ? "w-5 shrink-0" : "w-6 flex items-center justify-center shrink-0"}>
        {player.score === 0 ? (
          <div className={`rounded-full border border-dashed border-slate-300 flex items-center justify-center text-slate-400 font-bold ${
            embedded ? "w-4 h-4 text-[10px]" : "w-5 h-5 text-[10px]"
          }`}>
            ?
          </div>
        ) : (
          <div className={`font-semibold text-slate-400 text-center ${embedded ? "text-xs" : "text-sm"}`}>
            {index + 1}
          </div>
        )}
      </div>

      {/* Avatar */}
      {participant ? (
        <SpeakingAvatar participant={participant} name={player.name} embedded={embedded} />
      ) : (
        <Avatar
          size={embedded ? 40 : 36}
          src={fallbackAvatarUrl ? getImageUrl(fallbackAvatarUrl) : null}
          name={player.name}
          className="shrink-0"
        />
      )}

      {/* Info */}
      <div className={`flex-1 min-w-0 ${player.hasLeft ? 'opacity-40' : ''}`}>
        <div className={`font-semibold text-slate-800 flex items-center gap-1 min-w-0 ${embedded ? "text-sm" : "text-sm"}`}>
          <span className="truncate min-w-0 max-w-full" title={player.name}>{player.name}</span>
          {player.isYou && (
            <span className={`font-normal text-slate-500 shrink-0 ${embedded ? "text-[10px]" : "text-xs"}`}>
              ({t.rooms?.game?.crackIt?.you || "Bạn"})
            </span>
          )}
        </div>
        <div className={`text-slate-500 font-medium mt-0.5 flex items-center gap-1 ${embedded ? "text-xs" : "text-xs"}`}>
          <AnimatedScore value={player.score} suffix={isPictureIt ? "" : "pts"} />
          {isPictureIt && <Star size={embedded ? 11 : 12} className="text-yellow-400 fill-yellow-400 -mt-0.5" />}
        </div>
      </div>

      {/* Status Icon */}
      {gameState === "playing" && !player.hasLeft && (
        <div className="shrink-0 ml-1 md:ml-2">
          {player.isCorrect && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="text-green-500"
            >
              <Check size={embedded ? 16 : 18} strokeWidth={3} />
            </motion.div>
          )}
        </div>
      )}

      {player.hasLeft && (
        <div className="shrink-0 ml-1 md:ml-2">
          <span className={`uppercase font-bold text-slate-400 bg-slate-100 rounded-md ${
            embedded ? "text-[10px] px-1.5 py-0.5" : "text-[10px] px-2 py-1"
          }`}>
            {t.rooms?.game?.crackIt?.out || "Thoát"}
          </span>
        </div>
      )}

      {/* Round result marks */}
      {gameState === "result" && (
        <div className="shrink-0 ml-1 md:ml-2">
          {player.isCorrect && (
            <div className="text-green-500 flex items-center justify-center" title="+ Điểm">
              <TrendingUp size={embedded ? 16 : 20} strokeWidth={2.5} />
            </div>
          )}
        </div>
      )}
    </>
  )
}

const GameSidebar = ({ embedded = false, hideTitle = false, onClose = null }) => {
  const { scores, correctPlayers, gameState, currentUserId, playerNames, leftPlayers, gameType, pictureIt, gamePlayers } = useGame()
  const { t } = useLanguage()
  const participants = useParticipants()

  const isPictureIt = gameType === "picture_it" || gameType === "picture-it"

  // Khi embedded, chỉ hiển thị top 4 để tiết kiệm chiều cao
  const maxPlayers = embedded ? 4 : null

  const allPlayerIds = new Set()

  if (gameState !== "idle") {
    // Game đang chơi (setup/playing/result/game_over/force_stopped):
    // Gom union từ mọi nguồn để danh sách BXH không bao giờ rỗng khi game đang chạy:
    // 1. `gamePlayers` (original_players) — luôn có nếu BE sync đúng.
    // 2. `scores` — có khi có người ghi điểm (Picture IT: người đã rate; Crack IT: người đoán đúng).
    // 3. `pictureIt.leaderboard` — cho Picture IT, BE build sẵn theo score.
    // 4. `participants` (LiveKit room) — fallback cuối, đảm bảo luôn thấy ai đang trong phòng.
    // 5. Loại bỏ `leftPlayers` (người đã thoát).
    const addIfNotLeft = (id) => {
      if (id == null) return
      const idStr = id.toString()
      if (leftPlayers && leftPlayers.has(idStr)) return
      allPlayerIds.add(idStr)
    }

    if (gamePlayers && gamePlayers.size > 0) {
      gamePlayers.forEach(addIfNotLeft)
    }
    Object.keys(scores || {}).forEach(addIfNotLeft)
    if (isPictureIt && pictureIt?.leaderboard) {
      pictureIt.leaderboard.forEach((p) => addIfNotLeft(p?.id))
    }
    // Fallback cuối cùng: LiveKit participants trong phòng.
    participants.forEach((p) => {
      if (p.identity) addIfNotLeft(p.identity)
    })
  } else {
    // Game idle: mọi người trong phòng đều hiện
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

    score = scores[idStr] || 0

    if (isPictureIt && pictureIt?.leaderboard) {
      const pData = pictureIt.leaderboard.find(p => p.id.toString() === idStr)
      
      if (pData && pData.name) {
        name = pData.name
      } else {
        const p = participants.find(p => p.identity === idStr)
        name = p?.name || `Người chơi ${idStr}`
      }
    } else {
      
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

  const title = isPictureIt ? (t.rooms?.game?.pictureIt?.leaderboard?.title || "Leaderboard") : (t.rooms?.game?.crackIt?.leaderboard || "Bảng xếp hạng")

  // Embedded chỉ hiện top N; fullscreen hiện tất cả
  const visiblePlayers = maxPlayers ? players.slice(0, maxPlayers) : players

  return (
    <div className="h-full w-full flex flex-col gap-2 pt-2.5">
      {/* LEADERBOARD CARD */}
      <div className={`flex-1 bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 flex flex-col min-h-0 ${
        embedded ? "py-2 px-1.5" : "py-4 px-2 md:py-6 md:px-3"
      }`}>
        <div className={`shrink-0 ${embedded ? "px-1.5" : "px-2 md:px-3"}`}>
          {!hideTitle && (
            <div className={`flex items-center justify-between gap-2 border-b border-gray-200 ${
              embedded ? "mb-2.5 pb-2" : "mb-6 pb-4"
            }`}>
              <h3 className={`font-black text-cath-red-700 uppercase tracking-[0.2em] truncate ${
                embedded ? "text-xs tracking-[0.18em]" : "text-lg"
              }`}>
                {title}
              </h3>
              {onClose && (
                <button
                  onClick={onClose}
                  className="w-8 h-8 rounded-full bg-gray-100 hover:bg-red-50 text-slate-600 hover:text-cath-red-600 transition-colors flex items-center justify-center shrink-0"
                  aria-label="Đóng bảng xếp hạng"
                >
                  <X size={16} />
                </button>
              )}
            </div>
          )}
        </div>

        <div className="flex flex-col overflow-y-auto flex-1 min-h-0 relative">
          <AnimatePresence mode="popLayout">
            {visiblePlayers.map((player, index) => {
              const participant = player.hasLeft ? undefined : participants.find(p => String(p.identity) === player.id)

              const innerContent = (
                <PlayerItemContent
                  player={player}
                  index={index}
                  gameState={gameState}
                  t={t}
                  isPictureIt={isPictureIt}
                  participant={participant}
                  embedded={embedded}
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
                      <div className={`group flex items-center gap-2 md:gap-3 border-b border-transparent last:border-0 w-full h-full cursor-pointer transition-colors border-b-gray-100 hover:border-transparent relative rounded-xl ${
                        embedded ? "py-2.5 px-2" : "py-3 px-3 md:px-4"
                      }`}>
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
                    <div className={`flex items-center gap-2 md:gap-3 border-b border-gray-100 last:border-0 w-full h-full relative rounded-xl ${
                      embedded ? "py-2.5 px-2" : "py-3 px-3 md:px-4"
                    }`}>
                      {innerContent}
                    </div>
                  )}
                </motion.div>
              )
            })}
          </AnimatePresence>

          {visiblePlayers.length === 0 && (
            <div className={`flex-1 flex items-center justify-center text-gray-500 font-medium text-center ${
              embedded ? "text-[10px] px-1.5" : "text-sm px-2 md:px-3"
            }`}>
              {t.rooms?.game?.crackIt?.waitingPlayers || "Đang đợi người chơi..."}
            </div>
          )}

          {/* Embedded: nếu còn người ngoài top N, hiển thị dấu +N để gợi ý */}
          {embedded && players.length > maxPlayers && (
            <div className="text-[10px] text-slate-400 text-center py-1 shrink-0">
              +{players.length - maxPlayers}
            </div>
          )}
        </div>
      </div>

    </div>
  )
}

export default GameSidebar
