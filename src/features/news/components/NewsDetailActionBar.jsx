import React, { useState, useRef, useEffect } from "react"
import { MessageSquare, ThumbsUp } from "lucide-react"
import { useLanguage } from "@/shared/context/LanguageContext"
import ReactionsPopover from "@/shared/components/ui/ReactionsPopover"
import PillButton from "@/shared/components/ui/buttons/PillButton"
import { ReactionBadge, NEWS_REACTIONS } from "./ReactionBadge"
import ReactionStackedBadges from "./ReactionStackedBadges"
import {
  normalizeReactions,
  getTotalReactionsCount,
} from "../utils/reactionUtils"
import { useGetPostReactionsQuery } from "@/store/api/social/postsApi"

const ShareIcon = ({ size = 20, className = "" }) => (
  <svg
    viewBox="0 0 24 24"
    width={size}
    height={size}
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M14 9V5L21 12L14 19V14.9C9 14.9 5.5 16.5 3 20C4 15 7 10 14 9Z" />
  </svg>
)

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

    const shareData = {
      title: newsItem?.title || "CatSpeak",
      text: newsItem?.excerpt || newsItem?.title || "",
      url: window.location.href,
    }

    if (
      typeof navigator !== "undefined" &&
      typeof navigator.share === "function" &&
      (!navigator.canShare || navigator.canShare(shareData))
    ) {
      navigator.share(shareData).catch((err) => {
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

      {/* ── 3-Column Action Bar (Using PillButton) ── */}
      <div
        className="grid grid-cols-3 gap-2 overflow-visible"
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
          <PillButton
            variant="secondary"
            className="w-full"
            onClick={() => {
              const type = newsItem?.currentUserReaction || "Like"
              handleReact(type)
            }}
            aria-label={getReactionLabel()}
            startIcon={
              newsItem?.currentUserReaction ? (
                <ReactionBadge type={newsItem.currentUserReaction} size={20} />
              ) : (
                <ThumbsUp size={20} />
              )
            }
          >
            {totalReactions}
          </PillButton>

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
        <PillButton
          variant="secondary"
          className="w-full"
          onClick={onCommentClick}
          aria-label={t.news?.newsDetail?.comment || "Bình luận"}
          startIcon={<MessageSquare size={20} />}
        >
          {totalComments}
        </PillButton>

        {/* Share button */}
        <PillButton
          variant="secondary"
          className="w-full"
          onClick={onShareClick}
          aria-label={t.news?.newsDetail?.share || "Chia sẻ"}
          startIcon={<ShareIcon size={20} />}
        >
          {shareCount}
        </PillButton>
      </div>
    </div>
  )
}

export default NewsDetailActionBar
