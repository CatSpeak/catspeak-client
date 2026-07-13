import React, { useState, useEffect } from "react"
import { useGame } from "@/features/games/context/GameContext"
import { useLanguage } from "@/shared/context/LanguageContext"
import { motion } from "framer-motion"
import { Gamepad2, LogOut, Menu, MessageSquare, Mic, MicOff } from "lucide-react"
import { PillButton } from "@/shared/components/ui/buttons"
import { playGlobalSound } from "@/features/video-call/hooks/useParticipantAudioEffect"
import { useParticipants } from "@livekit/components-react"
import { useGlobalVideoCall } from "@/features/video-call/context/GlobalVideoCallProvider"

const TopBar = ({ onOpenMobileLeaderboard, onOpenMobileChat, onLeaveGame }) => {
  const { currentRound, timer: initialTimer, gameState, gameType, pictureIt, currentUserId } = useGame()
  const { t } = useLanguage()
  const [timeLeft, setTimeLeft] = useState(0)
  const participants = useParticipants()
  const { micOn, handleToggleMic } = useGlobalVideoCall()

  useEffect(() => {
    setTimeLeft(initialTimer)
  }, [initialTimer, currentRound]) // Reset when new round starts

  useEffect(() => {
    let interval
    if (gameState === "playing" && currentRound?.started_at && gameType === "crack_it") {
      const actualStartedAt = new Date(currentRound.started_at).getTime()
      const storageKey = `crackit_timer_${actualStartedAt}`

      let startedAt
      const storedStartedAt = sessionStorage.getItem(storageKey)

      if (storedStartedAt) {
        startedAt = parseInt(storedStartedAt, 10)
      } else {
        // Prevent startedAt from being in the future due to server-client clock drift
        startedAt = Math.min(Date.now(), actualStartedAt)
        sessionStorage.setItem(storageKey, startedAt.toString())
      }

      // Run every 200ms for smoother UI updates, though seconds only change once per sec
      interval = setInterval(() => {
        const elapsed = Math.floor((Date.now() - startedAt) / 1000)
        const remaining = Math.max(0, initialTimer - elapsed)

        setTimeLeft((prev) => {
          if (remaining === 10 && prev > 10) {
            // Play at 10 seconds remaining
            playGlobalSound("ticking")
          }
          if (remaining <= 0) {
            clearInterval(interval)
          }
          return remaining
        })
      }, 200)
    } else if (gameState !== "playing" && gameType === "crack_it") {
      // If the round ends and the timer is at 1 or 2 seconds, snap it to 0
      setTimeLeft(prev => (prev > 0 && prev <= 2) ? 0 : prev)
    }
    return () => clearInterval(interval)
  }, [gameState, currentRound?.started_at, initialTimer, gameType])

  const isPictureIt = gameType === "picture_it" || gameType === "picture-it"
  const gameName = isPictureIt ? "Picture IT" : (t.rooms?.game?.crackIt?.title || "Crack It")

  const isSpectator = pictureIt?.isSpectator
  const isDescriber = pictureIt?.describerId === currentUserId
  const topBar = isPictureIt ? (t.rooms?.game?.pictureIt?.topBar || {}) : {}

  // Describer User
  let describerName = null
  if (isPictureIt && (pictureIt?.roundDescriberId || pictureIt?.describerId)) {
    const descId = pictureIt?.roundDescriberId || pictureIt?.describerId
    const p = participants?.find(part => Number(part.identity) === descId)
    describerName = p?.name || p?.identity || `Player ${descId}`
    if (p?.metadata) {
      try {
        const meta = JSON.parse(p.metadata)
        if (meta.username) describerName = meta.username
      } catch (e) { }
    }
  }

  const isLowTime = timeLeft <= 10

  return (
    <div className="flex items-center justify-between border border-gray-200 rounded-2xl md:rounded-3xl px-3 py-2 md:px-4 md:py-3 bg-white shadow-sm gap-2 shrink-0">
      <div className="flex gap-2 md:gap-4 items-center flex-1 min-w-0">
        <div className="flex gap-2 md:gap-3 items-center shrink-0">
          <Gamepad2 className="text-cath-red-700 w-5 h-5 md:w-6 md:h-6 lg:block hidden" />
          {onOpenMobileLeaderboard && (
            <button
              className="lg:hidden text-slate-500 hover:text-cath-red-600 hover:bg-red-50 p-1.5 rounded-xl border border-gray-200 shadow-sm"
              onClick={onOpenMobileLeaderboard}
              title="Leaderboard"
            >
              <Menu size={20} />
            </button>
          )}
          <h2 className="text-cath-red-700 font-bold text-sm md:text-lg hidden sm:block whitespace-nowrap uppercase tracking-tight">
            {gameName}
          </h2>
        </div>

        <div className="h-4 md:h-6 w-px bg-gray-300 shrink-0 hidden sm:block"></div>

        {currentRound && (
          <div className="flex gap-1 md:gap-2 font-bold border border-cath-red-700 w-fit px-2 py-1 md:px-4 md:py-1.5 rounded-3xl text-xs md:text-sm whitespace-nowrap">
            <span className="hidden sm:inline">{isPictureIt ? (topBar.round || 'Round') : (t.rooms?.game?.crackIt?.round || "Ván")}: </span>
            <span className="font-semibold text-cath-red-700">{currentRound.round}/{currentRound.total}</span>
          </div>
        )}

        {describerName && (
          <div className="flex gap-1 md:gap-2 font-bold border border-cath-red-700 w-fit px-2 py-1 md:px-4 md:py-1.5 rounded-3xl text-xs md:text-sm whitespace-nowrap truncate max-w-[120px] md:max-w-fit">
            <span className="hidden sm:inline">{topBar.describer || 'Describer'}: </span>
            <span className="font-semibold text-cath-red-700 truncate">{describerName}</span>
          </div>
        )}

        <div className="flex-1 flex justify-center">
          {!isPictureIt && currentRound && (
            <motion.div
              transition={isLowTime ? { repeat: Infinity, duration: 1 } : {}}
              className={`text-2xl md:text-3xl font-black tabular-nums ${isLowTime ? "text-cath-red-600 drop-shadow-sm" : "text-slate-800"}`}
            >
              00:{timeLeft.toString().padStart(2, "0")}
            </motion.div>
          )}
        </div>
      </div>

      <div className="flex items-center justify-end gap-1.5 md:gap-4 shrink-0">
        {/* {isPictureIt && isSpectator !== undefined && (
          isSpectator ? (
            <span className="text-[10px] md:text-xs font-semibold px-2 md:px-2.5 py-1 rounded-full border border-gray-400 text-gray-500 bg-gray-50 hidden sm:inline-block">
              {topBar.spectator || 'Spectator'}
            </span>
          ) : (
            <span
              className={`text-[10px] md:text-xs font-semibold px-2 md:px-2.5 py-1 rounded-full border hidden sm:inline-block ${isDescriber
                ? 'border-cath-red-700 text-cath-red-700 bg-cath-red-700/5'
                : 'border-[#f08d1d] text-[#f08d1d] bg-orange-50'
                }`}
            >
              {isDescriber ? (topBar.roleDescriber || 'Describer') : (topBar.roleRater || 'Rater')}
            </span>
          )
        )} */}

        <button
          className={`p-1.5 rounded-xl border border-gray-200 shadow-sm transition-colors ${micOn ? 'text-cath-red-700 bg-red-50 hover:bg-red-100' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'}`}
          onClick={handleToggleMic}
          title={micOn ? "Tắt mic" : "Bật mic"}
        >
          {micOn ? <Mic size={20} /> : <MicOff size={20} />}
        </button>

        {onOpenMobileChat && (
          <button
            className="lg:hidden text-slate-500 hover:text-cath-red-600 hover:bg-red-50 p-1.5 rounded-xl border border-gray-200 shadow-sm"
            onClick={onOpenMobileChat}
            title="Chat"
          >
            <MessageSquare size={20} />
          </button>
        )}

        {onLeaveGame && (
          <PillButton
            variant="outline"
            className="h-7 px-2 md:h-8 md:px-3 border-red-500 text-red-500 hover:bg-red-50 flex items-center justify-center font-bold"
            onClick={onLeaveGame}
          >
            <LogOut size={16} />
          </PillButton>
        )}
      </div>
    </div>
  )
}
export default TopBar
