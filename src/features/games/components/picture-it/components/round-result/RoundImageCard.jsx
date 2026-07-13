import React from "react"
import { motion } from "framer-motion"
import FluentCard from "@/shared/components/ui/FluentCard"
import CategoryBadge from "./CategoryBadge"
import { fluentEaseOut } from "@/shared/utils/animations"

/**
 * RoundImageCard
 *
 * Left column card showing the round image with a category badge overlay.
 * The image maintains its natural aspect ratio and is fully rounded.
 *
 * @param {object} image        - { url: string, category: string }
 */
const RoundImageCard = ({ image }) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: -24 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, ease: fluentEaseOut, delay: 0.1 }}
      className="h-full w-full"
    >
      <FluentCard className="h-full p-3 gap-3 flex flex-col">
        {/* Image with category badge overlay */}
        <div className="relative flex-1 min-h-[180px] overflow-hidden rounded-xl">
          <img
            src={image?.url}
            alt="Image"
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.src =
                "https://picsum.photos/seed/fallback/800/600"
            }}
          />

          {/* Category badge — bottom-left overlay */}
          <div className="absolute bottom-3 left-3">
            <CategoryBadge category={image?.category} />
          </div>
        </div>
      </FluentCard>
    </motion.div>
  )
}

export default RoundImageCard
