import React, { useState, useRef, useEffect } from "react"
import { MessageSquare, ThumbsUp } from "lucide-react"
import { useLanguage } from "@/shared/context/LanguageContext"
import ReactionsPopover from "@/shared/components/ui/ReactionsPopover"
import { ReactionBadge, NEWS_REACTIONS } from "./ReactionBadge"
import ReactionStackedBadges from "./ReactionStackedBadges"
import {
  normalizeReactions,
  getTotalReactionsCount,
} from "../utils/reactionUtils"
import { useGetPostReactionsQuery } from "@/store/api/social/postsApi"

const NewsDetailActionBar = ({
  newsItem,
  reactions: propReactions,
  handleReact,
  handleShare,
  onCommentClick,
}) => {
  const { t } = useLanguage()
  const [showReactions, setShowReactions] = useState(false)
  const holdTimer = useRef(null)
  const closeTimer = useRef(null)

  const postId = newsItem?.postId
  const { data: fetchedReactions } = useGetPostReactionsQuery(postId, {
    skip: !postId || Boolean(propReactions),
  })
  const reactions = propReactions || fetchedReactions

  const handleMouseEnter = () => {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current)
      closeTimer.current = null
    }
    setShowReactions(true)
  }

  const handleMouseLeave = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current)
    closeTimer.current = setTimeout(() => {
      setShowReactions(false)
    }, 200)
  }

  const handleTouchStart = () => {
    holdTimer.current = setTimeout(() => setShowReactions(true), 400)
  }

  const handleTouchEnd = () => {
    if (holdTimer.current) clearTimeout(holdTimer.current)
  }

  const handleSelectReaction = (type) => {
    if (closeTimer.current) clearTimeout(closeTimer.current)
    setShowReactions(false)
    handleReact?.(type)
  }

  const handleCloseReactions = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current)
    setShowReactions(false)
  }

  useEffect(() => {
    return () => {
      if (holdTimer.current) clearTimeout(holdTimer.current)
      if (closeTimer.current) clearTimeout(closeTimer.current)
    }
  }, [])

  const getReactionLabel = () => {
    if (newsItem?.currentUserReaction === "Love")
      return t.news?.newsDetail?.love || "Yêu"
    if (newsItem?.currentUserReaction === "Haha")
      return t.news?.newsDetail?.haha || "Haha"
    return t.news?.newsDetail?.like || "Thích"
  }

  const normalized = normalizeReactions(reactions)
  const totalReactions = getTotalReactionsCount(
    normalized,
    newsItem?.totalReactions !== undefined && newsItem?.totalReactions !== null
      ? newsItem.totalReactions
      : 0,
  )
  const totalComments = newsItem?.totalComments ?? newsItem?.commentCount ?? 0
  const shareCount = newsItem?.totalShares ?? newsItem?.shareCount ?? 0

  const onShareClick = (e) => {
    if (handleShare) {
      handleShare(e)
      return
    }

    if (navigator.share) {
      navigator
        .share({
          title: newsItem?.title || "CatSpeak",
          text: newsItem?.excerpt || newsItem?.title || "",
          url: window.location.href,
        })
        .catch((err) => {
          if (err?.name !== "AbortError") {
            console.error("Error sharing:", err)
          }
        })
    }
  }

  return (
    <div className="flex flex-col">
      {/* ── Stats row: Stacked reaction badges on the right (matching ProfilePostCard) ── */}
      <div className="flex items-center justify-end text-sm text-secondary dark:text-[#AAAAAA] mb-4 empty:hidden">
        <ReactionStackedBadges
          postId={postId}
          reactions={reactions}
          totalReactions={totalReactions}
        />
      </div>

      {/* ── 3-Column Action Bar (Matching PostActionBar) ── */}
      <div
        className="grid grid-cols-3 border-t border-border dark:border-[#3F3F3F] overflow-visible -mx-4"
        onPointerDown={(e) => e.stopPropagation()}
      >
        {/* Like / Reactions button */}
        <div
          className={`group/reactions relative flex items-center justify-center overflow-visible w-full ${
            showReactions ? "z-50" : ""
          }`}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          onTouchMove={handleTouchEnd}
        >
          <button
            type="button"
            onClick={() => {
              const type = newsItem?.currentUserReaction || "Like"
              handleReact(type)
            }}
            className="w-full h-12 flex items-center justify-center gap-2 transition-colors hover:bg-neutral-100 dark:hover:bg-[#272727] active:bg-[#E6E6E6] dark:active:bg-[#3D3D3D] text-secondary dark:text-[#AAAAAA] hover:text-black dark:hover:text-white cursor-pointer touch-manipulation"
            aria-label={getReactionLabel()}
          >
            {newsItem?.currentUserReaction ? (
              <ReactionBadge type={newsItem.currentUserReaction} size={20} />
            ) : (
              <ThumbsUp
                size={20}
                strokeWidth={1.8}
                className="text-secondary dark:text-[#AAAAAA] group-hover/reactions:text-black dark:group-hover/reactions:text-white transition-colors"
              />
            )}
            <span className="text-sm font-medium">{totalReactions}</span>
          </button>

          {/* Reactions Popover */}
          <ReactionsPopover
            show={showReactions}
            onClose={handleCloseReactions}
            onSelect={(_, type) => handleSelectReaction(type)}
            reactions={NEWS_REACTIONS}
            iconSize={20}
          />
        </div>

        {/* Comment button */}
        <button
          type="button"
          onClick={onCommentClick}
          className="w-full h-12 flex items-center justify-center gap-2 transition-colors hover:bg-neutral-100 dark:hover:bg-[#272727] active:bg-[#E6E6E6] dark:active:bg-[#3D3D3D] text-secondary dark:text-[#AAAAAA] hover:text-black dark:hover:text-white cursor-pointer touch-manipulation"
          aria-label={t.news?.newsDetail?.comment || "Bình luận"}
        >
          <MessageSquare
            size={20}
            strokeWidth={1.8}
            className="transition-colors"
          />
          <span className="text-sm font-medium">{totalComments}</span>
        </button>

        {/* Share button */}
        <button
          type="button"
          onClick={onShareClick}
          className="w-full h-12 flex items-center justify-center gap-2 transition-colors hover:bg-neutral-100 dark:hover:bg-[#272727] active:bg-[#E6E6E6] dark:active:bg-[#3D3D3D] text-secondary dark:text-[#AAAAAA] hover:text-black dark:hover:text-white cursor-pointer touch-manipulation"
          aria-label={t.news?.newsDetail?.share || "Chia sẻ"}
        >
          <svg
            viewBox="0 0 24 24"
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.8}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M14 9V5L21 12L14 19V14.9C9 14.9 5.5 16.5 3 20C4 15 7 10 14 9Z" />
          </svg>
          <span className="text-sm font-medium">{shareCount}</span>
        </button>
      </div>
    </div>
  )
}

export default NewsDetailActionBar
