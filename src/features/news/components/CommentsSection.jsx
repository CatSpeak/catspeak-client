import React, { useState, forwardRef } from "react"
import { useAuth, useGetProfileQuery } from "@/features/auth"
import { useLanguage } from "@/shared/context/LanguageContext"
import { ChevronDown, ChevronUp } from "lucide-react"
import Avatar from "@/shared/components/ui/Avatar"
import ConfirmationModal from "@/shared/components/ui/ConfirmationModal"
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
  const { data: userData } = useGetProfileQuery(undefined, {
    skip: !isAuthenticated,
  })
  const user = userData?.data ?? authUser ?? {}

  const { data: comments, isLoading } = useGetPostCommentsQuery({ postId })
  const [createComment] = useCreatePostCommentMutation()
  const [deleteComment] = useDeletePostCommentMutation()
  const [editComment] = useEditPostCommentMutation()
  const [reactToComment] = useReactToCommentMutation()
  const [content, setContent] = useState("")
  const [commentToDelete, setCommentToDelete] = useState(null)
  const [isCollapsed, setIsCollapsed] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!content.trim() || !isAuthenticated) return

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
    if (!replyContent.trim() || !isAuthenticated) return

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
    if (!editContent.trim() || !isAuthenticated) return
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
    if (!isAuthenticated) return
    reactToComment({ postId, commentId, type })
  }

  if (isLoading)
    return (
      <div className="p-4 text-center text-gray-500 font-nunito">
        {t.news?.newsDetail?.loadingComments || "Loading comments..."}
      </div>
    )

  const commentsList = comments?.data || []

  return (
    <div ref={ref}>
      {/* ── Header ──────────────────────────────────────────────── */}
      <div className="mb-3 flex items-center justify-between gap-3">
        <h3 className="min-w-0 truncate font-nunito text-lg font-semibold leading-[1.35] text-black">
          {t.news?.newsDetail?.totalComments?.replace(
            "{{count}}",
            totalComments,
          ) || `Bình luận (${totalComments})`}
        </h3>
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="flex h-6 w-6 shrink-0 items-center justify-center text-[#7b7979] transition-colors hover:text-black"
        >
          {isCollapsed ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
        </button>
      </div>

      {/* ── Comment Input ───────────────────────────────────────── */}
      {isAuthenticated && (
        <div className="mb-4 border-b border-[#e2e2e2] pb-3">
          <form onSubmit={handleSubmit} className="flex items-center gap-2">
            <Avatar
              size={32}
              src={
                user?.avatarImageUrl ? getImageUrl(user.avatarImageUrl) : null
              }
              name={
                user?.fullName || user?.firstName || user?.username || "User"
              }
              className="shrink-0"
            />
            <div className="flex-1 relative">
              <input
                type="text"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder={
                  t.news?.newsDetail?.writeComment || "Nhập bình luận..."
                }
                className="min-h-[42px] w-full rounded-2xl border border-[#e2e2e2] bg-[#f5f5f5] px-3 py-2 font-nunito text-sm text-black transition-colors placeholder:text-[rgba(123,121,121,0.5)] focus:border-cath-red-700 focus:outline-none"
              />
            </div>
          </form>
          {content.length > 0 && (
            <div className="mt-2 flex justify-end gap-2 pl-[40px]">
              <button
                type="button"
                onClick={() => setContent("")}
                className="px-3 py-1 rounded-full border border-cath-red-700 text-cath-red-700 font-nunito font-medium text-sm hover:bg-cath-red-50 transition-colors"
              >
                {t.news?.newsDetail?.cancel || "Hủy"}
              </button>
              <button
                type="submit"
                onClick={handleSubmit}
                disabled={!content.trim()}
                className="px-4 py-1 rounded-full bg-cath-red-700 text-white font-nunito font-medium text-sm hover:bg-cath-red-800 transition-colors disabled:opacity-50"
              >
                {t.news?.newsDetail?.comment || "Gửi"}
              </button>
            </div>
          )}
        </div>
      )}

      {/* ── Comments List ───────────────────────────────────────── */}
      {!isCollapsed && (
        <div className="flex flex-col gap-4">
          {commentsList
            .slice()
            .sort((a, b) => new Date(a.createDate) - new Date(b.createDate))
            .map((comment) => (
              <CommentItem
                key={comment.commentId}
                comment={comment}
                replies={comment.replies || []}
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
