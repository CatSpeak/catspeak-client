import React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Trophy } from "lucide-react"
import FluentCard from "@/shared/components/ui/FluentCard"
import LeaderboardRow from "./LeaderboardRow"
import { fluentEaseOut } from "@/shared/utils/animations"
import { useLanguage } from "@/shared/context/LanguageContext"

/**
 * LeaderboardCard
 *
 * Right column — live leaderboard after the round.
 *
 * @param {Array}  leaderboard     - Array of LeaderboardPlayer objects
 */
const LeaderboardCard = ({ leaderboard = [] }) => {
  const { t } = useLanguage();
  const lb = t.rooms?.game?.pictureIt?.leaderboard || {};

  const sorted = [...leaderboard].sort((a, b) => b.totalScore - a.totalScore).slice(0, 8)

  return (
    <motion.div
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, ease: fluentEaseOut, delay: 0.2 }}
      className="h-full"
    >
      <FluentCard className="h-full gap-3 py-4">
        {/* Header */}
        <div className="flex items-center gap-2 px-3 pb-2 border-b border-[#E5E5E5]">
          <div className="flex items-center justify-center w-7 h-7 rounded-lg shrink-0 bg-cath-red-700/10">
            <Trophy size={14} className="text-cath-red-700" />
          </div>
          <p className="text-sm font-semibold text-headingColor">{lb.title || 'Leaderboard'}</p>
          <span className="ml-auto text-xs text-secondary tabular-nums">
            {(lb.playersCount || '{0} players').replace('{0}', leaderboard.length)}
          </span>
        </div>

        {/* Rows */}
        <div className="flex flex-col overflow-y-auto scrollbar-app-hover flex-1 pr-0.5">
          <AnimatePresence mode="popLayout">
            {sorted.map((player, index) => (
              <LeaderboardRow
                key={player.id}
                player={player}
                index={index}
              />
            ))}
          </AnimatePresence>
        </div>
      </FluentCard>
    </motion.div>
  )
}

export default LeaderboardCard
