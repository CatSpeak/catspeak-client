import React, { useState, forwardRef } from "react"
import { useAuth } from "@/features/auth/hooks/useAuth"
import { useLanguage } from "@/shared/context/LanguageContext"
import Avatar from "@/shared/components/ui/Avatar"
import {
  useGetPostCommentsQuery,
  useCreatePostCommentMutation,
  useDeletePostCommentMutation,
  useReactToCommentMutation,
} from "@/store/api/postsApi"
import { getImageUrl } from "@/shared/utils/imageUtils"
import PillButton from "@/shared/components/ui/buttons/PillButton"
import TextInput from "@/shared/components/ui/inputs/TextInput"
import CommentItem from "./CommentItem"

const CommentsSection = forwardRef(({ postId, totalComments }, ref) => {
  const { t } = useLanguage()
  const { user, isAuthenticated } = useAuth()
  const { data: comments, isLoading } = useGetPostCommentsQuery({ postId })
  const [createComment] = useCreatePostCommentMutation()
  const [deleteComment] = useDeletePostCommentMutation()
  const [reactToComment] = useReactToCommentMutation()

  const [content, setContent] = useState("")

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
    if (window.confirm(t.news?.newsDetail?.deleteComment || "Are you sure you want to delete this comment?")) {
      deleteComment({ postId, commentId })
    }
  }

  const handleReact = (commentId, type) => {
    if (!isAuthenticated) return
    reactToComment({ postId, commentId, type })
  }

  if (isLoading)
    return (
      <div className="p-4 text-center text-gray-500">{t.news?.newsDetail?.loadingComments || "Loading comments..."}</div>
    )

  const commentsList = comments?.data || []

  return (
    <div className="mt-6" ref={ref}>
      {totalComments > 0 && (
        <div className="font-semibold text-lg mb-4 text-gray-900">
          {t.news?.newsDetail?.totalComments?.replace("{{count}}", totalComments) || `${totalComments} Comments`}
        </div>
      )}
      {/* Comment Form */}
      {isAuthenticated && (
        <div className="flex gap-3">
          <Avatar 
            size={48} 
            src={user?.avatarUrl ? getImageUrl(user.avatarUrl) : null} 
            name={user?.firstName || "User"} 
            className="shrink-0"
          />
          <form onSubmit={handleSubmit} className="flex-1 flex flex-col gap-3">
            <TextInput
              id="post-comment-input"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={t.news?.newsDetail?.writeComment || "Write a comment..."}
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
              onReact={handleReact}
            />
          ))}
      </div>
    </div>
  )
})

export default CommentsSection
