import React, { useMemo, useState, useRef, useCallback } from "react"
import { Play, Heart, Eye, Volume2, VolumeX } from "lucide-react"
import Avatar from "@/shared/components/ui/Avatar"
import { formatCompactNumber } from "../utils/formatters"
import styles from "../styles/videoReels.module.css"

/**
 * Aspect ratios cycled by index for Pinterest-style height variance.
 */
const ASPECT_RATIOS = [
  { paddingBottom: "133%" }, // 3:4  portrait
  { paddingBottom: "125%" }, // 4:5  portrait
  { paddingBottom: "150%" }, // 2:3  tall portrait
  { paddingBottom: "100%" }, // 1:1  square
  { paddingBottom: "115%" }, // ~7:8 short portrait
  { paddingBottom: "140%" }, // ~5:7 tall
]

/**
 * Single video reel card in the Pinterest masonry grid.
 *
 * Behavior:
 * - Hover → video auto-plays (muted) over the thumbnail
 * - Leave → video stops, thumbnail returns
 * - Play button ONLY shows when the user explicitly pauses a playing video
 *   (never on initial hover, never as a default state)
 */
const VideoCard = ({ video, index, onClick }) => {
  const videoRef = useRef(null)
  const hoverIntentRef = useRef(null)

  const [showVideo, setShowVideo] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isPaused, setIsPaused] = useState(false) // true ONLY after explicit user pause
  const [isMuted, setIsMuted] = useState(true)

  const aspect = useMemo(
    () => ASPECT_RATIOS[index % ASPECT_RATIOS.length],
    [index],
  )

  const hasVideo = Boolean(video.videoUrl)

  /** Start playback on hover (with small delay to avoid flicker on quick passes) */
  const handleMouseEnter = useCallback(() => {
    if (!hasVideo) return

    hoverIntentRef.current = setTimeout(() => {
      const el = videoRef.current
      if (!el) return

      // Make the video visible, then play
      setShowVideo(true)
      setIsPaused(false)
      el.currentTime = 0
      el.play()
        .then(() => setIsPlaying(true))
        .catch(() => setIsPlaying(false))
    }, 200) // 200ms delay avoids unnecessary loads on quick mouse passes
  }, [hasVideo])

  /** Pause and hide on mouse leave */
  const handleMouseLeave = useCallback(() => {
    // Cancel pending hover intent
    if (hoverIntentRef.current) {
      clearTimeout(hoverIntentRef.current)
      hoverIntentRef.current = null
    }

    const el = videoRef.current
    if (el) {
      el.pause()
      el.currentTime = 0
    }
    setShowVideo(false)
    setIsPlaying(false)
    setIsPaused(false)
  }, [])

  /** User explicitly pauses or resumes — this is the ONLY way the play button appears */
  const handlePlayPause = useCallback((e) => {
    e.stopPropagation()
    const el = videoRef.current
    if (!el) return

    if (el.paused) {
      el.play()
        .then(() => {
          setIsPlaying(true)
          setIsPaused(false)
        })
        .catch(() => { })
    } else {
      el.pause()
      setIsPlaying(false)
      setIsPaused(true) // Mark as explicitly paused
    }
  }, [])

  /** Toggle mute */
  const handleToggleMute = useCallback((e) => {
    e.stopPropagation()
    const el = videoRef.current
    if (!el) return
    el.muted = !el.muted
    setIsMuted(el.muted)
  }, [])

  return (
    <div
      className={styles.card}
      onClick={onClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Thumbnail + video area with dynamic aspect ratio */}
      <div style={{ position: "relative", ...aspect, width: "100%" }}>
        {/* Video element — replacing static thumbnail */}
        {hasVideo ? (
          <video
            ref={videoRef}
            src={`${video.videoUrl}#t=1.0`}
            muted={isMuted}
            loop
            playsInline
            preload="metadata"
            className={styles.cardVideo}
            style={{ opacity: 1 }}
          />
        ) : (
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "#990011",
              color: "white",
              fontSize: 24,
              fontWeight: 700,
            }}
          >
            {video.title.charAt(0)}
          </div>
        )}

        {/* Hover overlay gradient */}
        <div className={styles.cardOverlay} />

        {/* Play button — ONLY when user has explicitly paused the video */}
        {isPaused && (
          <div className={styles.playOverlay} style={{ opacity: 1 }}>
            <button
              className={styles.playButton}
              onClick={handlePlayPause}
              aria-label="Play video"
            >
              <Play size={20} fill="#1a1a1a" color="#1a1a1a" />
            </button>
          </div>
        )}

        {/* Mute toggle — only while video is visible and playing */}
        {showVideo && isPlaying && (
          <button
            className={styles.muteButton}
            onClick={handleToggleMute}
            aria-label={isMuted ? "Unmute" : "Mute"}
          >
            {isMuted ? <VolumeX size={14} /> : <Volume2 size={14} />}
          </button>
        )}

        {/* Stats on hover */}
        <div className={styles.cardInfo}>
          <div className={styles.cardMeta}>
            <Eye size={12} />
            <span>{formatCompactNumber(video.views)}</span>
            <Heart size={12} style={{ marginLeft: 4 }} />
            <span>{formatCompactNumber(video.likes)}</span>
          </div>
        </div>
      </div>

      {/* Footer — always visible */}
      <div className={styles.cardFooter}>
        <p className={styles.cardFooterTitle}>{video.title}</p>

        <div className={styles.cardFooterAuthor}>
          <Avatar
            size={22}
            src={video.author.avatarUrl}
            name={video.author.name}
            alt={video.author.name}
          />
          <span className={styles.authorName}>{video.author.name}</span>
          {video.author.verified && (
            <svg
              className={styles.verifiedBadge}
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
            </svg>
          )}
        </div>

        <div className={styles.cardFooterStats}>
          <span className={styles.statItem}>
            <Eye size={12} />
            {formatCompactNumber(video.views)}
          </span>
          <span className={styles.statItem}>
            <Heart size={12} />
            {formatCompactNumber(video.likes)}
          </span>
        </div>
      </div>
    </div>
  )
}

export default VideoCard
