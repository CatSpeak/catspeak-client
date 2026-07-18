import React, { useState } from "react"
import { useNavigate } from "react-router-dom"
import Avatar from "@/shared/components/ui/Avatar"
import ReelMoreMenu from "./ReelMoreMenu"
import { useLanguage } from "@/shared/context/LanguageContext"

/**
 * Interactive Reel Caption component overlaying or standing beside the video player.
 * Features description truncation with "Show more/Show less" toggles and premium tags.
 */
const ReelCaption = React.memo(({ reel, isMobile = false }) => {
  const { t } = useLanguage()
  const navigate = useNavigate()
  const [isExpanded, setIsExpanded] = useState(false)
  const description = reel.description || ""
  const DESCRIPTION_CHAR_LIMIT = 90
  const shouldTruncate = description.length > DESCRIPTION_CHAR_LIMIT

  const displayDescription = isExpanded
    ? description
    : shouldTruncate
      ? `${description.slice(0, DESCRIPTION_CHAR_LIMIT)}...`
      : description

  return (
    <div className={`shrink-0 ${isMobile ? "p-3" : "p-4 border-b border-gray-200"}`}>
      <div className={`flex items-center justify-between ${isMobile ? "mb-3" : "mb-4"}`}>
        <div className={`flex items-center ${isMobile ? "gap-2" : "gap-3"}`}>
          <Avatar
            size={isMobile ? 36 : 40}
            src={reel.author?.avatarUrl}
            name={reel.author?.name}
            alt={reel.author?.name}
            className="shadow-sm rounded-full overflow-hidden cursor-pointer hover:opacity-80 transition-opacity"
            onClick={(e) => {
              e.stopPropagation()
              if (reel.author?.id) navigate(`/profile/${reel.author.id}`)
            }}
          />
          <div className="flex flex-col">
            <span 
              className={`font-bold flex items-center gap-1 cursor-pointer transition-colors duration-200 ${isMobile ? "text-white text-[14px] drop-shadow-md hover:text-gray-200" : "text-headingColor text-[15px] hover:text-cath-red-700"}`}
              onClick={(e) => {
                e.stopPropagation()
                if (reel.author?.id) navigate(`/profile/${reel.author.id}`)
              }}
            >
              {reel.author?.name}
              {reel.author?.verified && (
                <svg
                  className="w-3.5 h-3.5 text-[#3b82f6] drop-shadow-sm"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                </svg>
              )}
            </span>
          </div>
        </div>
        {!isMobile && <ReelMoreMenu reel={reel} />}
      </div>

      <div className={`leading-[1.6] ${isMobile ? "text-white text-[13px] drop-shadow-md" : "text-headingColor text-[14px]"}`}>
        {reel.title && <h3 className={`font-bold mb-2 ${isMobile ? "text-[14px]" : "text-[15px] text-headingColor"}`}>{reel.title}</h3>}
        <p className={`relative whitespace-pre-wrap break-words mb-3 ${isMobile ? "opacity-95" : "text-gray-800"}`}>
          {displayDescription}
          {shouldTruncate && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                setIsExpanded(!isExpanded)
              }}
              className={`font-bold ml-1 cursor-pointer bg-transparent border-none outline-none p-0 transition-colors duration-200 ${isMobile ? "text-white/80 hover:text-white" : "text-gray-500 hover:text-gray-700"}`}
            >
              {isExpanded ? (t?.catSpeak?.reels?.detail?.showLess || "Show less") : (t?.catSpeak?.reels?.detail?.showMore || "Show more")}
            </button>
          )}
        </p>
      </div>

      {reel.tags && reel.tags.length > 0 && (
        <div className={`flex flex-wrap mb-4 ${isMobile ? "gap-1.5" : "gap-1.5"}`}>
          {reel.tags.map((tag) => (
            <span key={tag} className={`font-medium hover:underline cursor-pointer transition-colors duration-200 ${isMobile ? "text-white text-[12px] drop-shadow-md" : "text-cath-red-700 text-[13px]"}`}>
              {tag.startsWith("#") ? tag : `#${tag}`}
            </span>
          ))}
        </div>
      )}

      {reel.createdAt && !isMobile && (
        <div className="text-[12px] text-gray-400 font-medium">
          {new Date(reel.createdAt).toISOString().split('T')[0]}
        </div>
      )}
    </div>
  )
})

export default ReelCaption
