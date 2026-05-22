import React, { useState, useRef, useCallback, useEffect, useMemo } from "react"
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
import { useGetReelsFeedQuery } from "@/store/api/reelsApi"
import { mapReelDtoToFrontend } from "../utils/mappers"
import ReelScrollContainer from "../components/ReelScrollContainer"
import {
  formatCompactNumber,
  formatRelativeTime,
} from "../utils/formatters"
import styles from "../styles/reels.module.css"

/**
 * Individual full-screen Reel Slide rendered in the Vertical Snapper.
 * Encapsulates playback states, isolation, progress controls, volume preferences,
 * and the sliding Comments Drawers to avoid DOM overlap conflicts.
 */
const ReelDetailSlide = ({
  reel,
  isActive,
  onClose,
  sharedMuted,
  setSharedMuted,
  sharedVolume,
  setSharedVolume,
}) => {
  /* ── Refs ───────────────────────────────────────── */
  const videoRef = useRef(null)
  const progressRef = useRef(null)
  const containerRef = useRef(null)

  /* ── State ──────────────────────────────────────── */
  const [isPlaying, setIsPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [isSeeking, setIsSeeking] = useState(false)
  const [showInfo, setShowInfo] = useState(false)

  const { isFullscreen, toggleFullscreen } = useFullscreen()
  const hasVideo = Boolean(reel?.videoUrl)

  /* ── Autoplay / Pause isolation ─────────────────── */
  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    if (isActive) {
      video.play()
        .then(() => setIsPlaying(true))
        .catch((e) => {
          console.log("Autoplay blocked or failed", e)
          setIsPlaying(false)
        })
    } else {
      video.pause()
      video.currentTime = 0
      setIsPlaying(false)
      setProgress(0)
    }
  }, [isActive])

  /* ── Sync shared volume and mute preferences ────── */
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.volume = sharedVolume
      videoRef.current.muted = sharedMuted
    }
  }, [sharedVolume, sharedMuted])

  /* ── Playback control ───────────────────────────── */
  const handlePlayPause = useCallback(() => {
    if (!videoRef.current) return
    if (videoRef.current.paused) {
      videoRef.current.play()
        .then(() => setIsPlaying(true))
        .catch(() => { })
    } else {
      videoRef.current.pause()
      setIsPlaying(false)
    }
  }, [])

  const handleToggleMute = useCallback((e) => {
    e.stopPropagation()
    if (sharedMuted || sharedVolume === 0) {
      setSharedMuted(false)
      if (sharedVolume === 0) setSharedVolume(1)
    } else {
      setSharedMuted(true)
    }
  }, [sharedMuted, sharedVolume, setSharedMuted, setSharedVolume])

  const handleVolumeChange = useCallback((e) => {
    const newVol = parseFloat(e.target.value)
    setSharedVolume(newVol)
    if (newVol > 0 && sharedMuted) setSharedMuted(false)
    else if (newVol === 0 && !sharedMuted) setSharedMuted(true)
  }, [sharedMuted, setSharedMuted, setSharedVolume])

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

  const toggleInfo = useCallback(() => {
    setShowInfo((prev) => !prev)
  }, [])

  const containerClasses = [
    styles.detailVideoContainer,
    isFullscreen ? styles.detailVideoContainerFullscreen : "",
  ].filter(Boolean).join(" ")

  return (
    <div
      className={`${styles.detailPage} ${isFullscreen ? styles.detailPageFullscreen : ""}`}
      style={{ height: "100%", width: "100%", borderRadius: 0 }}
    >
      {/* Left area: dark background containing video */}
      <div className={styles.detailLeftArea}>
        <div className={containerClasses} ref={containerRef}>
          {hasVideo ? (
            <>
              {/* Gradient overlays */}
              <div className={styles.videoTopOverlay} />
              <div className={styles.videoBottomOverlay} />

              {/* Top bar: Close (left) + More (right) */}
              <div className={styles.topBar}>
                <button
                  className={styles.detailCloseButton}
                  onClick={(e) => { e.stopPropagation(); onClose() }}
                  aria-label="Close"
                >
                  <X size={22} color="white" />
                </button>

                <ReelMoreMenu />
              </div>

              {/* Video element */}
              <video
                ref={videoRef}
                src={reel.videoUrl}
                muted={sharedMuted}
                loop
                playsInline
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

              {/* Bottom controls: volume (left) + fullscreen (right) */}
              <div className={styles.bottomControls}>
                <div
                  className={styles.volumeControlWrapper}
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    className={styles.detailMuteButton}
                    onClick={handleToggleMute}
                    aria-label={sharedMuted || sharedVolume === 0 ? "Unmute" : "Mute"}
                  >
                    {sharedMuted || sharedVolume === 0 ? (
                      <VolumeX size={20} color="white" />
                    ) : sharedVolume < 0.6 ? (
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
                    value={sharedMuted ? 0 : sharedVolume}
                    onChange={handleVolumeChange}
                    className={styles.volumeSlider}
                    style={{ '--volume-fill': `${(sharedMuted ? 0 : sharedVolume) * 100}%` }}
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

              {/* Progress bar */}
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

        {/* Action bar (Instagram-style, outside video) */}
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

      {/* Info / Comments panel */}
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
}

/**
 * Instagram-style reels detail page refactored into a full-viewport snapped scroller.
 * Intersects queries to allow keyboard, mouse, and gesture sliding natively.
 */
const ReelDetailPage = () => {
  const { id, lang } = useParams()
  const navigate = useNavigate()

  // Fetch the current single reel (deep-linked)
  const { reel: currentReel, isLoading: isDetailLoading, notFound } = useReelDetail(id)

  // Fetch the wider feed for scroll-snapping context
  const { data: feedResponse, isLoading: isFeedLoading } = useGetReelsFeedQuery()

  // Mapped reels list from the feed query
  const feedReels = useMemo(() => {
    if (feedResponse?.data && feedResponse.data.length > 0) {
      return feedResponse.data.map(mapReelDtoToFrontend)
    }
    return []
  }, [feedResponse])

  // Combine feed with the deep-linked currentReel prepended if it's missing from the feed list
  const combinedReels = useMemo(() => {
    if (!currentReel) return feedReels

    const exists = feedReels.some((r) => r.id === currentReel.id)
    if (exists) return feedReels

    return [currentReel, ...feedReels]
  }, [currentReel, feedReels])

  // Global shared volume state across slides
  const [sharedVolume, setSharedVolume] = useState(() => {
    const saved = localStorage.getItem("reelVolume")
    return saved !== null ? parseFloat(saved) : 0.5
  })
  const [sharedMuted, setSharedMuted] = useState(true)

  // Save volume updates to local storage
  const handleVolumeChange = useCallback((vol) => {
    setSharedVolume(vol)
    localStorage.setItem("reelVolume", String(vol))
  }, [])

  // Calculate the correct initial active index based on URL parameter ID
  const initialIndex = useMemo(() => {
    if (!id || combinedReels.length === 0) return 0
    const idx = combinedReels.findIndex((r) => r.id === id)
    return idx !== -1 ? idx : 0
  }, [combinedReels, id])

  const handleClose = useCallback(() => {
    if (window.history.length > 1) {
      navigate(-1)
    } else {
      navigate(`/${lang}/cat-speak/reels`)
    }
  }, [navigate, lang])

  // Dynamic URL Sync on scrolling
  const handleActiveIndexChange = useCallback((index) => {
    const activeReel = combinedReels[index]
    if (activeReel && activeReel.id !== id) {
      navigate(`/${lang}/cat-speak/reels/${activeReel.id}`, { replace: true })
    }
  }, [combinedReels, id, lang, navigate])

  const isLoading = (isDetailLoading || isFeedLoading) && combinedReels.length === 0

  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-120px)] w-full items-center justify-center bg-black/5 rounded-2xl border border-gray-100">
        <Loader2 className="h-10 w-10 animate-spin text-[#990011]" />
      </div>
    )
  }

  if (notFound || combinedReels.length === 0) {
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

  return (
    <ReelScrollContainer
      reels={combinedReels}
      initialIndex={initialIndex}
      hasMore={false}
      isLoading={false}
      onActiveIndexChange={handleActiveIndexChange}
    >
      {(reel, index, isActive) => (
        <ReelDetailSlide
          reel={reel}
          isActive={isActive}
          onClose={handleClose}
          sharedMuted={sharedMuted}
          setSharedMuted={setSharedMuted}
          sharedVolume={sharedVolume}
          setSharedVolume={handleVolumeChange}
        />
      )}
    </ReelScrollContainer>
  )
}

export default ReelDetailPage
