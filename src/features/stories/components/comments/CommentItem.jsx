import React, { useState, useRef } from "react"
import { ThumbsUp } from "lucide-react"
import Avatar from "@/shared/components/ui/Avatar"
import { getImageUrl } from "@/shared/utils/imageUtils"
import { useLanguage } from "@/shared/context/LanguageContext"
import dayjs from "dayjs"
import relativeTime from "dayjs/plugin/relativeTime"
import "dayjs/locale/vi"
import "dayjs/locale/zh"
import { REACTIONS } from "./constants"
import CommentMoreMenu from "./CommentMoreMenu"
import CommentReactionPicker from "./CommentReactionPicker"
import CommentInput from "./CommentInput"

dayjs.extend(relativeTime)
const timeAgo = (date) => (date ? dayjs(date).fromNow() : "")

/**
 * Renders a single comment (or nested reply).
 *
 * @param {Object}   props.comment        - Comment data
 * @param {number}   props.storyId        - Parent story ID
 * @param {Function} props.onReply        - (content, parentId, replyToAccountId) => void
 * @param {boolean}  [props.isNested]     - True when rendered as a reply (indented)
 * @param {number}   [props.currentUserId] - accountId of the logged-in user
 */
const CommentItem = ({ comment, storyId, onReply, isNested = false, currentUserId }) => {
  const { t } = useLanguage()
  const [isEditing, setIsEditing] = useState(false)
  const [isReplying, setIsReplying] = useState(false)
  const [showReactions, setShowReactions] = useState(false)
  const reactionTimer = useRef(null)

  // TODO: change logic check isOwner when get real API
  const isOwner = currentUserId && currentUserId === comment.accountId
  const reaction = REACTIONS[comment.currentUserReaction]
  const ReactionIcon = reaction?.icon || ThumbsUp

  const handleReact = (type) => {
    // TODO: call react comment API
    setShowReactions(false)
  }

  const handleEdit = async (content) => {
    // TODO: call edit comment API
    setIsEditing(false)
  }

  const handleDelete = () => {
    // TODO: call delete comment API
  }

  const handleReplySubmit = (content) => {
    onReply?.(content, comment.commentId, comment.accountId)
    setIsReplying(false)
  }

  return (
    <div className={`flex gap-3 ${isNested ? "ml-10" : ""}`}>
      <Avatar
        size={34}
        src={comment.avatarUrl ? getImageUrl(comment.avatarUrl) : null}
        name={comment.authorName || "User"}
        className="shrink-0 mt-0.5"
      />

      <div className="flex-1 min-w-0">
        {/* Header: name, time, menu */}
        <div className="flex items-baseline gap-1.5 text-xs text-[#9e9e9e] mb-1">
          <span className="text-lg text-[#7B7979]">{comment.authorName}</span>
          <span className="text-base text-[#7B7979] ml-2">• {timeAgo(comment.createDate)}</span>
          {comment.lastEdited && comment.lastEdited !== comment.createDate && (
            <span className="italic">{t.catSpeak?.comments?.edited || "(đã sửa)"}</span>
          )}
          <div className="ml-auto">
            {isOwner && (
              <CommentMoreMenu
                onEdit={() => setIsEditing(true)}
                onDelete={handleDelete}
              />
            )}
          </div>
        </div>

        {/* Body: content */}
        {isEditing ? (
          <CommentInput
            placeholder={t.catSpeak?.comments?.editPlaceholder || "Chỉnh sửa bình luận..."}
            defaultValue={comment.content}
            onSubmit={handleEdit}
            onCancel={() => setIsEditing(false)}
            autoFocus
          />
        ) : (
          <p className="text-sm text-black break-words leading-[1.5] mb-2">
            {comment.replyToAccountName && (
              <span className="font-semibold text-[#990011] mr-1">
                @{comment.replyToAccountName}
              </span>
            )}
            {comment.content}
          </p>
        )}

        {/* Action row */}
        {!isEditing && (
          <div className="flex items-center gap-4 text-xs text-[#9e9e9e]">
            {/* React */}
            <div
              className="relative flex items-center"
              onMouseEnter={() => { clearTimeout(reactionTimer.current); setShowReactions(true) }}
              onMouseLeave={() => { reactionTimer.current = setTimeout(() => setShowReactions(false), 300) }}
            >
              {showReactions && <CommentReactionPicker onReact={handleReact} />}

              <button
                type="button"
                onClick={() => handleReact(comment.currentUserReaction || 1)}
                className={`flex items-center gap-1 ${reaction ? reaction.color : "text-[#9e9e9e] hover:text-[#3d3d3d]"}`}
              >
                <ReactionIcon size={13} className={reaction ? reaction.fill : ""} />
                {comment.totalReactions > 0 && <span>{comment.totalReactions}</span>}
              </button>
            </div>

            {/* Reply button */}
            <button
              type="button"
              onClick={() => setIsReplying((v) => !v)}
              className="hover:underline hover:text-[#3d3d3d] transition-colors"
            >
              {t.catSpeak?.comments?.reply}
            </button>
          </div>
        )}

        {/* Inline reply input */}
        {isReplying && (
          <div className="mt-3">
            <CommentInput
              placeholder={t.catSpeak?.comments?.replyPlaceholder}
              onSubmit={handleReplySubmit}
              onCancel={() => setIsReplying(false)}
              autoFocus
            />
          </div>
        )}
      </div>
    </div>
  )
}

export default CommentItem
