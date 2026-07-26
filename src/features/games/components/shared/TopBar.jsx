import React, { useState, useEffect } from "react"
import { useGame } from "@/features/games/context/GameContext"
import { useLanguage } from "@/shared/context/LanguageContext"
import { Gamepad2, Menu } from "lucide-react"
import { playGlobalSound } from "@/features/video-call/hooks/useParticipantAudioEffect"
import { useParticipants } from "@livekit/components-react"
import { motion } from "framer-motion"

const TopBar = ({ onOpenMobileLeaderboard }) => {
  const { currentRound, timer: initialTimer, gameState, gameType, pictureIt, currentUserId } = useGame()
  const { t } = useLanguage()
  const [timeLeft, setTimeLeft] = useState(0)
  const participants = useParticipants()

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

  // Timer cho Picture IT (Describe 30s countdown & Rating countdown)
  const describeStartTimeMs = pictureIt?.describeStartTime
    ? new Date(pictureIt.describeStartTime).getTime()
    : null

  useEffect(() => {
    let interval
    if (isPictureIt && gameState === "playing") {
      if (pictureIt?.ratingOpen) {
        setTimeLeft(pictureIt?.ratingCountdownSec || 0)
      } else if (describeStartTimeMs) {
        const updateTimer = () => {
          const elapsed = Math.floor((Date.now() - describeStartTimeMs) / 1000)
          const remaining = Math.max(0, 30 - elapsed)
          setTimeLeft(remaining)
        }
        updateTimer()
        interval = setInterval(updateTimer, 300)
      }
    }
    return () => clearInterval(interval)
  }, [isPictureIt, gameState, pictureIt?.ratingOpen, pictureIt?.ratingCountdownSec, describeStartTimeMs])

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
          <div className="flex gap-1 md:gap-2 font-bold border border-cath-red-700 w-fit px-2 py-1 md:px-4 md:py-1.5 rounded-3xl text-xs md:text-sm whitespace-nowrap truncate max-w-[280px] md:max-w-fit">
            <span className="hidden sm:inline">{topBar.describer || 'Describer'}: </span>
            <span className="font-semibold text-cath-red-700 truncate">{describerName}</span>
          </div>
        )}

        <div className="flex-1 flex justify-center items-center">
          {currentRound && (
            <div className="flex items-center gap-1.5 md:gap-2">
              <motion.div
                transition={isLowTime ? { repeat: Infinity, duration: 1 } : {}}
                className={`text-2xl md:text-3xl font-black tabular-nums ${isLowTime ? "text-cath-red-600 drop-shadow-sm" : "text-slate-800"}`}
              >
                00:{timeLeft.toString().padStart(2, "0")}
              </motion.div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
export default TopBar