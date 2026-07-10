import React, { useEffect, useRef, useState } from "react"
import { createPortal } from "react-dom"
import { AnimatePresence, motion } from "framer-motion"
import { Star, Trophy, Crown, Swords, Globe2, BarChart2, Award, Zap } from "lucide-react"
import Avatar from "@/shared/components/ui/Avatar"
import { PillButton } from "@/shared/components/ui/buttons"
import useScrollLock from "@/shared/hooks/useScrollLock"
import ConfettiCanvas from "./ConfettiCanvas"
import { fluentEaseOut } from "@/shared/utils/animations"
import { LeaderboardRow } from "."

// ─── Constants ────────────────────────────────────────────────────────────────
const COUNTDOWN_SEC = 3

// Colors and styles to match the screenshot chips exactly
const BADGE_STYLES = {
  "Master Describer": "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
  "Great Speaker": "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
  "Best Rating Accuracy": "bg-rose-500/20 text-rose-300 border-rose-500/30",
  "Most Fluent": "bg-blue-500/20 text-blue-300 border-blue-500/30",
  "Team Player": "bg-amber-500/20 text-amber-300 border-amber-500/30",
  "Keep Practicing": "bg-slate-500/20 text-slate-300 border-slate-500/30",
}

const BADGE_ICONS = {
  "Master Describer": "🏆",
  "Great Speaker": "⭐",
  "Best Rating Accuracy": "🎯",
  "Most Fluent": "💬",
  "Team Player": "👏",
  "Keep Practicing": "💪",
}

const backdropVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.35, ease: fluentEaseOut } },
  exit: { opacity: 0, transition: { duration: 0.3, ease: fluentEaseOut } },
}

const panelVariants = {
  hidden: { opacity: 0, scale: 0.94, y: 20 },
  visible: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.45, ease: fluentEaseOut } },
  exit: { opacity: 0, scale: 0.96, y: 12, transition: { duration: 0.3, ease: fluentEaseOut } },
}

const WinnerCard = ({ player }) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, ease: fluentEaseOut, delay: 0.25 }}
    className="flex items-center justify-between gap-4 p-4 rounded-2xl border-2 relative overflow-hidden"
    style={{
      borderColor: "rgba(240,141,29,0.75)",
      background: "rgba(240,141,29,0.06)",
      boxShadow: "0 0 20px rgba(240,141,29,0.22), inset 0 0 12px rgba(240,141,29,0.05)",
    }}
  >
    {/* Gold glow pulse */}
    <div
      className="absolute inset-0 rounded-2xl pointer-events-none animate-pulse"
      style={{ boxShadow: "0 0 30px rgba(240,141,29,0.08)" }}
    />

    {/* Left: Avatar & Crown */}
    <div className="flex items-center gap-4 z-10">
      <div className="relative">
        <Avatar
          src={player.avatar}
          alt={player.name}
          size="lg"
          className="ring-2 ring-[#f08d1d] ring-offset-2 ring-offset-[#131926]"
        />
      </div>

      {/* Name and Badge */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-1.5">
          <Star size={24} className="text-yellow-500 fill-yellow-500" />
          <p className="text-lg font-bold text-white tracking-tight">{player.name}</p>
        </div>
        <div className="flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 w-fit">
          <span></span>
          <span>Champion</span>
        </div>
      </div>
    </div>

    {/* Right: Large final score */}
    <div className="flex items-baseline gap-1 z-10 pr-2">
      <span className="text-3xl font-extrabold tabular-nums text-black">
        {player.totalScore}
      </span>
      <span className="text-xs font-semibold text-slate-300"><Star /></span>
    </div>
  </motion.div>
)

const RANK_MEDAL = {
  1: "🥇",
  2: "🥈",
  3: "🥉",
}

// ─── FinalLeaderboardRow ──────────────────────────────────────────────────────
const FinalLeaderboardRow = ({ player, rank, index, badge }) => {
  const isWinner = rank === 1
  const isTopThree = rank <= 3

  const badges = badge ? [badge] : ["Keep Practicing"]

  return (
    <motion.div
      initial={{ opacity: 0, x: 16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.35, ease: fluentEaseOut, delay: 0.3 + index * 0.06 }}
      className={`flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl border transition-all ${isWinner
        ? "border-yellow-500/40 bg-yellow-500/5 shadow-[0_0_12px_rgba(240,141,29,0.1)]"
        : "border-transparent hover:bg-white/5"
        }`}
    >
      {/* Rank, Avatar, Name */}
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-6 text-center shrink-0 flex items-center justify-center">
          {RANK_MEDAL[rank] ? (
            <span className="text-base">{RANK_MEDAL[rank]}</span>
          ) : (
            <span className="text-xs font-bold text-black">{rank}</span>
          )}
        </div>
        <Avatar src={player.avatar} alt={player.name} size="xs" />
        <p className="text-xs font-semibold text-black truncate max-w-[100px]">
          {player.name}
        </p>
      </div>

      {/* Score and Badges */}
      <div className="flex items-center gap-3 shrink-0">
        {/* Score */}
        <div className="flex items-center gap-0.5 text-xs font-bold text-black tabular-nums">
          <span>{player.totalScore}</span>
          <span className="text-[10px] text-black font-normal ml-0.5"><Star size={12} className="text-cath-orange-400" fill="#f08d1d" /></span>
        </div>

        {/* Badges list */}
        <div className="flex items-center gap-1.5">
          {badges.map((badge) => {
            const style = BADGE_STYLES[badge] ?? "bg-slate-500/20 text-slate-300 border-slate-500/30"
            return (
              <span
                key={badge}
                className={`flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded-full border ${style}`}
              >
                <span>{BADGE_ICONS[badge]}</span>
                <span>{badge}</span>
              </span>
            )
          })}
        </div>
      </div>
    </motion.div>
  )
}

// ─── CountdownBar ─────────────────────────────────────────────────────────────
const CountdownBar = ({ seconds, total }) => {
  const pct = (seconds / total) * 100
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1 rounded-full bg-white/10 overflow-hidden">
        <motion.div
          className="h-full rounded-full bg-cath-red-700"
          initial={{ width: "100%" }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.9, ease: "linear" }}
        />
      </div>
      <span className="text-[11px] font-bold text-slate-300 tabular-nums w-8 text-right">
        {seconds}s
      </span>
    </div>
  )
}

// ─── GameOverModal ─────────────────────────────────────────────────────────────
const GameOverModal = ({ open, onClose, onPlayAgain, result, countdown = COUNTDOWN_SEC }) => {
  const [secondsLeft, setSecondsLeft] = useState(countdown)
  const intervalRef = useRef(null)

  useScrollLock(open)

  useEffect(() => {
    if (!open) return
    setSecondsLeft(countdown)

    intervalRef.current = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(intervalRef.current)
          onClose?.()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(intervalRef.current)
  }, [open, countdown, onClose])

  if (!result) return null

  // Ensure leaderboard has rank info, and sorted descending by score
  const sorted = [...(result.leaderboard ?? [])]
    .sort((a, b) => b.totalScore - a.totalScore)
    .map((player) => ({
      ...player
    }))


  const winner = sorted[0]

  const stats = [
    { label: "Rounds Played", value: result.totalRounds ?? "8", icon: <Swords size={13} className="text-slate-400" /> },
    { label: "Language", value: result.language ?? "English", icon: <Globe2 size={13} className="text-slate-400" /> },
    { label: "Difficulty", value: result.difficulty ?? "Medium", icon: <BarChart2 size={13} className="text-slate-400" /> },
    { label: "Winning Score", value: winner ? `${winner.totalScore}` : "48.6", icon: <Award size={13} className="text-slate-400" /> },
    { label: "Highest Round Score", value: "9.8", icon: <Zap size={13} className="text-slate-400" /> },
  ]

  return createPortal(
    <>
      {open && <ConfettiCanvas durationMs={8000} count={120} />}

      <AnimatePresence>
        {open && (
          <div className="fixed inset-0 z-[1400] flex items-center justify-center p-6">
            {/* Backdrop */}
            <motion.div
              variants={backdropVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="absolute inset-0 bg-black/50"
              style={{
                backdropFilter: "blur(10px)",
              }}
            />

            {/* Panel */}
            <motion.div
              variants={panelVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-[50vw] overflow-y-auto scrollbar-app-transparent rounded-3xl p-7 flex flex-col gap-6 bg-white"
            >
              {/* Confetti / Trophy header */}
              <div className="flex flex-col items-center gap-1.5 text-center mt-1">
                <motion.div
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.5, ease: [0.175, 0.885, 0.32, 1.275] }}
                  className="relative flex items-center justify-center"
                >
                  {/* Subtle pulsing shadow behind trophy */}
                  <div className="absolute w-12 h-12 bg-yellow-500/20 rounded-full blur-xl animate-pulse" />
                </motion.div>

                <motion.h2
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, ease: fluentEaseOut, delay: 0.1 }}
                  className="text-2xl font-bold  tracking-tight flex items-center gap-2"
                >
                  Game Finished
                </motion.h2>

                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.4, ease: fluentEaseOut, delay: 0.18 }}
                  className="text-xs font-medium"
                >
                  Thanks for playing <span className="font-semibold ">Picture IT</span>!
                </motion.p>
              </div>

              {/* Winner Card Highlight */}
              {winner && <WinnerCard player={winner} />}

              {/* Two Column details split */}

              {/* LEFT Column: Final Leaderboard list */}
              <div className="flex flex-col gap-2.5">
                <p className="text-[10px] font-bold text-black uppercase tracking-widest px-1">
                  Final Leaderboard
                </p>
                <div className="flex flex-col gap-1.5 overflow-y-auto scrollbar-app-hover max-h-[260px] pr-1">
                  {sorted.slice(0, 5).map((player, i) => (
                    <LeaderboardRow
                      key={player.id}
                      player={player}
                      rank={i + 1}
                      index={i}
                    />
                  ))}
                </div>
              </div>


              {/* Footer: timer & action buttons */}
              <div className="flex flex-col gap-4 pt-3 border-t border-white/5 mt-1">
                {/* Countdown bar */}
                {/* <CountdownBar seconds={secondsLeft} total={countdown} /> */}

                {/* Centered Actions */}
                {/* <div className="flex items-center justify-center gap-4">
                  <PillButton
                    onClick={() => {
                      clearInterval(intervalRef.current)
                      onPlayAgain?.()
                    }}
                    className="h-10 px-8 text-sm font-bold text-white bg-cath-red-700 hover:bg-cath-red-800 transition-colors shadow-lg shadow-cath-red-900/20"
                  >
                    Play Again
                  </PillButton>
                  <PillButton
                    variant="outline"
                    className="h-10 px-6 text-sm font-semibold text-slate-300 border-white/10 hover:bg-white/5 hover:text-white transition-colors"
                    onClick={() => {
                      clearInterval(intervalRef.current)
                      onClose?.()
                    }}
                  >
                    Back to Room
                  </PillButton>
                </div> */}
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>,
    document.body
  )
}

export default GameOverModal
