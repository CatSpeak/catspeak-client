import React, { useState } from "react"
import { useAuth } from "@/features/auth/hooks/useAuth"
import {
  ThumbsUp,
  Heart,
  Smile,
  ChevronDown,
  ChevronUp,
} from "lucide-react"
import CommentMoreMenu from "./CommentMoreMenu"
import { getImageUrl } from "@/shared/utils/imageUtils"
import {
  getTranslatedTimeAgo,
} from "@/features/news/utils/newsUtils"
import { useLanguage } from "@/shared/context/LanguageContext"
import Avatar from "@/shared/components/ui/Avatar"

export const REACTION_TYPES = {
  1: {
    label: "Like",
    icon: ThumbsUp,
    colorClass: "text-blue-600",
    fillClass: "fill-blue-400",
  },
  2: {
    label: "Love",
    icon: Heart,
    colorClass: "text-red-600",
    fillClass: "fill-red-400",
  },
  3: {
    label: "Haha",
    icon: Smile,
    colorClass: "text-yellow-600",
    fillClass: "fill-yellow-400",
  },
}

/**
 * Check if a comment has actually been edited.
 * Compares parsed timestamps with a 1-second tolerance to handle
 * minor precision differences from the API (e.g. trailing Z vs no Z,
 * millisecond truncation) that would cause false positives on new comments.
 */
const hasBeenEdited = (comment) => {
  if (!comment.lastEdited || !comment.createDate) return false
  const edited = new Date(comment.lastEdited).getTime()
  const created = new Date(comment.createDate).getTime()
  if (isNaN(edited) || isNaN(created)) return false
  return edited - created > 1000
}

const CommentItem = ({
  comment,
  replies,
  onReplySubmit,
  onDelete,
  onEdit,
  onReact,
  isNested = false,
}) => {
  const { user } = useAuth()
  const { t } = useLanguage()
  const [showReactions, setShowReactions] = useState(false)
  const [isReplying, setIsReplying] = useState(false)
  const [replyContent, setReplyContent] = useState("")
  const [showReplies, setShowReplies] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editContent, setEditContent] = useState("")

  const isOwner = user?.accountId === comment.accountId

  const currentReaction = REACTION_TYPES[comment.currentUserReaction]
  const ReactionIcon = currentReaction?.icon || ThumbsUp

  const handleReplyClick = () => {
    setIsReplying(true)
  }

  const submitReply = async (e) => {
    e.preventDefault()
    if (!replyContent.trim()) return
    const parentId = comment.parentCommentId || comment.commentId

    await onReplySubmit(replyContent, parentId, comment.accountId)

    setReplyContent("")
    setIsReplying(false)
    setShowReplies(true)
  }

  const hasReplies = replies?.length > 0

  return (
    <div
      className={`flex gap-3.5 group relative ${
        isNested ? "justify-end" : ""
      }`}
    >
      {/* ── Avatar column ────────────────────────────────────────── */}
      <div className="flex flex-col items-center shrink-0">
        <Avatar
          size={32}
          src={comment.avatarUrl ? getImageUrl(comment.avatarUrl) : null}
          name={comment.authorName || "User"}
          className="shrink-0"
        />
        {/* L-shaped connector: vertical line down + horizontal turn right */}
        {hasReplies && showReplies && (
          <div className="flex flex-col items-center flex-1 mt-3.5">
            {/* Vertical segment — fills remaining height */}
            <div className="w-[2px] flex-1 bg-[#e2e2e2] rounded-full" />
            {/* Horizontal segment — turns right toward toggle area */}
            <div className="h-[2px] w-4 bg-[#e2e2e2] rounded-full translate-x-[7px]" />
          </div>
        )}
      </div>

      {/* ── Content column ───────────────────────────────────────── */}
      <div className={`flex-1 min-w-0 ${isNested ? "flex-[1_0_0]" : ""}`}>
        {/* Author & Timestamp + More menu — Figma: gap-[8px] between header and body */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3.5">
              <span className="font-nunito font-medium text-lg text-[#7b7979] leading-[1.4]">
                {comment.authorName}
              </span>
              <span className="font-nunito text-base text-[#7b7979] leading-[1.4]">
                •
              </span>
              <span className="font-nunito text-base text-[#7b7979] leading-[1.4]">
                {getTranslatedTimeAgo(
                  comment.createDate,
                  t.news?.newsCard?.timeAgo,
                )}
              </span>
              {hasBeenEdited(comment) && (
                <>
                  <span className="font-nunito text-base text-[#7b7979]">•</span>
                  <span className="font-nunito text-base text-[#7b7979]">
                    {t.news?.newsDetail?.edited || "Edited"}
                  </span>
                </>
              )}
            </div>
            {isOwner && (
              <CommentMoreMenu
                onEdit={() => {
                  setEditContent(comment.content)
                  setIsEditing(true)
                }}
                onDelete={() => onDelete(comment.commentId)}
              />
            )}
          </div>

          {/* Comment Body */}
          {isEditing ? (
            <div className="flex flex-col gap-2">
              <input
                type="text"
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                autoFocus
                className="w-full bg-[#f5f5f5] border border-[#e2e2e2] rounded-2xl px-4 py-3 font-nunito text-base text-black focus:outline-none focus:border-cath-red-700 transition-colors"
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-3 py-1 rounded-full border border-cath-red-700 text-cath-red-700 font-nunito font-medium text-sm hover:bg-cath-red-50 transition-colors"
                >
                  {t.news?.newsDetail?.cancel || "Hủy"}
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    if (onEdit) {
                      await onEdit(comment.commentId, editContent)
                    }
                    setIsEditing(false)
                  }}
                  disabled={!editContent.trim() || editContent === comment.content}
                  className="px-4 py-1 rounded-full bg-cath-red-700 text-white font-nunito font-medium text-sm hover:bg-cath-red-800 transition-colors disabled:opacity-50"
                >
                  {t.news?.newsDetail?.save || "Gửi"}
                </button>
              </div>
            </div>
          ) : (
            <p className="font-nunito text-base text-black leading-[1.4] break-words whitespace-pre-wrap">
              {comment.replyToAccountName && (
                <span className="text-blue-600 font-semibold mr-1">
                  @{comment.replyToAccountName}
                </span>
              )}
              {comment.content}
            </p>
          )}
        </div>

        {/* ── Actions row — Figma: w-[303px] container, gap-[12px] ── */}
        {!isEditing && (
          <div className="flex flex-col items-start w-[303px] mt-2">
            <div className="flex gap-3 items-center w-full">
              {/* Reaction button */}
              <div
                className="group/reactions relative flex items-center"
                onMouseEnter={() => setShowReactions(true)}
                onMouseLeave={() => setShowReactions(false)}
              >
                <button
                  onClick={() => {
                    const type = comment.currentUserReaction || 1
                    onReact(comment.commentId, type)
                  }}
                  className="flex items-center gap-1 cursor-pointer"
                >
                  {currentReaction ? (
                    <currentReaction.icon
                      size={16}
                      strokeWidth={1.5}
                      className={`${currentReaction.colorClass} ${currentReaction.fillClass}`}
                    />
                  ) : (
                    <ThumbsUp size={16} strokeWidth={1.5} className="text-[#7b7979]" />
                  )}
                  {comment.totalReactions > 0 && (
                    <span className="font-nunito font-medium text-sm text-[#7b7979]">
                      {comment.totalReactions}
                    </span>
                  )}
                </button>

                {/* Reactions Popover */}
                <div
                  className={`absolute bottom-full left-0 mb-1 bg-white rounded-full shadow-[0_4px_16px_rgba(0,0,0,0.12)] border border-gray-100 p-1 flex items-center gap-1 transition-all duration-200 z-20 origin-bottom-left
                  ${showReactions ? "opacity-100 scale-100 visible" : "opacity-0 scale-95 invisible group-hover/reactions:opacity-100 group-hover/reactions:scale-100 group-hover/reactions:visible"}`}
                >
                  {Object.entries(REACTION_TYPES).map(([type, config]) => {
                    const IconComp = config.icon
                    return (
                      <button
                        key={type}
                        onClick={(e) => {
                          e.stopPropagation()
                          onReact(comment.commentId, parseInt(type, 10))
                          setShowReactions(false)
                        }}
                        className={`p-2 hover:-translate-y-1 transition-transform rounded-full ${
                          type === "1"
                            ? "hover:bg-blue-50"
                            : type === "2"
                              ? "hover:bg-red-50"
                              : "hover:bg-yellow-50"
                        }`}
                        title={config.label}
                      >
                        <IconComp
                          size={24}
                          className={`${config.colorClass} ${config.fillClass}`}
                        />
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Reply text */}
              <button
                onClick={handleReplyClick}
                className="font-nunito text-sm text-[#7b7979] hover:text-black transition-colors"
              >
                {t.news?.newsDetail?.reply || "Phản hồi"}
              </button>
            </div>
          </div>
        )}

        {/* Inline Reply Form */}
        {isReplying && (
          <form
            onSubmit={submitReply}
            className="mt-3 flex flex-col gap-2 relative z-10"
          >
            <div className="flex items-center gap-2">
              <Avatar
                size={32}
                src={user?.avatarImageUrl ? getImageUrl(user.avatarImageUrl) : null}
                name={user?.fullName || "User"}
                className="shrink-0"
              />
              <input
                type="text"
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                placeholder={`Reply to @${comment.authorName}...`}
                autoFocus
                className="flex-1 bg-transparent border-b-2 border-cath-red-700 px-2 py-1 font-nunito text-base text-black focus:outline-none transition-colors"
              />
            </div>
            <div className="flex items-center justify-between">
              <button
                type="button"
                className="p-1 text-[#7b7979] hover:text-black transition-colors"
                title="Emoji"
              >
                <Smile size={24} strokeWidth={1.5} />
              </button>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsReplying(false)}
                  className="px-3 py-1 rounded-full border border-cath-red-700 text-cath-red-700 font-nunito font-medium text-sm hover:bg-cath-red-50 transition-colors"
                >
                  {t.news?.newsDetail?.cancel || "Hủy"}
                </button>
                <button
                  type="submit"
                  disabled={!replyContent.trim()}
                  className="px-4 py-1 rounded-full bg-cath-red-700 text-white font-nunito font-medium text-sm hover:bg-cath-red-800 transition-colors disabled:opacity-50"
                >
                  {t.news?.newsDetail?.comment || "Gửi"}
                </button>
              </div>
            </div>
          </form>
        )}

        {/* Replies — rendered first so toggle anchors at the bottom */}
        {showReplies && hasReplies && (
          <div className="mt-3 flex flex-col gap-3 relative z-10">
            {replies
              .slice()
              .sort((a, b) => new Date(a.createDate) - new Date(b.createDate))
              .map((reply) => (
                <CommentItem
                  key={reply.commentId}
                  comment={reply}
                  replies={[]}
                  onReplySubmit={onReplySubmit}
                  onDelete={onDelete}
                  onEdit={onEdit}
                  onReact={onReact}
                  isNested={true}
                />
              ))}
          </div>
        )}

        {/* Show/Hide Replies Toggle — anchored below all replies */}
        {hasReplies && (
          <button
            onClick={() => setShowReplies(!showReplies)}
            className="mt-2 flex items-center gap-2 font-nunito font-semibold text-sm text-cath-red-700 hover:text-cath-red-800 transition-colors relative z-10"
          >
            {showReplies ? (
              <>
                {t.news?.newsDetail?.hideReplies || "Ẩn phản hồi"}
                <ChevronUp size={16} />
              </>
            ) : (
              <>
                {t.news?.newsDetail?.viewReplies?.replace("{{count}}", replies.length) || "phản hồi"}
                <ChevronDown size={16} />
              </>
            )}
          </button>
        )}
      </div>
    </div>
  )
}

export default CommentItem
