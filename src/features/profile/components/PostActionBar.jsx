import React, { useState, useRef } from "react"
import { MessageSquare, Share } from "lucide-react"
import ReactionsPopover, {
  ReactionIcon,
} from "@/shared/components/ui/ReactionsPopover"
import { useLanguage } from "@/shared/context/LanguageContext"

const PostActionBar = ({
  post,
  isCommentsOpen,
  onToggleComments,
  onReact,
  onShare,
}) => {
  const { t } = useLanguage()
  const [showReactions, setShowReactions] = useState(false)
  const holdTimer = useRef(null)

  const handleTouchStart = () => {
    holdTimer.current = setTimeout(() => setShowReactions(true), 400)
  }

  const handleTouchEnd = () => {
    if (holdTimer.current) clearTimeout(holdTimer.current)
  }

  return (
    <div
      className="grid grid-cols-3 border-t border-border"
      onPointerDown={(e) => e.stopPropagation()}
    >
      {/* Reactions */}
      <div
        className="group/reactions relative flex items-center justify-center"
        onMouseEnter={() => setShowReactions(true)}
        onMouseLeave={() => setShowReactions(false)}
      >
        <button
          type="button"
          onClick={(e) => {
            const type = post.currentUserReaction || "Like"
            onReact(e, type)
          }}
          className="w-full h-12 flex items-center justify-center gap-2 transition-colors hover:bg-primaryBg text-sm text-[#606060]"
        >
          <ReactionIcon reaction={post.currentUserReaction} size={20} />
          <span className="font-medium">{post.totalReactions || 0}</span>
        </button>

        {/* Reactions popover */}
        <ReactionsPopover
          show={showReactions}
          onClose={() => setShowReactions(false)}
          onSelect={(e, type) => onReact(e, type)}
          iconSize={18}
        />

        {/* Touch hold for mobile reactions */}
        <div
          className="hidden"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          onTouchMove={handleTouchEnd}
          onMouseLeave={() => setShowReactions(false)}
        />
      </div>

      {/* Comments */}
      <button
        type="button"
        onClick={onToggleComments}
        className={`w-full h-12 flex items-center justify-center gap-2 transition-colors hover:bg-primaryBg text-sm ${
          isCommentsOpen ? "text-cath-red-700 font-semibold" : "text-[#606060] font-medium"
        }`}
      >
        <MessageSquare
          size={20}
          strokeWidth={1.5}
          className={isCommentsOpen ? "text-cath-red-700" : "text-[#606060]"}
        />
        <span>{post.totalComments || 0}</span>
      </button>

      {/* Share */}
      <button
        type="button"
        onClick={onShare}
        className="w-full h-12 flex items-center justify-center gap-2 transition-colors hover:bg-primaryBg text-sm text-[#606060]"
        aria-label="Share"
      >
        <Share size={20} strokeWidth={1.5} className="text-[#606060]" />
        <span className="font-medium">{post.shareCount || 0}</span>
      </button>
    </div>
  )
}

export default PostActionBar
