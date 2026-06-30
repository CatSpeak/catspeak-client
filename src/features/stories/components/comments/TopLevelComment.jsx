import React, { useState } from "react"
import { ChevronDown, ChevronUp } from "lucide-react"
import CommentItem from "./CommentItem"

/**
 * Wraps a root-level comment together with its reply thread.
 *
 * @param {Object}  props.comment       - Root comment data (includes .replies[])
 * @param {number}  props.storyId
 * @param {number}  [props.currentUserId]
 */
const TopLevelComment = ({ comment, storyId, currentUserId }) => {
  const [showReplies, setShowReplies] = useState(false)

  const replies = comment.replies || []

  const handleReply = async (content, parentCommentId) => {
    // TODO: call create comment API
    setShowReplies(true) // auto-expand after posting a reply
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Root comment */}
      <CommentItem
        comment={comment}
        storyId={storyId}
        onReply={handleReply}
        currentUserId={currentUserId}
      />

      {/* Reply list */}
      {showReplies && replies.length > 0 && (
        <div className="flex flex-col gap-3 mt-1">
          {replies
            .slice()
            .sort((a, b) => new Date(a.createDate) - new Date(b.createDate))
            .map((reply) => (
              <CommentItem
                key={reply.commentId}
                comment={reply}
                storyId={storyId}
                onReply={handleReply}
                isNested
                currentUserId={currentUserId}
              />
            ))}
        </div>
      )}

      {/* Toggle button */}
      {replies.length > 0 && (
        <button
          type="button"
          onClick={() => setShowReplies((v) => !v)}
          className="ml-12 flex items-center gap-1 text-xs font-semibold text-[#990011] hover:underline w-fit"
        >
          {showReplies ? (
            <>Ẩn phản hồi <ChevronUp size={13} /></>
          ) : (
            <>{replies.length} phản hồi <ChevronDown size={13} /></>
          )}
        </button>
      )}
    </div>
  )
}

export default TopLevelComment
