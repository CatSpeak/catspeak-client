import React, { useState, useRef } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth, useGetProfileQuery } from "@/features/auth"
import { useAuthModal } from "@/shared/context/AuthModalContext"
import {
  ThumbsUp,
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
import Popover from "@/shared/components/ui/Popover"
import EmojiPickerWrapper from "@/shared/components/ui/EmojiPickerWrapper"
import ReactionsPopover from "@/shared/components/ui/ReactionsPopover"
import {
  ReactionBadge,
  COMMENT_FACEBOOK_REACTIONS,
} from "./FacebookReactionBadge"

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
  nestLevel = 0,
  currentUser,
  onReplySubmit,
  onDelete,
  onEdit,
  onReact,
  isNested = false,
}) => {
  const { user: authUser, isAuthenticated } = useAuth()
  const { openAuthModal } = useAuthModal()
  const { data: profileData } = useGetProfileQuery(undefined, {
    skip: !isAuthenticated,
  })
  const user = currentUser || (profileData?.data ?? profileData ?? authUser ?? {})
  const { t } = useLanguage()
  const navigate = useNavigate()
  const [showReactions, setShowReactions] = useState(false)
  const holdTimer = useRef(null)

  const handleTouchStart = () => {
    holdTimer.current = setTimeout(() => setShowReactions(true), 400)
  }

  const handleTouchEnd = () => {
    if (holdTimer.current) clearTimeout(holdTimer.current)
  }

  const [isReplying, setIsReplying] = useState(false)
  const [replyContent, setReplyContent] = useState("")
  const [showReplies, setShowReplies] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editContent, setEditContent] = useState("")

  const commentId = comment.commentId || comment.id
  const authorAccountId =
    comment.accountId ||
    comment.authorId ||
    comment.userId ||
    comment.authorAccountId ||
    comment.author?.accountId ||
    comment.author?.id
  const authorName =
    comment.authorName ||
    comment.fullName ||
    comment.nickname ||
    comment.username ||
    comment.author?.fullName ||
    comment.author?.username ||
    "User"

  const replyToAccountId =
    comment.replyToAccountId ||
    comment.replyToUserId ||
    comment.replyToAccount?.id ||
    comment.replyToAccount?.accountId ||
    comment.replyToId ||
    replies?.find(
      (r) =>
        (r.authorName || r.username || r.fullName) ===
        comment.replyToAccountName
    )?.accountId ||
    null

  const handleReplyToClick = (e) => {
    if (replyToAccountId) {
      e.stopPropagation()
      navigate(`/profile/${replyToAccountId}`)
    }
  }

  const mentionMatch =
    !comment.replyToAccountName && typeof comment.content === "string"
      ? comment.content.match(/^([@#][a-zA-Z0-9_\u00C0-\u024F\u1EA0-\u1EF9]+)\s*(.*)/s)
      : null

  const isOwner = Boolean(
    user?.accountId &&
      authorAccountId &&
      String(user.accountId) === String(authorAccountId)
  )

  const commentAvatarRaw =
    comment.avatarImageUrl ||
    comment.avatarUrl ||
    comment.avatar ||
    comment.authorAvatar ||
    comment.authorAvatarUrl ||
    comment.author?.avatarImageUrl ||
    comment.author?.avatarUrl ||
    comment.author?.avatar ||
    ""
  const commentAvatar = commentAvatarRaw ? getImageUrl(commentAvatarRaw) : null

  const userAvatarRaw =
    user?.avatarImageUrl ||
    user?.avatarUrl ||
    user?.avatar ||
    authUser?.avatarImageUrl ||
    authUser?.avatarUrl ||
    authUser?.avatar ||
    ""
  const userAvatar = userAvatarRaw ? getImageUrl(userAvatarRaw) : null

  const handleReplyClick = () => {
    if (!isAuthenticated) {
      openAuthModal("login")
      return
    }
    setIsReplying(true)
  }

  const submitReply = async (e) => {
    if (e?.preventDefault) {
      e.preventDefault()
    }
    if (!isAuthenticated) {
      openAuthModal("login")
      return
    }
    if (!replyContent.trim()) return
    const parentId = comment.parentCommentId || commentId

    try {
      if (onReplySubmit) {
        await onReplySubmit(replyContent, parentId, authorAccountId)
      }
      setReplyContent("")
      setIsReplying(false)
      setShowReplies(true)
    } catch (error) {
      console.error("Failed to post reply:", error)
    }
  }

  const handleReactClick = (type) => {
    if (!isAuthenticated) {
      openAuthModal("login")
      return
    }
    onReact?.(commentId, type)
  }

  const hasReplies = replies?.length > 0

  return (
    <div
      className={`flex gap-3 group relative w-full max-w-full min-w-0 ${
        isNested ? "justify-start" : ""
      }`}
    >
      {/* ── Avatar column ────────────────────────────────────────── */}
      <div className="flex flex-col items-center shrink-0">
        <Avatar
          size={isNested ? 26 : 30}
          src={commentAvatar}
          name={authorName}
          accountId={authorAccountId}
          className="shrink-0"
        />
        {/* L-shaped connector: vertical line down + horizontal turn right — only for top-level comment branching into replies */}
        {hasReplies && showReplies && nestLevel === 0 && (
          <div className="flex flex-col items-center flex-1 mt-3">
            {/* Vertical segment — fills remaining height */}
            <div className="w-[2px] flex-1 bg-[#e2e2e2] rounded-full" />
            {/* Horizontal segment — turns right toward toggle area */}
            <div className="h-[2px] w-3.5 bg-[#e2e2e2] rounded-full translate-x-[6px]" />
          </div>
        )}
      </div>

      {/* ── Content column ───────────────────────────────────────── */}
      <div className="flex-1 min-w-0 max-w-full">
        {/* Author & Timestamp + More menu */}
        <div className="flex flex-col gap-1 w-full max-w-full min-w-0">
          <div className="flex items-start justify-between gap-1 w-full min-w-0">
            {/* On laptop (lg:), timestamp sits directly under authorName */}
            <div className="flex flex-row lg:flex-col lg:items-start items-center flex-wrap gap-x-2 gap-y-0.5 min-w-0">
              <span
                onClick={(e) => {
                  if (authorAccountId) {
                    e.stopPropagation()
                    navigate(`/profile/${authorAccountId}`)
                  }
                }}
                className={`font-semibold text-sm text-slate-800 leading-snug break-words ${authorAccountId ? "cursor-pointer hover:underline hover:text-cath-red-700 transition-colors" : ""}`}
              >
                {authorName}
              </span>
              <div className="flex items-center gap-1.5 text-xs text-slate-400 leading-tight">
                <span className="lg:hidden leading-none">•</span>
                <span className="whitespace-nowrap">
                  {getTranslatedTimeAgo(
                    comment.createDate,
                    t.news?.newsCard?.timeAgo,
                  )}
                </span>
                {hasBeenEdited(comment) && (
                  <>
                    <span className="text-[10px] leading-none">•</span>
                    <span className="italic">
                      {t.news?.newsDetail?.edited || "Edited"}
                    </span>
                  </>
                )}
              </div>
            </div>
            {isOwner && (
              <CommentMoreMenu
                onEdit={() => {
                  setEditContent(comment.content)
                  setIsEditing(true)
                }}
                onDelete={() => onDelete(commentId)}
              />
            )}
          </div>

          {/* Comment Body */}
          {isEditing ? (
            <div className="flex flex-col gap-2 w-full max-w-full">
              <textarea
                rows={2}
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                autoFocus
                className="w-full bg-[#f5f5f5] border border-[#e2e2e2] rounded-xl px-3 py-2 text-sm text-slate-800 focus:outline-none focus:border-cath-red-700 transition-colors resize-none"
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-3 py-1 rounded-full border border-cath-red-700 text-cath-red-700 font-medium text-xs hover:bg-cath-red-50 transition-colors"
                >
                  {t.news?.newsDetail?.cancel || "Hủy"}
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    if (onEdit) {
                      await onEdit(commentId, editContent)
                    }
                    setIsEditing(false)
                  }}
                  disabled={!editContent.trim() || editContent === comment.content}
                  className="px-3.5 py-1 rounded-full bg-cath-red-700 text-white font-medium text-xs hover:bg-cath-red-800 transition-colors disabled:opacity-50"
                >
                  {t.news?.newsDetail?.save || "Gửi"}
                </button>
              </div>
            </div>
          ) : (
            <p className="text-sm text-slate-800 leading-relaxed break-words [overflow-wrap:anywhere] whitespace-pre-wrap max-w-full">
              {comment.replyToAccountName && (
                <span
                  onClick={handleReplyToClick}
                  className={`font-semibold mr-1.5 text-cath-red-700 ${
                    replyToAccountId
                      ? "cursor-pointer hover:underline hover:text-cath-red-800 transition-colors"
                      : ""
                  }`}
                  title={
                    replyToAccountId
                      ? `Xem trang cá nhân của @${comment.replyToAccountName}`
                      : undefined
                  }
                >
                  @{comment.replyToAccountName}
                </span>
              )}
              {!comment.replyToAccountName && mentionMatch ? (
                <>
                  <span
                    onClick={handleReplyToClick}
                    className={`font-semibold mr-1.5 text-cath-red-700 ${
                      replyToAccountId
                        ? "cursor-pointer hover:underline hover:text-cath-red-800 transition-colors"
                        : ""
                    }`}
                  >
                    {mentionMatch[1]}
                  </span>
                  {mentionMatch[2]}
                </>
              ) : (
                comment.content
              )}
            </p>
          )}
        </div>

        {/* ── Actions row ── */}
        {!isEditing && (
          <div className="flex items-center gap-3 mt-1.5 w-full max-w-full">
            {/* Reaction button */}
            <div
              className={`group/reactions relative flex items-center ${
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
                onClick={() => {
                  const type = comment.currentUserReaction || 1
                  handleReactClick(type)
                }}
                className="flex items-center gap-1.5 cursor-pointer text-[#7b7979] hover:text-black transition-colors"
                title={
                  comment.currentUserReaction === 2 ||
                  comment.currentUserReaction === "Love"
                    ? t.news?.newsDetail?.love || "Yêu"
                    : comment.currentUserReaction === 3 ||
                        comment.currentUserReaction === "Haha"
                      ? t.news?.newsDetail?.haha || "Haha"
                      : t.news?.newsDetail?.like || "Thích"
                }
              >
                {comment.currentUserReaction ? (
                  <ReactionBadge
                    type={comment.currentUserReaction}
                    size={16}
                  />
                ) : (
                  <ThumbsUp
                    size={14}
                    strokeWidth={1.8}
                    className="text-[#7b7979]"
                  />
                )}
                {comment.totalReactions > 0 && (
                  <span className="font-medium text-xs text-[#7b7979]">
                    {comment.totalReactions}
                  </span>
                )}
              </button>

              {/* Reactions Popover */}
              <ReactionsPopover
                show={showReactions}
                onClose={() => setShowReactions(false)}
                onSelect={(_, type) =>
                  handleReactClick(
                    typeof type === "number" ? type : parseInt(type, 10),
                  )
                }
                reactions={COMMENT_FACEBOOK_REACTIONS}
                iconSize={20}
                className="mb-1"
              />
            </div>

            {/* Reply text */}
            <button
              onClick={handleReplyClick}
              className="text-xs font-semibold text-[#7b7979] hover:text-black transition-colors"
            >
              {t.news?.newsDetail?.reply || "Phản hồi"}
            </button>
          </div>
        )}

        {/* Inline Reply Form */}
        {isReplying && (
          <form
            onSubmit={submitReply}
            className="mt-2.5 flex flex-col gap-2 relative z-10 w-full max-w-full"
          >
            <div className="flex items-center gap-2 w-full">
              <Avatar
                size={26}
                src={userAvatar}
                name={user?.fullName || user?.firstName || user?.username || "User"}
                accountId={user?.accountId || user?.id}
                className="shrink-0"
              />
              <input
                type="text"
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                placeholder={`Reply to @${authorName}...`}
                autoFocus
                className="flex-1 min-w-0 bg-transparent border-b-2 border-cath-red-700 px-2 py-1 text-sm text-slate-800 focus:outline-none transition-colors"
              />
            </div>
            <div className="flex items-center justify-between">
              <Popover
                placement="bottom-right"
                trigger={
                  <button
                    type="button"
                    className="p-1 text-[#7b7979] hover:text-black transition-colors rounded-full hover:bg-black/5"
                    title="Emoji"
                  >
                    <Smile size={18} strokeWidth={1.5} />
                  </button>
                }
                content={(close) => (
                  <EmojiPickerWrapper
                    width="280px"
                    height="320px"
                    onSelect={(emoji) => {
                      setReplyContent((prev) => prev + emoji)
                      close()
                    }}
                  />
                )}
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsReplying(false)}
                  className="px-3 py-1 rounded-full border border-cath-red-700 text-cath-red-700 font-medium text-xs hover:bg-cath-red-50 transition-colors"
                >
                  {t.news?.newsDetail?.cancel || "Hủy"}
                </button>
                <button
                  type="submit"
                  onClick={submitReply}
                  disabled={!replyContent.trim()}
                  className="px-3.5 py-1 rounded-full bg-cath-red-700 text-white font-medium text-xs hover:bg-cath-red-800 transition-colors disabled:opacity-50"
                >
                  {t.news?.newsDetail?.comment || "Gửi"}
                </button>
              </div>
            </div>
          </form>
        )}

        {/* Replies — rendered first so toggle anchors at the bottom */}
        {showReplies && hasReplies && (
          <div
            className={`mt-3.5 flex flex-col gap-4 sm:gap-4.5 relative z-10 w-full max-w-full ${
              nestLevel >= 1 ? "-ml-[38px] sm:-ml-[42px]" : ""
            }`}
          >
            {replies
              .slice()
              .sort((a, b) => new Date(a.createDate) - new Date(b.createDate))
              .map((reply) => (
                <CommentItem
                  key={reply.commentId || reply.id}
                  comment={reply}
                  replies={reply.replies || []}
                  nestLevel={nestLevel + 1}
                  currentUser={user}
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
            className="mt-2 flex items-center gap-1.5 font-semibold text-xs text-cath-red-700 hover:text-cath-red-800 transition-colors relative z-10"
          >
            {showReplies ? (
              <>
                {t.news?.newsDetail?.hideReplies || "Ẩn phản hồi"}
                <ChevronUp size={14} />
              </>
            ) : (
              <>
                {t.news?.newsDetail?.viewReplies?.replace("{{count}}", replies.length) || "phản hồi"}
                <ChevronDown size={14} />
              </>
            )}
          </button>
        )}
      </div>
    </div>
  )
}

export default CommentItem
