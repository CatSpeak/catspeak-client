import React from "react"
import { useNavigate } from "react-router-dom"
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion"
import Avatar from "@/shared/components/ui/Avatar"
import { fluentEaseOut } from "@/shared/utils/animations"
import { Star } from "lucide-react"

/**
 * LeaderboardRow
 *
 * @param {object}  player          - LeaderboardPlayer data
 */

import { getImageUrl } from "@/shared/utils/imageUtils"

const LeaderboardRow = ({ player, index }) => {
  const navigate = useNavigate()
  const playerAccountId = player.accountId || player.userId || player.id

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
        src={player.avatar ? getImageUrl(player.avatar) : null}
        name={player.name}
        alt={player.name}
        accountId={playerAccountId}
      />

      {/* Player name */}
      <div
        onClick={(e) => {
          if (playerAccountId) {
            e.stopPropagation()
            navigate(`/profile/${playerAccountId}`)
          }
        }}
        className={`flex-1 min-w-0 items-center text-sm font-semibold ${playerAccountId ? "cursor-pointer hover:underline hover:text-cath-red-700 transition-colors" : ""}`}
      >
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
