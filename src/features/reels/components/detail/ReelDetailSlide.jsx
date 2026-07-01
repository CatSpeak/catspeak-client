import React, { useState, useRef, useCallback, useEffect, useMemo } from "react"
import { useSelector } from "react-redux"
import {
  X, Play, Heart, MessageCircle, Share, Bookmark, VolumeX, Volume1, Volume2, Maximize, Minimize, Loader2
} from "lucide-react"
import Avatar from "@/shared/components/ui/Avatar"
import ReelMoreMenu from "./ReelMoreMenu"
import useFullscreen from "../../hooks/useFullscreen"
import toast from "react-hot-toast"
import { useLanguage } from "@/shared/context/LanguageContext"
import {
  useToggleLikeReelMutation,
  useGetReelCommentsQuery,
  useCreateReelCommentMutation,
  useDeleteReelCommentMutation,
} from "@/store/api/reelsApi"
import { useAuthModal } from "@/shared/context/AuthModalContext"
import { selectCurrentUser, selectIsAuthenticated } from "@/store/slices/authSlice"
import { formatCompactNumber } from "../../utils/formatters"
import CommentItemNode from "./CommentItemNode"
import VolumeSlider from "./VolumeSlider"

/**
 * Interactive Reel Caption component overlaying or standing beside the video player.
 * Features description truncation with "Show more/Show less" toggles and premium tags.
 */
const ReelCaption = React.memo(({ reel }) => {
  const { t, language } = useLanguage()
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
    <div className="p-4 border-b border-gray-200 shrink-0">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Avatar
            size={40}
            src={reel.author?.avatarUrl}
            name={reel.author?.name}
            alt={reel.author?.name}
            className="shadow-sm rounded-full overflow-hidden cursor-pointer"
          />
          <div className="flex flex-col">
            <span className="text-headingColor font-bold text-[15px] flex items-center gap-1 cursor-pointer transition-colors duration-200 hover:text-cath-red-700">
              {reel.author?.name}
              {reel.author?.verified && (
                <svg
                  className="w-3.5 h-3.5 text-[#3b82f6] drop-shadow-sm"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                </svg>
              )}
            </span>
          </div>
        </div>
        <ReelMoreMenu />
      </div>

      <div className="text-headingColor text-[14px] leading-[1.6]">
        {reel.title && <h3 className="font-bold text-[15px] mb-2 text-headingColor">{reel.title}</h3>}
        <p className="relative whitespace-pre-wrap break-words mb-3 text-gray-800">
          {displayDescription}
          {shouldTruncate && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                setIsExpanded(!isExpanded)
              }}
              className="text-gray-500 font-bold ml-1 hover:text-gray-700 cursor-pointer bg-transparent border-none outline-none p-0 transition-colors duration-200"
            >
              {isExpanded ? (t?.catSpeak?.reels?.detail?.showLess || "Show less") : (t?.catSpeak?.reels?.detail?.showMore || "Show more")}
            </button>
          )}
        </p>
      </div>

      {reel.tags && reel.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-4">
          {reel.tags.map((tag) => (
            <span key={tag} className="text-cath-red-700 font-medium text-[13px] hover:underline cursor-pointer transition-colors duration-200">
              {tag.startsWith("#") ? tag : `#${tag}`}
            </span>
          ))}
        </div>
      )}

      {reel.createdAt && (
        <div className="text-[12px] text-gray-400 font-medium">
          {new Date(reel.createdAt).toISOString().split('T')[0]}
        </div>
      )}
    </div>
  )
})

/**
 * Premium shimmer skeleton loading block for comments.
 */
const CommentsSkeleton = () => {
  return (
    <div className="flex flex-col gap-4 mt-3" aria-hidden="true">
      {[1, 2, 3, 4].map((n) => (
        <div key={n} className="flex gap-2 items-start transition-colors duration-200 rounded-lg hover:bg-black/5" style={{ gap: "12px", padding: "4px 0" }}>
          {/* Avatar Skeleton */}
          <div
            className="rounded-2xl bg-gray-200 animate-pulse"
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "50%",
              flexShrink: 0
            }}
          />
          {/* Details Skeleton */}
          <div className="flex-1 min-w-0 flex flex-col gap-[2px]" style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
              {/* Nickname Skeleton */}
              <div
                className="rounded-2xl bg-gray-200 animate-pulse"
                style={{
                  width: "90px",
                  height: "14px",
                  borderRadius: "4px"
                }}
              />
              {/* Time Skeleton */}
              <div
                className="rounded-2xl bg-gray-200 animate-pulse"
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
              className="rounded-2xl bg-gray-200 animate-pulse"
              style={{
                width: "90%",
                height: "14px",
                borderRadius: "4px",
                marginTop: "2px"
              }}
            />
            {/* Content line 2 Skeleton */}
            <div
              className="rounded-2xl bg-gray-200 animate-pulse"
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
  const { t, language } = useLanguage()
  const [isPlaying, setIsPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [isSeeking, setIsSeeking] = useState(false)
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
  const { openAuthModal } = useAuthModal()

  const { data: commentsResponse, isLoading: isCommentsLoading } =
    useGetReelCommentsQuery(reel.id, { skip: !reel.id || !isActive })

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
              setIsPlaying(false)
              return
            }
            video.muted = true
            setIsPlaybackMuted(true)
            video.play()
              .then(() => setIsPlaying(true))
              .catch(() => setIsPlaying(false))
          })
      }

      const startPlayback = () => {
        if (shouldStartMuted) {
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

          video._unmuteCleanup = () => {
            document.removeEventListener("touchstart", unmuteOnInteraction, true)
            document.removeEventListener("click", unmuteOnInteraction, true)
            document.removeEventListener("scroll", unmuteOnInteraction, true)
          }
        } else {
          attemptPlay(preferredMuted)
        }
      }

      if (video.readyState >= video.HAVE_FUTURE_DATA) {
        startPlayback()
      } else {
        const onCanPlay = () => {
          video.removeEventListener("canplay", onCanPlay)
          startPlayback()
        }
        video.addEventListener("canplay", onCanPlay)
        startPlayback()

        return () => {
          video.removeEventListener("canplay", onCanPlay)
        }
      }
    } else {
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

  /* ── Actions ─────────────────────────────────────── */
  const handleLikeToggle = useCallback(async (e) => {
    e.stopPropagation()
    if (!isAuthenticated) {
      openAuthModal()
      return
    }
    try {
      await toggleLike(reel.id).unwrap()
    } catch (err) {
      console.error("Failed to toggle like", err)
    }
  }, [reel.id, isAuthenticated, toggleLike, openAuthModal])

  const handleBookmarkToggle = useCallback((e) => {
    e.stopPropagation()
    toast("This feature is not available yet.", { icon: "🚧" })
  }, [])

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

  return (
    <div className="w-full h-full flex items-center justify-center p-0 md:py-6 md:px-20 lg:py-8 lg:px-24 relative">
      <div
        ref={containerRef}
        className={`flex flex-col md:flex-row w-full h-full md:max-h-[85vh] max-w-5xl bg-white md:rounded-2xl overflow-hidden relative shadow-lg border border-gray-100 ${isFullscreen ? "!max-w-none !rounded-none !border-none !max-h-none !h-screen fixed inset-0 z-[9999] !p-0" : ""}`}
      >
        {/* Left area: dark background containing video */}
        <div className="relative shrink-0 h-[45vh] md:h-auto md:flex-1 lg:flex-[1.5] bg-[#111] flex flex-col justify-center min-w-0 group">
          {hasVideo ? (
            <>
              {/* Top bar: Volume (left) inside video container */}
              <div className="absolute top-4 left-4 z-20 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                <VolumeSlider
                  isMuted={isEffectivelyMuted}
                  volume={sharedVolume}
                  onVolumeChange={handleVolumeChange}
                  onToggleMute={handleToggleMute}
                />
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
                className="block w-full h-full object-contain bg-[#111] cursor-pointer"
              />

              {/* Play overlay — shown when paused */}
              {isActive && !isPlaying && (
                <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none transition-opacity duration-200">
                  <div
                    className="w-[60px] h-[60px] rounded-full bg-black/50 backdrop-blur-md text-white flex items-center justify-center border border-white/20 shadow-[0_4px_16px_rgba(0,0,0,0.3)] transition-transform duration-200 pointer-events-auto cursor-pointer hover:scale-110 hover:bg-black/60"
                    onClick={(e) => { e.stopPropagation(); handlePlayPause() }}
                  >
                    <Play size={32} fill="#ffffff" color="#ffffff" />
                  </div>
                </div>
              )}

              {/* Bottom controls: fullscreen (right) */}
              <div className="absolute bottom-4 right-4 z-20 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                <button
                  className="w-8 h-8 rounded-full bg-black/40 backdrop-blur-md text-white flex items-center justify-center cursor-pointer transition-colors duration-200 border-none hover:bg-black/60"
                  onClick={handleFullscreen}
                  aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
                >
                  {isFullscreen ? (
                    <Minimize size={18} color="white" />
                  ) : (
                    <Maximize size={18} color="white" />
                  )}
                </button>
              </div>

              {/* Progress bar */}
              <div
                ref={progressRef}
                className="absolute bottom-0 left-0 right-0 h-[4px] bg-white/20 cursor-pointer z-20 hover:h-[6px] transition-all group/progress"
                onMouseDown={handleProgressMouseDown}
                onClick={handleProgressClick}
                onMouseMove={(e) => {
                  const rect = progressRef.current.getBoundingClientRect()
                  const pos = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
                  const hoverTime = (videoRef.current?.duration || 0) * pos
                  const formattedTime = `${Math.floor(hoverTime / 60)}:${Math.floor(hoverTime % 60).toString().padStart(2, '0')}`
                  const tooltip = document.getElementById(`tooltip-${reel.id}`)
                  if (tooltip) {
                    tooltip.style.left = `${pos * 100}%`
                    tooltip.textContent = formattedTime
                  }
                }}
              >
                <div
                  className="absolute top-0 left-0 h-full bg-cath-red-700 transition-all duration-100 ease-linear"
                  style={{ width: `${progress}%` }}
                />
                <div
                  id={`tooltip-${reel.id}`}
                  className="absolute bottom-full mb-2 opacity-0 group-hover/progress:opacity-100 bg-black/80 text-white text-[11px] px-1.5 py-0.5 rounded pointer-events-none transition-opacity -translate-x-1/2 whitespace-nowrap"
                />
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center text-gray-500 text-sm p-10">
              <span>No reel available</span>
            </div>
          )}
        </div>

        {/* Right panel: info + comments */}
        <div className="flex flex-col w-full md:w-[340px] lg:w-[380px] shrink-0 h-auto md:h-full overflow-y-auto border-l-0 md:border-l border-gray-100">
          {/* Top Header & Details (ReelCaption) */}
          <ReelCaption reel={reel} />

          {/* Comments List */}
          <div className={`flex-1 overflow-y-auto px-4 bg-white border-b border-gray-100 ${showComments ? "block" : "hidden md:block"}`}>
            <h3 className="text-[13px] font-semibold text-gray-500 py-3 sticky top-0 bg-white z-10 border-b border-gray-100 mb-3 flex justify-between items-center">
              <span>{formatCompactNumber(reel.comments, language)} {t?.catSpeak?.reels?.detail?.commentsTotal || "comments in total"}</span>
              <button
                className="md:hidden p-1 bg-gray-100 rounded-full cursor-pointer border-none"
                onClick={() => setShowComments(false)}
              >
                <X size={16} className="text-gray-600" />
              </button>
            </h3>

            {isCommentsLoading ? (
              <CommentsSkeleton />
            ) : comments.length === 0 ? (
              <p className="text-gray-400 text-center text-[13px] my-10">{t?.catSpeak?.reels?.detail?.beFirstToComment || "Be the first to comment."}</p>
            ) : (
              <div className="flex flex-col gap-4 pb-4">
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

          {/* Action Bar (Like, Bookmark, Message, Share) */}
          <div className="bg-white p-3 flex items-center justify-between shrink-0">
            <div className="flex items-center w-full min-w-0 gap-2">
              <form onSubmit={handlePostComment} className="flex flex-1 min-w-0 items-center bg-[#f3f4f6] rounded-full px-4 py-2">
                <input
                  ref={commentInputRef}
                  type="text"
                  placeholder={
                    !isAuthenticated
                      ? (t?.catSpeak?.reels?.detail?.signInToComment || "Sign in to comment...")
                      : replyTarget
                        ? `${t?.catSpeak?.reels?.detail?.replyTo || "Reply to"} @${replyTarget.username}...`
                        : (t?.catSpeak?.reels?.detail?.comment || "Comment")
                  }
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  className="w-full bg-transparent border-none text-[14px] outline-none text-gray-800 placeholder-gray-500 min-w-0"
                  disabled={isAuthenticated && isPostingComment}
                  readOnly={!isAuthenticated}
                  onClick={() => {
                    if (!isAuthenticated) {
                      openAuthModal()
                    }
                  }}
                />
                {isAuthenticated && commentText.trim() && (
                  <button
                    type="submit"
                    disabled={isPostingComment}
                    className="bg-transparent border-none text-cath-red-700 font-semibold text-[14px] cursor-pointer ml-2"
                  >
                    {isPostingComment ? <Loader2 className="h-4 w-4 animate-spin" /> : (t?.catSpeak?.reels?.detail?.send || "Send")}
                  </button>
                )}
              </form>

              <div className="flex items-center gap-1 shrink-0">
                <button onClick={handleLikeToggle} className="p-2 cursor-pointer rounded-full hover:bg-gray-100 flex items-center gap-1 group border-none bg-transparent outline-none">
                  <Heart size={22} className={reel.isLiked ? "text-[#e11d48] fill-[#e11d48]" : "text-gray-700"} />
                  <span className="text-[12px] font-semibold text-gray-700 group-hover:text-black">{formatCompactNumber(reel.likes, language)}</span>
                </button>
                <button
                  onClick={handleBookmarkToggle}
                  className="p-2 cursor-pointer rounded-full hover:bg-gray-100 flex items-center gap-1 group border-none bg-transparent outline-none"
                >
                  <Bookmark size={22} className="text-gray-700" />
                  <span className="text-[12px] font-semibold text-gray-700 group-hover:text-black">{formatCompactNumber(reel.shares || 0, language)}</span>
                </button>
                <button 
                  onClick={(e) => {
                    e.stopPropagation()
                    toast("This feature is not available yet.", { icon: "🚧" })
                  }}
                  className="p-2 cursor-pointer rounded-full hover:bg-gray-100 flex items-center group border-none bg-transparent outline-none"
                >
                  <Share size={22} className="text-gray-700" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
})

export default ReelDetailSlide
