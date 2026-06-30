import React, { useState, useMemo, useRef } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { useLanguage } from "@/shared/context/LanguageContext"
import { COLORS } from "@/shared/constants/constants"
import {
  Share,
  Bookmark,
  ThumbsUp,
  Heart,
  Smile,
  MessageSquare,
  Eye,
} from "lucide-react"
import {
  useReactToPostMutation,
  useSharePostMutation,
} from "@/store/api/postsApi"
import ShareModal from "./ShareModal"
import Carousel from "@/shared/components/ui/Carousel"
import { getImageUrl } from "@/shared/utils/imageUtils"
import { getTranslatedTimeAgo } from "@/features/news/utils/newsUtils"

/**
 * NewsCard — Figma "Card_Bản tin Catspeak" layout.
 *
 * Structure (top → bottom):
 *   1. Image area with media carousel + Share / Bookmark overlay
 *   2. Title + date
 *   3. Stats row: likes · comments · views
 *   4. Share modal + reactions popover
 */
const NewsCard = ({ news }) => {
  const navigate = useNavigate()
  const { lang } = useParams()
  const currentLang = lang || "en"
  const { t } = useLanguage()
  const newsCard = t.news?.newsCard

  /* ── API mutations ─────────────────────────────────────────────── */
  const [reactToPost] = useReactToPostMutation()
  const [sharePost] = useSharePostMutation()

  /* ── Local state ───────────────────────────────────────────────── */
  const [isShareModalOpen, setIsShareModalOpen] = useState(false)
  const [shareUrl, setShareUrl] = useState("")
  const [showReactions, setShowReactions] = useState(false)
  const holdTimer = useRef(null)

  /* ── Derived ───────────────────────────────────────────────────── */
  const hasMedia = news.media && news.media.length > 0

  const fallbackColor = useMemo(() => {
    const seed = news.postId || (news.title ? news.title.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0) : 0)
    const index =
      typeof seed === "number"
        ? seed % COLORS.length
        : seed.length % COLORS.length
    return COLORS[index].value
  }, [news.postId, news.title])

  /* ── Handlers ──────────────────────────────────────────────────── */
  const handleCardClick = () => {
    navigate(`/${currentLang}/cat-speak/news/${news.slug || news.postId}`)
  }

  const handleShare = async (e) => {
    e.stopPropagation()
    if (!news?.postId) return
    try {
      const result = await sharePost(news.postId).unwrap()
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

  const handleReact = (e, type) => {
    e.stopPropagation()
    if (!news?.postId) return
    reactToPost({ postId: news.postId, type })
  }

  const handleTouchStart = () => {
    holdTimer.current = setTimeout(() => setShowReactions(true), 400)
  }

  const handleTouchEnd = () => {
    if (holdTimer.current) clearTimeout(holdTimer.current)
  }

  /* ── Derived: carousel images ────────────────────────────────────── */
  const carouselImages = useMemo(() => {
    if (!hasMedia) return []
    return news.media.map((item) => ({
      url: getImageUrl(item.mediaUrl),
      alt: news.title,
    }))
  }, [hasMedia, news.media, news.title])

  /* ── Render ────────────────────────────────────────────────────── */
  return (
    <div
      onClick={handleCardClick}
      className="flex flex-col bg-white rounded-[20px] shadow-[0_1px_4px_rgba(12,12,13,0.1),0_1px_2px_rgba(12,12,13,0.05)] overflow-hidden cursor-pointer"
    >
      {/* ── Image area ───────────────────────────────────────────── */}
      <div className="relative flex-1 min-h-0 p-2.5 rounded-t-[20px]">
        {hasMedia ? (
          <div
            className="w-full h-full rounded-t-[20px] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <Carousel
              images={carouselImages}
              autoPlay
              interval={5000}
              className="w-full h-full rounded-t-[20px]"
            />
          </div>
        ) : (
          <div
            className="w-full h-full rounded-t-[20px] flex items-center justify-center p-6"
            style={{ backgroundColor: fallbackColor }}
          >
            <span className="text-white/30 font-bold text-3xl select-none text-center leading-tight">
              {news.title?.substring(0, 20)}
            </span>
          </div>
        )}

        {/* Overlay action buttons — top-right */}
        <div
          className="absolute top-2.5 right-2.5 flex gap-2.5 z-10"
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
            <Bookmark
              size={24}
              strokeWidth={1.5}
              className="text-[#2e2e2e]"
            />
          </button>
        </div>
      </div>

      {/* ── Content ──────────────────────────────────────────────── */}
      <div className="flex flex-col gap-2 px-4 pt-3">
        <h3 className="font-nunito font-bold text-base leading-[1.4] text-[#1a1a1a] truncate">
          {news.title}
        </h3>
        <p className="font-nunito font-medium text-sm leading-[1.4] text-[#7b7979]">
          {getTranslatedTimeAgo(news.createDate, newsCard)}
        </p>
      </div>

      {/* ── Stats row ────────────────────────────────────────────── */}
      <div
        className="flex items-end gap-1 px-4 pb-2 pt-1"
        onPointerDown={(e) => e.stopPropagation()}
      >
        {/* Like / Reactions */}
        <div className="group/reactions relative flex items-center">
          <button
            onClick={(e) => {
              const type = news.currentUserReaction || "Like"
              handleReact(e, type)
            }}
            className={`flex items-center gap-1 px-1 py-1 rounded-full transition-colors hover:bg-gray-100 ${
              news.currentUserReaction === "Love"
                ? "text-red-500"
                : news.currentUserReaction === "Haha"
                  ? "text-yellow-500"
                  : news.currentUserReaction === "Like"
                    ? "text-blue-600"
                    : ""
            }`}
          >
            {news.currentUserReaction === "Love" ? (
              <Heart size={16} strokeWidth={1.5} className="text-red-700 fill-red-400" />
            ) : news.currentUserReaction === "Haha" ? (
              <Smile size={16} strokeWidth={1.5} className="text-yellow-700 fill-yellow-400" />
            ) : (
              <ThumbsUp
                size={16}
                strokeWidth={1.5}
                className={
                  news.currentUserReaction === "Like"
                    ? "text-blue-700 fill-blue-400"
                    : "text-[#7b7979]"
                }
              />
            )}
            <span className="font-nunito font-medium text-sm text-[#7b7979]">
              {news.totalReactions || 0}
            </span>
          </button>

          {/* Reactions popover */}
          <div
            className={`absolute bottom-full left-0 mb-1 bg-white rounded-full shadow-[0_4px_16px_rgba(0,0,0,0.12)] border border-gray-100 p-1 flex items-center gap-1 transition-all duration-200 z-20 origin-bottom-left
            ${showReactions ? "opacity-100 scale-100 visible" : "opacity-0 scale-95 invisible group-hover/reactions:opacity-100 group-hover/reactions:scale-100 group-hover/reactions:visible"}`}
          >
            <button
              onClick={(e) => {
                e.stopPropagation()
                setShowReactions(false)
                handleReact(e, "Like")
              }}
              className="p-2 hover:-translate-y-1 transition-transform hover:bg-blue-50 rounded-full"
              title="Like"
            >
              <ThumbsUp size={18} className="text-blue-700 fill-blue-400" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation()
                setShowReactions(false)
                handleReact(e, "Love")
              }}
              className="p-2 hover:-translate-y-1 transition-transform hover:bg-red-50 rounded-full"
              title="Love"
            >
              <Heart size={18} className="text-red-700 fill-red-400" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation()
                setShowReactions(false)
                handleReact(e, "Haha")
              }}
              className="p-2 hover:-translate-y-1 transition-transform hover:bg-yellow-50 rounded-full"
              title="Haha"
            >
              <Smile size={18} className="text-yellow-700 fill-yellow-400" />
            </button>
          </div>

          {/* Touch hold for mobile reactions */}
          <div
            className="hidden"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            onTouchMove={handleTouchEnd}
            onMouseLeave={() => setShowReactions(false)}
          />
        </div>

        {/* Comments */}
        <button className="flex items-center gap-1 px-1 py-1 rounded-full transition-colors hover:bg-gray-100">
          <MessageSquare size={16} strokeWidth={1.5} className="text-[#7b7979]" />
          <span className="font-nunito font-medium text-sm text-[#7b7979]">
            {news.totalComments || 0}
          </span>
        </button>

        {/* Views */}
        <div className="flex items-center gap-1 px-1 py-1">
          <Eye size={16} strokeWidth={1.5} className="text-[#7b7979]" />
          <span className="font-nunito font-medium text-sm text-[#7b7979]">
            {news.viewCount || 0} lượt xem
          </span>
        </div>
      </div>

      {/* ── Modals ───────────────────────────────────────────────── */}
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

export default NewsCard
