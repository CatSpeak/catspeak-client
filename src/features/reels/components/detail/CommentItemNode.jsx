import React, { useState } from "react"
import Avatar from "@/shared/components/ui/Avatar"
import { useLanguage } from "@/shared/context/LanguageContext"
import { formatRelativeTime } from "../../utils/formatters"

/**
 * Individual comment node inside the hierarchical comments tree.
 * Renders the author, time, content, actions (Reply, Delete), and recursively renders replies.
 */
const CommentItemNode = React.memo(function CommentItemNode({
  comment,
  reelId,
  currentUser,
  onReply,
  onDelete,
}) {
  const { t, language } = useLanguage()
  const [expanded, setExpanded] = useState(false)
  const hasReplies = comment.replies && comment.replies.length > 0

  const handleReplyClick = () => {
    onReply({
      parentCommentId: comment.reelCommentId,
      username: comment.nickname || comment.username || "user",
    })
  }

  const handleDeleteClick = () => {
    if (window.confirm(t?.catSpeak?.reels?.detail?.deleteConfirm || "Are you sure you want to delete this comment?")) {
      onDelete(comment.reelCommentId)
    }
  }

  const isOwner = currentUser && String(currentUser.accountId) === String(comment.accountId)

  return (
    <div className="w-full">
      <div className="flex gap-2 items-start transition-colors duration-200 rounded-lg hover:bg-black/5">
        <Avatar
          size={36}
          src={comment.avatarUrl}
          name={comment.nickname || comment.username}
          alt={comment.nickname || comment.username}
          className="shadow-sm shrink-0 rounded-full"
        />
        <div className="flex-1 min-w-0 flex flex-col gap-[2px]">
          <div className="flex items-baseline gap-[6px] flex-wrap">
            <span className="font-bold text-[13px] text-headingColor">
              {comment.nickname || comment.username || "Anonymous"}
            </span>
            <span className="text-xs text-lighttextGray">
              {formatRelativeTime(comment.createdAt, language)}
            </span>
          </div>
          <p className="text-[14px] text-headingColor leading-[1.4] break-words whitespace-pre-wrap mt-0.5">{comment.content}</p>
          <div className="flex items-center gap-3 mt-1">
            <button
              onClick={handleReplyClick}
              className="text-xs font-semibold text-lighttextGray hover:text-text555 cursor-pointer bg-transparent border-none outline-none p-0 transition-colors duration-200"
            >
              {t?.catSpeak?.reels?.detail?.reply || "Reply"}
            </button>
            {isOwner && (
              <button
                onClick={handleDeleteClick}
                className="text-xs font-semibold text-[#ef4444] hover:text-[#dc2626] cursor-pointer bg-transparent border-none outline-none p-0 transition-colors duration-200 opacity-0 group-hover/comment:opacity-100"
              >
                {t?.catSpeak?.reels?.detail?.delete || "Delete"}
              </button>
            )}
          </div>
        </div>
      </div>

      {hasReplies && (
        <div style={{ display: "flex", flexDirection: "column" }}>
          {!expanded ? (
            <button
              onClick={() => setExpanded(true)}
              className="flex items-center gap-[6px] text-xs font-bold text-[#666] hover:text-headingColor mt-1 cursor-pointer bg-transparent border-none outline-none p-0 ml-9 transition-colors duration-200"
            >
              ── {t?.catSpeak?.reels?.detail?.viewReplies || "View replies"} ({comment.replies.length})
            </button>
          ) : (
            <>
              <button
                onClick={() => setExpanded(false)}
                className="flex items-center gap-[6px] text-xs font-bold text-[#666] hover:text-headingColor mt-1 cursor-pointer bg-transparent border-none outline-none p-0 ml-9 transition-colors duration-200"
              >
                ── {t?.catSpeak?.reels?.detail?.hideReplies || "Hide replies"}
              </button>
              <div className="ml-9 mt-3 flex flex-col gap-4 relative before:content-[''] before:absolute before:left-[-20px] before:top-2 before:bottom-6 before:w-[2px] before:bg-gray-200">
                {comment.replies.map((reply) => (
                  <CommentItemNode
                    key={reply.reelCommentId}
                    comment={reply}
                    reelId={reelId}
                    currentUser={currentUser}
                    onReply={onReply}
                    onDelete={onDelete}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
})

export default CommentItemNode
