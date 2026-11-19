import React, { useState, useRef, useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"
import {
  useUpdatePostMutation,
  useDeletePostMutation,
} from "../../../store/api/social/profilePostsApi"
import { useLazyGetPostBySlugQuery } from "@/store/api/social/postsApi"
import useSharePost from "@/shared/hooks/useSharePost"
import usePostReaction from "@/shared/hooks/usePostReaction"
import FluentCard from "@/shared/components/ui/FluentCard"
import PostEditorModal from "./PostEditorModal"
import PostMediaGallery from "./PostMediaGallery"
import ShareModal from "@/features/news/components/ShareModal"
import CommentsSection from "@/features/news/components/CommentsSection"
import PostContent from "@/features/news/components/PostContent"
import HighlightedText from "@/features/news/components/HighlightedText"
import ConfirmationModal from "@/shared/components/ui/ConfirmationModal"
import PostHeader from "./PostHeader"
import PostActionBar from "./PostActionBar"
import ReactionStackedBadges from "@/features/news/components/ReactionStackedBadges"
import { useLanguage } from "@/shared/context/LanguageContext"

const ProfilePostCard = ({ post, isOwnProfile, searchKeyword = "" }) => {
  const navigate = useNavigate()
  const { lang: paramLang } = useParams()
  const { t, language } = useLanguage()
  const currentLang = paramLang || language || "vi"
  const [isEditing, setIsEditing] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [isCommentsOpen, setIsCommentsOpen] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const [isOverflowing, setIsOverflowing] = useState(false)
  const contentRef = useRef(null)

  const contentUrl = post?.contentUrl || post?.ContentUrl || null
  // List API (GetPostsAsync) strips Content (excludeContent=true) and old posts
  // have ContentUrl=null, so fall back to excerpt (backend always returns it).
  const excerpt = post?.excerpt || post?.Excerpt || null
  const hasRichContent = Boolean(post?.content || contentUrl)
  const hasContent = Boolean(hasRichContent || excerpt)

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
  }, [post?.content, contentUrl, excerpt, isExpanded])
  const {
    shareUrl,
    isShareModalOpen,
    setIsShareModalOpen,
    handleShare: triggerShare,
  } = useSharePost()

  const [updatePost, { isLoading: isUpdating }] = useUpdatePostMutation()
  const [deletePost, { isLoading: isDeleting }] = useDeletePostMutation()
  const { handleReact } = usePostReaction(post)

  const [
    triggerGetPostBySlug,
    { data: detailedPostData, isLoading: isLoadingDetail },
  ] = useLazyGetPostBySlugQuery()

  const detailedPost = detailedPostData?.data || detailedPostData || null
  const detailedContent = detailedPost?.content || detailedPost?.Content || null
  const detailedContentUrl =
    detailedPost?.contentUrl || detailedPost?.ContentUrl || null

  const resolvedContent = detailedContent || post?.content
  const resolvedContentUrl = contentUrl || detailedContentUrl
  const isExcerptTruncated = Boolean(
    excerpt && (excerpt.endsWith("...") || excerpt.endsWith("…")),
  )
  const showExpandButton =
    isOverflowing || isExpanded || isExcerptTruncated || Boolean(contentUrl)

  const handleToggleExpand = () => {
    const nextExpanded = !isExpanded
    setIsExpanded(nextExpanded)

    if (nextExpanded && !contentUrl && !post?.content && !detailedContent) {
      const slug = post?.slug || post?.Slug || post?.postId || post?.PostId
      if (slug) {
        triggerGetPostBySlug(slug)
      }
    }
  }

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

  const handleShare = (e) => {
    triggerShare(e, post?.postId)
  }

  return (
    <>
      <FluentCard padding="p-0" rounded="rounded-2xl">
        <div className="p-4 space-y-2">
          <PostHeader
            post={post}
            isOwnProfile={isOwnProfile}
            onEdit={() => setIsEditing(true)}
            onDelete={() => setIsDeleteModalOpen(true)}
          />

          {post.title && post.title !== "Untitled" && (
            <h4
              onClick={(e) => {
                // If user clicked directly on a hashtag token inside title, let hashtag handler handle it
                if (e.target.closest("[data-hashtag]")) return
                if (post.slug || post.postId) {
                  navigate(
                    `/${currentLang}/cat-speak/news/${post.slug || post.postId}`,
                  )
                }
              }}
              className={`text-2xl font-bold ${
                post.slug || post.postId
                  ? "cursor-pointer hover:text-cath-red-700 dark:hover:text-red-400 transition-colors"
                  : ""
              }`}
            >
              <HighlightedText text={post.title} searchKeyword={searchKeyword} />
            </h4>
          )}

          {hasContent && (
            <div>
              <div
                ref={contentRef}
                className={!isExpanded ? "line-clamp-2 overflow-hidden" : ""}
              >
                <PostContent
                  html={isExpanded ? resolvedContent : post?.content || excerpt}
                  contentUrl={isExpanded ? resolvedContentUrl : null}
                  fallback={excerpt}
                  searchKeyword={searchKeyword}
                  className={
                    !isExpanded
                      ? "text-sm text-secondary dark:text-neutral-300"
                      : ""
                  }
                />
              </div>

              {isLoadingDetail && isExpanded && (
                <div className="py-2 flex items-center gap-2 text-xs text-secondary dark:text-neutral-400">
                  <div className="w-3.5 h-3.5 border-2 border-cath-red-700 dark:border-red-400 border-t-transparent rounded-full animate-spin" />
                  <span>{t.common?.loading || "Đang tải nội dung..."}</span>
                </div>
              )}

              {showExpandButton && (
                <button
                  type="button"
                  onClick={handleToggleExpand}
                  className="relative inline-block mt-1 text-sm font-semibold text-cath-red-700 dark:text-red-400 hover:text-cath-red-800 dark:hover:text-red-300 hover:underline focus:outline-none cursor-pointer touch-manipulation before:absolute before:top-1/2 before:-translate-y-1/2 before:left-1/2 before:-translate-x-1/2 before:min-w-[48px] before:w-full before:h-12 before:content-['']"
                >
                  {isExpanded
                    ? t.profile?.post?.showLess || "Thu gọn"
                    : t.profile?.post?.seeMore || "Xem thêm"}
                </button>
              )}
            </div>
          )}

          <PostMediaGallery media={post.media} />

          <div className="flex items-center justify-between text-sm text-secondary dark:text-[#AAAAAA]">
            <span>
              {typeof post?.viewCount === "number"
                ? post.viewCount.toLocaleString()
                : post?.viewCount || 0}{" "}
              {t.profile?.post?.header?.views || t.news?.views || "views"}
            </span>

            <ReactionStackedBadges
              postId={post?.postId || post?.id}
              reactions={post?.reactions}
              totalReactions={post?.totalReactions}
            />
          </div>
        </div>

        <PostActionBar
          post={post}
          isCommentsOpen={isCommentsOpen}
          onToggleComments={() => setIsCommentsOpen(!isCommentsOpen)}
          onReact={handleReact}
          onShare={handleShare}
        />

        {isCommentsOpen && (
          <div className="p-4 border-t border-border rounded-b-2xl">
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
          t.profile?.post?.deleteConfirm || "Bạn có chắc muốn xóa bài viết này?"
        }
        confirmText={
          t.profile?.post?.deleteBtn || t.profile?.post?.header?.delete || "Xóa"
        }
        cancelText={t.profile?.post?.editor?.cancel || "Hủy"}
        confirmVariant="destructive"
        isPending={isDeleting}
      />
    </>
  )
}

export default ProfilePostCard
