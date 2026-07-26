import React, { useState, useRef } from "react"
import { ThumbsUp, Heart, Smile, MessageCircle, Share } from "lucide-react"
import PillButton from "@/shared/components/ui/buttons/PillButton"
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
    <div className="flex justify-between">
      <div className="flex items-center gap-2">
        <div
          className="group/reactions relative flex items-center"
          onMouseEnter={() => setShowReactions(true)}
          onMouseLeave={() => setShowReactions(false)}
        >
          <PillButton
            variant="secondary"
            onClick={(e) => {
              const type = post.currentUserReaction || "Like"
              onReact(e, type)
            }}
            startIcon={
              <ReactionIcon reaction={post.currentUserReaction} size={20} />
            }
          >
            {post.totalReactions || 0}
          </PillButton>

          {/* Reactions popover */}
          <ReactionsPopover
            show={showReactions}
            onClose={() => setShowReactions(false)}
            onSelect={(e, type) => onReact(e, type)}
            iconSize={20}
          />

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
          {t.profile?.post?.actions?.share || "Chia sẻ"}
        </PillButton>
      </div>
    </div>
  )
}

export default PostActionBar
