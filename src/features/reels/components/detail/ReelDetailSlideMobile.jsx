import React, { useState, useRef, useCallback, useEffect, useMemo } from "react"
import { useSelector } from "react-redux"
import {
  X, Play, Heart, MessageCircle, Share, Bookmark, VolumeX, Volume1, Volume2, Maximize, Minimize, Loader2, ChevronLeft
} from "lucide-react"
import Avatar from "@/shared/components/ui/Avatar"
import ReelMoreMenu from "./ReelMoreMenu"
import useFullscreen from "../../hooks/useFullscreen"
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
const ReelDetailSlideMobile = React.memo(function ReelDetailSlideMobile({
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
    handleProgressClick(e.nativeEvent || e)

    const handlePointerMove = (ev) => {
      if (ev.touches && ev.touches.length > 0) {
        handleProgressClick(ev.touches[0])
      } else {
        handleProgressClick(ev)
      }
    }
    const handlePointerUp = () => {
      setIsSeeking(false)
      window.removeEventListener("pointermove", handlePointerMove)
      window.removeEventListener("pointerup", handlePointerUp)
      window.removeEventListener("pointercancel", handlePointerUp)
      window.removeEventListener("touchmove", handlePointerMove)
      window.removeEventListener("touchend", handlePointerUp)
    }
    window.addEventListener("pointermove", handlePointerMove)
    window.addEventListener("pointerup", handlePointerUp)
    window.addEventListener("pointercancel", handlePointerUp)
    window.addEventListener("touchmove", handlePointerMove, { passive: false })
    window.addEventListener("touchend", handlePointerUp)
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
    if (!isAuthenticated) {
      openAuthModal()
      return
    }
    alert("Bookmark feature coming soon!")
  }, [isAuthenticated, openAuthModal])

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
    <div className="w-full h-full relative bg-black flex flex-col justify-center overflow-hidden touch-none select-none">
      {hasVideo ? (
        <>
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
            className="w-full h-full object-cover"
          />

          {/* Top Header: Back Button & Volume Control */}
          <div className="absolute top-6 left-4 z-20">
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (typeof onClose === 'function') onClose();
              }}
              className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center border-none transition-all active:scale-95"
            >
              <ChevronLeft size={24} color="white" />
            </button>
          </div>

          <div className="absolute top-6 right-4 z-20">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleToggleMute(e);
              }}
              className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center border-none transition-all active:scale-95"
            >
              {isEffectivelyMuted ? <VolumeX size={20} color="white" /> : <Volume2 size={20} color="white" />}
            </button>
          </div>

          {/* Bottom Left Info Overlay */}
          <div className="absolute bottom-0 left-0 w-full p-4 pb-8 z-20 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex items-end">
            <div className="w-[calc(100%-60px)] pr-2">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-white font-bold text-[16px]">@{reel.author?.name}</span>
                {reel.author?.verified && (
                  <svg className="w-4 h-4 text-[#3b82f6] drop-shadow-sm" viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" /></svg>
                )}
              </div>
              <p className="text-white text-[14px] line-clamp-3 break-words mb-2">
                {reel.description}
              </p>
              {reel.tags && reel.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-1">
                  {reel.tags.map((tag) => (
                    <span key={tag} className="text-white/90 font-medium text-[14px]">
                      {tag.startsWith("#") ? tag : `#${tag}`}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Action Buttons Overlay */}
          <div className="absolute bottom-12 right-2 z-20 flex flex-col items-center gap-5">
            <div className="relative mb-2">
              <Avatar size={48} src={reel.author?.avatarUrl} name={reel.author?.name} className="border-2 border-white rounded-full shadow-lg" />

            </div>
            
            <button onClick={handleLikeToggle} className="flex flex-col items-center gap-1 group bg-transparent border-none">
              <div className="w-[45px] h-[45px] rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center">
                <Heart size={24} className={reel.isLiked ? "text-[#e11d48] fill-[#e11d48]" : "text-white"} />
              </div>
              <span className="text-white text-[12px] font-semibold drop-shadow-md">{formatCompactNumber(reel.likes, language)}</span>
            </button>
            
            <button onClick={() => setShowComments(true)} className="flex flex-col items-center gap-1 group bg-transparent border-none">
              <div className="w-[45px] h-[45px] rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center">
                <MessageCircle size={24} className="text-white" />
              </div>
              <span className="text-white text-[12px] font-semibold drop-shadow-md">{formatCompactNumber(reel.comments, language)}</span>
            </button>
            
            <button onClick={handleBookmarkToggle} className="flex flex-col items-center gap-1 group bg-transparent border-none">
              <div className="w-[45px] h-[45px] rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center">
                <Bookmark size={24} className="text-white" />
              </div>
              <span className="text-white text-[12px] font-semibold drop-shadow-md">{formatCompactNumber(reel.shares || 0, language)}</span>
            </button>
            
            <button className="flex flex-col items-center gap-1 group bg-transparent border-none">
              <div className="w-[45px] h-[45px] rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center">
                <Share size={24} className="text-white" />
              </div>
            </button>
          </div>

          {/* Progress bar */}
          <div 
            ref={progressRef}
            onPointerDown={handleProgressMouseDown}
            className="absolute bottom-0 left-0 right-0 h-[3px] bg-white/20 z-20 cursor-pointer group"
          >
            <div className="absolute -inset-y-2 inset-x-0" /> {/* Larger hit area for touch */}
            <div className="h-full bg-white transition-all duration-100 ease-linear group-active:bg-cath-red-600" style={{ width: `${progress}%` }} />
          </div>

          {/* Play Overlay */}
          {isActive && !isPlaying && (
            <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none transition-opacity duration-200">
              <div
                className="w-[70px] h-[70px] rounded-full bg-black/40 backdrop-blur-md text-white flex items-center justify-center border border-white/20 shadow-[0_4px_16px_rgba(0,0,0,0.3)] transition-transform duration-200 pointer-events-auto cursor-pointer"
                onClick={(e) => { e.stopPropagation(); handlePlayPause() }}
              >
                <Play size={36} fill="#ffffff" color="#ffffff" />
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="flex items-center justify-center text-white text-sm p-10">
          <span>No reel available</span>
        </div>
      )}

      {/* Slide-up Comments Drawer */}
      <div className={`absolute bottom-0 left-0 w-full h-[70vh] bg-white rounded-t-[20px] z-50 transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] ${showComments ? "translate-y-0" : "translate-y-full"} flex flex-col shadow-[0_-4px_24px_rgba(0,0,0,0.2)]`}>
        <div className="flex items-center justify-center py-2 shrink-0">
          <div className="w-10 h-1.5 bg-gray-300 rounded-full" />
        </div>
        <div className="flex items-center justify-between px-4 pb-3 border-b border-gray-100 shrink-0">
          <h3 className="text-[15px] font-bold text-gray-800">
            {formatCompactNumber(reel.comments, language)} {t?.catSpeak?.reels?.detail?.commentsTotal || "bình luận"}
          </h3>
          <button onClick={() => setShowComments(false)} className="p-1.5 bg-gray-100 rounded-full border-none cursor-pointer hover:bg-gray-200">
            <X size={18} className="text-gray-600" />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto px-4 py-2">
          {isCommentsLoading ? (
            <CommentsSkeleton />
          ) : comments.length === 0 ? (
            <p className="text-gray-400 text-center text-[13px] my-10">{t?.catSpeak?.reels?.detail?.beFirstToComment || "Be the first to comment."}</p>
          ) : (
            <div className="flex flex-col gap-4 pb-20">
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

        {/* Comment Input */}
        <div className="bg-white border-t border-gray-100 p-3 pb-safe shrink-0 absolute bottom-0 left-0 w-full shadow-[0_-4px_12px_rgba(0,0,0,0.05)] z-[60]">
          <form onSubmit={handlePostComment} className="flex items-center bg-[#f3f4f6] rounded-full px-4 py-2.5">
            <input
              ref={commentInputRef}
              type="text"
              placeholder={!isAuthenticated ? (t?.catSpeak?.reels?.detail?.signInToComment || "Đăng nhập để bình luận...") : replyTarget ? `${t?.catSpeak?.reels?.detail?.replyTo || "Trả lời"} @${replyTarget.username}...` : (t?.catSpeak?.reels?.detail?.comment || "Thêm bình luận...")}
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              className="w-full bg-transparent border-none text-[14px] outline-none text-gray-800 placeholder-gray-500 min-w-0"
              disabled={isAuthenticated && isPostingComment}
              readOnly={!isAuthenticated}
              onClick={() => { if (!isAuthenticated) openAuthModal() }}
            />
            {isAuthenticated && commentText.trim() && (
              <button type="submit" disabled={isPostingComment} className="bg-transparent border-none text-cath-red-700 font-bold text-[14px] ml-2 shrink-0 cursor-pointer">
                {isPostingComment ? <Loader2 className="h-4 w-4 animate-spin" /> : (t?.catSpeak?.reels?.detail?.send || "Gửi")}
              </button>
            )}
          </form>
        </div>
      </div>
    </div>
  )
})

export default ReelDetailSlideMobile
