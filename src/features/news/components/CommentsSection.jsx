import React, { useState, forwardRef, useRef, useEffect } from "react"
import { useAuth, useGetProfileQuery } from "@/features/auth"
import { useAuthModal } from "@/shared/context/AuthModalContext"
import { useLanguage } from "@/shared/context/LanguageContext"
import { MessageSquare, Smile, Send } from "lucide-react"
import Avatar from "@/shared/components/ui/Avatar"
import IconButton from "@/shared/components/ui/buttons/IconButton"
import PillButton from "@/shared/components/ui/buttons/PillButton"
import ConfirmationModal from "@/shared/components/ui/ConfirmationModal"
import Popover from "@/shared/components/ui/Popover"
import EmojiPickerWrapper from "@/shared/components/ui/EmojiPickerWrapper"
import Skeleton from "@/shared/components/ui/indicators/Skeleton"
import EmptyState from "@/shared/components/ui/indicators/EmptyState"
import {
  useGetPostCommentsQuery,
  useCreatePostCommentMutation,
  useDeletePostCommentMutation,
  useEditPostCommentMutation,
  useReactToCommentMutation,
} from "@/store/api/social/postsApi"
import { getImageUrl } from "@/shared/utils/imageUtils"
import CommentItem from "./CommentItem"

const CommentsSection = forwardRef(({ postId, totalComments }, ref) => {
  const { t } = useLanguage()
  const { user: authUser, isAuthenticated } = useAuth()
  const { openAuthModal } = useAuthModal()
  const { data: userData } = useGetProfileQuery(undefined, {
    skip: !isAuthenticated,
  })
  const user = userData?.data ?? userData ?? authUser ?? {}

  const userAvatarRaw =
    user?.avatarImageUrl ||
    user?.avatarUrl ||
    user?.avatar ||
    authUser?.avatarImageUrl ||
    authUser?.avatarUrl ||
    authUser?.avatar ||
    ""
  const userAvatar = userAvatarRaw ? getImageUrl(userAvatarRaw) : null

  const {
    data: comments,
    isLoading,
    isSuccess,
  } = useGetPostCommentsQuery({ postId })
  const [createComment, { isLoading: isCreatingComment }] =
    useCreatePostCommentMutation()
  const [deleteComment] = useDeletePostCommentMutation()
  const [editComment] = useEditPostCommentMutation()
  const [reactToComment] = useReactToCommentMutation()
  const [content, setContent] = useState("")
  const hasContent = Boolean(content.trim())
  const [commentToDelete, setCommentToDelete] = useState(null)
  const textareaRef = useRef(null)

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"
      if (content) {
        textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 140)}px`
      }
    }
  }, [content])

  const handleSubmit = async (e) => {
    if (e?.preventDefault) e.preventDefault()
    if (!isAuthenticated) {
      openAuthModal("login")
      return
    }
    if (!content.trim()) return

    try {
      await createComment({
        postId,
        content: content.trim(),
        parentCommentId: null,
        replyToAccountId: null,
      }).unwrap()

      setContent("")
    } catch (error) {
      console.error("Failed to post comment", error)
    }
  }

  const handleReplySubmit = async (
    replyContent,
    parentCommentId,
    replyToAccountId,
  ) => {
    if (!isAuthenticated) {
      openAuthModal("login")
      return
    }
    if (!replyContent.trim()) return

    try {
      await createComment({
        postId,
        content: replyContent.trim(),
        parentCommentId,
        replyToAccountId,
      }).unwrap()
    } catch (error) {
      console.error("Failed to post reply", error)
      throw error
    }
  }

  const handleDelete = (commentId) => {
    setCommentToDelete(commentId)
  }

  const confirmDelete = () => {
    if (commentToDelete) {
      deleteComment({ postId, commentId: commentToDelete })
      setCommentToDelete(null)
    }
  }

  const handleEdit = async (commentId, editContent) => {
    if (!isAuthenticated) {
      openAuthModal("login")
      return
    }
    if (!editContent.trim()) return
    try {
      await editComment({
        postId,
        commentId,
        content: editContent.trim(),
      }).unwrap()
    } catch (error) {
      console.error("Failed to edit comment", error)
      throw error
    }
  }

  const handleReact = (commentId, type) => {
    if (!isAuthenticated) {
      openAuthModal("login")
      return
    }
    reactToComment({ postId, commentId, type })
  }

  if (isLoading)
    return (
      <div
        ref={ref}
        role="status"
        className="w-full max-w-full min-w-0 flex flex-col gap-4 py-1"
        aria-label={
          t.news?.newsDetail?.loadingComments || "Loading comments..."
        }
      >
        {/* Header Skeleton */}
        <Skeleton className="h-5 w-32 rounded-md" />

        {/* Comment Input Skeleton */}
        <div className="flex items-start gap-4 w-full mb-1">
          <Skeleton className="w-10 h-10 rounded-full shrink-0" />
          <Skeleton className="min-h-[92px] flex-1 rounded-2xl" />
        </div>

        {/* Comment Items Skeletons */}
        <div className="flex flex-col gap-4 w-full">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex gap-3 w-full">
              <Skeleton className="w-[30px] h-[30px] rounded-full shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="p-3 rounded-2xl bg-gray-100 dark:bg-[#272727] space-y-2 w-full max-w-md">
                  <Skeleton className="h-3.5 w-28 rounded-md" />
                  <Skeleton className="h-3 w-full rounded-md" />
                  <Skeleton className="h-3 w-3/4 rounded-md" />
                </div>
                <div className="flex gap-3 pl-2">
                  <Skeleton className="h-2.5 w-8 rounded-sm" />
                  <Skeleton className="h-2.5 w-8 rounded-sm" />
                  <Skeleton className="h-2.5 w-12 rounded-sm" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )

  const commentsList = Array.isArray(comments?.data) ? comments.data : []

  return (
    <div
      ref={ref}
      className="w-full max-w-full min-w-0 flex flex-col justify-start"
    >
      {/* ── Header ──────────────────────────────────────────────── */}
      <h2 className="mb-4 text-base font-bold text-slate-900 dark:text-white">
        {t.news?.newsDetail?.totalComments?.replace(
          "{{count}}",
          totalComments,
        ) || `Bình luận (${totalComments})`}
      </h2>

      {/* ── Comment Input ───────────────────────────────────────── */}
      {isAuthenticated ? (
        <div className="mb-4 w-full max-w-full min-w-0">
          <form
            onSubmit={handleSubmit}
            className="flex items-start gap-4 w-full"
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
                onClick={() => textareaRef.current?.focus()}
                className="w-full flex flex-col justify-between rounded-2xl border border-border dark:border-[#3F3F3F] bg-gray-50/60 dark:bg-[#272727] focus-within:border-cath-red-700 dark:focus-within:border-red-400 transition-colors cursor-text min-h-[92px] gap-2"
              >
                {/* Row 1: Full-Width Text Input Area */}
                <div className="w-full min-w-0 pt-4 px-4">
                  <textarea
                    ref={textareaRef}
                    rows={1}
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault()
                        handleSubmit(e)
                      } else if (e.key === "Escape") {
                        setContent("")
                      }
                    }}
                    aria-label={
                      t.news?.newsDetail?.writeComment || "Write a comment..."
                    }
                    placeholder={
                      t.news?.newsDetail?.writeComment || "Nhập bình luận..."
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
                            setContent((prev) => prev + emoji)
                            close()
                          }}
                        />
                      )}
                    />
                  </div>

                  {/* Right: Cancel + Send Buttons */}
                  <div className="flex items-center gap-2 shrink-0 ml-auto">
                    {hasContent && (
                      <PillButton
                        variant="ghost"
                        onClick={() => setContent("")}
                      >
                        {t.news?.newsDetail?.cancel || "Hủy"}
                      </PillButton>
                    )}

                    <IconButton
                      type="submit"
                      onClick={handleSubmit}
                      disabled={!hasContent || isCreatingComment}
                      variant={hasContent ? "primary" : "ghost"}
                      aria-label={t.news?.newsDetail?.comment || "Gửi"}
                      title={t.news?.newsDetail?.comment || "Gửi"}
                      className={
                        !hasContent
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
        </div>
      ) : (
        <div className="mb-4 w-full max-w-full">
          <PillButton
            variant="secondary"
            className="w-full"
            onClick={() => openAuthModal("login")}
          >
            {t.news?.newsDetail?.loginToComment || "Đăng nhập để bình luận"}
          </PillButton>
        </div>
      )}

      {/* ── Comments List ───────────────────────────────────────── */}
      <div
        id={`news-comments-${postId}`}
        className="flex flex-col gap-4 w-full max-w-full min-w-0"
      >
        {isLoading ? (
          <div className="flex flex-col gap-4 py-2">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="flex gap-3">
                <Skeleton className="w-10 h-10 rounded-full shrink-0" />
                <div className="flex-1 space-y-2 pt-1">
                  <Skeleton className="h-4 w-32 rounded" />
                  <Skeleton className="h-3.5 w-full rounded" />
                  <Skeleton className="h-3.5 w-4/5 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : isSuccess && commentsList.length === 0 ? (
          <EmptyState
            variant="component"
            icon={MessageSquare}
            title={t.news?.newsDetail?.noComments || "No comments yet"}
            description={
              t.news?.newsDetail?.noCommentsDescription ||
              "Be the first to share your thoughts on this article."
            }
            className="px-4"
          />
        ) : (
          commentsList
            .slice()
            .sort((a, b) => new Date(a.createDate) - new Date(b.createDate))
            .map((comment) => (
              <CommentItem
                key={comment.commentId || comment.id}
                comment={comment}
                replies={comment.replies || []}
                nestLevel={0}
                currentUser={user}
                onReplySubmit={handleReplySubmit}
                onDelete={handleDelete}
                onEdit={handleEdit}
                onReact={handleReact}
              />
            ))
        )}
      </div>

      <ConfirmationModal
        open={!!commentToDelete}
        onClose={() => setCommentToDelete(null)}
        onConfirm={confirmDelete}
        title={t.news?.newsDetail?.deleteCommentTitle || "Delete Comment"}
        message={
          t.news?.newsDetail?.deleteCommentMessage ||
          "Are you sure you want to delete this comment? This action cannot be undone."
        }
        cancelText={t.news?.newsDetail?.cancel || "Cancel"}
        confirmText={t.news?.newsDetail?.deleteCommentConfirm || "Delete"}
        confirmVariant="destructive"
      />
    </div>
  )
})

CommentsSection.displayName = "CommentsSection"

export default CommentsSection
