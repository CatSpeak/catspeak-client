import React, { useState, useRef } from "react"
import { MessageSquare, ThumbsUp } from "lucide-react"
import ReactionsPopover from "@/shared/components/ui/ReactionsPopover"
import { ReactionBadge, NEWS_REACTIONS } from "@/features/news/components/ReactionBadge"
import ReactionStackedBadges from "@/features/news/components/ReactionStackedBadges"
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

  const handleTouchStart = () => {
    holdTimer.current = setTimeout(() => setShowReactions(true), 400)
  }

  const handleTouchEnd = () => {
    if (holdTimer.current) clearTimeout(holdTimer.current)
  }

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
      className="border-t border-border py-2.5 px-4 sm:px-6 flex items-center justify-between gap-3"
      onPointerDown={(e) => e.stopPropagation()}
    >
      {/* ── Left: Action buttons (react · comment · share) ─────── */}
      <div className="flex items-center gap-5 sm:gap-6">
        {/* Reactions */}
        <div
          className={`group/reactions relative flex items-center justify-center overflow-visible ${
            showReactions ? "z-50" : ""
          }`}
          onMouseEnter={() => setShowReactions(true)}
          onMouseLeave={() => setShowReactions(false)}
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
            className="p-1.5 -m-1.5 rounded-full hover:bg-gray-100 transition-colors flex items-center gap-1.5 text-[#4b5563] hover:text-black cursor-pointer"
            aria-label="React"
          >
            {post.currentUserReaction ? (
              <ReactionBadge
                type={post.currentUserReaction}
                size={22}
              />
            ) : (
              <ThumbsUp size={22} strokeWidth={1.8} className="text-[#4b5563]" />
            )}
            <span className="text-sm font-medium">{totalReactions}</span>
          </button>

          {/* Reactions popover - Centered & consistent */}
          <ReactionsPopover
            show={showReactions}
            onClose={() => setShowReactions(false)}
            onSelect={(e, type) => onReact(e, type)}
            reactions={NEWS_REACTIONS}
            iconSize={22}
            className="mb-2"
          />
        </div>

        {/* Comments */}
        <button
          type="button"
          onClick={onToggleComments}
          className={`p-1.5 -m-1.5 rounded-full hover:bg-gray-100 transition-colors flex items-center gap-1.5 cursor-pointer ${
            isCommentsOpen
              ? "text-cath-red-700 font-semibold"
              : "text-[#4b5563] hover:text-black"
          }`}
          aria-label="Comment"
        >
          <MessageSquare
            size={22}
            strokeWidth={1.8}
            className={isCommentsOpen ? "text-cath-red-700" : "text-[#4b5563]"}
          />
          <span className="text-sm font-medium">{totalComments}</span>
        </button>

        {/* Share */}
        <button
          type="button"
          onClick={onShare}
          className="p-1.5 -m-1.5 rounded-full hover:bg-gray-100 transition-colors flex items-center gap-1.5 text-[#4b5563] hover:text-black cursor-pointer"
          aria-label="Share"
        >
          <svg
            viewBox="0 0 24 24"
            className="w-[22px] h-[22px]"
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

      {/* ── Right: Stacked reaction badges (Like · Love · Haha) ── */}
      <ReactionStackedBadges
        postId={post?.postId || post?.id}
        reactions={post?.reactions}
        totalReactions={totalReactions}
      />
    </div>
  )
}

export default PostActionBar
