import React, { useState, useEffect } from "react"
import { useGame } from "@/features/games/context/GameContext"
import { useLanguage } from "@/shared/context/LanguageContext"
import { Gamepad2, Trophy } from "lucide-react"
import { playGlobalSound } from "@/features/video-call/hooks/useParticipantAudioEffect"

const TopBar = ({ onOpenMobileLeaderboard }) => {
  const { currentRound, timer: initialTimer, gameState, gameType, pictureIt } = useGame()
  const { t } = useLanguage()
  const [timeLeft, setTimeLeft] = useState(0)

  useEffect(() => {
    setTimeLeft(initialTimer)
  }, [initialTimer, currentRound])

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
        startedAt = Math.min(Date.now(), actualStartedAt)
        sessionStorage.setItem(storageKey, startedAt.toString())
      }

      interval = setInterval(() => {
        const elapsed = Math.floor((Date.now() - startedAt) / 1000)
        const remaining = Math.max(0, initialTimer - elapsed)

        setTimeLeft((prev) => {
          if (remaining === 10 && prev > 10) {
            playGlobalSound("ticking")
          }
          if (remaining <= 0) {
            clearInterval(interval)
          }
          return remaining
        })
      }, 200)
    } else if (gameState !== "playing" && gameType === "crack_it") {
      setTimeLeft(prev => (prev > 0 && prev <= 2) ? 0 : prev)
    }
    return () => clearInterval(interval)
  }, [gameState, currentRound?.started_at, initialTimer, gameType])

  const isPictureIt = gameType === "picture_it" || gameType === "picture-it"
  const gameName = isPictureIt ? "Picture IT" : (t.rooms?.game?.crackIt?.title || "Crack It")

  const topBar = isPictureIt ? (t.rooms?.game?.pictureIt?.topBar || {}) : {}

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
    <div className="flex items-center justify-between gap-2 px-3 py-2 md:px-4 md:py-2.5 bg-white border-b border-slate-100 shrink-0">
      <div className="flex items-center gap-2 md:gap-3 flex-1 min-w-0">
        <Gamepad2 className="text-cath-red-700 w-5 h-5 md:w-6 md:h-6 shrink-0" />
        <h2 className="text-cath-red-700 font-bold text-sm md:text-base whitespace-nowrap uppercase tracking-tight truncate">
          {gameName}
        </h2>

        {currentRound && (
          <div className="flex items-center gap-1 font-bold border border-cath-red-700/70 px-2.5 py-0.5 rounded-full text-xs md:text-sm whitespace-nowrap shrink-0">
            <span className="text-slate-500 font-medium">{isPictureIt ? (topBar.round || 'Round') : (t.rooms?.game?.crackIt?.round || "Ván")}: </span>
            <span className="font-semibold text-cath-red-700">{currentRound.round}/{currentRound.total}</span>
          </div>
        )}
      </div>

      <div className="flex items-center gap-1 shrink-0">
        {currentRound && (
          <div className={`text-lg md:text-2xl font-black tabular-nums ${isLowTime ? "text-cath-red-600" : "text-slate-800"}`}>
            00:{timeLeft.toString().padStart(2, "0")}
          </div>
        )}

        {/* Nút mở BXH — chỉ hiện khi parent truyền callback (mobile trong embedded) */}
        {onOpenMobileLeaderboard && (
          <button
            onClick={onOpenMobileLeaderboard}
            className="sm:hidden ml-1 p-1.5 rounded-lg bg-white text-cath-red-700 transition-colors border border-cath-red-200"
            title="Bảng xếp hạng"
            aria-label="Mở bảng xếp hạng"
          >
            <Trophy size={16} />
          </button>
        )}
      </div>
    </div>
  )
}
export default TopBar
