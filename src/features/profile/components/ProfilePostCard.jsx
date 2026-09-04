import React, { useState, useRef, useEffect } from "react"
import {
  useUpdatePostMutation,
  useDeletePostMutation,
} from "../../../store/api/social/profilePostsApi"
import { useReactToPostMutation } from "@/store/api/social/postsApi"
import useSharePost from "@/shared/hooks/useSharePost"
import FluentCard from "@/shared/components/ui/FluentCard"
import PostEditorModal from "./PostEditorModal"
import PostMediaGallery from "./PostMediaGallery"
import ShareModal from "@/features/news/components/ShareModal"
import CommentsSection from "@/features/news/components/CommentsSection"
import PostContent from "@/features/news/components/PostContent"
import ConfirmationModal from "@/shared/components/ui/ConfirmationModal"
import PostHeader from "./PostHeader"
import PostActionBar from "./PostActionBar"
import { useLanguage } from "@/shared/context/LanguageContext"

const ProfilePostCard = ({ post, isOwnProfile }) => {
  const { t } = useLanguage()
  const [isEditing, setIsEditing] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [isCommentsOpen, setIsCommentsOpen] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const [isOverflowing, setIsOverflowing] = useState(false)
  const contentRef = useRef(null)

  const contentUrl = post?.contentUrl || post?.ContentUrl || null
  const hasContent = Boolean(post?.content || contentUrl)

  useEffect(() => {
    const el = contentRef.current
    if (!el) return

    const checkOverflow = () => {
      if (!isExpanded) {
        setIsOverflowing(el.scrollHeight > el.clientHeight + 1)
      }
    }

    checkOverflow()
    const observer = new ResizeObserver(checkOverflow)
    observer.observe(el)
    return () => observer.disconnect()
  }, [post?.content, contentUrl, isExpanded])
  const {
    shareUrl,
    isShareModalOpen,
    setIsShareModalOpen,
    handleShare: triggerShare,
  } = useSharePost()

  const [updatePost, { isLoading: isUpdating }] = useUpdatePostMutation()
  const [deletePost, { isLoading: isDeleting }] = useDeletePostMutation()
  const [reactToPost] = useReactToPostMutation()

  const handleUpdatePost = async (formData) => {
    await updatePost({ postId: post.postId, formData }).unwrap()
    setIsEditing(false)
  }

  const handleConfirmDelete = async () => {
    try {
      await deletePost(post.postId).unwrap()
      setIsDeleteModalOpen(false)
    } catch (error) {
      console.error("Failed to delete post:", error)
    }
  }

  const handleReact = (e, type) => {
    e.stopPropagation()
    reactToPost({ postId: post.postId, type })
  }

  const handleShare = (e) => {
    triggerShare(e, post?.postId)
  }

  return (
    <>
      <FluentCard padding="p-0">
        <div className="p-4 sm:p-6 space-y-4">
          <PostHeader
            post={post}
            isOwnProfile={isOwnProfile}
            onEdit={() => setIsEditing(true)}
            onDelete={() => setIsDeleteModalOpen(true)}
          />

          {post.title && post.title !== "Untitled" && (
            <h4 className="text-2xl font-bold">{post.title}</h4>
          )}

          {hasContent && (
            <div>
              <div
                ref={contentRef}
                className={!isExpanded ? "line-clamp-2 overflow-hidden" : ""}
              >
                <PostContent
                  html={post.content}
                  contentUrl={contentUrl}
                  className="text-sm text-[#606060]"
                />
              </div>
              {(isOverflowing || isExpanded) && (
                <button
                  type="button"
                  onClick={() => setIsExpanded((prev) => !prev)}
                  className="inline-flex items-center min-h-[48px] -my-1.5 py-1.5 px-1 -mx-1 text-sm font-semibold text-cath-red-700 hover:text-cath-red-800 hover:underline focus:outline-none cursor-pointer touch-manipulation"
                >
                  {isExpanded
                    ? t.profile?.post?.showLess || "Thu gọn"
                    : t.profile?.post?.seeMore || "Xem thêm"}
                </button>
              )}
            </div>
          )}

          <PostMediaGallery media={post.media} />
        </div>

        <PostActionBar
          post={post}
          isCommentsOpen={isCommentsOpen}
          onToggleComments={() => setIsCommentsOpen(!isCommentsOpen)}
          onReact={handleReact}
          onShare={handleShare}
        />

        {isCommentsOpen && (
          <div className="p-4 sm:p-6 pt-3 border-t border-border">
            <CommentsSection
              postId={post.postId}
              totalComments={post.totalComments || 0}
            />
          </div>
        )}
      </FluentCard>

      <ShareModal
        open={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        shareUrl={shareUrl}
      />

      <PostEditorModal
        isOpen={isEditing}
        onClose={() => setIsEditing(false)}
        initialTitle={post.title || ""}
        initialSlug={post.slug || ""}
        initialContent={post.content || ""}
        initialPrivacy={post.privacy || "Public"}
        initialLanguageCommunity={post.languageCommunity || "All"}
        initialMedias={post.media || []}
        isEditMode={true}
        isSubmitting={isUpdating}
        onSubmit={handleUpdatePost}
      />

      <ConfirmationModal
        open={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title={
          t.profile?.post?.deleteTitle ||
          t.profile?.post?.header?.delete ||
          "Xóa bài viết"
        }
        message={
          t.profile?.post?.deleteConfirm ||
          "Bạn có chắc muốn xóa bài viết này?"
        }
        confirmText={
          t.profile?.post?.deleteBtn ||
          t.profile?.post?.header?.delete ||
          "Xóa"
        }
        cancelText={t.profile?.post?.editor?.cancel || "Hủy"}
        confirmVariant="destructive"
        isPending={isDeleting}
      />
    </>
  )
}

export default ProfilePostCard
