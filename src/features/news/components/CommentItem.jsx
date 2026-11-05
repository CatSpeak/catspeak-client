import React, { useState, useRef, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth, useGetProfileQuery } from "@/features/auth"
import { useAuthModal } from "@/shared/context/AuthModalContext"
import { ThumbsUp, Smile, ChevronDown, ChevronUp, Send } from "lucide-react"
import IconButton from "@/shared/components/ui/buttons/IconButton"
import PillButton from "@/shared/components/ui/buttons/PillButton"
import CommentMoreMenu from "./CommentMoreMenu"
import { getImageUrl } from "@/shared/utils/imageUtils"
import { getTranslatedTimeAgo } from "@/features/news/utils/newsUtils"
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
  const user =
    currentUser || (profileData?.data ?? profileData ?? authUser ?? {})
  const { t } = useLanguage()
  const navigate = useNavigate()
  const [showReactions, setShowReactions] = useState(false)
  const holdTimer = useRef(null)
  const closeTimer = useRef(null)

  const handleMouseEnter = () => {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current)
      closeTimer.current = null
    }
    setShowReactions(true)
  }

  const handleMouseLeave = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current)
    closeTimer.current = setTimeout(() => {
      setShowReactions(false)
    }, 200)
  }

  const handleTouchStart = () => {
    holdTimer.current = setTimeout(() => setShowReactions(true), 400)
  }

  const handleTouchEnd = () => {
    if (holdTimer.current) clearTimeout(holdTimer.current)
  }

  useEffect(() => {
    return () => {
      if (holdTimer.current) clearTimeout(holdTimer.current)
      if (closeTimer.current) clearTimeout(closeTimer.current)
    }
  }, [])

  const [isReplying, setIsReplying] = useState(false)
  const [replyContent, setReplyContent] = useState("")
  const [isSubmittingReply, setIsSubmittingReply] = useState(false)
  const [showReplies, setShowReplies] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editContent, setEditContent] = useState("")
  const [isSubmittingEdit, setIsSubmittingEdit] = useState(false)

  const replyTextareaRef = useRef(null)
  const editTextareaRef = useRef(null)
  const hasReplyContent = Boolean(replyContent.trim())
  const hasEditContent = Boolean(editContent.trim())
  const canSaveEdit =
    hasEditContent && editContent.trim() !== (comment.content || "").trim()

  useEffect(() => {
    if (replyTextareaRef.current) {
      replyTextareaRef.current.style.height = "auto"
      if (replyContent) {
        replyTextareaRef.current.style.height = `${Math.min(replyTextareaRef.current.scrollHeight, 140)}px`
      }
    }
  }, [replyContent])

  useEffect(() => {
    if (isReplying) {
      setTimeout(() => replyTextareaRef.current?.focus(), 50)
    }
  }, [isReplying])

  useEffect(() => {
    if (editTextareaRef.current) {
      editTextareaRef.current.style.height = "auto"
      if (editContent) {
        editTextareaRef.current.style.height = `${Math.min(editTextareaRef.current.scrollHeight, 140)}px`
      }
    }
  }, [editContent])

  useEffect(() => {
    if (isEditing) {
      setTimeout(() => {
        if (editTextareaRef.current) {
          editTextareaRef.current.focus()
          const len = editTextareaRef.current.value.length
          editTextareaRef.current.setSelectionRange(len, len)
        }
      }, 50)
    }
  }, [isEditing])

  const submitEdit = async (e) => {
    if (e?.preventDefault) {
      e.preventDefault()
    }
    if (
      !editContent.trim() ||
      editContent.trim() === (comment.content || "").trim() ||
      isSubmittingEdit
    ) {
      return
    }
    try {
      setIsSubmittingEdit(true)
      if (onEdit) {
        await onEdit(commentId, editContent)
      }
      setIsEditing(false)
    } catch (error) {
      console.error("Failed to edit comment:", error)
    } finally {
      setIsSubmittingEdit(false)
    }
  }

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
        comment.replyToAccountName,
    )?.accountId ||
    null

  const handleProfileClick = (e) => {
    if (authorAccountId) {
      e?.preventDefault?.()
      e?.stopPropagation()
      navigate(`/workspace/profile/${authorAccountId}`)
    }
  }

  const handleReplyToClick = (e) => {
    if (replyToAccountId) {
      e.stopPropagation()
      navigate(`/workspace/profile/${replyToAccountId}`)
    }
  }

  const mentionMatch =
    !comment.replyToAccountName && typeof comment.content === "string"
      ? comment.content.match(
          /^([@#][a-zA-Z0-9_\u00C0-\u024F\u1EA0-\u1EF9]+)\s*(.*)/s,
        )
      : null

  const isOwner = Boolean(
    user?.accountId &&
    authorAccountId &&
    String(user.accountId) === String(authorAccountId),
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
    if (!replyContent.trim() || isSubmittingReply) return
    const parentId = comment.parentCommentId || commentId

    try {
      setIsSubmittingReply(true)
      if (onReplySubmit) {
        await onReplySubmit(replyContent, parentId, authorAccountId)
      }
      setReplyContent("")
      setIsReplying(false)
      setShowReplies(true)
    } catch (error) {
      console.error("Failed to post reply:", error)
    } finally {
      setIsSubmittingReply(false)
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
      className={`flex gap-4 relative w-full max-w-full min-w-0 ${
        isNested ? "justify-start" : ""
      }`}
    >
      {/* ── Avatar column ────────────────────────────────────────── */}
      <div className="flex flex-col items-center shrink-0 w-10 relative">
        {/* Branch connector from parent trunk line into this nested avatar */}
        {isNested && (
          <div
            className="absolute -left-9 -top-4 h-9 w-9 border-l-2 border-b-2 border-border dark:border-[#3F3F3F] rounded-bl-2xl pointer-events-none"
            aria-hidden="true"
          />
        )}

        <div
          onClick={handleProfileClick}
          className={`relative inline-flex items-center justify-center shrink-0 group/avatar ${
            authorAccountId ? "cursor-pointer touch-manipulation" : ""
          }`}
          role={authorAccountId ? "button" : undefined}
          tabIndex={authorAccountId ? 0 : undefined}
          onKeyDown={(e) => {
            if (authorAccountId && (e.key === "Enter" || e.key === " ")) {
              handleProfileClick(e)
            }
          }}
          aria-label={authorName || "User"}
        >
          <Avatar
            size={40}
            src={commentAvatar}
            name={authorName}
            accountId={authorAccountId}
            hoverScale={false}
            className="group-hover/avatar:opacity-85 shrink-0"
            onClick={handleProfileClick}
          />
        </div>
        {/* L-shaped connector: vertical line down + horizontal turn right — branches into replies and toggle button */}
        {hasReplies && nestLevel === 0 && (
          <div
            className="absolute left-1/2 top-10 bottom-6 w-9 border-l-2 border-b-2 border-border dark:border-[#3F3F3F] rounded-bl-2xl pointer-events-none"
            aria-hidden="true"
          />
        )}
      </div>

      {/* ── Content column ───────────────────────────────────────── */}
      <div className="flex-1 min-w-0 max-w-full">
        {/* Author & Timestamp + More menu */}
        <div className="flex flex-col gap-2 w-full max-w-full min-w-0">
          <div className="flex items-center justify-between gap-1 w-full min-w-0 min-h-[48px]">
            <div className="flex flex-col min-w-0">
              <span
                onClick={handleProfileClick}
                className={`text-base font-bold text-slate-900 dark:text-neutral-100 break-words inline-flex items-center min-h-[48px] -my-3 py-3 ${authorAccountId ? "cursor-pointer hover:text-cath-red-700 dark:hover:text-red-400 transition-colors touch-manipulation" : ""}`}
              >
                {authorName}
              </span>
              <div className="flex items-center gap-2 text-sm text-secondary dark:text-[#AAAAAA] flex-wrap">
                <span className="whitespace-nowrap">
                  {getTranslatedTimeAgo(
                    comment.createDate,
                    t.news?.newsCard?.timeAgo,
                  )}
                </span>
                {hasBeenEdited(comment) && (
                  <>
                    <span className="w-1 h-1 rounded-full bg-secondary dark:bg-[#AAAAAA] shrink-0" />
                    <span className="italic whitespace-nowrap">
                      {t.news?.newsDetail?.edited || "Edited"}
                    </span>
                  </>
                )}
              </div>
            </div>
            {isOwner && !isEditing && (
              <CommentMoreMenu
                onEdit={() => {
                  setEditContent(comment.content || "")
                  setIsEditing(true)
                }}
                onDelete={() => onDelete(commentId)}
              />
            )}
          </div>

          {/* Comment Body */}
          {isEditing ? (
            <form
              onSubmit={submitEdit}
              className="w-full max-w-full relative z-10"
            >
              <div
                onClick={() => editTextareaRef.current?.focus()}
                className="w-full flex flex-col justify-between rounded-2xl border border-border dark:border-[#3F3F3F] bg-gray-50/60 dark:bg-[#272727] focus-within:border-cath-red-700 dark:focus-within:border-red-400 transition-colors cursor-text min-h-[92px] gap-2"
              >
                {/* Row 1: Full-Width Text Input Area */}
                <div className="w-full min-w-0 pt-4 px-4">
                  <textarea
                    ref={editTextareaRef}
                    rows={1}
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault()
                        submitEdit(e)
                      } else if (e.key === "Escape") {
                        setIsEditing(false)
                        setEditContent(comment.content || "")
                      }
                    }}
                    placeholder={
                      t.news?.newsDetail?.editComment || "Edit comment..."
                    }
                    className="w-full text-base text-foreground dark:text-white placeholder:text-[#606060] dark:placeholder:text-[#AAAAAA] bg-transparent outline-none resize-none max-h-[140px] overflow-y-auto leading-normal"
                    style={{ minHeight: "1.5rem" }}
                  />
                </div>

                {/* Row 2: Bottom Utility Toolbar */}
                <div
                  className="flex items-center justify-between w-full px-1 pb-1 cursor-default"
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Left: Emoji Picker */}
                  <div className="flex items-center shrink-0">
                    <Popover
                      placement="top-left"
                      className="shrink-0"
                      triggerClassName="inline-flex items-center justify-center"
                      trigger={
                        <IconButton
                          variant="ghost"
                          aria-label="Emoji"
                          type="button"
                          title="Emoji"
                          className="text-gray-500 hover:text-gray-800 dark:text-[#AAAAAA] dark:hover:text-white"
                        >
                          <Smile />
                        </IconButton>
                      }
                      content={(close) => (
                        <EmojiPickerWrapper
                          width="280px"
                          height="320px"
                          onSelect={(emoji) => {
                            setEditContent((prev) => prev + emoji)
                            close()
                          }}
                        />
                      )}
                    />
                  </div>

                  {/* Right: Cancel + Save Buttons */}
                  <div className="flex items-center gap-2 shrink-0 ml-auto">
                    <PillButton
                      variant="ghost"
                      type="button"
                      onClick={() => {
                        setIsEditing(false)
                        setEditContent(comment.content || "")
                      }}
                    >
                      {t.news?.newsDetail?.cancel || "Hủy"}
                    </PillButton>

                    <IconButton
                      type="submit"
                      onClick={submitEdit}
                      disabled={!canSaveEdit || isSubmittingEdit}
                      variant={canSaveEdit ? "primary" : "ghost"}
                      aria-label={t.news?.newsDetail?.save || "Lưu"}
                      title={t.news?.newsDetail?.save || "Lưu"}
                      className={
                        !canSaveEdit
                          ? "text-gray-400 hover:text-gray-600 dark:text-[#AAAAAA] dark:hover:text-white"
                          : ""
                      }
                    >
                      <Send className="-translate-x-[1px] translate-y-[1px]" />
                    </IconButton>
                  </div>
                </div>
              </div>
            </form>
          ) : (
            <p className="text-base text-slate-800 dark:text-[#E5E5E5] break-words [overflow-wrap:anywhere] whitespace-pre-wrap max-w-full">
              {comment.replyToAccountName && (
                <span
                  onClick={handleReplyToClick}
                  className={`font-semibold mr-1 text-cath-red-700 dark:text-red-400 inline-flex items-center min-h-[48px] -my-3 py-3 ${
                    replyToAccountId
                      ? "cursor-pointer hover:underline hover:text-cath-red-800 dark:hover:text-red-300 transition-colors touch-manipulation"
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
                    className={`font-semibold mr-1 text-cath-red-700 dark:text-red-400 inline-flex items-center min-h-[48px] -my-3 py-3 ${
                      replyToAccountId
                        ? "cursor-pointer hover:underline hover:text-cath-red-800 dark:hover:text-red-300 transition-colors touch-manipulation"
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
          <div className="flex items-center gap-4 mt-2 w-full max-w-full">
            {/* Reaction button */}
            <div
              className={`group/reactions relative flex items-center ${
                showReactions ? "z-50" : ""
              }`}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
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
                className="min-h-[48px] -mx-1.5 px-1.5 inline-flex items-center justify-center gap-2 cursor-pointer text-[#7b7979] dark:text-[#AAAAAA] hover:text-black dark:hover:text-white transition-colors touch-manipulation"
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
                  <ReactionBadge type={comment.currentUserReaction} />
                ) : (
                  <ThumbsUp size={20} className="text-[#7b7979] dark:text-[#AAAAAA]" />
                )}
                {comment.totalReactions > 0 && (
                  <span className="text-sm text-[#7b7979] dark:text-[#AAAAAA]">
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
              />
            </div>

            {/* Reply text */}
            <button
              type="button"
              onClick={handleReplyClick}
              className="min-h-[48px] -mx-2 px-2 inline-flex items-center justify-center text-sm text-[#7b7979] dark:text-[#AAAAAA] hover:text-black dark:hover:text-white transition-colors cursor-pointer touch-manipulation"
            >
              {t.news?.newsDetail?.reply || "Phản hồi"}
            </button>
          </div>
        )}

        {/* Inline Reply Form */}
        {isReplying && (
          <form
            onSubmit={submitReply}
            className="mt-4 flex items-start gap-4 w-full max-w-full relative z-10"
          >
            <Avatar
              size={40}
              src={userAvatar}
              name={
                user?.fullName || user?.firstName || user?.username || "User"
              }
              clickable={false}
              hoverScale={false}
              className="shrink-0"
            />
            <div className="flex-1 min-w-0">
              <div
                onClick={() => replyTextareaRef.current?.focus()}
                className="w-full flex flex-col justify-between rounded-2xl border border-border dark:border-[#3F3F3F] bg-gray-50/60 dark:bg-[#272727] focus-within:border-cath-red-700 dark:focus-within:border-red-400 transition-colors cursor-text min-h-[92px] gap-2"
              >
                {/* Row 1: Full-Width Text Input Area */}
                <div className="w-full min-w-0 pt-4 px-4">
                  <textarea
                    ref={replyTextareaRef}
                    rows={1}
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault()
                        submitReply(e)
                      } else if (e.key === "Escape") {
                        setIsReplying(false)
                        setReplyContent("")
                      }
                    }}
                    placeholder={`Reply to @${authorName}...`}
                    className="w-full text-base text-foreground dark:text-white placeholder:text-[#606060] dark:placeholder:text-[#AAAAAA] bg-transparent outline-none resize-none max-h-[140px] overflow-y-auto leading-normal"
                    style={{ minHeight: "1.5rem" }}
                  />
                </div>

                {/* Row 2: Bottom Utility Toolbar */}
                <div
                  className="flex items-center justify-between w-full px-1 pb-1 cursor-default"
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Left: Emoji Picker */}
                  <div className="flex items-center shrink-0">
                    <Popover
                      placement="top-left"
                      className="shrink-0"
                      triggerClassName="inline-flex items-center justify-center"
                      trigger={
                        <IconButton
                          variant="ghost"
                          aria-label="Emoji"
                          type="button"
                          title="Emoji"
                          className="text-gray-500 hover:text-gray-800 dark:text-[#AAAAAA] dark:hover:text-white"
                        >
                          <Smile />
                        </IconButton>
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
                  </div>

                  {/* Right: Cancel + Send Buttons */}
                  <div className="flex items-center gap-2 shrink-0 ml-auto">
                    <PillButton
                      variant="ghost"
                      onClick={() => {
                        setIsReplying(false)
                        setReplyContent("")
                      }}
                    >
                      {t.news?.newsDetail?.cancel || "Hủy"}
                    </PillButton>

                    <IconButton
                      type="submit"
                      onClick={submitReply}
                      disabled={!hasReplyContent || isSubmittingReply}
                      variant={hasReplyContent ? "primary" : "ghost"}
                      aria-label={t.news?.newsDetail?.comment || "Gửi"}
                      title={t.news?.newsDetail?.comment || "Gửi"}
                      className={
                        !hasReplyContent
                          ? "text-gray-400 hover:text-gray-600 dark:text-[#AAAAAA] dark:hover:text-white"
                          : ""
                      }
                    >
                      <Send className="-translate-x-[1px] translate-y-[1px]" />
                    </IconButton>
                  </div>
                </div>
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
          <PillButton
            variant="ghost"
            onClick={() => setShowReplies(!showReplies)}
            endIcon={showReplies ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            className="mt-2 text-cath-red-700 dark:text-red-400 hover:text-cath-red-800 dark:hover:text-red-300"
          >
            {showReplies
              ? t.news?.newsDetail?.hideReplies || "Ẩn phản hồi"
              : t.news?.newsDetail?.viewReplies?.replace(
                  "{{count}}",
                  replies.length,
                ) || "phản hồi"}
          </PillButton>
        )}
      </div>
    </div>
  )
}

export default CommentItem
