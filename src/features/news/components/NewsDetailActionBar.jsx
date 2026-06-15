import React, { useState, useRef } from "react"
import { ThumbsUp, Heart, Smile, Share2, MessageCircle } from "lucide-react"
import { useLanguage } from "@/shared/context/LanguageContext"

const NewsDetailActionBar = ({
  newsItem,
  handleReact,
  handleShare,
  onCommentClick,
}) => {
  const { t } = useLanguage()
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

  return (
    <div className="pb-4 border-b border-[#e5e5e5] flex items-center gap-2 flex-wrap text-sm mt-4">
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
        <button
          onClick={() => {
            const type = newsItem.currentUserReaction
              ? newsItem.currentUserReaction
              : "Like"
            handleReact(type)
          }}
          className={`flex items-center gap-2 h-12 px-4 rounded-full border border-[#e5e5e5] transition-colors ${
            newsItem.currentUserReaction === "Love"
              ? "bg-red-50 text-red-600 border-red-100"
              : newsItem.currentUserReaction === "Haha"
                ? "bg-yellow-50 text-yellow-600 border-yellow-100"
                : newsItem.currentUserReaction === "Like"
                  ? "bg-blue-50 text-blue-600 border-blue-100"
                  : "bg-white text-[#606060] hover:bg-[#f2f2f2]"
          }`}
        >
          {newsItem.currentUserReaction === "Love" ? (
            <Heart className="text-red-700 fill-red-400" />
          ) : newsItem.currentUserReaction === "Haha" ? (
            <Smile className="text-yellow-700 fill-yellow-400" />
          ) : (
            <ThumbsUp
              className={
                newsItem.currentUserReaction === "Like"
                  ? "text-blue-700 fill-blue-400"
                  : ""
              }
            />
          )}
          <span className="text-base">{newsItem.totalReactions || 0}</span>
        </button>

        {/* Reactions Popover */}
        <div
          className={`absolute bottom-full left-0 mb-2 bg-white rounded-full shadow-[0_4px_16px_rgba(0,0,0,0.12)] border border-gray-100 p-1 flex items-center gap-1 transition-all duration-200 z-20 origin-bottom-left
          ${showReactions ? "opacity-100 scale-100 visible" : "opacity-0 scale-95 invisible group-hover/reactions:opacity-100 group-hover/reactions:scale-100 group-hover/reactions:visible"}`}
        >
          <button
            onClick={(e) => {
              e.stopPropagation()
              setShowReactions(false)
              handleReact("Like")
            }}
            className="p-2 hover:-translate-y-1 transition-transform hover:bg-blue-50 rounded-full"
            title={t.news?.newsDetail?.like || "Like"}
          >
            <ThumbsUp className="text-blue-700 fill-blue-400" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              setShowReactions(false)
              handleReact("Love")
            }}
            className="p-2 hover:-translate-y-1 transition-transform hover:bg-red-50 rounded-full"
            title={t.news?.newsDetail?.love || "Love"}
          >
            <Heart className="text-red-700 fill-red-400" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              setShowReactions(false)
              handleReact("Haha")
            }}
            className="p-2 hover:-translate-y-1 transition-transform hover:bg-yellow-50 rounded-full"
            title={t.news?.newsDetail?.haha || "Haha"}
          >
            <Smile className="text-yellow-700 fill-yellow-400" />
          </button>
        </div>
      </div>

      <button
        onClick={onCommentClick}
        className="flex items-center gap-2 h-12 px-4 rounded-full border border-[#e5e5e5] bg-white text-[#606060] transition-colors hover:bg-[#f2f2f2]"
      >
        <MessageCircle className="text-[#606060]" />
        <span className="text-base">{newsItem.totalComments || 0}</span>
      </button>

      <button
        onClick={handleShare}
        className="flex items-center gap-2 h-12 px-4 rounded-full border border-[#e5e5e5] transition-colors bg-white text-[#606060] hover:bg-[#f2f2f2]"
      >
        <Share2 className="text-[#606060] " />
        <span className="text-base">
          {t.news?.newsDetail?.share || "Share"}
        </span>
      </button>
    </div>
  )
}

export default NewsDetailActionBar
