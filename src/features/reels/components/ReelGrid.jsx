import React from "react"
import { motion } from "framer-motion"
import ReelCard from "./ReelCard"
import styles from "../styles/reels.module.css"

/**
 * Stagger animation config for the masonry items.
 */
const containerVariants = {
  hidden: {},
  // visible: { transition: { staggerChildren: 0.06 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    // transition: { duration: 0.35, ease: "easeOut" },
  },
}

/**
 * Pinterest-style masonry grid of reel cards.
 *
 * @param {{ reels: Reel[], onReelClick: (reel: Reel) => void }} props
 */
const ReelGrid = ({ reels, onReelClick }) => {
  if (reels.length === 0) {
    return (
      <div className={styles.emptyState}>
        <svg
          className={styles.emptyIcon}
          width="48"
          height="48"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polygon points="23 7 16 12 23 17 23 7" />
          <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
        </svg>
        <span className={styles.emptyText}>No reels found</span>
        <span className={styles.emptySubtext}>
          Try selecting a different tag or check back later.
        </span>
      </div>
    )
  }

  return (
    <motion.div
      className={styles.masonryGrid}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      key={reels.map((v) => v.id).join(",")}
    >
      {reels.map((reel, index) => (
        <motion.div
          key={reel.id}
          className={styles.masonryItem}
          variants={itemVariants}
        >
          <ReelCard
            reel={reel}
            index={index}
            onClick={() => onReelClick(reel)}
          />
        </motion.div>
      ))}
    </motion.div>
  )
}

export default ReelGrid
