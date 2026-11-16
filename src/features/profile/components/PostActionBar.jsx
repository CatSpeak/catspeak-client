import React, { useState, useRef, useEffect } from "react"
import { MessageSquare, ThumbsUp } from "lucide-react"
import ReactionsPopover from "@/shared/components/ui/ReactionsPopover"
import {
  ReactionBadge,
  NEWS_REACTIONS,
} from "@/features/news/components/ReactionBadge"
import {
  normalizeReactions,
  getTotalReactionsCount,
} from "@/features/news/utils/reactionUtils"

const PostActionBar = ({
  post,
  isCommentsOpen,
  onToggleComments,
  onReact,
  onShare,
}) => {
  const [showReactions, setShowReactions] = useState(false)
  const holdTimer = useRef(null)
  const closeTimer = useRef(null)

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

  const handleSelectReaction = (e, type) => {
    if (closeTimer.current) clearTimeout(closeTimer.current)
    setShowReactions(false)
    onReact?.(e, type)
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

  const normalized = normalizeReactions(post?.reactions)
  const totalReactions = getTotalReactionsCount(
    normalized,
    post?.totalReactions !== undefined && post?.totalReactions !== null
      ? post.totalReactions
      : 0,
  )
  const totalComments = post?.totalComments ?? post?.commentCount ?? 0
  const shareCount = post?.shareCount ?? post?.totalShares ?? 0

  return (
    <div
      className={`grid grid-cols-3 border-t border-border dark:border-[#3F3F3F] overflow-visible ${
        !isCommentsOpen ? "rounded-b-2xl" : ""
      }`}
      onPointerDown={(e) => e.stopPropagation()}
    >
      {/* ── Reaction (Like) ─────── */}
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
          onClick={(e) => {
            const type = post.currentUserReaction || "Like"
            onReact(e, type)
          }}
          className={`w-full h-12 flex items-center justify-center gap-2 transition-colors hover:bg-neutral-100 dark:hover:bg-[#272727] text-secondary dark:text-[#AAAAAA] hover:text-black dark:hover:text-white cursor-pointer ${
            !isCommentsOpen ? "rounded-bl-2xl" : ""
          }`}
          aria-label="React"
        >
          {post.currentUserReaction ? (
            <ReactionBadge type={post.currentUserReaction} size={20} />
          ) : (
            <ThumbsUp
              size={20}
              strokeWidth={1.8}
              className="text-secondary dark:text-[#AAAAAA] group-hover/reactions:text-black dark:group-hover/reactions:text-white transition-colors"
            />
          )}
          <span className="text-sm font-medium">{totalReactions}</span>
        </button>

        {/* Reactions popover - Centered & consistent */}
        <ReactionsPopover
          show={showReactions}
          onClose={handleCloseReactions}
          onSelect={handleSelectReaction}
          reactions={NEWS_REACTIONS}
        />
      </div>

      {/* ── Comments ─────── */}
      <button
        type="button"
        onClick={onToggleComments}
        className="w-full h-12 flex items-center justify-center gap-2 transition-colors hover:bg-neutral-100 dark:hover:bg-[#272727] text-secondary dark:text-[#AAAAAA] hover:text-black dark:hover:text-white cursor-pointer"
        aria-label="Comment"
      >
        <MessageSquare
          size={20}
          strokeWidth={1.8}
          className="transition-colors"
        />
        <span className="text-sm font-medium">{totalComments}</span>
      </button>

      {/* ── Share ─────── */}
      <button
        type="button"
        onClick={onShare}
        className={`w-full h-12 flex items-center justify-center gap-2 transition-colors hover:bg-neutral-100 dark:hover:bg-[#272727] text-secondary dark:text-[#AAAAAA] hover:text-black dark:hover:text-white cursor-pointer ${
          !isCommentsOpen ? "rounded-br-2xl" : ""
        }`}
        aria-label="Share"
      >
        <svg
          viewBox="0 0 24 24"
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M14 9V5L21 12L14 19V14.9C9 14.9 5.5 16.5 3 20C4 15 7 10 14 9Z" />
        </svg>
        <span className="text-sm font-medium">{shareCount}</span>
      </button>
    </div>
  )
}

export default PostActionBar
