import React, { useState, useRef } from "react"
import { ThumbsUp, Heart, Smile, MessageCircle, Share } from "lucide-react"
import PillButton from "@/shared/components/ui/buttons/PillButton"

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

  return (
    <div className="flex justify-between">
      <div className="flex items-center gap-2">
        {/* Like / Reactions */}
        <div className="group/reactions relative flex items-center">
          <PillButton
            variant="secondary"
            onClick={(e) => {
              const type = post.currentUserReaction || "Like"
              onReact(e, type)
            }}
            startIcon={
              post.currentUserReaction === "Love" ? (
                <Heart size={20} className="text-red-600 fill-red-500" />
              ) : post.currentUserReaction === "Haha" ? (
                <Smile size={20} className="text-yellow-600 fill-yellow-500" />
              ) : (
                <ThumbsUp
                  size={20}
                  className={
                    post.currentUserReaction === "Like"
                      ? "text-blue-600 fill-blue-500"
                      : ""
                  }
                />
              )
            }
          >
            {post.totalReactions || 0}
          </PillButton>

          {/* Reactions popover */}
          <div
            className={`absolute bottom-full left-0 mb-1 bg-white rounded-full shadow-[0_4px_16px_rgba(0,0,0,0.12)] border border-gray-100 p-1 flex items-center gap-1 transition-all duration-200 z-20 origin-bottom-left
            ${showReactions ? "opacity-100 scale-100 visible" : "opacity-0 scale-95 invisible group-hover/reactions:opacity-100 group-hover/reactions:scale-100 group-hover/reactions:visible"}`}
          >
            <button
              onClick={(e) => {
                onReact(e, "Like")
                setShowReactions(false)
              }}
              className="p-2 hover:-translate-y-1 transition-transform hover:bg-blue-50 rounded-full"
            >
              <ThumbsUp size={20} className="text-blue-600 fill-blue-500" />
            </button>
            <button
              onClick={(e) => {
                onReact(e, "Love")
                setShowReactions(false)
              }}
              className="p-2 hover:-translate-y-1 transition-transform hover:bg-red-50 rounded-full"
            >
              <Heart size={20} className="text-red-600 fill-red-500" />
            </button>
            <button
              onClick={(e) => {
                onReact(e, "Haha")
                setShowReactions(false)
              }}
              className="p-2 hover:-translate-y-1 transition-transform hover:bg-yellow-50 rounded-full"
            >
              <Smile size={20} className="text-yellow-600 fill-yellow-500" />
            </button>
          </div>

          {/* Touch handlers */}
          <div
            className="hidden"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            onTouchMove={handleTouchEnd}
            onMouseLeave={() => setShowReactions(false)}
          />
        </div>

        {/* Comments */}
        <PillButton
          variant="secondary"
          onClick={onToggleComments}
          startIcon={<MessageCircle size={20} />}
        >
          {post.totalComments || 0}
        </PillButton>

        {/* Share */}
        <PillButton
          variant="secondary"
          onClick={onShare}
          startIcon={<Share size={20} />}
        >
          Chia sẻ
        </PillButton>
      </div>
    </div>
  )
}

export default PostActionBar
