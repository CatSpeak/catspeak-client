import React from "react"
import { motion } from "framer-motion"
import { Star } from "lucide-react"
import Avatar from "@/shared/components/ui/Avatar"
import FluentCard from "@/shared/components/ui/FluentCard"
import RoleBadge from "./RoleBadge"
import useCountUp from "./useCountUp"
import { fluentEaseOut } from "@/shared/utils/animations"

/**
 * RoundScoreCard
 *
 * @param {object} describer     - { id, name, avatar }
 * @param {number} roundScore    - Score earned this round
 */
const RoundScoreCard = ({ describer, roundScore }) => {
  const animatedScore = useCountUp(roundScore)

  // Build 5 stars with partial fill support (rounded to 0.5)
  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => {
      const filled = i < Math.floor(rating)
      const half = !filled && i < rating
      return (
        <Star
          key={i}
          size={16}
          className={filled || half ? "text-cath-orange-400" : "text-[#E5E5E5]"}
          fill={filled ? "#f08d1d" : half ? "url(#half)" : "none"}
        />
      )
    })
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: fluentEaseOut, delay: 0.15 }}
    >
      <FluentCard variant="glass" className="gap-6 h-full min-w-[230px]">
        {/* Describer identity */}
        <div className="flex flex-col items-center gap-2 pb-3 border-b border-[#E5E5E5]">
          <Avatar
            size={56}
            src={describer?.avatar}
            name={describer?.name}
            alt={describer?.name}
          />
          <div className="text-center">
            <p className="text-sm font-semibold text-headingColor leading-tight">
              {describer?.name}
            </p>
            <div className="mt-1">
              <RoleBadge role="Describer" />
            </div>
          </div>
        </div>

        {/* Average rating */}
        <div className="flex flex-col items-center gap-1.5">
          <p className="text-base font-medium text-secondary uppercase tracking-widest">Average Rating</p>
          <div className="flex items-center gap-1">{renderStars(roundScore)}</div>
          <p className="text-2xl font-semibold text-headingColor">
            {animatedScore?.toFixed(1)}{" "}
            <span className="text-xl font-normal text-secondary">/ 5.0</span>
          </p>
        </div>
      </FluentCard>
    </motion.div>
  )
}

export default RoundScoreCard
