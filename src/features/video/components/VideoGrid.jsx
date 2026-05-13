import React from "react"
import { motion } from "framer-motion"
import VideoCard from "./VideoCard"
import styles from "../styles/videoReels.module.css"

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
 * Pinterest-style masonry grid of video cards.
 *
 * @param {{ videos: Video[], onVideoClick: (video: Video) => void }} props
 */
const VideoGrid = ({ videos, onVideoClick }) => {
  if (videos.length === 0) {
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
        <span className={styles.emptyText}>No videos found</span>
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
      key={videos.map((v) => v.id).join(",")}
    >
      {videos.map((video, index) => (
        <motion.div
          key={video.id}
          className={styles.masonryItem}
          variants={itemVariants}
        >
          <VideoCard
            video={video}
            index={index}
            onClick={() => onVideoClick(video)}
          />
        </motion.div>
      ))}
    </motion.div>
  )
}

export default VideoGrid
