import React from "react"
import styles from "../styles/videoReels.module.css"

/**
 * Horizontal scrollable tag filter bar.
 *
 * @param {{
 *   tags: string[],
 *   activeTag: string|null,
 *   onTagClick: (tag: string) => void,
 * }} props
 */
const VideoTagBar = ({ tags, activeTag, onTagClick }) => {
  if (tags.length === 0) return null

  return (
    <div className={styles.tagBar}>
      {tags.map((tag) => (
        <button
          key={tag}
          className={`${styles.tag} ${activeTag === tag ? styles.tagActive : ""}`}
          onClick={() => onTagClick(tag)}
        >
          #{tag}
        </button>
      ))}
    </div>
  )
}

export default VideoTagBar
