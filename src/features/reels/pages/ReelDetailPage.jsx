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
  useToggleLikeReelMutation,
  useGetReelCommentsQuery,
  useCreateReelCommentMutation,
  useDeleteReelCommentMutation,
} from "@/store/api/reelsApi"
import { selectCurrentUser, selectIsAuthenticated } from "@/store/slices/authSlice"
import { mapReelDtoToFrontend } from "../utils/mappers"
import ReelScrollContainer from "../components/ReelScrollContainer"
import {
  formatCompactNumber,
  formatRelativeTime,
} from "../utils/formatters"
import styles from "../styles/reels.module.css"

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
  const [showInfo, setShowInfo] = useState(false)
  const [commentText, setCommentText] = useState("")
  const [replyTarget, setReplyTarget] = useState(null)

  const { isFullscreen, toggleFullscreen } = useFullscreen()
  const hasVideo = Boolean(reel?.videoUrl)

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
      video.play()
        .then(() => setIsPlaying(true))
        .catch(() => {
          setIsPlaying(false)
        })
    } else {
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
                preload={shouldPreload ? "auto" : "metadata"}
                poster={reel.thumbnailUrl || undefined}
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
              size={40}
              src={reel.author.avatarUrl}
              name={reel.author.name}
              alt={reel.author.name}
              className={styles.actionAvatar}
            />

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
                {tag}
              </span>
            ))}
          </div>

          <div className={styles.commentsSection}>
            {isCommentsLoading ? (
              <div className="flex justify-center py-6">
                <Loader2 className="h-6 w-6 animate-spin text-[#990011]" />
              </div>
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
 * Instagram-style reels detail page refactored into a full-viewport snapped scroller.
 * Intersects queries to allow keyboard, mouse, and gesture sliding natively.
 */
const ReelDetailPage = () => {
  const { id, lang } = useParams()
  const navigate = useNavigate()

  // Track the initial deep-linked ID to keep the prepended list stable
  const [initialId, setInitialId] = useState(id)

  // Fetch the current single reel (deep-linked)
  const { reel: currentReel, isLoading: isDetailLoading, notFound } = useReelDetail(initialId)

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
  const [sharedVolume, setSharedVolume] = useState(() => {
    const saved = localStorage.getItem("reelVolume")
    return saved !== null ? parseFloat(saved) : 0.5
  })
  const [sharedMuted, setSharedMuted] = useState(false)

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
      <div className="flex h-[calc(100vh-120px)] w-full items-center justify-center">
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
      hasMore={false}
      isLoading={false}
      onActiveIndexChange={handleActiveIndexChange}
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
        />
      )}
    </ReelScrollContainer>
  )
}

export default ReelDetailPage
