import React, { useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { useLanguage } from "@/shared/context/LanguageContext"
import { ArrowRight, Share, Bookmark, ThumbsUp, MessageSquare, Eye } from "lucide-react"
import { useGetPostsQuery, useSharePostMutation } from "@/store/api/postsApi"
import ShareModal from "./ShareModal"
import { getImageUrl } from "@/shared/utils/imageUtils"
import { getTranslatedTimeAgo } from "@/features/news/utils/newsUtils"

const RELATED_COUNT = 4

/**
 * RelatedNewsCard — matches Figma "Card_Bản tin Catspeak" (node 5032:14849).
 *
 * Structure:
 *   1. Image area with share / bookmark overlay buttons
 *   2. Title (bold, truncated) + time ago
 *   3. Stats row: likes · comments · views
 */
const RelatedNewsCard = ({ post }) => {
  const navigate = useNavigate()
  const { lang } = useParams()
  const { t } = useLanguage()
  const newsCard = t.news?.newsCard
  const [sharePost] = useSharePostMutation()
  const [isShareModalOpen, setIsShareModalOpen] = useState(false)
  const [shareUrl, setShareUrl] = useState("")
  const [imageError, setImageError] = useState(false)

  const fallbackColor = (() => {
    const COLORS = ["#c0392b", "#8e44ad", "#2980b9", "#27ae60", "#f39c12", "#1abc9c"]
    const seed = post.postId || 0
    return COLORS[typeof seed === "number" ? seed % COLORS.length : 0]
  })()

  const hasMedia = post.media && post.media.length > 0

  const handleCardClick = () => {
    navigate(`/${lang}/cat-speak/news/${post.slug || post.postId}`)
  }

  const handleShare = async (e) => {
    e.stopPropagation()
    if (!post?.postId) return
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
    <div
      onClick={handleCardClick}
      className="bg-white flex flex-col gap-3 rounded-[20px] shadow-[0_1px_4px_rgba(12,12,13,0.1),0_1px_2px_rgba(12,12,13,0.05)] overflow-hidden cursor-pointer w-full"
    >
      {/* ── Image area ─────────────────────────────────────────── */}
      <div className="relative flex-1 min-h-[150px] p-[10px] rounded-t-[20px]">
        {hasMedia && !imageError ? (
          <img
            src={getImageUrl(post.media[0].mediaUrl)}
            alt={post.title}
            className="absolute inset-0 w-full h-full object-cover rounded-t-[20px]"
            onError={() => setImageError(true)}
          />
        ) : (
          <div
            className="absolute inset-0 rounded-t-[20px] flex items-center justify-center p-4"
            style={{ backgroundColor: fallbackColor }}
          >
            <span className="text-white/30 font-bold text-xl select-none text-center leading-tight">
              {post.title?.substring(0, 20)}
            </span>
          </div>
        )}

        {/* Overlay buttons — top-right */}
        <div
          className="absolute top-[10px] right-[10px] flex gap-[10px] z-10"
          onPointerDown={(e) => e.stopPropagation()}
        >
          <button
            onClick={handleShare}
            className="flex items-center justify-center p-1 bg-white/50 rounded-full hover:bg-white/70 transition-colors"
            aria-label="Share"
          >
            <Share size={24} strokeWidth={1.5} className="text-[#2e2e2e]" />
          </button>
          <button
            onClick={(e) => e.stopPropagation()}
            className="flex items-center justify-center p-1 bg-white/50 rounded-full hover:bg-white/70 transition-colors"
            aria-label="Bookmark"
          >
            <Bookmark size={24} strokeWidth={1.5} className="text-[#2e2e2e]" />
          </button>
        </div>
      </div>

      {/* ── Text area ──────────────────────────────────────────── */}
      <div className="flex flex-col gap-2 px-4">
        <h3 className="font-nunito font-bold text-base leading-[1.4] text-[#1a1a1a] truncate">
          {post.title}
        </h3>
        <p className="font-nunito font-medium text-sm leading-[1.4] text-[#7b7979]">
          {getTranslatedTimeAgo(post.createDate, newsCard?.timeAgo)}
        </p>
      </div>

      {/* ── Stats row ──────────────────────────────────────────── */}
      <div className="flex items-end gap-1 px-4 pb-2">
        <div className="flex items-center gap-1 px-1 py-1">
          <ThumbsUp size={16} strokeWidth={1.5} className="text-[#7b7979]" />
          <span className="font-nunito font-medium text-sm text-[#7b7979]">
            {post.totalReactions || 0}
          </span>
        </div>
        <div className="flex items-center gap-1 px-1 py-1">
          <MessageSquare size={16} strokeWidth={1.5} className="text-[#7b7979]" />
          <span className="font-nunito font-medium text-sm text-[#7b7979]">
            {post.totalComments || 0}
          </span>
        </div>
        <div className="flex items-center gap-1 px-1 py-1">
          <Eye size={16} strokeWidth={1.5} className="text-[#7b7979]" />
          <span className="font-nunito font-medium text-sm text-[#7b7979]">
            {post.viewCount || 0} lượt xem
          </span>
        </div>
      </div>

      {/* ── Modals ─────────────────────────────────────────────── */}
      <div onClick={(e) => e.stopPropagation()} onPointerDown={(e) => e.stopPropagation()}>
        <ShareModal
          open={isShareModalOpen}
          onClose={() => setIsShareModalOpen(false)}
          shareUrl={shareUrl}
        />
      </div>
    </div>
  )
}

/**
 * RelatedNewsSection — matches Figma node 5032:15676.
 *
 * Full-width section placed outside the two-column layout.
 * Header: title (28px Medium) + "Xem tất cả" pill button.
 * Cards: flex row with gap-[36px], each card flex-[1_0_0].
 */
const RelatedNewsSection = ({ currentPostId }) => {
  const navigate = useNavigate()
  const { lang } = useParams()
  const { t } = useLanguage()
  const newsDetail = t.news?.newsDetail

  const { data } = useGetPostsQuery({ page: 1, pageSize: 20 })

  const relatedPosts = (data?.data || [])
    .filter(
      (post) =>
        post.postId !== currentPostId && post.privacy === "Public",
    )
    .slice(0, RELATED_COUNT)

  return (
    <section className="w-full mt-8">
      {/* ── Header ──────────────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-5">
        <h2 className="font-nunito font-medium text-[28px] leading-[1.4] text-black">
          {newsDetail?.relatedNews || "Bản tin liên quan"}
        </h2>
        {relatedPosts.length > 0 && (
          <button
            onClick={() => navigate(`/${lang}/cat-speak/news`)}
            className="flex items-center gap-2 px-3 py-1 rounded-full border border-cath-red-700 text-cath-red-700 font-nunito font-medium text-sm hover:bg-cath-red-50 transition-colors"
          >
            {newsDetail?.viewAll || "Xem tất cả"}
            <ArrowRight size={12} />
          </button>
        )}
      </div>

      {/* ── Cards row or empty state ────────────────────────────── */}
      {relatedPosts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-[36px] items-start">
          {relatedPosts.map((post) => (
            <RelatedNewsCard key={post.postId} post={post} />
          ))}
        </div>
      ) : (
        <p className="font-nunito text-base text-[#7b7979] leading-[1.4]">
          {newsDetail?.noRelatedNews || "Không có bản tin liên quan."}
        </p>
      )}
    </section>
  )
}

export default RelatedNewsSection
