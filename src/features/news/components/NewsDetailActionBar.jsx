import React, { useState, useRef } from "react"
import {
  ThumbsUp,
  Heart,
  Smile,
  Share,
  ChevronDown,
} from "lucide-react"
import { useLanguage } from "@/shared/context/LanguageContext"
import InDevelopmentModal from "@/shared/components/ui/InDevelopmentModal"
import PillButton from "@/shared/components/ui/buttons/PillButton"

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
    <div className="border-t border-[#e2e2e2] pt-4 flex flex-wrap items-center justify-between gap-3">
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
        <PillButton
          variant="secondary"
          onClick={handleShare}
          startIcon={<Share size={16} strokeWidth={1.5} />}
        >
          {t.news?.newsDetail?.share || "Chia sẻ"}
        </PillButton>

        {/* Bookmark — hidden (feature in development) */}
        {/* <button
          onClick={() => setIsDevModalOpen(true)}
          className="flex items-center justify-center p-2 rounded-full border border-cath-red-700 text-cath-red-700 transition-colors hover:bg-cath-red-50"
        >
          <Bookmark size={16} strokeWidth={1.5} />
        </button> */}
      </div>

      {/* ── Right: Social sharing icons (Facebook · Google · Zalo) ── */}
      <div className="flex items-center gap-3">
        {/* Facebook */}
        <button
          onClick={() => setIsDevModalOpen(true)}
          className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-gray-100 transition-colors hover:scale-110 duration-200 transition-all"
          title="Share on Facebook"
        >
          <svg viewBox="0 0 24 24" className="w-7 h-7" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="24" height="24" rx="12" fill="#1877F2" />
            <path d="M16.5 8H14.5C13.948 8 13.5 8.448 13.5 9V11H16.5L16 14H13.5V22H10.5V14H8.5V11H10.5V9C10.5 6.791 12.291 5 14.5 5H16.5V8Z" fill="white" />
          </svg>
        </button>

        {/* Google */}
        <button
          onClick={() => setIsDevModalOpen(true)}
          className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-gray-100 transition-colors hover:scale-110 duration-200 transition-all"
          title="Share on Google"
        >
          <svg viewBox="0 0 24 24" className="w-7 h-7" xmlns="http://www.w3.org/2000/svg">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
          </svg>
        </button>

        {/* Zalo */}
        <button
          onClick={() => setIsDevModalOpen(true)}
          className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-gray-100 transition-colors hover:scale-110 duration-200 transition-all"
          title="Shares on Zalo"
        >
          <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="100" height="100" viewBox="0 0 48 48">
            <path fill="#2962ff" d="M15,36V6.827l-1.211-0.811C8.64,8.083,5,13.112,5,19v10c0,7.732,6.268,14,14,14h10	c4.722,0,8.883-2.348,11.417-5.931V36H15z"></path>
            <path fill="white" d="M29,5H19c-1.845,0-3.601,0.366-5.214,1.014C10.453,9.25,8,14.528,8,19	c0,6.771,0.936,10.735,3.712,14.607c0.216,0.301,0.357,0.653,0.376,1.022c0.043,0.835-0.129,2.365-1.634,3.742	c-0.162,0.148-0.059,0.419,0.16,0.428c0.942,0.041,2.843-0.014,4.797-0.877c0.557-0.246,1.191-0.203,1.729,0.083	C20.453,39.764,24.333,40,28,40c4.676,0,9.339-1.04,12.417-2.916C42.038,34.799,43,32.014,43,29V19C43,11.268,36.732,5,29,5z"></path><path fill="#2962ff" d="M36.75,27C34.683,27,33,25.317,33,23.25s1.683-3.75,3.75-3.75s3.75,1.683,3.75,3.75	S38.817,27,36.75,27z M36.75,21c-1.24,0-2.25,1.01-2.25,2.25s1.01,2.25,2.25,2.25S39,24.49,39,23.25S37.99,21,36.75,21z"></path><path fill="#2962ff" d="M31.5,27h-1c-0.276,0-0.5-0.224-0.5-0.5V18h1.5V27z"></path><path fill="#2962ff" d="M27,19.75v0.519c-0.629-0.476-1.403-0.769-2.25-0.769c-2.067,0-3.75,1.683-3.75,3.75	S22.683,27,24.75,27c0.847,0,1.621-0.293,2.25-0.769V26.5c0,0.276,0.224,0.5,0.5,0.5h1v-7.25H27z M24.75,25.5	c-1.24,0-2.25-1.01-2.25-2.25S23.51,21,24.75,21S27,22.01,27,23.25S25.99,25.5,24.75,25.5z"></path><path fill="#2962ff" d="M21.25,18h-8v1.5h5.321L13,26h0.026c-0.163,0.211-0.276,0.463-0.276,0.75V27h7.5	c0.276,0,0.5-0.224,0.5-0.5v-1h-5.321L21,19h-0.026c0.163-0.211,0.276-0.463,0.276-0.75V18z"></path>
          </svg>
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
