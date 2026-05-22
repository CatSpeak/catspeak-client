import React, { useState, useRef, useCallback, useEffect } from "react"
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
  AlertCircle,
  Loader2,
} from "lucide-react"
import Avatar from "@/shared/components/ui/Avatar"
import ReelMoreMenu from "./ReelMoreMenu"
import useFullscreen from "../hooks/useFullscreen"
import { formatCompactNumber, formatRelativeTime } from "../utils/formatters"
import styles from "../styles/reels.module.css"

/**
 * Upgraded individual Reel Scroll slide.
 * Implements high-performance autoplay/autopause via IntersectionObserver,
 * progressive preloading, error auto-skips, and keyboard/focus controls.
 */
const ReelScrollItem = React.memo(({
  reel,
  index,
  total,
  isActive,
  isAdjacent,
  volume,
  isMuted,
  onVolumeChange,
  onToggleMute,
  showInfo,
  toggleInfo,
  handleClose,
  lang,
  scrollNext,
  containerRef,
}) => {
  const videoRef = useRef(null)
  const progressRef = useRef(null)
  const itemRef = useRef(null)

  const [isPlaying, setIsPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [isSeeking, setIsSeeking] = useState(false)
  const [aspectRatio, setAspectRatio] = useState(9 / 16)
  const [videoError, setVideoError] = useState(false)

  const { isFullscreen, toggleFullscreen } = useFullscreen()
  const hasVideo = Boolean(reel?.videoUrl)

  // Determine the preloading configuration dynamically based on distance from active
  const preloadStrategy = isActive ? "auto" : isAdjacent ? "metadata" : "none"

  /* ── 80% Threshold IntersectionObserver for Autoplay ── */
  useEffect(() => {
    const parentContainer = containerRef.current
    const itemEl = itemRef.current
    const videoEl = videoRef.current
    if (!parentContainer || !itemEl || !videoEl) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio >= 0.8) {
            // Autoplay when at least 80% visible in viewport
            videoEl.play()
              .then(() => setIsPlaying(true))
              .catch((err) => {
                console.warn("Autoplay blocked by browser policy:", err)
              })
          } else {
            // Pause and reset playback when leaving active threshold immediately
            videoEl.pause()
            videoEl.currentTime = 0
            setIsPlaying(false)
            setProgress(0)
          }
        })
      },
      {
        root: parentContainer,
        threshold: 0.8,
      }
    )

    observer.observe(itemEl)

    return () => {
      observer.disconnect()
    }
  }, [containerRef])

  /* ── Sync volume & muted status from parent ── */
  useEffect(() => {
    const video = videoRef.current
    if (video) {
      video.volume = volume
      video.muted = isMuted
    }
  }, [volume, isMuted])

  /* ── Focus Management: Keep focus inside active item ── */
  useEffect(() => {
    if (isActive && itemRef.current) {
      itemRef.current.focus()
    }
  }, [isActive])

  /* ── Video Load Error Recovery: Auto-skip after 2s ── */
  useEffect(() => {
    if (videoError && isActive && scrollNext) {
      const skipTimer = setTimeout(() => {
        scrollNext()
      }, 2000)
      return () => clearTimeout(skipTimer)
    }
  }, [videoError, isActive, scrollNext])

  const handlePlayPause = useCallback(() => {
    const video = videoRef.current
    if (!video) return
    if (video.paused) {
      video.play()
        .then(() => setIsPlaying(true))
        .catch(() => {})
    } else {
      video.pause()
      setIsPlaying(false)
    }
  }, [])

  const handleTimeUpdate = useCallback(() => {
    if (isSeeking) return
    const video = videoRef.current
    if (!video || !video.duration) return
    setProgress((video.currentTime / video.duration) * 100)
  }, [isSeeking])

  const handleProgressClick = useCallback((e) => {
    const video = videoRef.current
    const bar = progressRef.current
    if (!video || !bar || !video.duration) return

    const rect = bar.getBoundingClientRect()
    const percent = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
    video.currentTime = percent * video.duration
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

  const handleLoadedMetadata = useCallback((e) => {
    const { videoWidth, videoHeight } = e.target
    if (videoWidth && videoHeight) {
      setAspectRatio(videoWidth / videoHeight)
    }
  }, [])

  const handleVideoError = useCallback(() => {
    setVideoError(true)
  }, [])

  const handleFullscreen = useCallback((e) => {
    e.stopPropagation()
    toggleFullscreen(itemRef.current)
  }, [toggleFullscreen])

  const containerClasses = [
    styles.detailVideoContainer,
    isFullscreen ? styles.detailVideoContainerFullscreen : "",
  ].filter(Boolean).join(" ")

  const wrapperStyle = isFullscreen
    ? { width: "100%", height: "100%" }
    : {
      "--video-aspect-ratio": aspectRatio,
      width: `min(100%, calc(var(--page-height) * ${aspectRatio}))`,
    }

  return (
    <div
      ref={itemRef}
      data-index={index}
      tabIndex={isActive ? 0 : -1}
      role="article"
      aria-label={`Reel ${index + 1} of ${total}`}
      className={`${styles.detailLeftArea} ${styles.reelScrollItem} ${isActive ? styles.reelScrollItemActive : styles.reelScrollItemInactive}`}
      style={{ outline: "none", height: "100dvh", flexShrink: 0 }}
    >
      <div className={styles.playerAndActionsWrapper} style={wrapperStyle}>
        <div className={containerClasses}>
          {hasVideo ? (
            <>
              {/* Top progress bar: premium thin visual line */}
              {!isFullscreen && (
                <div 
                  className={styles.reelProgressBarWrapper}
                  style={{ contentVisibility: "auto" }}
                >
                  <div 
                    className="h-full bg-[#990011] transition-all duration-75"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              )}

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

              {/* ── Video Element with Error & Preload controls ── */}
              {!videoError ? (
                <>
                  {reel.thumbnailUrl && (
                    <img 
                      src={reel.thumbnailUrl} 
                      className={styles.reelBgBlur} 
                      aria-hidden="true" 
                      alt="" 
                    />
                  )}
                  <video
                    ref={videoRef}
                    src={reel.videoUrl}
                    muted={isMuted}
                    loop
                    playsInline
                    preload={preloadStrategy}
                    onClick={handlePlayPause}
                    onPlay={() => setIsPlaying(true)}
                    onPause={() => setIsPlaying(false)}
                    onTimeUpdate={handleTimeUpdate}
                    onLoadedMetadata={handleLoadedMetadata}
                    onError={handleVideoError}
                    className={styles.detailVideo}
                  />
                </>
              ) : (
                /* ── Video Error Fallback (Thumbnail + Alert) ── */
                <div className="absolute inset-0 w-full h-full bg-black flex flex-col items-center justify-center text-center p-6 gap-3 z-10">
                  {reel.thumbnailUrl && (
                    <img 
                      src={reel.thumbnailUrl} 
                      alt="Fallback thumbnail" 
                      className="absolute inset-0 w-full h-full object-cover opacity-45 filter blur-[2px]"
                    />
                  )}
                  <AlertCircle size={44} color="#ef4444" className="z-10" />
                  <span className="text-white text-sm font-semibold z-10">Video playback failed</span>
                  <span className="text-gray-400 text-xs z-10">Skipping to next reel in 2s...</span>
                </div>
              )}

              {/* ── Video Metadata Overlay ── */}
              <div className={`${styles.videoMetadataOverlay} ${showInfo ? styles.videoMetadataOverlayHidden : ""}`}>
                <div className={styles.overlayHeader}>
                  <Avatar
                    size={32}
                    src={reel.author.avatarUrl}
                    name={reel.author.name}
                    className={styles.overlayAvatar}
                  />
                  <div className={styles.overlayAuthorDetails}>
                    <div className={styles.overlayAuthorName}>
                      {reel.author.name}
                      {reel.author.verified && (
                        <svg
                          className={styles.overlayVerifiedBadge}
                          viewBox="0 0 24 24"
                          fill="currentColor"
                        >
                          <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                        </svg>
                      )}
                    </div>
                  </div>
                </div>
                <div className={styles.overlayContent}>
                  <h2 className={styles.overlayTitle}>{reel.title}</h2>
                  <p className={styles.overlayDescription}>{reel.description}</p>
                  {reel.tags && reel.tags.length > 0 && (
                    <div className={styles.overlayTags}>
                      {reel.tags.map((tag) => (
                        <span key={tag} className={styles.overlayTag}>
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Play Overlay (shown when paused) */}
              {!isPlaying && !videoError && (
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
                    onClick={(e) => { e.stopPropagation(); onToggleMute() }}
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
                    onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
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

              {/* ── Progress bar (Scrubbable Bottom Line) ── */}
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

        {/* ── Action bar (positioned float-right next to video) ── */}
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
              onClick={(e) => { e.stopPropagation(); toggleInfo() }}
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
    </div>
  )
})

/**
 * Snapped Scroll Container component with Virtualized Windowing logic.
 * Renders only adjacent reels in the sliding view to conserve DOM memory.
 */
export default function ReelScrollContainer({
  reels,
  activeIndex,
  onScrollActiveIndex,
  volume,
  isMuted,
  onVolumeChange,
  onToggleMute,
  showInfo,
  toggleInfo,
  handleClose,
  lang,
  scrollNext,
  containerRef,
  isFetchingMore = false,
  hasMoreData = true,
}) {

  // Sync scroll height to match selected index on orientation change
  useEffect(() => {
    const handleResize = () => {
      const container = containerRef.current
      if (container) {
        container.scrollTop = activeIndex * container.clientHeight
      }
    }
    window.addEventListener("resize", handleResize)
    window.addEventListener("orientationchange", handleResize)
    return () => {
      window.removeEventListener("resize", handleResize)
      window.removeEventListener("orientationchange", handleResize)
    }
  }, [activeIndex, containerRef])

  // Accessibility screen-reader live announcements on active slide shift
  const [screenReaderAnnouncement, setScreenReaderAnnouncement] = useState("")
  useEffect(() => {
    const activeReel = reels[activeIndex]
    if (activeReel) {
      setScreenReaderAnnouncement(`${activeReel.author.name}'s reel: ${activeReel.title}`)
    }
  }, [activeIndex, reels])

  // Pause playback when document/tab becomes hidden
  useEffect(() => {
    const handleVisibilityChange = () => {
      const activeVideo = containerRef.current?.querySelector(
        `[data-index="${activeIndex}"] video`
      )
      if (!activeVideo) return
      if (document.hidden) {
        activeVideo.pause()
      } else {
        activeVideo.play().catch(() => {})
      }
    }
    document.addEventListener("visibilitychange", handleVisibilityChange)
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange)
    }
  }, [activeIndex, containerRef])

  return (
    <div
      ref={containerRef}
      className={styles.scrollContainer}
      role="feed"
      aria-busy={isFetchingMore ? "true" : "false"}
      style={{ height: "100dvh", overflowY: "scroll" }}
    >
      {/* Hidden Live Announcement for A11y polite readers */}
      <div 
        className="sr-only" 
        role="status" 
        aria-live="polite" 
        style={{ position: "absolute", width: "1px", height: "1px", padding: 0, margin: "-1px", overflow: "hidden", clip: "rect(0,0,0,0)", border: 0 }}
      >
        {screenReaderAnnouncement}
      </div>

      {reels.map((item, index) => {
        const delta = Math.abs(index - activeIndex)
        const isVisible = delta <= 2 // 5-item virtual window: [prev, prev, active, next, next]
        const isAdjacent = delta === 1

        if (!isVisible) {
          // Empty exact-height snap placeholder to avoid layout shift & save browser memory
          return (
            <div
              key={item.id}
              className={styles.reelScrollItemPlaceholder}
              style={{ height: "100dvh", flexShrink: 0 }}
            />
          )
        }

        return (
          <ReelScrollItem
            key={item.id}
            reel={item}
            index={index}
            total={reels.length}
            isActive={index === activeIndex}
            isAdjacent={isAdjacent}
            volume={volume}
            isMuted={isMuted}
            onVolumeChange={onVolumeChange}
            onToggleMute={onToggleMute}
            showInfo={showInfo}
            toggleInfo={toggleInfo}
            handleClose={handleClose}
            lang={lang}
            scrollNext={scrollNext}
            containerRef={containerRef}
          />
        )
      })}

      {/* Loading slide snap indicator */}
      {isFetchingMore && (
        <div 
          className={`${styles.detailLeftArea}`}
          style={{ height: "100dvh", flexShrink: 0, scrollSnapAlign: "start", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", gap: "12px", background: "#000000" }}
        >
          <Loader2 className="h-10 w-10 animate-spin text-[#990011]" />
          <span className="text-gray-400 text-sm font-medium">Loading more reels...</span>
        </div>
      )}

      {/* Fully caught up slide snap indicator */}
      {!hasMoreData && (
        <div 
          className={`${styles.detailLeftArea} ${styles.noMoreReelsFooter}`}
          style={{ height: "100dvh", flexShrink: 0, scrollSnapAlign: "start", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", gap: "16px", background: "#0c0c0e" }}
        >
          <div className="w-16 h-16 rounded-full bg-[#fef2f2] border border-[#fca5a5] flex items-center justify-center text-[#990011] transition-transform hover:scale-105">
            <svg
              className="w-8 h-8"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          </div>
          <span className={styles.noMoreReelsText}>You're all caught up</span>
          <span className={styles.noMoreReelsSubtext}>You've watched all the available reels</span>
        </div>
      )}
    </div>
  )
}
