import React, { useEffect, useMemo, useState, useRef, useCallback } from "react"
import { Play, Heart, Eye, Volume2, VolumeX } from "lucide-react"
import Avatar from "@/shared/components/ui/Avatar"
import { formatCompactNumber, formatRelativeTime } from "../utils/formatters"
import styles from "../styles/reels.module.css"
import colors from "@/shared/utils/colors"


/**
 * Single reel card in the Pinterest masonry grid.
 *
 * Behavior:
 * - Hover → video auto-plays (muted) over the thumbnail
 * - Leave → video stops, thumbnail returns
 * - Play button ONLY shows when the user explicitly pauses a playing video
 *   (never on initial hover, never as a default state)
 */
const ReelCard = React.memo(function ReelCard({ reel, index, onSelect }) {
  const videoRef = useRef(null)
  const hoverIntentRef = useRef(null)

  const [showVideo, setShowVideo] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isPaused, setIsPaused] = useState(false) // true ONLY after explicit user pause
  const [isMuted, setIsMuted] = useState(true)

  const hasVideo = Boolean(reel.videoUrl)

  const handleCardClick = useCallback(() => {
    onSelect(reel)
  }, [onSelect, reel])

  const stopPreview = useCallback((resetState = true) => {
    if (hoverIntentRef.current) {
      clearTimeout(hoverIntentRef.current)
      hoverIntentRef.current = null
    }

    const el = videoRef.current
    if (el) {
      el.pause()
      if (el.readyState > 0) {
        el.currentTime = 0
      }
    }
    if (resetState) {
      setShowVideo(false)
      setIsPlaying(false)
      setIsPaused(false)
    }
  }, [])

  useEffect(() => {
    return () => {
      stopPreview(false)
    }
  }, [stopPreview])

  /** Start playback on hover (with small delay to avoid flicker on quick passes) */
  const handleMouseEnter = useCallback(() => {
    if (!hasVideo) return

    hoverIntentRef.current = setTimeout(() => {
      const el = videoRef.current
      if (!el) return

      // Make the video visible, then play
      setShowVideo(true)
      setIsPaused(false)
      if (el.readyState > 0) {
        el.currentTime = 0
      }
      el.play()
        .then(() => setIsPlaying(true))
        .catch(() => setIsPlaying(false))
    }, 200) // 200ms delay avoids unnecessary loads on quick mouse passes
  }, [hasVideo])

  /** Pause and hide on mouse leave */
  const handleMouseLeave = useCallback(() => {
    stopPreview()
  }, [stopPreview])

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
        .catch(() => {})
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
      onClick={handleCardClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Thumbnail + video area */}
      <div style={{ position: "relative", width: "100%", display: "flex" }}>
        {/* Thumbnail image — always visible as poster */}
        {reel.thumbnailUrl ? (
          <img
            src={reel.thumbnailUrl}
            alt={reel.title}
            className={styles.cardThumbnail}
            loading="lazy"
          />
        ) : (
          <div
            style={{
              width: "100%",
              aspectRatio: "3/4",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: colors.primaryRed,
              color: "white",
              fontSize: 24,
              fontWeight: 700,
            }}
          >
            {reel.title.charAt(0)}
          </div>
        )}

        {/* Video element — overlays thumbnail on hover */}
        {hasVideo && (
          <video
            ref={videoRef}
            src={reel.videoUrl}
            muted={isMuted}
            loop
            playsInline
            preload="none"
            className={styles.cardVideo}
            style={{ opacity: showVideo ? 1 : 0 }}
          />
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

        {/* Floating immersive text and stats overlay */}
        <div className={styles.cardInfoOverlay}>
          {/* Tags row */}
          {reel.tags && reel.tags.length > 0 && (
            <div className={styles.cardTagsRow}>
              {reel.tags.slice(0, 2).map((tag, idx) => (
                <span key={idx} className={styles.cardTagPill}>
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Title */}
          <p className={styles.cardTitle}>{reel.title}</p>

          {/* Creator details and Stats row */}
          <div className={styles.cardMetaRow}>
            <div className={styles.authorBlock}>
              <span className={styles.avatarWrapper}>
                <Avatar
                  size={22}
                  src={reel.author.avatarUrl}
                  name={reel.author.name}
                  alt={reel.author.name}
                />
              </span>
              <span className={styles.authorName}>{reel.author.name}</span>
              {reel.author.verified && (
                <svg
                  className={styles.verifiedBadge}
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                </svg>
              )}
              <span className={styles.dotSeparator}>•</span>
              <span className={styles.uploadTime}>
                {formatRelativeTime(reel.createdAt)}
              </span>
            </div>

            <div className={styles.cardFooterStats}>
              <span className={styles.viewsPill} title="Views">
                <Eye size={10} />
                {formatCompactNumber(reel.views)}
              </span>
              <span className={styles.likesPill} title="Likes">
                <Heart size={10} />
                {formatCompactNumber(reel.likes)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
})

export default ReelCard
