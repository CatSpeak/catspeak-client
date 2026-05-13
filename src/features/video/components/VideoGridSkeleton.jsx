import React from "react"
import styles from "../styles/videoReels.module.css"

/**
 * Heights cycled to mimic the masonry visual during loading.
 */
const SKELETON_HEIGHTS = [260, 320, 220, 280, 340, 240, 300, 250]

/**
 * Skeleton placeholder grid displayed while videos are loading.
 *
 * @param {{ count?: number }} props
 */
const VideoGridSkeleton = ({ count = 12 }) => (
  <div className={styles.masonryGrid}>
    {Array.from({ length: count }, (_, i) => (
      <div key={i} className={styles.masonryItem}>
        <div
          className={styles.skeleton}
          style={{ height: SKELETON_HEIGHTS[i % SKELETON_HEIGHTS.length] }}
        />
        {/* Footer skeleton */}
        <div style={{ padding: "10px 12px" }}>
          <div
            className={styles.skeleton}
            style={{ height: 14, width: "80%", marginBottom: 8, borderRadius: 6 }}
          />
          <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
            <div
              className={styles.skeleton}
              style={{ width: 22, height: 22, borderRadius: "50%" }}
            />
            <div
              className={styles.skeleton}
              style={{ height: 12, width: 80, borderRadius: 6 }}
            />
          </div>
        </div>
      </div>
    ))}
  </div>
)

export default VideoGridSkeleton
