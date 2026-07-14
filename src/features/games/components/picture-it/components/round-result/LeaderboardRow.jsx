import React from "react"
import { motion } from "framer-motion"
import Avatar from "@/shared/components/ui/Avatar"
import { fluentEaseOut } from "@/shared/utils/animations"
import { Star } from "lucide-react"

/**
 * LeaderboardRow
 *
 * @param {object}  player          - LeaderboardPlayer data
 */

const LeaderboardRow = ({ player, index }) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, ease: fluentEaseOut, delay: 0.2 }}
      className={"flex items-center gap-3 px-3 py-2 rounded-xl transition-colors "}
    >
      {/* Rank */}
      <div className="w-6 text-center shrink-0 text-sm font-bold">
        {index + 1}
      </div>

      {/* Avatar */}
      <Avatar
        size={32}
        src={player.avatar}
        name={player.name}
        alt={player.name}
      />

      {/* Player name */}
      <div className="flex-1 min-w-0 items-center text-sm font-nunito font-semibold">
        {player.name}
      </div>

      {/* Score */}
      <span className="text-xs font-semibold text-headingColor tabular-nums flex items-center gap-1">
        {player.totalScore}
        <Star
          size={16}
          className={"text-cath-orange-400"}
          fill="#f08d1d"
        />
      </span>
    </motion.div >
  )
}

export default LeaderboardRow
