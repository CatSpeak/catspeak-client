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
import { useReactToPostMutation } from "@/store/api/social/postsApi"
import useSharePost from "@/shared/hooks/useSharePost"
import ShareModal from "./ShareModal"
import InDevelopmentModal from "@/shared/components/ui/InDevelopmentModal"
import Carousel from "@/shared/components/ui/Carousel"
import { getImageUrl } from "@/shared/utils/imageUtils"
import { getTranslatedTimeAgo } from "@/features/news/utils/newsUtils"
import ReactionsPopover, {
  ReactionIcon,
} from "@/shared/components/ui/ReactionsPopover"

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

  /* ── API mutations & hooks ───────────────────────────────────────── */
  const [reactToPost] = useReactToPostMutation()
  const {
    shareUrl,
    isShareModalOpen,
    setIsShareModalOpen,
    handleShare: triggerShare,
  } = useSharePost()

  /* ── Local state ───────────────────────────────────────────────── */
  const [showReactions, setShowReactions] = useState(false)
  const [isDevModalOpen, setIsDevModalOpen] = useState(false)
  const holdTimer = useRef(null)

  /* ── Derived ───────────────────────────────────────────────────── */
  const hasMedia = news.media && news.media.length > 0

  const fallbackColor = useMemo(() => {
    const seed =
      news.postId ||
      (news.title
        ? news.title
            .split("")
            .reduce((acc, char) => acc + char.charCodeAt(0), 0)
        : 0)
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

  const handleShare = (e) => {
    triggerShare(e, news?.postId)
  }

  const handleReact = (e, type) => {
    e?.stopPropagation?.()
    const id = news?.postId || news?.id
    if (!id) return
    reactToPost({ postId: id, type })
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
  // const carouselImages = (news.media ?? []).map((item) => ({
  //   url: getImageUrl(item.mediaUrl),
  //   alt: news.title,
  // }));

  /* ── Render ────────────────────────────────────────────────────── */
  return (
    <div
      onClick={handleCardClick}
      className="group flex flex-col bg-white border border-[#e5e5e5] rounded-xl cursor-pointer"
    >
      {/* ── Image area ───────────────────────────────────────────── */}
      <div className="relative flex-1 min-h-0 rounded-t-xl">
        {hasMedia ? (
          <div className="w-full h-full rounded-t-xl rounded-b-none overflow-hidden">
            <Carousel
              images={carouselImages}
              autoPlay
              interval={5000}
              className="w-full h-full rounded-t-xl rounded-b-none aspect-video!"
              objectFit="contain"
              showIndicators={false}
              // disableFullscreen
            />
          </div>
        ) : (
          <div
            className="w-full h-full rounded-t-xl flex items-center justify-center p-6"
            style={{ backgroundColor: fallbackColor }}
          >
            <span className="text-white/30 font-bold text-3xl select-none text-center leading-tight">
              {news.title?.substring(0, 20)}
            </span>
          </div>
        )}
      </div>

      {/* ── Content ──────────────────────────────────────────────── */}
      <div className="flex flex-col gap-1 p-4">
        <h3 className="font-bold line-clamp-2">{news.title}</h3>
        {/* Inline dot-separated metadata row */}
        <div className="flex items-center text-sm gap-1 text-[#606060]">
          <span>
            {news.viewCount || 0} {newsCard?.views || "views"}
          </span>
          <span>•</span>
          <span>
            {getTranslatedTimeAgo(news.createDate, newsCard?.timeAgo)}
          </span>
        </div>
      </div>

      {/* ── Action bar ────────────────────────────────────────────── */}
      <div
        className="grid grid-cols-3 border-t border-[#e5e5e5] rounded-b-xl"
        onPointerDown={(e) => e.stopPropagation()}
      >
        <div
          className="group/reactions relative flex items-center justify-center"
          onMouseEnter={() => setShowReactions(true)}
          onMouseLeave={() => setShowReactions(false)}
        >
          <button
            onClick={(e) => {
              const type = news.currentUserReaction || "Like"
              handleReact(e, type)
            }}
            className="w-full h-12 flex items-center justify-center gap-2 transition-colors hover:bg-[#f3f3f3] rounded-bl-xl"
          >
            <ReactionIcon reaction={news.currentUserReaction} size={20} />
            <span className="text-sm text-[#606060]">
              {news.totalReactions || 0}
            </span>
          </button>

          {/* Reactions popover */}
          <ReactionsPopover
            show={showReactions}
            onClose={() => setShowReactions(false)}
            onSelect={(e, type) => handleReact(e, type)}
            iconSize={18}
          />

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
        <button className="w-full h-12 flex items-center justify-center gap-2 transition-colors hover:bg-[#f3f3f3]">
          <MessageSquare
            size={20}
            strokeWidth={1.5}
            className="text-[#606060]"
          />
          <span className="text-sm text-[#606060]">
            {news.totalComments || 0}
          </span>
        </button>

        {/* Share */}
        <button
          onClick={handleShare}
          className="w-full h-12 flex items-center justify-center gap-2 transition-colors hover:bg-[#f3f3f3] rounded-br-xl"
          aria-label="Share"
        >
          <Share size={20} strokeWidth={1.5} className="text-[#606060]" />
          <span className="text-sm text-[#606060]">
            {news.totalShares || 0}
          </span>
        </button>
      </div>

      {/* ── Modals ───────────────────────────────────────────────── */}
      <div
        onClick={(e) => e.stopPropagation()}
        onPointerDown={(e) => e.stopPropagation()}
      >
        <ShareModal
          open={isShareModalOpen}
          onClose={() => setIsShareModalOpen(false)}
          shareUrl={shareUrl}
        />
        <InDevelopmentModal
          open={isDevModalOpen}
          onCancel={() => setIsDevModalOpen(false)}
        />
      </div>
    </div>
  )
}

export default NewsCard
