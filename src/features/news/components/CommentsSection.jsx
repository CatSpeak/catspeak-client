import React, { useState, forwardRef } from "react"
import { useAuth, useGetProfileQuery } from "@/features/auth"
import { useLanguage } from "@/shared/context/LanguageContext"
import Avatar from "@/shared/components/ui/Avatar"
import ConfirmationModal from "@/shared/components/ui/ConfirmationModal"
import {
  useGetPostCommentsQuery,
  useCreatePostCommentMutation,
  useDeletePostCommentMutation,
  useEditPostCommentMutation,
  useReactToCommentMutation,
} from "@/store/api/postsApi"
import { getImageUrl } from "@/shared/utils/imageUtils"
import PillButton from "@/shared/components/ui/buttons/PillButton"
import TextInput from "@/shared/components/ui/inputs/TextInput"
import CommentItem from "./CommentItem"

const CommentsSection = forwardRef(({ postId, totalComments }, ref) => {
  const { t } = useLanguage()
  const { user: authUser, isAuthenticated } = useAuth()
  const { data: userData } = useGetProfileQuery(undefined, { skip: !isAuthenticated })
  const user = userData?.data ?? authUser ?? {}
  
  const { data: comments, isLoading } = useGetPostCommentsQuery({ postId })
  const [createComment] = useCreatePostCommentMutation()
  const [deleteComment] = useDeletePostCommentMutation()
  const [editComment] = useEditPostCommentMutation()
  const [reactToComment] = useReactToCommentMutation()
  const [content, setContent] = useState("")
  const [commentToDelete, setCommentToDelete] = useState(null)

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
      <div className="p-4 text-center text-gray-500">
        {t.news?.newsDetail?.loadingComments || "Loading comments..."}
      </div>
    )

  const commentsList = comments?.data || []

  return (
    <div className="mt-6" ref={ref}>
      {totalComments > 0 && (
        <div className="font-semibold text-lg mb-4 text-gray-900">
          {t.news?.newsDetail?.totalComments?.replace(
            "{{count}}",
            totalComments,
          ) || `${totalComments} Comments`}
        </div>
      )}
      {/* Comment Form */}
      {isAuthenticated && (
        <div className="flex gap-3">
          <Avatar
            size={48}
            src={user?.avatarImageUrl ? getImageUrl(user.avatarImageUrl) : null}
            name={user?.fullName || user?.firstName || user?.username || "User"}
            className="shrink-0"
          />
          <form onSubmit={handleSubmit} className="flex-1 flex flex-col gap-3">
            <TextInput
              id="post-comment-input"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={
                t.news?.newsDetail?.writeComment || "Write a comment..."
              }
              autoFocus={false}
              multiline
            />
            {content.length > 0 && (
              <div className="flex justify-end gap-3">
                <PillButton
                  type="button"
                  variant="secondary"
                  onClick={() => setContent("")}
                >
                  {t.news?.newsDetail?.cancel || "Cancel"}
                </PillButton>
                <PillButton
                  type="submit"
                  variant="primary"
                  disabled={!content.trim()}
                >
                  {t.news?.newsDetail?.comment || "Comment"}
                </PillButton>
              </div>
            )}
          </form>
        </div>
      )}

      {/* Comments List */}
      <div className="space-y-6 mt-6">
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

      <ConfirmationModal
        open={!!commentToDelete}
        onClose={() => setCommentToDelete(null)}
        onConfirm={confirmDelete}
        title={t.news?.newsDetail?.deleteCommentTitle || "Delete Comment"}
        message={t.news?.newsDetail?.deleteCommentMessage || "Are you sure you want to delete this comment? This action cannot be undone."}
        cancelText={t.news?.newsDetail?.cancel || "Cancel"}
        confirmText={t.news?.newsDetail?.deleteCommentConfirm || "Delete"}
        confirmVariant="destructive"
      />
    </div>
  )
})

export default CommentsSection
