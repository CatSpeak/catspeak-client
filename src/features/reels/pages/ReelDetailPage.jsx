import React, { useState, useRef, useCallback, useEffect, useMemo } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useSelector } from "react-redux"
import {
  X,
  Play,
  Heart,
  MessageCircle,
  Share,
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
  useGetReelsFeedQuery,
  useGetUserReelsQuery,
  useToggleLikeReelMutation,
  useGetReelCommentsQuery,
  useCreateReelCommentMutation,
  useDeleteReelCommentMutation,
} from "@/store/api/reelsApi"
import { useAuth } from "@/features/auth"
import { selectCurrentUser, selectIsAuthenticated } from "@/store/slices/authSlice"
import { mapReelDtoToFrontend } from "../utils/mappers"
import ReelScrollContainer from "../components/ReelScrollContainer"
import {
  formatCompactNumber,
  formatRelativeTime,
} from "../utils/formatters"
import styles from "../styles/reels.module.css"

const REEL_VOLUME_STORAGE_KEY = "reelVolume"
const REEL_MUTED_STORAGE_KEY = "reelMuted"
const DEFAULT_REEL_VOLUME = 0.5
const DEFAULT_REEL_MUTED = false

const readReelPreference = (key) => {
  if (typeof window === "undefined") return null

  try {
    return window.localStorage.getItem(key)
  } catch {
    return null
  }
}

const readStoredReelVolume = () => {
  const saved = readReelPreference(REEL_VOLUME_STORAGE_KEY)
  const parsed = saved !== null ? Number.parseFloat(saved) : DEFAULT_REEL_VOLUME

  return Number.isFinite(parsed)
    ? Math.min(Math.max(parsed, 0), 1)
    : DEFAULT_REEL_VOLUME
}

const readStoredReelMuted = () => {
  const saved = readReelPreference(REEL_MUTED_STORAGE_KEY)
  if (saved === "false") return false
  if (saved === "true") return true

  return DEFAULT_REEL_MUTED
}

const writeReelPreference = (key, value) => {
  if (typeof window === "undefined") return

  try {
    window.localStorage.setItem(key, String(value))
  } catch {
    // Storage can be unavailable in strict private/security modes.
  }
}

/**
 * Individual comment node inside the hierarchical comments tree.
 * Renders the author, time, content, actions (Reply, Delete), and recursively renders replies.
 */
const CommentItemNode = React.memo(function CommentItemNode({
  comment,
  reelId,
  currentUser,
  onReply,
  onDelete,
}) {
  const [expanded, setExpanded] = useState(false)
  const hasReplies = comment.replies && comment.replies.length > 0

  const handleReplyClick = () => {
    onReply({
      parentCommentId: comment.reelCommentId,
      username: comment.nickname || comment.username || "user",
    })
  }

  const handleDeleteClick = () => {
    if (window.confirm("Are you sure you want to delete this comment?")) {
      onDelete(comment.reelCommentId)
    }
  }

  const isOwner = currentUser && String(currentUser.accountId) === String(comment.accountId)

  return (
    <div className={styles.commentItemWrapper}>
      <div className={styles.commentItem}>
        <Avatar
          size={36}
          src={comment.avatarUrl}
          name={comment.nickname || comment.username}
          alt={comment.nickname || comment.username}
          className={styles.commentAvatar}
        />
        <div className={styles.commentDetails}>
          <div className={styles.commentHeader}>
            <span className={styles.commentNickname}>
              {comment.nickname || comment.username || "Anonymous"}
            </span>
            {/* {comment.username && (
              <span className={styles.commentUsername}>@{comment.username}</span>
            )} */}
            <span className={styles.commentTime}>
              {formatRelativeTime(comment.createdAt)}
            </span>
          </div>
          <p className={styles.commentContent}>{comment.content}</p>
          <div className={styles.commentActions}>
            <button
              onClick={handleReplyClick}
              className={styles.commentActionBtn}
            >
              Reply
            </button>
            {isOwner && (
              <button
                onClick={handleDeleteClick}
                className={styles.commentDeleteBtn}
              >
                Delete
              </button>
            )}
          </div>
        </div>
      </div>

      {hasReplies && (
        <div style={{ display: "flex", flexDirection: "column" }}>
          {!expanded ? (
            <button
              onClick={() => setExpanded(true)}
              className={styles.repliesToggle}
            >
              ── View replies ({comment.replies.length})
            </button>
          ) : (
            <>
              <button
                onClick={() => setExpanded(false)}
                className={styles.repliesToggle}
              >
                ── Hide replies
              </button>
              <div className={styles.replyList}>
                {comment.replies.map((reply) => (
                  <CommentItemNode
                    key={reply.reelCommentId}
                    comment={reply}
                    reelId={reelId}
                    currentUser={currentUser}
                    onReply={onReply}
                    onDelete={onDelete}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
})

/**
 * Interactive Reel Caption component overlaying or standing beside the video player.
 * Features description truncation with "Show more/Show less" toggles and premium tags.
 */
const ReelCaption = React.memo(function ReelCaption({ reel }) {
  const [isExpanded, setIsExpanded] = useState(false)
  const description = reel.description || ""
  const DESCRIPTION_CHAR_LIMIT = 90
  const shouldTruncate = description.length > DESCRIPTION_CHAR_LIMIT

  const displayDescription = isExpanded
    ? description
    : shouldTruncate
      ? `${description.slice(0, DESCRIPTION_CHAR_LIMIT)}...`
      : description

  return (
    <div className={styles.captionContainer}>
      <div className={styles.captionHeader}>
        <Avatar
          size={36}
          src={reel.author.avatarUrl}
          name={reel.author.name}
          alt={reel.author.name}
          className={styles.captionAvatar}
        />
        <div className={styles.captionAuthorDetails}>
          <span className={styles.captionAuthorName}>
            {reel.author.name}
            {reel.author.verified && (
              <svg
                className={styles.captionVerifiedBadge}
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
              </svg>
            )}
          </span>
        </div>
      </div>

      <div className={styles.captionTextContent}>
        {reel.title && <h3 className={styles.captionTitle}>{reel.title}</h3>}
        <p className={styles.captionDescription}>
          {displayDescription}
          {shouldTruncate && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                setIsExpanded(!isExpanded)
              }}
              className={styles.captionExpandBtn}
            >
              {isExpanded ? "Show less" : "Show more"}
            </button>
          )}
        </p>
      </div>

      {reel.tags && reel.tags.length > 0 && (
        <div className={styles.captionTags}>
          {reel.tags.map((tag) => (
            <span key={tag} className={styles.captionTag}>
              {tag.startsWith("#") ? tag : `#${tag}`}
            </span>
          ))}
        </div>
      )}
    </div>
  )
})

/**
 * Individual full-screen Reel Slide rendered in the Vertical Snapper.
 * Encapsulates playback states, isolation, progress controls, volume preferences,
 * and the sliding Comments Drawers to avoid DOM overlap conflicts.
 */
const ReelDetailSlide = React.memo(function ReelDetailSlide({
  reel,
  isActive,
  shouldPreload = false,
  onClose,
  sharedMuted,
  setSharedMuted,
  sharedVolume,
  setSharedVolume,
  hasUserInteracted,
  showComments,
  setShowComments,
}) {
  /* ── Refs ───────────────────────────────────────── */
  const videoRef = useRef(null)
  const progressRef = useRef(null)
  const containerRef = useRef(null)
  const commentInputRef = useRef(null)
  const resetTimerRef = useRef(null)

  /* ── State ──────────────────────────────────────── */
  const [isPlaying, setIsPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [isSeeking, setIsSeeking] = useState(false)
  const showInfo = showComments
  const [commentText, setCommentText] = useState("")
  const [replyTarget, setReplyTarget] = useState(null)
  const [isPlaybackMuted, setIsPlaybackMuted] = useState(sharedMuted)

  const { isFullscreen, toggleFullscreen } = useFullscreen()
  const hasVideo = Boolean(reel?.videoUrl)
  const preferredMuted = sharedMuted || sharedVolume === 0
  const isEffectivelyMuted = preferredMuted || isPlaybackMuted

  /* ── Redux/API Hooks ────────────────────────────── */
  const currentUser = useSelector(selectCurrentUser)
  const isAuthenticated = useSelector(selectIsAuthenticated)

  const { data: commentsResponse, isLoading: isCommentsLoading } =
    useGetReelCommentsQuery(reel.id, { skip: !reel.id || !isActive || !showInfo })

  const [toggleLike] = useToggleLikeReelMutation()
  const [createComment, { isLoading: isPostingComment }] =
    useCreateReelCommentMutation()
  const [deleteComment] = useDeleteReelCommentMutation()

  const comments = useMemo(() => {
    if (!commentsResponse) return []
    return commentsResponse.data !== undefined
      ? commentsResponse.data
      : Array.isArray(commentsResponse)
        ? commentsResponse
        : []
  }, [commentsResponse])

  useEffect(() => {
    const video = videoRef.current
    if (!video || !hasVideo || !shouldPreload) return

    if (video.readyState < video.HAVE_CURRENT_DATA) {
      video.load()
    }
  }, [hasVideo, reel.videoUrl, shouldPreload])

  /* ── Autoplay / Pause isolation ─────────────────── */
  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    if (resetTimerRef.current) {
      window.clearTimeout(resetTimerRef.current)
      resetTimerRef.current = null
    }

    if (isActive) {
      // On mobile, browsers block unmuted autoplay until user has interacted.
      // Strategy (same as YouTube Shorts):
      //   - If no user interaction yet → start muted, then unmute on first gesture
      //   - If user has interacted (scrolled/tapped) → play unmuted directly
      const userHasInteracted = hasUserInteracted?.current === true
      const shouldStartMuted = !userHasInteracted && !preferredMuted

      const attemptPlay = (muted) => {
        video.volume = sharedVolume
        video.muted = muted
        video.play()
          .then(() => {
            setIsPlaying(true)
            setIsPlaybackMuted(video.muted)
          })
          .catch(() => {
            if (muted) {
              // Already muted and still failed — give up
              setIsPlaying(false)
              return
            }
            // Unmuted play was blocked by browser policy → fall back to muted
            video.muted = true
            setIsPlaybackMuted(true)
            video.play()
              .then(() => setIsPlaying(true))
              .catch(() => setIsPlaying(false))
          })
      }

      const startPlayback = () => {
        if (shouldStartMuted) {
          // Start muted, then unmute on first user gesture
          attemptPlay(true)

          const unmuteOnInteraction = () => {
            const v = videoRef.current
            if (v && !v.paused) {
              v.muted = preferredMuted
              setIsPlaybackMuted(preferredMuted)
            }
            document.removeEventListener("touchstart", unmuteOnInteraction, true)
            document.removeEventListener("click", unmuteOnInteraction, true)
            document.removeEventListener("scroll", unmuteOnInteraction, true)
          }

          document.addEventListener("touchstart", unmuteOnInteraction, { capture: true, once: true })
          document.addEventListener("click", unmuteOnInteraction, { capture: true, once: true })
          document.addEventListener("scroll", unmuteOnInteraction, { capture: true, once: true, passive: true })

          // Store cleanup ref for the listeners
          video._unmuteCleanup = () => {
            document.removeEventListener("touchstart", unmuteOnInteraction, true)
            document.removeEventListener("click", unmuteOnInteraction, true)
            document.removeEventListener("scroll", unmuteOnInteraction, true)
          }
        } else {
          // User has previously interacted → try unmuted directly
          attemptPlay(preferredMuted)
        }
      }

      // If the video has enough data, play immediately.
      // Otherwise, wait for `canplay` to avoid a silent failure.
      if (video.readyState >= video.HAVE_FUTURE_DATA) {
        startPlayback()
      } else {
        const onCanPlay = () => {
          video.removeEventListener("canplay", onCanPlay)
          startPlayback()
        }
        video.addEventListener("canplay", onCanPlay)
        // Also try immediately — readyState can change between the check and listener
        startPlayback()

        return () => {
          video.removeEventListener("canplay", onCanPlay)
        }
      }
    } else {
      // Clean up any pending unmute listeners when going inactive
      if (video._unmuteCleanup) {
        video._unmuteCleanup()
        video._unmuteCleanup = null
      }

      video.pause()

      resetTimerRef.current = window.setTimeout(() => {
        const currentVideo = videoRef.current
        if (currentVideo?.readyState > 0) {
          currentVideo.currentTime = 0
        }
        setIsPlaying(false)
        setProgress(0)
        resetTimerRef.current = null
      }, 250)
    }

    return () => {
      if (resetTimerRef.current) {
        window.clearTimeout(resetTimerRef.current)
        resetTimerRef.current = null
      }
      if (video._unmuteCleanup) {
        video._unmuteCleanup()
        video._unmuteCleanup = null
      }
    }
  }, [isActive, preferredMuted, reel.videoUrl, sharedVolume, hasUserInteracted])

  /* ── Sync shared volume and mute preferences ────── */
  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    video.volume = sharedVolume

    if (preferredMuted) {
      video.muted = true
    } else if (!isPlaybackMuted) {
      video.muted = false
    }
  }, [isPlaybackMuted, preferredMuted, sharedVolume])

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
    const video = videoRef.current

    if (isEffectivelyMuted) {
      const nextVolume = sharedVolume === 0 ? 1 : sharedVolume
      setSharedVolume(nextVolume)
      setSharedMuted(false)
      setIsPlaybackMuted(false)

      if (video) {
        video.volume = nextVolume
        video.muted = false

        if (video.paused) {
          video.play()
            .then(() => setIsPlaying(true))
            .catch(() => {
              video.muted = true
              setIsPlaybackMuted(true)
              setIsPlaying(false)
            })
        }
      }
    } else {
      if (video) {
        video.muted = true
      }
      setIsPlaybackMuted(true)
      setSharedMuted(true)
    }
  }, [isEffectivelyMuted, sharedVolume, setSharedMuted, setSharedVolume])

  const handleVolumeChange = useCallback((e) => {
    const newVol = parseFloat(e.target.value)
    const video = videoRef.current

    setSharedVolume(newVol)

    if (video) {
      video.volume = newVol
    }

    if (newVol > 0) {
      if (video) {
        video.muted = false
      }
      setIsPlaybackMuted(false)
      setSharedMuted(false)
    } else {
      if (video) {
        video.muted = true
      }
      setIsPlaybackMuted(true)
      setSharedMuted(true)
    }
  }, [setSharedMuted, setSharedVolume])

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
    setShowComments((prev) => !prev)
  }, [setShowComments])

  /* ── Actions ─────────────────────────────────────── */
  const handleLikeToggle = useCallback(async (e) => {
    e.stopPropagation()
    if (!isAuthenticated) {
      alert("Please sign in to like this reel.")
      return
    }
    try {
      await toggleLike(reel.id).unwrap()
    } catch (err) {
      console.error("Failed to toggle like", err)
    }
  }, [reel.id, isAuthenticated, toggleLike])

  const handleReply = useCallback((target) => {
    setReplyTarget(target)
    if (commentInputRef.current) {
      commentInputRef.current.focus()
    }
  }, [])

  const handleDelete = useCallback(async (commentId) => {
    try {
      await deleteComment({ commentId, reelId: reel.id }).unwrap()
    } catch (err) {
      console.error("Failed to delete comment", err)
    }
  }, [deleteComment, reel.id])

  const handlePostComment = useCallback(async (e) => {
    e.preventDefault()
    if (!isAuthenticated) return
    if (!commentText.trim()) return

    try {
      await createComment({
        reelId: reel.id,
        content: commentText.trim(),
        parentCommentId: replyTarget ? replyTarget.parentCommentId : null,
      }).unwrap()
      setCommentText("")
      setReplyTarget(null)
    } catch (err) {
      console.error("Failed to post comment", err)
    }
  }, [commentText, createComment, isAuthenticated, reel.id, replyTarget])

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

              {/* Reel Caption overlay inside the video player (hidden in fullscreen) */}
              <ReelCaption reel={reel} />

              {/* Top bar: Close (left) + Volume next to it, and More (right) */}
              <div className={styles.topBar}>
                <div className={styles.topLeftControls}>
                  <button
                    className={styles.detailCloseButton}
                    onClick={(e) => { e.stopPropagation(); onClose() }}
                    aria-label="Close"
                  >
                    <X size={22} color="white" />
                  </button>

                  <div
                    className={styles.volumeControlWrapper}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      className={styles.detailMuteButton}
                      onClick={handleToggleMute}
                      aria-label={isEffectivelyMuted ? "Unmute" : "Mute"}
                    >
                      {isEffectivelyMuted ? (
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
                      value={isEffectivelyMuted ? 0 : sharedVolume}
                      onChange={handleVolumeChange}
                      className={styles.volumeSlider}
                      style={{ '--volume-fill': `${(isEffectivelyMuted ? 0 : sharedVolume) * 100}%` }}
                      aria-label="Volume"
                    />
                  </div>
                </div>

                <ReelMoreMenu />
              </div>

              {/* Video element */}
              <video
                ref={videoRef}
                src={reel.videoUrl}
                preload={shouldPreload ? "auto" : "metadata"}
                poster={reel.thumbnailUrl || undefined}
                muted={isEffectivelyMuted}
                autoPlay={isActive}
                loop
                playsInline
                onClick={handlePlayPause}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                onTimeUpdate={handleTimeUpdate}
                className={styles.detailVideo}
              />

              {/* Play overlay — shown when paused */}
              {isActive && !isPlaying && (
                <div className={styles.detailPlayButton}>
                  <div
                    className={styles.detailPlayIcon}
                    onClick={(e) => { e.stopPropagation(); handlePlayPause() }}
                  >
                    <Play size={32} fill="#ffffff" color="#ffffff" />
                  </div>
                </div>
              )}

              {/* Bottom controls: fullscreen (right) */}
              <div className={styles.bottomControls}>
                <div style={{ flex: 1 }} />
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
            <button
              className={styles.actionBarBtn}
              onClick={handleLikeToggle}
              aria-label={reel.isLiked ? "Unlike" : "Like"}
            >
              <div className={styles.actionIconWrapper}>
                <Heart
                  size={24}
                  className={reel.isLiked ? styles.heartIconLiked : ""}
                />
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
                <Share size={24} />
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
          <div className={styles.commentsSection}>
            {isCommentsLoading ? (
              <CommentsSkeleton />
            ) : comments.length === 0 ? (
              <p className={styles.noCommentsMessage}>Be the first to comment.</p>
            ) : (
              <div className={styles.commentList}>
                {comments.map((comment) => (
                  <CommentItemNode
                    key={comment.reelCommentId}
                    comment={comment}
                    reelId={reel.id}
                    currentUser={currentUser}
                    onReply={handleReply}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        <div className={styles.commentInputWrapper}>
          {replyTarget && (
            <div className={styles.replyIndicator}>
              <span className={styles.replyIndicatorText}>
                Replying to @{replyTarget.username}
              </span>
              <button
                type="button"
                onClick={() => setReplyTarget(null)}
                className={styles.replyIndicatorCancel}
              >
                Cancel
              </button>
            </div>
          )}
          <form onSubmit={handlePostComment} className={styles.commentInputContainer}>
            <input
              ref={commentInputRef}
              type="text"
              placeholder={
                !isAuthenticated
                  ? "Please sign in to comment..."
                  : replyTarget
                    ? `Reply to @${replyTarget.username}...`
                    : "Add comment..."
              }
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              className={styles.commentInput}
              disabled={!isAuthenticated || isPostingComment}
            />
            {isAuthenticated && (
              <button
                type="submit"
                disabled={isPostingComment || !commentText.trim()}
                className={`${styles.commentPostBtn} ${isPostingComment || !commentText.trim() ? styles.commentPostBtnDisabled : ""
                  }`}
              >
                {isPostingComment ? (
                  <Loader2 className="h-4 w-4 animate-spin text-[#990011]" />
                ) : (
                  "Post"
                )}
              </button>
            )}
          </form>
        </div>
      </div>
    </div>
  )
})

/**
 * Premium shimmer skeleton loading block for comments.
 */
const CommentsSkeleton = () => {
  return (
    <div className={styles.commentList} aria-hidden="true">
      {[1, 2, 3, 4].map((n) => (
        <div key={n} className={styles.commentItem} style={{ gap: "12px", padding: "4px 0" }}>
          {/* Avatar Skeleton */}
          <div
            className={styles.skeleton}
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "50%",
              flexShrink: 0
            }}
          />
          {/* Details Skeleton */}
          <div className={styles.commentDetails} style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
              {/* Nickname Skeleton */}
              <div
                className={styles.skeleton}
                style={{
                  width: "90px",
                  height: "14px",
                  borderRadius: "4px"
                }}
              />
              {/* Time Skeleton */}
              <div
                className={styles.skeleton}
                style={{
                  width: "40px",
                  height: "12px",
                  borderRadius: "4px",
                  marginLeft: "auto"
                }}
              />
            </div>
            {/* Content line 1 Skeleton */}
            <div
              className={styles.skeleton}
              style={{
                width: "90%",
                height: "14px",
                borderRadius: "4px",
                marginTop: "2px"
              }}
            />
            {/* Content line 2 Skeleton */}
            <div
              className={styles.skeleton}
              style={{
                width: "70%",
                height: "14px",
                borderRadius: "4px"
              }}
            />
          </div>
        </div>
      ))}
    </div>
  )
}

const DETAIL_PAGE_SIZE = 10

/**
 * Shared snapped scroller for public Reels and the workspace-owned Reels list.
 */
export const ReelDetailPageBase = ({ source = "feed" } = {}) => {
  const { id, lang } = useParams()
  const navigate = useNavigate()
  const isWorkspace = source === "workspace"
  const { user } = useAuth()
  const userId = user?.accountId
  const [feedPage, setFeedPage] = useState(1)

  // Track the initial deep-linked ID to keep the prepended list stable
  const [initialId, setInitialId] = useState(id)

  // Fetch the current single reel (deep-linked)
  const { reel: currentReel, isLoading: isDetailLoading, notFound } = useReelDetail(initialId)

  // Fetch the wider feed for scroll-snapping context.
  const {
    data: publicFeedResponse,
    isLoading: isPublicFeedLoading,
  } = useGetReelsFeedQuery(undefined, { skip: isWorkspace })

  const {
    data: workspaceFeedResponse,
    isLoading: isWorkspaceFeedLoading,
    isFetching: isWorkspaceFeedFetching,
  } = useGetUserReelsQuery(
    { userId, page: feedPage, pageSize: DETAIL_PAGE_SIZE },
    { skip: !isWorkspace || !userId }
  )

  const feedResponse = isWorkspace ? workspaceFeedResponse : publicFeedResponse
  const isFeedLoading = isWorkspace ? isWorkspaceFeedLoading : isPublicFeedLoading

  // Mapped reels list from the feed query
  const feedReels = useMemo(() => {
    if (feedResponse?.data && feedResponse.data.length > 0) {
      return feedResponse.data.map(mapReelDtoToFrontend)
    }
    return []
  }, [feedResponse])

  // Combine feed with the deep-linked currentReel, placing the currentReel at the very start (index 0) to reset the feed order on refresh.
  const combinedReels = useMemo(() => {
    if (!currentReel) return feedReels

    // Filter out currentReel from feedReels to prevent duplication
    const otherReels = feedReels.filter((r) => r.id !== currentReel.id)
    return [currentReel, ...otherReels]
  }, [currentReel, feedReels])

  // Sync initialId if the URL ID changes to a reel not currently present in the list
  const hasReel = useMemo(() => {
    return combinedReels.some((r) => r.id === id)
  }, [combinedReels, id])

  useEffect(() => {
    if (id && !hasReel) {
      const timer = setTimeout(() => {
        setInitialId(id)
      }, 0)
      return () => clearTimeout(timer)
    }
  }, [id, hasReel])

  // Global shared volume state across slides
  const [sharedVolume, setSharedVolume] = useState(readStoredReelVolume)
  const [sharedMuted, setSharedMutedState] = useState(readStoredReelMuted)

  // Lifted state to persist comments drawer visibility across reels
  const [showComments, setShowComments] = useState(false)

  // Track whether the user has interacted with the page (for mobile autoplay policy)
  const hasUserInteracted = useRef(false)
  useEffect(() => {
    const markInteracted = () => {
      hasUserInteracted.current = true
      // Clean up after first interaction — we only need to detect it once
      document.removeEventListener("touchstart", markInteracted, true)
      document.removeEventListener("click", markInteracted, true)
      document.removeEventListener("scroll", markInteracted, true)
    }
    document.addEventListener("touchstart", markInteracted, { capture: true })
    document.addEventListener("click", markInteracted, { capture: true })
    document.addEventListener("scroll", markInteracted, { capture: true, passive: true })
    return () => {
      document.removeEventListener("touchstart", markInteracted, true)
      document.removeEventListener("click", markInteracted, true)
      document.removeEventListener("scroll", markInteracted, true)
    }
  }, [])

  const setSharedMuted = useCallback((muted, { persist = true } = {}) => {
    setSharedMutedState(muted)
    if (persist) {
      writeReelPreference(REEL_MUTED_STORAGE_KEY, muted)
    }
  }, [])

  // Save volume updates to local storage
  const handleVolumeChange = useCallback((vol) => {
    setSharedVolume(vol)
    writeReelPreference(REEL_VOLUME_STORAGE_KEY, vol)
  }, [])

  // Calculate the correct initial active index based on URL parameter ID
  const initialIndex = useMemo(() => {
    if (!id || combinedReels.length === 0) return 0
    const idx = combinedReels.findIndex((r) => r.id === id)
    return idx !== -1 ? idx : 0
  }, [combinedReels, id])

  const getListPath = useCallback(() => {
    return isWorkspace ? "/workspace/reels" : `/${lang}/cat-speak/reels`
  }, [isWorkspace, lang])

  const getDetailPath = useCallback((reelId) => {
    return isWorkspace ? `/workspace/reels/${reelId}` : `/${lang}/cat-speak/reels/${reelId}`
  }, [isWorkspace, lang])

  const handleClose = useCallback(() => {
    if (!isWorkspace && window.history.length > 1) {
      navigate(-1)
    } else {
      navigate(getListPath())
    }
  }, [getListPath, isWorkspace, navigate])

  // Dynamic URL Sync on scrolling
  const handleActiveIndexChange = useCallback((index) => {
    const activeReel = combinedReels[index]
    if (activeReel && activeReel.id !== id) {
      navigate(getDetailPath(activeReel.id), { replace: true })
    }
  }, [combinedReels, getDetailPath, id, navigate])

  const hasMore = isWorkspace && (feedResponse?.lastPageCount || 0) >= DETAIL_PAGE_SIZE

  const handleLoadMore = useCallback(() => {
    if (!hasMore || isWorkspaceFeedFetching) return
    setFeedPage((page) => page + 1)
  }, [hasMore, isWorkspaceFeedFetching])

  const isLoading = (isDetailLoading || isFeedLoading) && combinedReels.length === 0

  if (isLoading) {
    return (
      <div className={`flex w-full items-center justify-center ${isWorkspace ? "h-[calc(100dvh-128px)]" : "h-[calc(100dvh-120px)]"}`}>
        <Loader2 className="h-10 w-10 animate-spin text-[#990011]" />
      </div>
    )
  }

  const isReelNotFound = notFound && !feedReels.some((r) => r.id === id)

  if (isReelNotFound || combinedReels.length === 0) {
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
      hasMore={hasMore}
      isLoading={isWorkspace && isWorkspaceFeedFetching && combinedReels.length > 0}
      onLoadMore={isWorkspace ? handleLoadMore : undefined}
      onActiveIndexChange={handleActiveIndexChange}
      containerHeight={isWorkspace ? "calc(100dvh - 128px)" : "calc(100dvh - 120px)"}
    >
      {(reel, index, isActive, preloadState = {}) => (
        <ReelDetailSlide
          reel={reel}
          isActive={isActive}
          shouldPreload={preloadState.shouldPreload}
          onClose={handleClose}
          sharedMuted={sharedMuted}
          setSharedMuted={setSharedMuted}
          sharedVolume={sharedVolume}
          setSharedVolume={handleVolumeChange}
          hasUserInteracted={hasUserInteracted}
          showComments={showComments}
          setShowComments={setShowComments}
        />
      )}
    </ReelScrollContainer>
  )
}

const ReelDetailPage = () => <ReelDetailPageBase source="feed" />

export default ReelDetailPage
