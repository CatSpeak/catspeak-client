import React, { useState, useMemo, useEffect, useRef } from "react"
import { useNavigate, useParams } from "react-router-dom"
import InDevelopmentModal from "@/shared/components/ui/InDevelopmentModal"
import { COLORS } from "@/shared/constants/constants"
import { useLanguage } from "@/shared/context/LanguageContext"
import { getTranslatedTimeAgo } from "@/features/news/utils/newsUtils"
import { ThumbsUp, Heart, Smile, MessageCircle } from "lucide-react"
import { useReactToPostMutation } from "@/store/api/postsApi"

import { getImageUrl } from "@/shared/utils/imageUtils"

const NewsCard = ({ news }) => {
  const navigate = useNavigate()
  const { lang } = useParams()
  const currentLang = lang || "en"
  const { t } = useLanguage()

  const [reactToPost] = useReactToPostMutation()
  const [isPressed, setIsPressed] = useState(false)

  const handleReact = (e, type) => {
    e.stopPropagation()
    if (!news?.postId) return
    reactToPost({ postId: news.postId, type })
  }

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0)
  const [imageError, setImageError] = useState(false)
  const [showReactions, setShowReactions] = useState(false)
  const holdTimer = useRef(null)

  const handleTouchStart = () => {
    holdTimer.current = setTimeout(() => {
      setShowReactions(true)
    }, 400)
  }

  const handleTouchEnd = () => {
    if (holdTimer.current) clearTimeout(holdTimer.current)
  }

  const newsCard = t.news?.newsCard

  const handleCardClick = () => {
    navigate(`/${currentLang}/cat-speak/news/${news.postId}`)
  }

  const hasMedia = news.media && news.media.length > 0

  useEffect(() => {
    if (hasMedia && news.media.length > 1) {
      const interval = setInterval(() => {
        setCurrentMediaIndex((prev) => (prev + 1) % news.media.length)
      }, 10000)
      return () => clearInterval(interval)
    }
  }, [hasMedia, news.media?.length])

  const fallbackColor = useMemo(() => {
    const seed = news.postId || Math.floor(Math.random() * COLORS.length)
    const index =
      typeof seed === "number"
        ? seed % COLORS.length
        : seed.length % COLORS.length
    return COLORS[index].value
  }, [news.postId])

  return (
    <div
      onClick={handleCardClick}
      onPointerDown={() => setIsPressed(true)}
      onPointerUp={() => setIsPressed(false)}
      onPointerLeave={() => setIsPressed(false)}
      onPointerCancel={() => setIsPressed(false)}
      className="relative cursor-pointer group/card outline-offset-4 touch-manipulation block mb-2"
    >
      {/* Shadow */}
      <div
        className="absolute top-0 left-0 w-full h-full rounded-2xl bg-black/10 will-change-transform translate-y-[0px] opacity-0 transition-all duration-[600ms] ease-[cubic-bezier(.3,.7,.4,1)] group-hover/card:translate-y-[6px] group-hover/card:opacity-100 group-hover/card:duration-[250ms] group-hover/card:ease-[cubic-bezier(.3,.7,.4,1.5)]"
        style={
          isPressed
            ? { transform: "translateY(1px)", transitionDuration: "34ms" }
            : undefined
        }
      ></div>

      {/* Edge */}
      <div
        className="absolute top-0 left-0 w-full h-full rounded-2xl opacity-0 transition-opacity duration-[600ms] group-hover/card:opacity-100 group-hover/card:duration-[250ms]"
        style={{
          background:
            "linear-gradient(to left, #e5e5e5 0%, #f5f5f5 8%, #f5f5f5 92%, #e5e5e5 100%)",
        }}
      ></div>

      {/* Front */}
      <div
        className="relative rounded-2xl bg-white flex flex-col overflow-hidden border border-[#e5e5e5] shadow-sm group-hover/card:shadow-none will-change-transform translate-y-[0px] transition-all duration-[600ms] ease-[cubic-bezier(.3,.7,.4,1)] group-hover/card:-translate-y-[6px] group-hover/card:duration-[250ms] group-hover/card:ease-[cubic-bezier(.3,.7,.4,1.5)]"
        style={
          isPressed
            ? { transform: "translateY(-2px)", transitionDuration: "34ms" }
            : undefined
        }
      >
        {/* Thumbnail */}
        <div className="relative w-full bg-gray-100 overflow-hidden">
          {hasMedia && !imageError ? (
            <div
              className="flex transition-transform duration-700 ease-out"
              style={{ transform: `translateX(-${currentMediaIndex * 100}%)` }}
            >
              {news.media.map((item) => {
                const imageUrl = getImageUrl(item.mediaUrl)
                return (
                  <div
                    key={item.postMediaId}
                    className="w-full h-full flex-shrink-0 relative"
                  >
                    <img
                      src={imageUrl}
                      alt={news.title}
                      className="w-full h-auto object-cover"
                      onError={() => setImageError(true)}
                    />
                  </div>
                )
              })}
            </div>
          ) : (
            <div
              className="w-full aspect-[4/3] flex flex-col items-center justify-center p-6"
              style={{ backgroundColor: fallbackColor }}
            >
              <span className="text-white/30 font-bold text-3xl select-none mb-4 text-center leading-tight">
                {news.title.substring(0, 20)}
              </span>
            </div>
          )}

          {/* Media indicator for multiple images */}
          {hasMedia && news.media.length > 1 && (
            <div className="absolute top-3 right-3 bg-black/50 text-white text-xs px-2 py-1 rounded-full backdrop-blur-md">
              {currentMediaIndex + 1} / {news.media.length}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex flex-col">
          <div className="flex flex-col flex-1 min-w-0 p-3">
            {/* Title above */}
            <h3 className="font-medium line-clamp-2 transition-colors">
              {news.title}
            </h3>

            {/* Date */}
            <div className="flex items-center text-sm text-[#606060] mt-1">
              <span>
                {getTranslatedTimeAgo(news.createDate, newsCard?.timeAgo)}
              </span>
            </div>
          </div>

          {/* Below are the rest of the buttons to interact */}
          <div
            className="flex items-center text-[#606060] text-sm border-t border-[#e5e5e5]"
            onPointerDown={(e) => e.stopPropagation()}
          >
            <div
              className="group/reactions relative flex items-center"
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
              onTouchMove={handleTouchEnd}
              onMouseLeave={() => setShowReactions(false)}
              onContextMenu={(e) => {
                if (window.innerWidth < 1024) e.preventDefault()
              }}
            >
              {/* Main Interactive Button */}
              <button
                onClick={(e) => {
                  const type = news.currentUserReaction
                    ? news.currentUserReaction
                    : "Like"
                  handleReact(e, type)
                }}
                className={`flex items-center justify-center gap-2 px-4 h-12 transition-colors hover:bg-[#f2f2f2] ${
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
                  <Heart className="text-red-700 fill-red-400" />
                ) : news.currentUserReaction === "Haha" ? (
                  <Smile className="text-yellow-700 fill-yellow-400" />
                ) : (
                  <ThumbsUp
                    className={
                      news.currentUserReaction === "Like"
                        ? "text-blue-700 fill-blue-400"
                        : ""
                    }
                  />
                )}
                <span className="font-semibold text-base">
                  {news.totalReactions || 0}
                </span>
              </button>

              {/* Reactions Popover */}
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
                  <ThumbsUp className="text-blue-700 fill-blue-400" />
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
                  <Heart className="text-red-700 fill-red-400" />
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
                  <Smile className="text-yellow-700 fill-yellow-400" />
                </button>
              </div>
            </div>

            <div className="flex items-center justify-center gap-2 px-4 h-12 text-[#606060]">
              <MessageCircle className="text-[#606060]" />
              <span className="font-semibold text-base">{news.totalComments || 0}</span>
            </div>
          </div>
        </div>
      </div>

      <InDevelopmentModal
        open={isModalOpen}
        onCancel={(e) => {
          if (e) e.stopPropagation()
          setIsModalOpen(false)
        }}
      />
    </div>
  )
}

export default NewsCard
