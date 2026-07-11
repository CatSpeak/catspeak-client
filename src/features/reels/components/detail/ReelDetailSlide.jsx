import React, { useState, useRef, useCallback, useMemo } from "react"
import { useSelector } from "react-redux"
import {
  X, Play, Heart, MessageCircle, Share, Bookmark, VolumeX, Volume1, Volume2, Maximize, Minimize, Loader2
} from "lucide-react"
import Avatar from "@/shared/components/ui/Avatar"
import ReelMoreMenu from "./ReelMoreMenu"
import ReelPlaylistModal from "../modals/ReelPlaylistModal"
import useFullscreen from "../../hooks/useFullscreen"
import toast from "react-hot-toast"
import { useLanguage } from "@/shared/context/LanguageContext"
import { useGetReelCommentsQuery, useGetAllBookmarkedReelsQuery, useBookmarkReelMutation } from "@/store/api/reelsApi"
import { useReelInteractions } from "../../hooks/useReelInteractions"
import { useVideoPlayback } from "../../hooks/useVideoPlayback"
import { useAuthModal } from "@/shared/context/AuthModalContext"
import { selectCurrentUser, selectIsAuthenticated } from "@/store/slices/authSlice"
import { formatCompactNumber } from "../../utils/formatters"
import CommentItemNode from "./CommentItemNode"
import VolumeSlider from "./VolumeSlider"
import ReelCaption from "./ReelCaption"
import CommentsSkeleton from "./CommentsSkeleton"



/**
 * Individual full-screen Reel Slide rendered in the Vertical Snapper.
 * Encapsulates playback states, isolation, progress controls, volume preferences,
 * and the sliding Comments Drawers to avoid DOM overlap conflicts.
 */
const ReelDetailSlide = React.memo(function ReelDetailSlide({
  reel,
  isActive,
  shouldPreload = false,
  sharedMuted,
  setSharedMuted,
  sharedVolume,
  setSharedVolume,
  hasUserInteracted,
  showComments,
  setShowComments,
}) {
  /* ── Refs ───────────────────────────────────────── */
  const commentInputRef = useRef(null)

  /* ── State ──────────────────────────────────────── */
  const { t, language } = useLanguage()
  const [commentText, setCommentText] = useState("")
  const [showPlaylistModal, setShowPlaylistModal] = useState(false)
  const [replyTarget, setReplyTarget] = useState(null)
  const { isFullscreen, toggleFullscreen } = useFullscreen()

  const {
    videoRef, progressRef, containerRef, isPlaying, setIsPlaying,
    progress, hasVideo, isEffectivelyMuted,
    handlePlayPause, handleToggleMute, handleVolumeChange,
    handleTimeUpdate, handleProgressClick, handleProgressMouseDown,
  } = useVideoPlayback({
    reel, isActive, sharedMuted, setSharedMuted, sharedVolume, setSharedVolume,
    hasUserInteracted, shouldPreload,
  })

  /* ── Redux/API Hooks ────────────────────────────── */
  const currentUser = useSelector(selectCurrentUser)
  const isAuthenticated = useSelector(selectIsAuthenticated)
  const { openAuthModal } = useAuthModal()
  
  const { data: bookmarkedReels } = useGetAllBookmarkedReelsQuery(undefined, { skip: !isAuthenticated })
  const isBookmarked = reel.isBookmarked || (bookmarkedReels?.some(b => String(b.reelId) === String(reel.id)) ?? false)

  const { handleLike, handleShare, handleCommentSubmit, handleCommentDelete, isPostingComment } = useReelInteractions({
    reel,
    isAuthenticated,
    openAuthModal,
    t,
    currentUser
  })

  const { data: commentsResponse, isLoading: isCommentsLoading } =
    useGetReelCommentsQuery(reel.id, { skip: !reel.id })

  const comments = useMemo(() => {
    if (!commentsResponse) return []
    return commentsResponse.data !== undefined
      ? commentsResponse.data
      : Array.isArray(commentsResponse)
        ? commentsResponse
        : []
  }, [commentsResponse])


  /* ── Fullscreen ─────────────────────────────────── */
  const handleFullscreen = useCallback((e) => {
    e.stopPropagation()
    toggleFullscreen(containerRef.current)
  }, [toggleFullscreen, containerRef])

  const handleLikeToggle = (e) => {
    e.stopPropagation()
    handleLike()
  }

  const [bookmarkReel] = useBookmarkReelMutation()

  const handleBookmarkToggle = async (e) => {
    e.stopPropagation()
    if (!isAuthenticated) return openAuthModal()
    
    if (isBookmarked) {
      // Find the reel in bookmarkedReels to get its playlist IDs
      const bookmarkedItem = bookmarkedReels?.find(b => String(b.reelId) === String(reel.id))
      if (bookmarkedItem && bookmarkedItem.__playlistIds) {
        try {
          const promises = bookmarkedItem.__playlistIds.map(pid => 
            bookmarkReel({ reelId: reel.id, playlistId: pid }).unwrap()
          )
          await Promise.all(promises)
          toast.success(t?.catSpeak?.reels?.detail?.moreMenu?.removedFromPlaylist || "Đã gỡ khỏi Bookmark")
        } catch {
          toast.error(t?.catSpeak?.reels?.detail?.errorBookmark || "Có lỗi xảy ra")
        }
      } else {
        // Fallback: just unbookmark from default
        try {
          await bookmarkReel({ reelId: reel.id }).unwrap()
        } catch {}
      }
    } else {
      setShowPlaylistModal(true)
    }
  }

  const handleReply = useCallback((target) => {
    setReplyTarget(target)
    if (commentInputRef.current) {
      commentInputRef.current.focus()
    }
  }, [])

  const handleDelete = (commentId) => handleCommentDelete(commentId)

  const handlePostComment = (e) => {
    e.preventDefault()
    handleCommentSubmit(commentText, replyTarget, () => {
      setCommentText("")
      setReplyTarget(null)
    })
  }

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
                  <Bookmark 
                    size={22} 
                    className={isBookmarked ? "text-[#fbbf24]" : "text-gray-700"}
                    fill={isBookmarked ? "currentColor" : "none"}
                  />
                </button>
                <button 
                  onClick={(e) => {
                    e.stopPropagation()
                    handleShare()
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
      
      {showPlaylistModal && (
        <ReelPlaylistModal
          reelId={reel.id}
          onClose={() => setShowPlaylistModal(false)}
        />
      )}
    </div>
  )
})

export default ReelDetailSlide
