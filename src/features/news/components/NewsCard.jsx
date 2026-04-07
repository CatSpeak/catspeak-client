import React, { useState, useMemo, useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"
import InDevelopmentModal from "@/shared/components/ui/InDevelopmentModal"
import Avatar from "@/shared/components/ui/Avatar"
import { COLORS } from "@/shared/constants/constants"
import { useLanguage } from "@/shared/context/LanguageContext"
import { getTranslatedTimeAgo } from "@/features/news/utils/newsUtils"
import { ThumbsUp, Heart, Smile } from "lucide-react"
import { useReactToPostMutation } from "@/store/api/postsApi"

const IMAGE_BASE_URL = "https://api.catspeak.com.vn"

const NewsCard = ({ news }) => {
  const navigate = useNavigate()
  const { lang } = useParams()
  const currentLang = lang || "en"
  const { t } = useLanguage()

  const [reactToPost] = useReactToPostMutation()

  const handleReact = (e, type) => {
    e.stopPropagation()
    if (!news?.postId) return
    reactToPost({ postId: news.postId, type })
  }

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0)
  const [imageError, setImageError] = useState(false)

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

  const avatarSrc = news.avatarUrl
    ? `${IMAGE_BASE_URL}${news.avatarUrl}`
    : undefined

  // Varied aspect ratio for masonry look
  const aspectRatios = ["aspect-[3/4]", "aspect-[4/5]", "aspect-[4/3]"]
  const randomAspect = useMemo(() => {
    if (!hasMedia) return "aspect-[4/3]"
    const seed = news.postId || Math.floor(Math.random() * aspectRatios.length)
    const index =
      typeof seed === "number"
        ? seed % aspectRatios.length
        : seed.length % aspectRatios.length
    return aspectRatios[index]
  }, [news.postId, hasMedia])

  return (
    <div
      onClick={handleCardClick}
      className="group relative overflow-hidden rounded-xl bg-white flex flex-col shadow-sm cursor-pointer hover:shadow-xl transition-all duration-300 border border-[#e5e5e5]"
    >
      {/* Thumbnail */}
      <div
        className={`relative w-full bg-gray-100 overflow-hidden ${randomAspect}`}
      >
        {hasMedia && !imageError ? (
          <div
            className="flex h-full transition-transform duration-700 ease-out"
            style={{ transform: `translateX(-${currentMediaIndex * 100}%)` }}
          >
            {news.media.map((item) => {
              const imageUrl = `${IMAGE_BASE_URL}${item.mediaUrl}`
              return (
                <div
                  key={item.postMediaId}
                  className="w-full h-full flex-shrink-0 relative"
                >
                  <img
                    src={imageUrl}
                    alt={news.title}
                    className="w-full h-full object-cover"
                    onError={() => setImageError(true)}
                  />
                </div>
              )
            })}
          </div>
        ) : (
          <div
            className="w-full h-full flex flex-col items-center justify-center p-6"
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
      <div className="p-4 flex flex-col gap-3">
        {/* Title */}
        <h3 className="text-base sm:text-lg font-bold leading-snug line-clamp-3 transition-colors">
          {news.title}
        </h3>

        {/* Author info & Time */}
        <div className="flex items-center gap-2 mt-1">
          <Avatar
            size={24}
            src={avatarSrc}
            alt={news.authorName || "Author"}
            name={news.authorName}
            fallback={news.authorName?.charAt(0) || "C"}
          />
          <span className="text-sm font-medium text-gray-700 truncate">
            {news.authorName || "Cat Speak Admin"}
          </span>
        </div>

        {/* Interactions Row */}
        <div className="mt-2 flex items-center justify-between text-gray-500 text-sm border-t border-[#e5e5e5] pt-3">
          <span className="text-xs">
            {getTranslatedTimeAgo(news.createDate, newsCard?.timeAgo)}
          </span>

          <div className="flex items-center gap-3">
            <button
              onClick={(e) => handleReact(e, "Like")}
              className={`flex items-center hover:scale-110 transition-transform ${news.currentUserReaction === "Like" ? "text-blue-600" : "hover:text-blue-500"}`}
              title={t.news?.newsDetail?.like || "Like"}
            >
              <ThumbsUp
                size={16}
                className={
                  news.currentUserReaction === "Like" ? "fill-blue-600" : ""
                }
              />
            </button>

            <button
              onClick={(e) => handleReact(e, "Love")}
              className={`flex items-center hover:scale-110 transition-transform ${news.currentUserReaction === "Love" ? "text-red-500" : "hover:text-red-400"}`}
              title={t.news?.newsDetail?.love || "Love"}
            >
              <Heart
                size={16}
                className={
                  news.currentUserReaction === "Love" ? "fill-red-500" : ""
                }
              />
            </button>

            <button
              onClick={(e) => handleReact(e, "Haha")}
              className={`flex items-center hover:scale-110 transition-transform ${news.currentUserReaction === "Haha" ? "text-yellow-500" : "hover:text-yellow-400"}`}
              title={t.news?.newsDetail?.haha || "Haha"}
            >
              <Smile
                size={16}
                className={
                  news.currentUserReaction === "Haha" ? "fill-yellow-500" : ""
                }
              />
            </button>

            {news.totalReactions > 0 && (
              <span className="font-medium bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs ml-1">
                {news.totalReactions}
              </span>
            )}
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
