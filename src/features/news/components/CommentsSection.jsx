import React, { useState, forwardRef } from "react"
import { useAuth, useGetProfileQuery } from "@/features/auth"
import { useAuthModal } from "@/shared/context/AuthModalContext"
import { useLanguage } from "@/shared/context/LanguageContext"
import { ChevronDown, ChevronUp, MessageSquare, Smile } from "lucide-react"
import Avatar from "@/shared/components/ui/Avatar"
import ConfirmationModal from "@/shared/components/ui/ConfirmationModal"
import Popover from "@/shared/components/ui/Popover"
import EmojiPickerWrapper from "@/shared/components/ui/EmojiPickerWrapper"
import LoadingSpinner from "@/shared/components/ui/indicators/LoadingSpinner"
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

  const { data: comments, isLoading, isSuccess } = useGetPostCommentsQuery({ postId })
  const [createComment] = useCreatePostCommentMutation()
  const [deleteComment] = useDeletePostCommentMutation()
  const [editComment] = useEditPostCommentMutation()
  const [reactToComment] = useReactToCommentMutation()
  const [content, setContent] = useState("")
  const [commentToDelete, setCommentToDelete] = useState(null)
  const [isCollapsed, setIsCollapsed] = useState(false)

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
      <div ref={ref} role="status" className="py-6" aria-label={t.news?.newsDetail?.loadingComments || "Loading comments..."}>
        <LoadingSpinner className="flex flex-col items-center justify-center [&_svg]:h-6 [&_svg]:w-6" text={t.news?.newsDetail?.loadingComments || "Loading comments..."} />
      </div>
    )

  const commentsList = Array.isArray(comments?.data) ? comments.data : []

  return (
    <div ref={ref} className="w-full max-w-full min-w-0 flex flex-col justify-start">
      {/* ── Header ──────────────────────────────────────────────── */}
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 className="min-w-0 truncate text-base font-semibold leading-snug text-slate-900">
          {t.news?.newsDetail?.totalComments?.replace(
            "{{count}}",
            totalComments,
          ) || `Bình luận (${totalComments})`}
        </h2>
        <button
          type="button"
          onClick={() => setIsCollapsed(!isCollapsed)}
          aria-expanded={!isCollapsed}
          aria-controls={`news-comments-${postId}`}
          aria-label={isCollapsed ? t.news?.newsDetail?.expandComments || "Show comments" : t.news?.newsDetail?.collapseComments || "Hide comments"}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[#7b7979] transition-colors hover:bg-black/5 hover:text-black focus-visible:outline-cath-red-700"
        >
          {isCollapsed ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </button>
      </div>

      {/* ── Comment Input ───────────────────────────────────────── */}
      {isAuthenticated ? (
        <div className="mb-4 border-b border-[#e2e2e2] pb-3 w-full max-w-full min-w-0">
          <form onSubmit={handleSubmit} className="flex items-center gap-2 w-full">
            <Avatar
              size={32}
              src={userAvatar}
              name={
                user?.fullName || user?.firstName || user?.username || "User"
              }
              accountId={user?.accountId || user?.id}
              className="shrink-0"
            />
            <div className="flex-1 min-w-0 relative flex items-center">
              <input
                type="text"
                aria-label={t.news?.newsDetail?.writeComment || "Write a comment..."}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder={
                  t.news?.newsDetail?.writeComment || "Nhập bình luận..."
                }
                className="min-h-[38px] w-full rounded-2xl border border-[#e2e2e2] bg-[#f5f5f5] pl-3 pr-9 py-1.5 text-sm text-slate-800 transition-colors placeholder:text-[rgba(123,121,121,0.6)] focus:border-cath-red-700 focus:outline-none"
              />
              <div className="absolute right-2">
                <Popover
                  placement="bottom-right"
                  estimatedWidth={280}
                  estimatedHeight={320}
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
                        setContent((prev) => prev + emoji)
                        close()
                      }}
                    />
                  )}
                />
              </div>
            </div>
          </form>
          {content.length > 0 && (
            <div className="mt-2 flex justify-end gap-2 pl-[40px]">
              <button
                type="button"
                onClick={() => setContent("")}
                className="px-3 py-1 rounded-full border border-cath-red-700 text-cath-red-700 font-medium text-xs hover:bg-cath-red-50 transition-colors"
              >
                {t.news?.newsDetail?.cancel || "Hủy"}
              </button>
              <button
                type="submit"
                onClick={handleSubmit}
                disabled={!content.trim()}
                className="px-3.5 py-1 rounded-full bg-cath-red-700 text-white font-medium text-xs hover:bg-cath-red-800 transition-colors disabled:opacity-50"
              >
                {t.news?.newsDetail?.comment || "Gửi"}
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="mb-4 border-b border-[#e2e2e2] pb-3 w-full max-w-full">
          <button
            type="button"
            onClick={() => openAuthModal("login")}
            className="w-full py-2.5 px-3 rounded-xl border border-dashed border-gray-300 text-xs sm:text-sm text-gray-500 hover:text-cath-red-700 hover:border-cath-red-700 transition-colors text-center font-medium bg-slate-50/50"
          >
            {t.news?.newsDetail?.loginToComment || "Đăng nhập để bình luận"}
          </button>
        </div>
      )}

      {/* ── Comments List ───────────────────────────────────────── */}
      {!isCollapsed && (
        <div id={`news-comments-${postId}`} className="flex flex-col gap-5 sm:gap-6 w-full max-w-full min-w-0">
          {isSuccess && commentsList.length === 0 ? (
            <EmptyState
              variant="component"
              icon={MessageSquare}
              title={t.news?.newsDetail?.noComments || "No comments yet"}
              description={t.news?.newsDetail?.noCommentsDescription || "Be the first to share your thoughts on this article."}
              className="px-4"
            />
          ) : commentsList
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
            ))}
        </div>
      )}

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
