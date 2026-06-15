import React, { useState } from "react"
import { useAuth } from "@/features/auth/hooks/useAuth"
import {
  ThumbsUp,
  Heart,
  Smile,
} from "lucide-react"
import CommentMoreMenu from "./CommentMoreMenu"
import { getImageUrl } from "@/shared/utils/imageUtils"
import {
  getTranslatedTimeAgo,
  formatExactDate,
} from "@/features/news/utils/newsUtils"
import { useLanguage } from "@/shared/context/LanguageContext"
import TextInput from "@/shared/components/ui/inputs/TextInput"
import PillButton from "@/shared/components/ui/buttons/PillButton"
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
  const { t, language } = useLanguage()
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
    setShowReplies(true) // Auto expand replies when adding a new one
  }

  return (
    <div className={`flex gap-3 group relative ${isNested ? "" : "mb-4"}`}>
      {/* Branch curve for nested reply */}
      {isNested && (
        <div
          className="absolute border-l-2 border-b-2 border-[#E5E5E5] rounded-bl-xl pointer-events-none z-0"
          style={{
            left: "-34px",
            top: 0,
            height: "18px",
            width: "34px",
          }}
        />
      )}
      <Avatar
        size={36}
        src={comment.avatarUrl ? getImageUrl(comment.avatarUrl) : null}
        name={comment.authorName || "User"}
        className="shrink-0"
      />
      <div className="flex-1 min-w-0">
        <div className="relative">
          {/* Thread line from avatar */}
          {replies?.length > 0 && (
            <div
              className="absolute border-l-2 border-b-2 border-[#E5E5E5] rounded-bl-xl pointer-events-none z-0"
              style={{
                left: "-30px",
                top: "36px",
                bottom: "24px",
                width: "30px",
              }}
            />
          )}

          {/* Author & Timestamp */}
          <div className="flex items-end gap-1 text-xs text-[#606060] mb-3">
            <span className="font-semibold text-black text-sm">
              {comment.authorName}
            </span>

            <span>·</span>

            <span>
              {getTranslatedTimeAgo(
                comment.createDate,
                t.news?.newsCard?.timeAgo,
              )}
            </span>

            <span>·</span>

            {comment.lastEdited &&
              comment.lastEdited !== comment.createDate && (
                <span>
                  {t.news?.newsDetail?.edited || "Edited"}{" "}
                  {getTranslatedTimeAgo(
                    comment.lastEdited,
                    t.news?.newsCard?.timeAgo,
                  )}
                </span>
              )}
          </div>

          {/* Comment Body & Action Row */}
          {isEditing ? (
            <div className="flex-1 flex flex-col gap-3 mb-3">
              <TextInput
                id={`edit-input-${comment.commentId}`}
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                autoFocus
                multiline
              />
              <div className="flex justify-end gap-3">
                <PillButton
                  type="button"
                  variant="secondary"
                  onClick={() => setIsEditing(false)}
                >
                  {t.news?.newsDetail?.cancel || "Cancel"}
                </PillButton>
                <PillButton
                  type="button"
                  variant="primary"
                  onClick={async () => {
                    if (onEdit) {
                      await onEdit(comment.commentId, editContent)
                    }
                    setIsEditing(false)
                  }}
                  disabled={
                    !editContent.trim() || editContent === comment.content
                  }
                >
                  {t.news?.newsDetail?.save || "Save"}
                </PillButton>
              </div>
            </div>
          ) : (
            <>
              {/* Comment Body */}
              <div className="flex items-center gap-1 group/body mb-3 relative">
                <div className="bg-[#f0f2f5] rounded-2xl px-4 py-3 inline-block max-w-full relative">
                  <p className="break-words whitespace-pre-wrap">
                    {comment.replyToAccountName && (
                      <span className="text-blue-600 font-semibold mr-1">
                        @{comment.replyToAccountName}
                      </span>
                    )}
                    {comment.content}
                  </p>

                  {/* Reaction Count (Floating Bottom Right) */}
                  {comment.totalReactions > 0 && (
                    <div className="absolute -bottom-2 -right-3 flex items-center gap-1 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.2)] rounded-full px-1.5 py-0.5 z-10">
                      <ReactionIcon
                        size={16}
                        className={
                          currentReaction
                            ? currentReaction.fillClass
                            : "fill-blue-500 text-blue-500"
                        }
                      />

                      <span className="text-[13px] leading-none text-[#65676B]">
                        {comment.totalReactions}
                      </span>
                    </div>
                  )}
                </div>

                {isOwner && !isEditing && (
                  <CommentMoreMenu
                    onEdit={() => {
                      setEditContent(comment.content)
                      setIsEditing(true)
                    }}
                    onDelete={() => onDelete(comment.commentId)}
                  />
                )}
              </div>

              {/* Action Row */}
              <div className="flex items-center mt-1">
                <div className="flex items-center gap-4 text-xs font-bold text-[#65676B] pl-2">
                  {/* Reaction Button with Popover */}
                  <div
                    className="group/reactions relative flex items-center"
                    onMouseEnter={() => setShowReactions(true)}
                    onMouseLeave={() => setShowReactions(false)}
                  >
                    <button
                      onClick={() => {
                        const type = comment.currentUserReaction
                          ? comment.currentUserReaction
                          : 1
                        onReact(comment.commentId, type)
                      }}
                      className={`hover:underline cursor-pointer flex items-center transition-colors ${
                        currentReaction
                          ? currentReaction.colorClass
                          : "text-[#65676B]"
                      }`}
                    >
                      <span className="">
                        {currentReaction
                          ? t.news?.newsDetail?.[
                              currentReaction.label.toLowerCase()
                            ] || currentReaction.label
                          : t.news?.newsDetail?.like || "Like"}
                      </span>
                    </button>

                    {/* Reactions Popover */}
                    <div
                      className={`absolute bottom-full left-0 mb-1 bg-white rounded-full shadow-[0_4px_16px_rgba(0,0,0,0.12)] border border-gray-100 p-1 flex items-center gap-1 transition-all duration-200 z-20 origin-bottom-left
                  ${
                    showReactions
                      ? "opacity-100 scale-100 visible"
                      : "opacity-0 scale-95 invisible group-hover/reactions:opacity-100 group-hover/reactions:scale-100 group-hover/reactions:visible"
                  }`}
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
                            title={
                              t.news?.newsDetail?.[config.label.toLowerCase()] ||
                              config.label
                            }
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

                  {/* Reply Button */}
                  <button
                    onClick={handleReplyClick}
                    className="hover:underline cursor-pointer transition-colors text-[#65676B]"
                  >
                    {t.news?.newsDetail?.reply || "Reply"}
                  </button>
                </div>
              </div>
            </>
          )}

          {/* Inline Reply Form */}
          {isReplying && (
            <form
              onSubmit={submitReply}
              className="mt-2 flex flex-col gap-2 pl-1 relative z-10"
            >
              <TextInput
                id={`reply-input-${comment.commentId}`}
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                placeholder={`Reply to @${comment.authorName}...`}
                autoFocus
                className="!min-h-[40px] text-[14px]"
                multiline
              />
              <div className="flex justify-end gap-2">
                <PillButton
                  type="button"
                  variant="secondary"
                  onClick={() => setIsReplying(false)}
                  className="!h-8 !text-sm"
                >
                  {t.news?.newsDetail?.cancel || "Cancel"}
                </PillButton>
                <PillButton
                  type="submit"
                  variant="primary"
                  disabled={!replyContent.trim()}
                  className="!h-8 !text-sm"
                >
                  {t.news?.newsDetail?.reply || "Reply"}
                </PillButton>
              </div>
            </form>
          )}

          {/* Replies */}
          {showReplies && replies?.length > 0 && (
            <div className="mt-3 pl-1 flex flex-col gap-4 mb-2 relative z-10">
              {replies
                .slice()
                .sort((a, b) => new Date(a.createDate) - new Date(b.createDate))
                .map((reply) => (
                  <CommentItem
                    key={reply.commentId}
                    comment={reply}
                    replies={[]} // Nested replies are flattened into the parent's replies array
                    onReplySubmit={onReplySubmit}
                    onDelete={onDelete}
                    onEdit={onEdit}
                    onReact={onReact}
                    isNested={true}
                  />
                ))}
            </div>
          )}

          {/* Show/Hide Replies Toggle */}
          {replies?.length > 0 && (
            <div className="mt-2 relative flex items-center z-10">
              <PillButton
                variant="secondary"
                onClick={() => setShowReplies(!showReplies)}
                className="!bg-transparent hover:!bg-[#f2f2f2] border-none shadow-none !text-base !text-[#65676B] gap-2 px-4 !h-12"
              >
                {showReplies
                  ? t.news?.newsDetail?.hideReplies || "Hide replies"
                  : (
                      t.news?.newsDetail?.viewReplies ||
                      "View {{count}} replies"
                    ).replace("{{count}}", replies.length)}
              </PillButton>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default CommentItem
