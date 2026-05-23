import React from "react"
import { useLanguage } from "@/shared/context/LanguageContext"
import ReelCard from "./ReelCard"
import styles from "../styles/reels.module.css"

/**
 * Pinterest-style masonry grid of reel cards.
 *
 * @param {{ reels: Reel[], onReelClick: (reel: Reel) => void }} props
 */
const ReelGrid = React.memo(function ReelGrid({ reels, onReelClick }) {
  const { t } = useLanguage()

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
        <span className={styles.emptyText}>{t.catSpeak.reels.noReelsFound}</span>
        <span className={styles.emptySubtext}>
          {t.catSpeak.reels.trySelectingDifferentTag}
        </span>
      </div>
    )
  }

  return (
    <div className={styles.masonryGrid}>
      {reels.map((reel, index) => (
        <div
          key={reel.id}
          className={styles.masonryItem}
        >
          <ReelCard
            reel={reel}
            index={index}
            onSelect={onReelClick}
          />
        </div>
      ))}
    </div>
  )
})

export default ReelGrid
