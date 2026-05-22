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
  Maximize,
  Minimize,
  Loader2,
} from "lucide-react"
import Avatar from "@/shared/components/ui/Avatar"
import ReelMoreMenu from "../components/ReelMoreMenu"
import useReelDetail from "../hooks/useReelDetail"
import useFullscreen from "../hooks/useFullscreen"
import {
  formatCompactNumber,
  formatRelativeTime,
} from "../utils/formatters"
import styles from "../styles/reels.module.css"

/**
 * Instagram-style reel detail page.
 *
 * Desktop  : [ Reel ] [ Action column ] [ Side panel ]
 * Mobile   : Reel + action column below, bottom-sheet panel
 * Fullscreen: Reel fills viewport with floating overlays
 */
const ReelDetailPage = () => {
  const { id, lang } = useParams()
  const navigate = useNavigate()

  const { reel, isLoading, notFound } = useReelDetail(id)

  /* ── Refs ───────────────────────────────────────── */
  const videoRef = useRef(null)
  const progressRef = useRef(null)
  const containerRef = useRef(null)

  /* ── State ──────────────────────────────────────── */
  const [isPlaying, setIsPlaying] = useState(true)
  const [isMuted, setIsMuted] = useState(false)
  const [volume, setVolume] = useState(0.5)
  const [progress, setProgress] = useState(0)
  const [isSeeking, setIsSeeking] = useState(false)
  const [showInfo, setShowInfo] = useState(false)

  const { isFullscreen, toggleFullscreen } = useFullscreen()
  const hasVideo = Boolean(reel?.videoUrl)

  /* ── Sync volume to <video> ─────────────────────── */
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.volume = volume
      videoRef.current.muted = isMuted
    }
  }, [volume, isMuted])

  /* ── Navigation ─────────────────────────────────── */
  const handleClose = useCallback(() => {
    if (window.history.length > 1) {
      navigate(-1)
    } else {
      navigate(`/${lang}/cat-speak/reels`)
    }
  }, [navigate, lang])

  /* ── Playback ───────────────────────────────────── */
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
    if (newVol > 0 && isMuted) setIsMuted(false)
    else if (newVol === 0 && !isMuted) setIsMuted(true)
  }, [isMuted])

  /* ── Progress bar ───────────────────────────────── */
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

  /* ── Fullscreen ─────────────────────────────────── */
  const handleFullscreen = useCallback((e) => {
    e.stopPropagation()
    toggleFullscreen(containerRef.current)
  }, [toggleFullscreen])


  /* ── Cleanup on unmount ─────────────────────────── */
  useEffect(() => {
    return () => {
      if (videoRef.current) videoRef.current.pause()
    }
  }, [])

  /* ── Loading state ───────────────────────────────── */
  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-120px)] w-full items-center justify-center bg-black/5 rounded-2xl border border-gray-100">
        <Loader2 className="h-10 w-10 animate-spin text-[#990011]" />
      </div>
    )
  }

  /* ── Not found / Safe Guard check ───────────────── */
  if (notFound || !reel) {
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
        <span className={styles.emptyText}>Reel not found</span>
        <span className={styles.emptySubtext}>
          The reel you're looking for doesn't exist or has been removed.
        </span>
        <button className={styles.backToVideosBtn} onClick={handleClose}>
          ← Back to Reels
        </button>
      </div>
    )
  }

  const containerClasses = [
    styles.detailVideoContainer,
    isFullscreen ? styles.detailVideoContainerFullscreen : "",
  ].filter(Boolean).join(" ")

  /* ── Render ─────────────────────────────────────── */
  return (
    <div className={`${styles.detailPage} ${isFullscreen ? styles.detailPageFullscreen : ""}`}>
      {/* ─── Left area: dark background containing video ─── */}
      <div className={styles.detailLeftArea}>
        <div className={containerClasses} ref={containerRef}>
          {hasVideo ? (
            <>
              {/* Gradient overlays */}
              <div className={styles.videoTopOverlay} />
              <div className={styles.videoBottomOverlay} />

              {/* ── Top bar: Close (left) + More (right) ── */}
              <div className={styles.topBar}>
                <button
                  className={styles.detailCloseButton}
                  onClick={(e) => { e.stopPropagation(); handleClose() }}
                  aria-label="Close"
                >
                  <X size={22} color="white" />
                </button>

                <ReelMoreMenu />
              </div>

              {/* ── Video element ── */}
              <video
                ref={videoRef}
                src={reel.videoUrl}
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

              {/* Play overlay — shown when paused */}
              {!isPlaying && (
                <div className={styles.detailPlayButton}>
                  <div
                    className={styles.detailPlayIcon}
                    onClick={(e) => { e.stopPropagation(); handlePlayPause() }}
                  >
                    <Play size={32} fill="#ffffff" color="#ffffff" />
                  </div>
                </div>
              )}

              {/* ── Bottom controls: volume (left) + fullscreen (right) ── */}
              <div className={styles.bottomControls}>
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

                <button
                  className={styles.fullscreenBtn}
                  onClick={handleFullscreen}
                  aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
                >
                  {isFullscreen ? (
                    <Minimize size={20} color="white" />
                  ) : (
                    <Maximize size={20} color="white" />
                  )}
                </button>
              </div>

              {/* ── Progress bar ── */}
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

            </>
          ) : (
            <div className={styles.detailNoVideo}>
              <span>No reel available</span>
            </div>
          )}
        </div>

        {/* ── Action bar (Instagram-style, outside video) ── */}
        {hasVideo && (
          <div className={styles.actionBar}>
            <Avatar
              size={48}
              src={reel.author.avatarUrl}
              name={reel.author.name}
              alt={reel.author.name}
              className={styles.actionAvatar}
            />

            <button className={styles.actionBarBtn} aria-label="Like">
              <div className={styles.actionIconWrapper}>
                <Heart size={24} />
              </div>
              <span className={styles.actionBarLabel}>
                {formatCompactNumber(reel.likes)}
              </span>
            </button>

            <button
              className={`${styles.actionBarBtn} ${showInfo ? styles.actionBarBtnActive : ""}`}
              onClick={toggleInfo}
              aria-label="Comments"
            >
              <div className={styles.actionIconWrapper}>
                <MessageCircle size={24} />
              </div>
              <span className={styles.actionBarLabel}>
                {formatCompactNumber(reel.comments)}
              </span>
            </button>

            <button className={styles.actionBarBtn} aria-label="Save">
              <div className={styles.actionIconWrapper}>
                <Bookmark size={24} />
              </div>
              <span className={styles.actionBarLabel}>
                {formatCompactNumber(reel.shares || 0)}
              </span>
            </button>

            <button className={styles.actionBarBtn} aria-label="Share">
              <div className={styles.actionIconWrapper}>
                <Share2 size={24} />
              </div>
              <span className={styles.actionBarLabel}>Share</span>
            </button>
          </div>
        )}
      </div>

      {/* ─── Info / Comments panel ─── */}
      <div className={`${styles.detailInfo} ${showInfo ? styles.detailInfoVisible : ""}`}>
        <div className={styles.panelHeader}>
          <h3 className={styles.panelHeading}>Comments {formatCompactNumber(reel.comments)}</h3>
          <button
            className={styles.infoPanelClose}
            onClick={toggleInfo}
            aria-label="Close panel"
          >
            <X size={20} />
          </button>
        </div>

        <div className={styles.panelScrollableContent}>
          <div className={styles.detailHeader}>
            <Avatar
              size={40}
              src={reel.author.avatarUrl}
              name={reel.author.name}
              alt={reel.author.name}
            />
            <div className={styles.detailAuthorInfo}>
              <div className={styles.detailAuthorName}>
                {reel.author.name}
                {reel.author.verified && (
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
                {formatRelativeTime(reel.createdAt)}
              </div>
            </div>
          </div>

          <div className={styles.detailTextContent}>
            <h2 className={styles.detailTitle}>{reel.title}</h2>
            <p className={styles.detailDescription}>{reel.description}</p>
          </div>

          <div className={styles.detailTags}>
            {reel.tags.map((tag) => (
              <span key={tag} className={styles.detailTag}>
                #{tag}
              </span>
            ))}
          </div>

          <div className={styles.commentsSection}>
            <p className={styles.noCommentsMessage}>Be the first to comment.</p>
          </div>
        </div>

        <div className={styles.commentInputWrapper}>
          <input type="text" placeholder="Add comment..." className={styles.commentInput} />
        </div>
      </div>
    </div>
  )

  /* ── Inline helper (avoids repeating onClick + toggleInfo) ─── */
  function toggleInfo() {
    setShowInfo((prev) => !prev)
  }
}

export default ReelDetailPage
