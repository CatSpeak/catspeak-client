import React from "react"
import Modal from "@/shared/components/ui/Modal"
import Avatar from "@/shared/components/ui/Avatar"
import { useLanguage } from "@/shared/context/LanguageContext"
import { useAuth } from "@/features/auth/hooks/useAuth"
import { useGetProfileQuery } from "@/features/auth"
import { getImageUrl } from "@/shared/utils/imageUtils"
import CommentInput from "./comments/CommentInput"
import TopLevelComment from "./comments/TopLevelComment"

/**
 * Modal that shows the comment section for a story.
 *
 * @param {boolean}  props.open    - Whether the modal is visible
 * @param {Function} props.onClose - Called when the modal requests to close
 */
const CommentModal = ({ open, story, onClose }) => {
  const { t } = useLanguage()
  const { user: authUser, isAuthenticated } = useAuth()
  const { data: userData } = useGetProfileQuery(undefined, { skip: !isAuthenticated })

  // Prefer full profile data; fall back to auth token payload
  const user = userData?.data ?? authUser ?? {}
  const userAvatar = user?.avatarImageUrl ? getImageUrl(user.avatarImageUrl) : null
  const userName = user?.fullName || user?.firstName || user?.username || "User"

  const storyId = story?.storyId

  // TODO: integrate with real API to get comments list
  const commentsList = []
  const isLoading = false

  // Only root-level comments; replies are nested inside each comment object
  // parentCommentId is a user-defined variable that will change according to the actual API.
  const topLevel = commentsList
    .filter((c) => !c.parentCommentId) // parentCommentId = 0 mean root comment
    .sort((a, b) => new Date(a.createDate) - new Date(b.createDate))

  const handleAddComment = async (content) => {
    if (!content.trim() || !storyId) return
    // TODO: call create comment API
  }

  if (!story) return null

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`${t.catSpeak?.comments?.title} (${commentsList.length})`}
    >
      <div className="flex flex-col gap-5">
        {/* Add comment (authenticated users) */}
        {isAuthenticated && (
          <div className="flex items-start gap-3 border-b pb-4">
            <Avatar size={34} src={userAvatar} name={userName} className="shrink-0 mt-1" />
            <div className="flex-1">
              <CommentInput
                placeholder={t.catSpeak?.comments?.placeholder}
                onSubmit={handleAddComment}
              />
            </div>
          </div>
        )}

        {/* Comment list */}
        <div className="flex flex-col gap-4 max-h-[50vh] overflow-y-auto pr-1">
          {isLoading ? (
            <div className="py-6 text-center text-sm text-[#9e9e9e]">
              {t.catSpeak?.comments?.loading}
            </div>
          ) : topLevel.length === 0 ? (
            <div className="py-6 text-center text-sm text-[#9e9e9e]">
              {t.catSpeak?.comments?.empty}
            </div>
          ) : (
            topLevel.map((comment) => (
              <TopLevelComment
                key={comment.commentId}
                comment={comment}
                storyId={storyId}
                currentUserId={user?.accountId}
              />
            ))
          )}
        </div>
      </div>
    </Modal>
  )
}

export default CommentModal