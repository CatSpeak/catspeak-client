import React, { useState, useRef, useEffect } from "react"
import { Video, FileText } from "lucide-react"

import {
  useUpdatePostMutation,
  useDeletePostMutation,
} from "../../../store/api/social/profilePostsApi"
import { useReactToPostMutation } from "@/store/api/social/postsApi"
import useSharePost from "@/shared/hooks/useSharePost"
import FluentCard from "@/shared/components/ui/FluentCard"
import PostEditorModal from "./PostEditorModal"
import ShareModal from "@/features/news/components/ShareModal"
import CommentsSection from "@/features/news/components/CommentsSection"
import PostContent from "@/features/news/components/PostContent"
import PostHeader from "./PostHeader"
import PostActionBar from "./PostActionBar"
import { useLanguage } from "@/shared/context/LanguageContext"

const ProfilePostCard = ({ post, isOwnProfile }) => {
  const { t } = useLanguage()
  const [isEditing, setIsEditing] = useState(false)
  const [isCommentsOpen, setIsCommentsOpen] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const [isOverflowing, setIsOverflowing] = useState(false)
  const contentRef = useRef(null)

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
  }, [post?.content, isExpanded])
  const {
    shareUrl,
    isShareModalOpen,
    setIsShareModalOpen,
    handleShare: triggerShare,
  } = useSharePost()

  const [updatePost, { isLoading: isUpdating }] = useUpdatePostMutation()
  const [deletePost] = useDeletePostMutation()
  const [reactToPost] = useReactToPostMutation()

  const handleUpdatePost = async (formData) => {
    try {
      await updatePost({ postId: post.postId, formData }).unwrap()
      setIsEditing(false)
    } catch (error) {
      console.error("Failed to update post:", error)
      throw error
    }
  }

  const handleDeletePost = async () => {
    if (
      window.confirm(
        t.profile?.post?.deleteConfirm || "Bạn có chắc muốn xóa bài viết này?",
      )
    ) {
      try {
        await deletePost(post.postId).unwrap()
      } catch (error) {
        console.error("Failed to delete post:", error)
      }
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
      <FluentCard padding="p-0" className="overflow-hidden">
        <div className="p-4 sm:p-6 space-y-4">
          <PostHeader
            post={post}
            isOwnProfile={isOwnProfile}
            onEdit={() => setIsEditing(true)}
            onDelete={handleDeletePost}
          />

          {post.title && post.title !== "Untitled" && (
            <h4 className="text-2xl font-bold">{post.title}</h4>
          )}

          {post.content && (
            <div>
              <div
                ref={contentRef}
                className={!isExpanded ? "line-clamp-2 overflow-hidden" : ""}
              >
                <PostContent html={post.content} className="text-sm text-[#606060]" />
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

          {post.media && post.media.length > 0 && (
            <div className="grid grid-cols-2 gap-2">
              {post.media.slice(0, 2).map((m) => (
                <div
                  key={m.postMediaId}
                  className="aspect-square bg-gray-200 rounded-lg overflow-hidden"
                >
                  {m.mediaType === "Image" ? (
                    <img
                      src={m.mediaUrl}
                      alt="media"
                      loading="lazy"
                      className="w-full h-full object-cover"
                    />
                  ) : m.mediaType === "Video" ? (
                    <video
                      src={m.mediaUrl}
                      controls
                      preload="metadata"
                      className="w-full h-full object-cover bg-black"
                      onClick={(e) => e.stopPropagation()}
                    />
                  ) : (
                    <a
                      href={m.mediaUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="w-full h-full flex flex-col items-center justify-center bg-gray-50 hover:bg-gray-100 transition-colors p-4 text-center border border-border"
                    >
                      <FileText className="w-10 h-10 text-blue-500 mb-2 shrink-0" />
                      <span className="text-sm font-semibold text-gray-700 truncate w-full px-2">
                        {m.fileName || t.profile?.post?.document || "Tài liệu"}
                      </span>
                      <span className="text-xs text-gray-400 mt-1">
                        {m.fileSize
                          ? `${(m.fileSize / (1024 * 1024)).toFixed(2)} MB`
                          : ""}
                      </span>
                    </a>
                  )}
                </div>
              ))}
              {post.media.length > 2 && (
                <div className="aspect-square bg-[#333333] rounded-lg flex items-center justify-center text-white text-xl font-bold">
                  +{post.media.length - 2}
                </div>
              )}
            </div>
          )}
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
    </>
  )
}

export default ProfilePostCard
