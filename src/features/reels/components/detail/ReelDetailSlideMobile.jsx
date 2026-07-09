import React, { useState, useCallback, useMemo, useRef, useEffect } from "react";
import { useSelector } from "react-redux";
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
  ChevronLeft,
} from "lucide-react";
import Avatar from "@/shared/components/ui/Avatar";
import ReelMoreMenu from "./ReelMoreMenu";
import toast from "react-hot-toast";
import { BookmarkModal, ShareModal, NotInterestedModal, AboutAccountModal, ReportReelModal } from "../modals/ReelInteractionsModals";

import { useLanguage } from "@/shared/context/LanguageContext";
import { useGetReelCommentsQuery } from "@/store/api/reelsApi";
import { useReelInteractions } from "../../hooks/useReelInteractions";
import { useVideoPlayback } from "../../hooks/useVideoPlayback";
import { useAuthModal } from "@/shared/context/AuthModalContext";
import {
  selectCurrentUser,
  selectIsAuthenticated,
} from "@/store/slices/authSlice";
import { formatCompactNumber } from "../../utils/formatters";
import CommentItemNode from "./CommentItemNode";
import ReelCaption from "./ReelCaption";
import CommentsSkeleton from "./CommentsSkeleton";
import VolumeSlider from "./VolumeSlider";

const formatVideoTime = (seconds) => {
  if (isNaN(seconds)) return "00:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
};

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
  const commentInputRef = useRef(null);
  const longPressTimerRef = useRef(null);
  const hasLongPressedRef = useRef(false);

  /* ── Redux/API Hooks ────────────────────────────── */
  const currentUser = useSelector(selectCurrentUser);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const { openAuthModal } = useAuthModal();

  const {
    videoRef,
    progressRef,
    isPlaying,
    setIsPlaying,
    progress,
    currentTime,
    duration,
    isSeeking,
    hasVideo,
    isEffectivelyMuted,
    handlePlayPause,
    handleToggleMute,
    handleTimeUpdate,
    handleProgressMouseDown,
  } = useVideoPlayback({
    reel,
    isActive,
    sharedMuted,
    setSharedMuted,
    sharedVolume,
    setSharedVolume,
    hasUserInteracted,
    shouldPreload,
  });

  /* ── State ──────────────────────────────────────── */
  const { t, language } = useLanguage();
  const [commentText, setCommentText] = useState("");
  const [replyTarget, setReplyTarget] = useState(null);
  const [isInputModalOpen, setIsInputModalOpen] = useState(false);
  const [viewportOffset, setViewportOffset] = useState(0);
  const [showMoreMenu, setShowMoreMenu] = useState(false);

  const [isBookmarkOpen, setIsBookmarkOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isNotInterestedOpen, setIsNotInterestedOpen] = useState(false);
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);

  const handleActionClick = useCallback((actionKey) => {
    setShowMoreMenu(false);
    if (actionKey === "copyLink") {
      navigator.clipboard.writeText(`${window.location.origin}/reels/${reel.id}`);
      toast.success("Đã sao chép liên kết!");
      return;
    }

    if (!isAuthenticated) {
      openAuthModal();
      return;
    }

    if (actionKey === "report") setIsReportOpen(true);
    else if (actionKey === "notInterested") setIsNotInterestedOpen(true);
    else if (actionKey === "addToPlaylist" || actionKey === "saveReel") setIsBookmarkOpen(true);
    else if (actionKey === "aboutAccount") setIsAboutOpen(true);
  }, [reel.id, isAuthenticated, openAuthModal]);

  // Track iOS Safari visual viewport offset to counteract keyboard push-up
  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return;
    const handler = () => {
      setViewportOffset(vv.offsetTop);
    };
    vv.addEventListener("resize", handler);
    vv.addEventListener("scroll", handler);
    return () => {
      vv.removeEventListener("resize", handler);
      vv.removeEventListener("scroll", handler);
    };
  }, []);

  const {
    handleLike,
    handleCommentSubmit,
    handleCommentDelete,
    isPostingComment,
  } = useReelInteractions({
    reel,
    isAuthenticated,
    openAuthModal,
    t,
    currentUser,
  });

  const { data: commentsResponse, isLoading: isCommentsLoading } =
    useGetReelCommentsQuery(reel.id, { skip: !reel.id || !isActive });

  const comments = useMemo(() => {
    if (!commentsResponse) return [];
    return commentsResponse.data !== undefined
      ? commentsResponse.data
      : Array.isArray(commentsResponse)
        ? commentsResponse
        : [];
  }, [commentsResponse]);

  /* ── Actions ─────────────────────────────────────── */
  const handleLikeToggle = (e) => {
    e.stopPropagation();
    handleLike();
  };

  const handleBookmarkToggle = useCallback((e) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      openAuthModal();
      return;
    }
    setIsBookmarkOpen(true);
  }, [isAuthenticated, openAuthModal])

  const handleReply = useCallback((target) => {
    setReplyTarget(target);
    if (commentInputRef.current) {
      commentInputRef.current.focus();
    }
  }, []);

  const handleDelete = (commentId) => handleCommentDelete(commentId);

  const handlePostComment = (e) => {
    e.preventDefault();
    handleCommentSubmit(commentText, replyTarget, () => {
      setCommentText("");
      setReplyTarget(null);
      setIsInputModalOpen(false);
      setShowComments(true);
    });
  };

  const handlePointerDown = useCallback((e) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    hasLongPressedRef.current = false;
    longPressTimerRef.current = setTimeout(() => {
      hasLongPressedRef.current = true;
      setShowMoreMenu(true);
      longPressTimerRef.current = null;
    }, 500);
  }, []);

  const handlePointerUpOrMove = useCallback(() => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  }, []);

  const handleOpenInput = useCallback(() => {
    if (!isAuthenticated) {
      openAuthModal();
      return;
    }
    setIsInputModalOpen(true);
    if (commentInputRef.current) {
      commentInputRef.current.focus();
    }
  }, [isAuthenticated, openAuthModal]);

  /* Focus is handled synchronously in handleOpenInput for iOS Safari support */

  return (
    <div className="w-full h-full relative bg-black flex flex-col justify-center overflow-hidden select-none">
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
            onPointerDown={handlePointerDown}
            onPointerUp={handlePointerUpOrMove}
            onPointerMove={handlePointerUpOrMove}
            onPointerCancel={handlePointerUpOrMove}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            onTimeUpdate={handleTimeUpdate}
            className="w-full h-full object-contain"
          />

          {/* Top Header: Back Button & Volume Control */}
          <div className="absolute top-6 left-4 z-20">
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (typeof onClose === "function") onClose();
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
              {isEffectivelyMuted ? (
                <VolumeX size={20} color="white" />
              ) : (
                <Volume2 size={20} color="white" />
              )}
            </button>
          </div>

          {/* Bottom Left Info Overlay */}
          <div className="absolute bottom-0 left-0 w-full p-4 pb-8 z-20 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex items-end">
            <div className="w-[calc(100%-60px)] pr-2">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-white font-bold text-[16px]">
                  @{reel.author?.name}
                </span>
                {reel.author?.verified && (
                  <svg
                    className="w-4 h-4 text-[#3b82f6] drop-shadow-sm"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                  </svg>
                )}
              </div>
              {reel.description && (
                <p className="text-white text-[14px] line-clamp-3 break-words mb-2">
                  {reel.description}
                </p>
              )}
              {reel.tags && reel.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-1">
                  {reel.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-white/90 font-medium text-[14px]"
                    >
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
              <Avatar
                size={48}
                src={reel.author?.avatarUrl}
                name={reel.author?.name}
                className="border-2 border-white rounded-full shadow-lg"
              />
            </div>

            <button
              onClick={handleLikeToggle}
              className="flex flex-col items-center gap-1 group bg-transparent border-none"
            >
              <div className="w-[45px] h-[45px] rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center">
                <Heart
                  size={24}
                  className={
                    reel.isLiked
                      ? "text-[#e11d48] fill-[#e11d48]"
                      : "text-white"
                  }
                />
              </div>
              <span className="text-white text-[12px] font-semibold drop-shadow-md">
                {formatCompactNumber(reel.likes, language)}
              </span>
            </button>

            <button
              onClick={() => setShowComments(true)}
              className="flex flex-col items-center gap-1 group bg-transparent border-none"
            >
              <div className="w-[45px] h-[45px] rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center">
                <MessageCircle size={24} className="text-white" />
              </div>
              <span className="text-white text-[12px] font-semibold drop-shadow-md">
                {formatCompactNumber(reel.comments, language)}
              </span>
            </button>

            <button
              onClick={handleBookmarkToggle}
              className="flex flex-col items-center gap-1 group bg-transparent border-none"
            >
              <div className="w-[45px] h-[45px] rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center">
                <Bookmark size={24} className="text-white" />
              </div>
              <span className="text-white text-[12px] font-semibold drop-shadow-md">
                {formatCompactNumber(reel.shares || 0, language)}
              </span>
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsShareOpen(true);
              }}
              className="flex flex-col items-center gap-1 group bg-transparent border-none"
            >
              <div className="w-[45px] h-[45px] rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center">
                <Share size={24} className="text-white" />
              </div>
            </button>
          </div>

          {/* Progress bar */}
          <div
            ref={progressRef}
            onPointerDown={handleProgressMouseDown}
            className={`absolute bottom-1.5 left-0 right-0 ${
              isSeeking ? "h-[6px]" : "h-[3px]"
            } bg-white/20 z-20 cursor-pointer group transition-all duration-200 touch-none`}
          >
            <div className="absolute -inset-y-4 inset-x-0" />{" "}
            {/* Larger hit area for touch */}
            <div
              className={`h-full bg-[#e11d48] relative ${
                isSeeking ? "" : "transition-all duration-100 ease-linear"
              }`}
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Time Display (shows when seeking) */}
          <div
            className={`absolute bottom-8 left-1/2 -translate-x-1/2 z-20 pointer-events-none transition-opacity duration-200 ${
              isSeeking ? "opacity-100" : "opacity-0"
            }`}
          >
            <div className="bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-lg text-white font-bold text-[18px] tracking-wide shadow-lg">
              {formatVideoTime(currentTime)}{" "}
              <span className="text-white/60 text-[15px]">
                / {formatVideoTime(duration)}
              </span>
            </div>
          </div>

          {/* Play Overlay */}
          {isActive && !isPlaying && (
            <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none transition-opacity duration-200">
              <div
                className="w-[70px] h-[70px] rounded-full bg-black/40 backdrop-blur-md text-white flex items-center justify-center border border-white/20 shadow-[0_4px_16px_rgba(0,0,0,0.3)] transition-transform duration-200 pointer-events-auto cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  handlePlayPause();
                }}
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

      {/* Backdrop for Comments Drawer */}
      {showComments && isActive && (
        <div
          className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm transition-opacity duration-300"
          onClick={() => setShowComments(false)}
        />
      )}

      {/* Slide-up Comments Drawer */}
      <div
        className={`fixed inset-x-0 bottom-0 z-[70] bg-white rounded-t-3xl shadow-2xl transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] flex flex-col ${
          showComments && isActive ? "translate-y-0" : "translate-y-full"
        }`}
        style={{
          height: "65vh",
          transform:
            showComments && isActive
              ? `translateY(${viewportOffset}px)`
              : "translateY(100%)",
        }}
      >
        <div className="flex items-center justify-center py-2 shrink-0">
          <div className="w-10 h-1.5 bg-gray-300 rounded-full" />
        </div>
        <div className="flex items-center justify-between px-4 pb-3 border-b border-gray-100 shrink-0">
          <h3 className="text-[15px] font-bold text-gray-800">
            {formatCompactNumber(reel.comments, language)}{" "}
            {t?.catSpeak?.reels?.detail?.commentsTotal || "bình luận"}
          </h3>
          <button
            onClick={() => setShowComments(false)}
            className="p-1.5 bg-gray-100 rounded-full border-none cursor-pointer hover:bg-gray-200"
          >
            <X size={18} className="text-gray-600" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto overscroll-y-contain px-4 py-2">
          {isCommentsLoading ? (
            <CommentsSkeleton />
          ) : comments.length === 0 ? (
            <p className="text-gray-400 text-center text-[13px] my-10">
              {t?.catSpeak?.reels?.detail?.beFirstToComment ||
                "Be the first to comment."}
            </p>
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

        {/* Fake Comment Input (Triggers Modal) */}
        <div className="bg-white border-t border-gray-100 p-3 pb-safe shrink-0 w-full shadow-[0_-4px_12px_rgba(0,0,0,0.05)] z-[60] mt-auto">
          <div onClick={handleOpenInput} className="flex items-center gap-3">
            <Avatar
              size={36}
              src={currentUser?.avatarUrl}
              name={currentUser?.name}
              className="shrink-0"
            />
            <div className="flex-1 bg-[#f1f1f2] rounded-full px-4 py-2.5 cursor-text">
              <span className="text-[14px] text-gray-500">
                {!isAuthenticated
                  ? t?.catSpeak?.reels?.detail?.signInToComment ||
                    "Đăng nhập để bình luận..."
                  : replyTarget
                    ? `${t?.catSpeak?.reels?.detail?.replyTo || "Trả lời"} @${replyTarget.username}...`
                    : t?.catSpeak?.reels?.detail?.comment ||
                      "Thêm bình luận..."}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Active TikTok-style Comment Input Bar (Always rendered to support instant iOS focus) */}
      <div
        className={`fixed inset-0 z-[90] bg-transparent touch-none ${isInputModalOpen ? "block" : "hidden"}`}
        onClick={() => setIsInputModalOpen(false)}
      />
      <div
        className={`fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 p-2 pb-safe z-[100] shadow-[0_-10px_20px_rgba(0,0,0,0.08)] flex items-center gap-3 transition-transform duration-200 ${isInputModalOpen ? "translate-y-0" : "translate-y-[150%]"}`}
      >
        <Avatar
          size={36}
          src={currentUser?.avatarUrl}
          name={currentUser?.name}
          className="shrink-0"
        />
        <form
          onSubmit={handlePostComment}
          className="flex-1 flex items-center bg-[#f1f1f2] rounded-full px-4 py-1.5"
        >
          <input
            ref={commentInputRef}
            type="text"
            placeholder={
              t?.catSpeak?.reels?.detail?.comment || "Thêm bình luận..."
            }
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            className="w-full bg-transparent border-none text-[16px] outline-none text-gray-800 placeholder-gray-500 min-w-0 h-8"
            disabled={isPostingComment}
            onBlur={() => {
              setTimeout(() => {
                window.scrollTo(0, 0);
                document.body.scrollTop = 0;
              }, 100);
            }}
          />
          <button
            type="submit"
            disabled={isPostingComment || !commentText.trim()}
            className="ml-2 w-7 h-7 rounded-full bg-cath-red-700 text-white flex items-center justify-center shrink-0 border-none disabled:opacity-50 disabled:bg-gray-300 transition-colors"
          >
            {isPostingComment ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : (
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 19V5M5 12l7-7 7 7" />
              </svg>
            )}
          </button>
        </form>
      </div>

      {/* Long Press Modal Menu */}
      <ReelMoreMenu
        isMobile
        showMenu={showMoreMenu}
        onClose={() => setShowMoreMenu(false)}
        onActionClick={handleActionClick}
      />

      {/* Render Reels Modals */}
      <BookmarkModal isOpen={isBookmarkOpen} onClose={() => setIsBookmarkOpen(false)} reelId={reel.id} />
      <ShareModal isOpen={isShareOpen} onClose={() => setIsShareOpen(false)} reel={reel} />
      <NotInterestedModal isOpen={isNotInterestedOpen} onClose={() => setIsNotInterestedOpen(false)} reel={reel} />
      <AboutAccountModal isOpen={isAboutOpen} onClose={() => setIsAboutOpen(false)} accountId={reel.accountId} />
      <ReportReelModal isOpen={isReportOpen} onClose={() => setIsReportOpen(false)} reelId={reel.id} />
    </div>
  );
});

export default ReelDetailSlideMobile;
