import React, { useState } from "react"
import { Video, FileText } from "lucide-react"

import {
  useUpdatePostMutation,
  useDeletePostMutation,
} from "../../../store/api/social/profilePostsApi"
import {
  useReactToPostMutation,
  useSharePostMutation,
} from "@/store/api/social/postsApi"
import FluentCard from "@/shared/components/ui/FluentCard"
import PostEditorModal from "./PostEditorModal"
import ShareModal from "@/features/news/components/ShareModal"
import CommentsSection from "@/features/news/components/CommentsSection"
import PostContent from "@/features/news/components/PostContent"
import PostHeader from "./PostHeader"
import PostActionBar from "./PostActionBar"

const ProfilePostCard = ({ post, isOwnProfile }) => {
  const [isEditing, setIsEditing] = useState(false)
  const [isCommentsOpen, setIsCommentsOpen] = useState(false)
  const [isShareModalOpen, setIsShareModalOpen] = useState(false)
  const [shareUrl, setShareUrl] = useState("")

  const [updatePost, { isLoading: isUpdating }] = useUpdatePostMutation()
  const [deletePost] = useDeletePostMutation()
  const [reactToPost] = useReactToPostMutation()
  const [sharePost] = useSharePostMutation()

  const handleUpdatePost = async (formData) => {
    try {
      await updatePost({ postId: post.postId, formData }).unwrap()
      setIsEditing(false)
    } catch (error) {
      console.error("Failed to update post:", error)
    }
  }

  const handleDeletePost = async () => {
    if (window.confirm("Bạn có chắc muốn xóa bài viết này?")) {
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

  const handleShare = async (e) => {
    e.stopPropagation()
    try {
      const result = await sharePost(post.postId).unwrap()
      let url =
        (typeof result === "string" ? result : result?.shareLink) ||
        window.location.href

      if (url && !url.startsWith("http")) {
        url = url.startsWith("/") ? url : `/${url}`
        url = `${window.location.origin}${url}`
      }

      if (url) {
        setShareUrl(url)
        setIsShareModalOpen(true)
      }
    } catch (err) {
      console.error("Share failed", err)
    }
  }

  return (
    <>
      <FluentCard className="space-y-4">
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
          <PostContent html={post.content} className="text-sm text-[#606060]" />
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
                    className="w-full h-full flex flex-col items-center justify-center bg-gray-50 hover:bg-gray-100 transition-colors p-4 text-center border border-gray-100"
                  >
                    <FileText className="w-10 h-10 text-blue-500 mb-2 shrink-0" />
                    <span className="text-sm font-semibold text-gray-700 truncate w-full px-2">
                      {m.fileName || "Tài liệu"}
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

        <PostActionBar
          post={post}
          isCommentsOpen={isCommentsOpen}
          onToggleComments={() => setIsCommentsOpen(!isCommentsOpen)}
          onReact={handleReact}
          onShare={handleShare}
        />

        {isCommentsOpen && (
          <div className="pt-2">
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
