import React, { useState, useMemo, useRef } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { useLanguage } from "@/shared/context/LanguageContext"
import { COLORS } from "@/shared/constants/constants"
import { Share, MessageSquare } from "lucide-react"
import {
  useReactToPostMutation,
  useSharePostMutation,
} from "@/store/api/social/postsApi"
import { getShareUrlWithVersion } from "@/shared/utils/shareUtils"
import ShareModal from "./ShareModal"
import Carousel from "@/shared/components/ui/Carousel"
import { getImageUrl } from "@/shared/utils/imageUtils"
import { useTimezone } from "@/shared/hooks/useTimezone"
import ReactionsPopover, {
  ReactionIcon,
} from "@/shared/components/ui/ReactionsPopover"
import { ReactionBadge, NEWS_REACTIONS } from "./ReactionBadge"
import {
  normalizeReactions,
  getTotalReactionsCount,
} from "../utils/reactionUtils"
import { useAuthModal } from "@/shared/context/AuthModalContext"
import { useAuth } from "@/features/auth"
import TopicChips from "./TopicChips"

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
  const { formatTimeAgo } = useTimezone()
  const { isAuthenticated } = useAuth()
  const { openAuthModal } = useAuthModal()

  /* ── API mutations & hooks ───────────────────────────────────────── */
  const [reactToPost] = useReactToPostMutation()
  const [sharePost] = useSharePostMutation()
  const [shareUrl, setShareUrl] = useState("")
  const [isShareModalOpen, setIsShareModalOpen] = useState(false)

  /* ── Local state ───────────────────────────────────────────────── */
  const [showReactions, setShowReactions] = useState(false)
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

  const totalReactions = useMemo(() => {
    const norm = normalizeReactions(news.reactions)
    return getTotalReactionsCount(
      norm,
      news.totalReactions !== undefined && news.totalReactions !== null
        ? news.totalReactions
        : 0,
    )
  }, [news.reactions, news.totalReactions])

  const totalComments =
    news.totalComments ??
    news.commentCount ??
    news.commentsCount ??
    news.comments?.length ??
    0
  const totalShares = news.totalShares ?? news.shareCount ?? 0

  const formattedTime = news.createDate ? formatTimeAgo(news.createDate) : ""

  /* ── Handlers ──────────────────────────────────────────────────── */
  const handleCardClick = () => {
    navigate(`/${currentLang}/cat-speak/news/${news.slug || news.postId}`)
  }

  const handleShare = async (e) => {
    e?.preventDefault?.()
    e?.stopPropagation?.()
    const postId = news?.postId || news?.id
    if (!postId) return

    try {
      const result = await sharePost(postId).unwrap()
      let url =
        (typeof result === "string" ? result : result?.shareLink) ||
        `${window.location.origin}/${currentLang}/cat-speak/news/${news.slug || postId}`

      if (url && !url.startsWith("http")) {
        url = url.startsWith("/") ? url : `/${url}`
        url = `${window.location.origin}${url}`
      }

      const finalShareUrl = getShareUrlWithVersion(url)

      if (navigator.share) {
        try {
          await navigator.share({
            title: news.title || "CatSpeak",
            text: news.excerpt || news.title || "",
            url: finalShareUrl,
          })
        } catch (err) {
          if (err.name === "NotAllowedError") {
            setShareUrl(finalShareUrl)
            setIsShareModalOpen(true)
          } else if (err.name !== "AbortError") {
            console.error("Share failed", err)
          }
        }
      } else {
        setShareUrl(finalShareUrl)
        setIsShareModalOpen(true)
      }
    } catch (err) {
      if (navigator.share) {
        try {
          await navigator.share({
            title: news.title || "CatSpeak",
            text: news.excerpt || news.title || "",
            url: `${window.location.origin}/${currentLang}/cat-speak/news/${news.slug || postId}`,
          })
        } catch (shareErr) {
          if (shareErr.name !== "AbortError") {
            console.error("Share failed", shareErr)
          }
        }
      } else {
        console.error("Share failed", err)
      }
    }
  }

  const handleReact = (e, type) => {
    e?.preventDefault?.()
    e?.stopPropagation?.()

    if (!isAuthenticated) {
      openAuthModal("login")
      return
    }

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

  /* ── Render ────────────────────────────────────────────────────── */
  return (
    <div
      onClick={handleCardClick}
      className={`group flex flex-col bg-white dark:bg-[#1A1A1A] hover:bg-[#F2F2F2] dark:hover:bg-[#272727] active:bg-[#E6E6E6] dark:active:bg-[#3D3D3D] border border-border dark:border-[#3F3F3F] rounded-2xl cursor-pointer hover:shadow-md transition-all duration-200 overflow-visible relative ${
        showReactions ? "z-40" : ""
      }`}
    >
      {/* ── Image area ───────────────────────────────────────────── */}
      <div className="relative w-full rounded-t-2xl overflow-hidden">
        {news.topics && news.topics.length > 0 && (
          <div className="absolute top-2 left-2 z-20 pointer-events-auto max-w-[calc(100%-20px)]">
            <TopicChips topics={news.topics} overlay maxVisible={2} />
          </div>
        )}
        {hasMedia ? (
          <div className="w-full h-full rounded-t-2xl rounded-b-none overflow-hidden">
            <div className="w-full h-full transition-[filter] duration-150 ease-out group-hover:brightness-[0.96] dark:group-hover:brightness-[1.08]">
              <Carousel
                images={carouselImages}
                autoPlay
                interval={5000}
                className="w-full rounded-t-2xl rounded-b-none aspect-video"
                objectFit="contain"
                showIndicators={false}
                lockToFirstImage={true}
              />
            </div>
          </div>
        ) : (
          <div className="w-full h-full rounded-t-2xl overflow-hidden">
            <div
              className="w-full h-full flex items-center justify-center p-6 min-h-[160px] transition-[filter] duration-150 ease-out group-hover:brightness-[0.96] dark:group-hover:brightness-[1.08]"
              style={{ backgroundColor: fallbackColor }}
            >
              <span className="text-white/30 font-bold text-3xl select-none text-center">
                {news.title?.substring(0, 20)}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* ── Content ──────────────────────────────────────────────── */}
      <div className="flex flex-col p-4 flex-1">
        <h3 className="font-bold text-base text-foreground dark:text-white break-words">
          {news.title}
        </h3>
        {news.excerpt && (
          <p className="text-sm text-[#4a4a4a] dark:text-neutral-300 line-clamp-2 mb-2">
            {news.excerpt}
          </p>
        )}
        {/* Inline dot-separated metadata row matching PostHeader */}
        <div className="flex items-center flex-wrap gap-x-2 text-sm text-secondary dark:text-[#AAAAAA]">
          {formattedTime && (
            <span className="whitespace-nowrap">{formattedTime}</span>
          )}
          {formattedTime && news.viewCount != null && (
            <span className="w-1 h-1 rounded-full bg-secondary dark:bg-[#AAAAAA] shrink-0" />
          )}
          <span className="whitespace-nowrap">
            {news.viewCount || 0} {newsCard?.views || "views"}
          </span>
        </div>
      </div>

      {/* ── Action bar ────────────────────────────────────────────── */}
      <div
        className="grid grid-cols-3 border-t border-border dark:border-[#3F3F3F] rounded-b-2xl overflow-visible"
        onPointerDown={(e) => e.stopPropagation()}
      >
        <div
          className={`group/reactions relative flex items-center justify-center overflow-visible ${
            showReactions ? "z-50" : ""
          }`}
          onMouseEnter={() => setShowReactions(true)}
          onMouseLeave={() => setShowReactions(false)}
        >
          <button
            onClick={(e) => {
              const type = news.currentUserReaction || "Like"
              handleReact(e, type)
            }}
            className="w-full h-12 flex items-center justify-center gap-2 transition-colors hover:bg-neutral-100 dark:hover:bg-[#272727] active:bg-[#E6E6E6] dark:active:bg-[#3D3D3D] rounded-bl-2xl cursor-pointer"
          >
            <ReactionBadge type={news.currentUserReaction} />
            <span className="text-sm text-secondary dark:text-[#AAAAAA]">
              {totalReactions}
            </span>
          </button>

          {/* Reactions popover */}
          <ReactionsPopover
            show={showReactions}
            onClose={() => setShowReactions(false)}
            onSelect={(e, type) => handleReact(e, type)}
            reactions={NEWS_REACTIONS}
            iconSize={20}
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
        <button
          onClick={handleCardClick}
          className="w-full h-12 flex items-center justify-center gap-2 transition-colors hover:bg-neutral-100 dark:hover:bg-[#272727] active:bg-[#E6E6E6] dark:active:bg-[#3D3D3D] cursor-pointer"
        >
          <MessageSquare
            size={20}
            className="text-secondary dark:text-[#AAAAAA]"
          />
          <span className="text-sm text-secondary dark:text-[#AAAAAA]">
            {totalComments}
          </span>
        </button>

        {/* Share */}
        <button
          onClick={handleShare}
          className="w-full h-12 flex items-center justify-center gap-2 transition-colors hover:bg-neutral-100 dark:hover:bg-[#272727] active:bg-[#E6E6E6] dark:active:bg-[#3D3D3D] rounded-br-2xl cursor-pointer"
          aria-label="Share"
        >
          <Share size={20} className="text-secondary dark:text-[#AAAAAA]" />
          <span className="text-sm text-secondary dark:text-[#AAAAAA]">
            {totalShares}
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
      </div>
    </div>
  )
}

export default NewsCard
