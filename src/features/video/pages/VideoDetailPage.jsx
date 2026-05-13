import React, { useState, useRef, useCallback, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import {
  X,
  Play,
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  VolumeX,
  Volume1,
  Volume2,
} from "lucide-react"
import Avatar from "@/shared/components/ui/Avatar"
import useVideoDetail from "../hooks/useVideoDetail"
import {
  formatCompactNumber,
  formatRelativeTime,
} from "../utils/formatters"
import styles from "../styles/videoReels.module.css"

/**
 * TikTok-style video detail page.
 *
 * Layout (desktop): [ Dark Area (Video + Action Buttons) ] [ Description Panel ]
 * - Video: centered inside the dark area
 * - Action buttons: vertical column to the right of the video
 * - Description: separate white panel, toggleable via Comment button
 *
 * Layout (mobile): Video fills screen, action buttons bottom-right,
 *   description slides up from bottom as overlay
 */
const VideoDetailPage = () => {
  const { id, lang } = useParams()
  const navigate = useNavigate()

  const { video, notFound } = useVideoDetail(id)

  const videoRef = useRef(null)
  const progressRef = useRef(null)
  const [isPlaying, setIsPlaying] = useState(true)
  const [isMuted, setIsMuted] = useState(false)
  const [volume, setVolume] = useState(0.5)
  const [showInfo, setShowInfo] = useState(false)

  // Sync volume with video element
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.volume = volume
      videoRef.current.muted = isMuted
    }
  }, [volume, isMuted])
  const [progress, setProgress] = useState(0)
  const [isSeeking, setIsSeeking] = useState(false)

  const hasVideo = Boolean(video?.videoUrl)

  /* ── Navigation ───────────────────────────────── */
  const handleClose = useCallback(() => {
    if (window.history.length > 1) {
      navigate(-1)
    } else {
      navigate(`/${lang}/cat-speak/video`)
    }
  }, [navigate, lang])

  /* ── Playback controls ────────────────────────── */
  const handlePlayPause = useCallback(() => {
    if (!videoRef.current) return
    if (videoRef.current.paused) {
      videoRef.current.play().then(() => setIsPlaying(true)).catch(() => { })
    } else {
      videoRef.current.pause()
      setIsPlaying(false)
    }
  }, [])

  const handleToggleMute = useCallback((e) => {
    e.stopPropagation()
    if (isMuted || volume === 0) {
      setIsMuted(false)
      if (volume === 0) setVolume(1)
    } else {
      setIsMuted(true)
    }
  }, [isMuted, volume])

  const handleVolumeChange = useCallback((e) => {
    const newVol = parseFloat(e.target.value)
    setVolume(newVol)
    if (newVol > 0 && isMuted) {
      setIsMuted(false)
    } else if (newVol === 0 && !isMuted) {
      setIsMuted(true)
    }
  }, [isMuted])

  /* ── Progress bar ─────────────────────────────── */
  const handleTimeUpdate = useCallback(() => {
    if (isSeeking) return
    const el = videoRef.current
    if (!el || !el.duration) return
    setProgress((el.currentTime / el.duration) * 100)
  }, [isSeeking])

  const handleProgressClick = useCallback((e) => {
    const el = videoRef.current
    const bar = progressRef.current
    if (!el || !bar || !el.duration) return

    const rect = bar.getBoundingClientRect()
    const percent = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
    el.currentTime = percent * el.duration
    setProgress(percent * 100)
  }, [])

  const handleProgressMouseDown = useCallback((e) => {
    setIsSeeking(true)
    handleProgressClick(e)

    const handleMouseMove = (ev) => handleProgressClick(ev)
    const handleMouseUp = () => {
      setIsSeeking(false)
      window.removeEventListener("mousemove", handleMouseMove)
      window.removeEventListener("mouseup", handleMouseUp)
    }
    window.addEventListener("mousemove", handleMouseMove)
    window.addEventListener("mouseup", handleMouseUp)
  }, [handleProgressClick])

  /* ── Toggle info panel ────────────────────────── */
  const toggleInfo = useCallback(() => {
    setShowInfo((prev) => !prev)
  }, [])

  /* ── Cleanup ──────────────────────────────────── */
  useEffect(() => {
    return () => {
      if (videoRef.current) {
        videoRef.current.pause()
      }
    }
  }, [])

  /* ── Not found ────────────────────────────────── */
  if (notFound) {
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
        <span className={styles.emptyText}>Video not found</span>
        <span className={styles.emptySubtext}>
          The video you're looking for doesn't exist or has been removed.
        </span>
        <button className={styles.backToVideosBtn} onClick={handleClose}>
          ← Back to Videos
        </button>
      </div>
    )
  }

  /* ── Main layout ──────────────────────────────── */
  return (
    <div className={styles.detailPage}>
      {/* ─── Left Area: Dark background containing video and action bar ─── */}
      <div className={styles.detailLeftArea}>

        {/* ─── Video Container ─── */}
        <div className={styles.detailVideoContainer}>
          {hasVideo ? (
            <>
              {/* Overlays that appear on hover */}
              <div className={styles.videoTopOverlay} />
              <div className={styles.videoBottomOverlay} />

              {/* Close button inside video container */}
              <button
                className={styles.detailCloseButton}
                onClick={(e) => { e.stopPropagation(); handleClose(); }}
                aria-label="Close"
              >
                <X size={24} color="white" />
              </button>

              <video
                ref={videoRef}
                src={video.videoUrl}
                muted={isMuted}
                loop
                playsInline
                autoPlay
                onClick={handlePlayPause}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                onTimeUpdate={handleTimeUpdate}
                className={styles.detailVideo}
              />

              {/* Play overlay — only when paused */}
              {!isPlaying && (
                <div className={styles.detailPlayButton}>
                  <div className={styles.detailPlayIcon} onClick={(e) => { e.stopPropagation(); handlePlayPause(); }}>
                    <Play size={32} fill="#ffffff" color="#ffffff" />
                  </div>
                </div>
              )}

              {/* Volume Control wrapper */}
              <div
                className={styles.volumeControlWrapper}
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  className={styles.detailMuteButton}
                  onClick={handleToggleMute}
                  aria-label={isMuted || volume === 0 ? "Unmute" : "Mute"}
                >
                  {isMuted || volume === 0 ? (
                    <VolumeX size={20} color="white" />
                  ) : volume < 0.6 ? (
                    <Volume1 size={20} color="white" />
                  ) : (
                    <Volume2 size={20} color="white" />
                  )}
                </button>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={isMuted ? 0 : volume}
                  onChange={handleVolumeChange}
                  className={styles.volumeSlider}
                  style={{ '--volume-fill': `${(isMuted ? 0 : volume) * 100}%` }}
                  aria-label="Volume"
                />
              </div>

              {/* Progress bar — bottom edge of video */}
              <div
                ref={progressRef}
                className={styles.progressBar}
                onMouseDown={handleProgressMouseDown}
                onClick={handleProgressClick}
              >
                <div
                  className={styles.progressFill}
                  style={{ width: `${progress}%` }}
                />
                <div
                  className={styles.progressThumb}
                  style={{ left: `${progress}%` }}
                />
              </div>

              {/* ─── Action buttons (vertical, inside video container) ─── */}
              <div className={styles.actionBar}>
                <Avatar
                  size={48}
                  src={video.author.avatarUrl}
                  name={video.author.name}
                  alt={video.author.name}
                  className={styles.actionAvatar}
                />

                <button className={styles.actionBarBtn} aria-label="Like">
                  <div className={styles.actionIconWrapper}>
                    <Heart size={24} fill="white" color="white" />
                  </div>
                  <span className={styles.actionBarLabel}>
                    {formatCompactNumber(video.likes)}
                  </span>
                </button>

                <button
                  className={`${styles.actionBarBtn} ${showInfo ? styles.actionBarBtnActive : ""}`}
                  onClick={toggleInfo}
                  aria-label="Comments"
                >
                  <div className={styles.actionIconWrapper}>
                    <MessageCircle size={24} fill="white" color="white" />
                  </div>
                  <span className={styles.actionBarLabel}>
                    {formatCompactNumber(video.comments)}
                  </span>
                </button>

                <button className={styles.actionBarBtn} aria-label="Save">
                  <div className={styles.actionIconWrapper}>
                    <Bookmark size={24} fill="white" color="white" />
                  </div>
                  <span className={styles.actionBarLabel}>
                    {formatCompactNumber(video.shares || 0)}
                  </span>
                </button>

                <button className={styles.actionBarBtn} aria-label="Share">
                  <div className={styles.actionIconWrapper}>
                    <Share2 size={24} fill="white" color="white" />
                  </div>
                  <span className={styles.actionBarLabel}>Share</span>
                </button>
              </div>
            </>
          ) : (
            <div className={styles.detailNoVideo}>
              <span>No video available</span>
            </div>
          )}
        </div>
      </div>

      {/* ─── Description panel (separate white block) ─── */}
      <div className={`${styles.detailInfo} ${showInfo ? styles.detailInfoVisible : ""}`}>
        {/* Header inside Panel */}
        <div className={styles.panelHeader}>
          <h3 className={styles.panelHeading}>Comments {formatCompactNumber(video.comments)}</h3>
          <button
            className={styles.infoPanelClose}
            onClick={toggleInfo}
            aria-label="Close panel"
          >
            <X size={20} />
          </button>
        </div>

        <div className={styles.panelScrollableContent}>
          {/* Author info inside panel */}
          <div className={styles.detailHeader}>
            <Avatar
              size={40}
              src={video.author.avatarUrl}
              name={video.author.name}
              alt={video.author.name}
            />
            <div className={styles.detailAuthorInfo}>
              <div className={styles.detailAuthorName}>
                {video.author.name}
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
              <div className={styles.detailTime}>
                {formatRelativeTime(video.createdAt)}
              </div>
            </div>
          </div>

          {/* Title & Description */}
          <div className={styles.detailTextContent}>
            <h2 className={styles.detailTitle}>{video.title}</h2>
            <p className={styles.detailDescription}>{video.description}</p>
          </div>

          {/* Tags */}
          <div className={styles.detailTags}>
            {video.tags.map((tag) => (
              <span key={tag} className={styles.detailTag}>
                #{tag}
              </span>
            ))}
          </div>

          {/* Dummy Comment Placeholder */}
          <div className={styles.commentsSection}>
            {/* You can replace this with actual comment items later */}
            <p className={styles.noCommentsMessage}>Be the first to comment.</p>
          </div>
        </div>

        {/* Comment Input */}
        <div className={styles.commentInputWrapper}>
          <input type="text" placeholder="Add comment..." className={styles.commentInput} />
        </div>
      </div>
    </div>
  )
}

export default VideoDetailPage
