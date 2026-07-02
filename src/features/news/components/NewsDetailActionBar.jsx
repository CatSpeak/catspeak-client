import React, { useState, useRef } from "react"
import {
  ThumbsUp,
  Heart,
  Smile,
  Share,
  Bookmark,
  ChevronDown,
} from "lucide-react"
import { useLanguage } from "@/shared/context/LanguageContext"
import facebookIcon from "@/shared/assets/images/facebook-icon.svg"
import googleIcon from "@/shared/assets/images/google-icon.svg"
import zaloIcon from "@/shared/assets/images/zalo-icon.png"
import InDevelopmentModal from "@/shared/components/ui/InDevelopmentModal"

const NewsDetailActionBar = ({
  newsItem,
  handleReact,
  handleShare,
  onCommentClick,
}) => {
  const { t } = useLanguage()
  const [showReactions, setShowReactions] = useState(false)
  const [isDevModalOpen, setIsDevModalOpen] = useState(false)
  const holdTimer = useRef(null)

  const handleTouchStart = () => {
    holdTimer.current = setTimeout(() => setShowReactions(true), 400)
  }

  const handleTouchEnd = () => {
    if (holdTimer.current) clearTimeout(holdTimer.current)
  }

  return (
    <div className="border-t border-[#e2e2e2] py-4 flex flex-wrap items-center justify-between gap-3">
      {/* ── Left: Action buttons ─────────────────────────────────── */}
      <div className="flex items-center gap-2 flex-wrap">
        {/* Like / Reactions */}
        <div
          className="group/reactions relative"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          onTouchMove={handleTouchEnd}
          onMouseLeave={() => setShowReactions(false)}
        >
          <button
            onClick={() => {
              const type = newsItem.currentUserReaction || "Like"
              handleReact(type)
            }}
            className={`flex items-center gap-2 px-3 py-2 rounded-full border transition-colors ${
              newsItem.currentUserReaction === "Love"
                ? "bg-red-50 text-red-600 border-cath-red-700"
                : newsItem.currentUserReaction === "Haha"
                  ? "bg-yellow-50 text-yellow-600 border-cath-red-700"
                  : newsItem.currentUserReaction === "Like"
                    ? "bg-blue-50 text-blue-600 border-cath-red-700"
                    : "bg-white text-cath-red-700 border-cath-red-700 hover:bg-cath-red-50"
            }`}
          >
            {newsItem.currentUserReaction === "Love" ? (
              <Heart size={16} strokeWidth={1.5} className="text-cath-red-700 fill-red-400" />
            ) : newsItem.currentUserReaction === "Haha" ? (
              <Smile size={16} strokeWidth={1.5} className="text-cath-red-700 fill-yellow-400" />
            ) : (
              <ThumbsUp
                size={16}
                strokeWidth={1.5}
                className={
                  newsItem.currentUserReaction === "Like"
                    ? "text-cath-red-700 fill-blue-400"
                    : "text-cath-red-700"
                }
              />
            )}
            <span className="font-nunito font-medium text-base">Thích</span>
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
              title="Like"
            >
              <ThumbsUp size={18} className="text-blue-700 fill-blue-400" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation()
                setShowReactions(false)
                handleReact("Love")
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
                handleReact("Haha")
              }}
              className="p-2 hover:-translate-y-1 transition-transform hover:bg-yellow-50 rounded-full"
              title="Haha"
            >
              <Smile size={18} className="text-yellow-700 fill-yellow-400" />
            </button>
          </div>
        </div>

        {/* Share */}
        <button
          onClick={handleShare}
          className="flex items-center gap-2 px-3 py-2 rounded-full border border-cath-red-700 text-cath-red-700 transition-colors hover:bg-cath-red-50"
        >
          <Share size={16} strokeWidth={1.5} />
          <span className="font-nunito font-medium text-base">
            {t.news?.newsDetail?.share || "Chia sẻ"}
          </span>
        </button>

        {/* Bookmark */}
        <button
          onClick={() => setIsDevModalOpen(true)}
          className="flex items-center justify-center p-2 rounded-full border border-cath-red-700 text-cath-red-700 transition-colors hover:bg-cath-red-50"
        >
          <Bookmark size={16} strokeWidth={1.5} />
        </button>
      </div>

      {/* ── Right: Social sharing icons (Facebook · Google · Zalo) ── */}
      <div className="flex items-center gap-5">
        {/* Facebook */}
        <button
          onClick={() => setIsDevModalOpen(true)}
          className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-gray-100 transition-colors"
          title="Share on Facebook"
        >
          <img src={facebookIcon} alt="Facebook" className="w-10 h-10 object-contain" />
        </button>

        {/* Google */}
        <button
          onClick={() => setIsDevModalOpen(true)}
          className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-gray-100 transition-colors"
          title="Share on Google"
        >
          <img src={googleIcon} alt="Google" className="w-10 h-10 object-contain" />
        </button>

        {/* Zalo */}
        <button
          onClick={() => setIsDevModalOpen(true)}
          className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-gray-100 transition-colors"
          title="Share on Zalo"
        >
          <span className="relative block w-10 h-10 overflow-hidden rounded-full">
            <img
              src={zaloIcon}
              alt="Zalo"
              className="absolute h-auto max-w-none"
              style={{ left: "-35%", top: "-34.55%", width: "169.09%" }}
            />
          </span>
        </button>
      </div>

      <InDevelopmentModal
        open={isDevModalOpen}
        onCancel={() => setIsDevModalOpen(false)}
      />
    </div>
  )
}

export default NewsDetailActionBar
