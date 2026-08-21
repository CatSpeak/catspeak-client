import React, { useState } from "react"
import { Newspaper } from "lucide-react"
import { useLanguage } from "@/shared/context/LanguageContext"
import { getImageUrl } from "@/shared/utils/imageUtils"
import { isPostNew, formatNewsDate } from "../utils/landingNewsUtils"

const LandingNewsCard = ({ item, onClick }) => {
  const { t, language } = useLanguage()
  const [imgError, setImgError] = useState(false)

  const newsT = t?.landing?.news || {}
  const viewArticleText = newsT.viewArticle || "Xem bài viết"
  const newBadgeText = newsT.newBadge || "New"

  const firstMediaUrl =
    item.media && item.media.length > 0
      ? getImageUrl(item.media[0].mediaUrl)
      : null

  const isNew = isPostNew(item.createDate)
  const formattedDate = formatNewsDate(item.createDate, language)

  return (
    <div
      onClick={onClick}
      className="flex-shrink-0 w-[300px] sm:w-[350px] lg:w-[370px] flex flex-col group/news cursor-pointer"
    >
      {/* Top Image Showcase Frame */}
      <div className="relative w-full h-[190px] sm:h-[210px] lg:h-[220px] rounded-xl overflow-hidden bg-stone-100 flex items-center justify-center">
        {firstMediaUrl && !imgError ? (
          <img
            src={firstMediaUrl}
            alt={item.title}
            className="w-full h-full object-cover"
            onError={() => setImgError(true)}
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center p-6 bg-gradient-to-b from-stone-100 to-stone-200/60 text-gray-400">
            <Newspaper size={48} strokeWidth={1.5} />
          </div>
        )}

        {/* Yellow "New" badge */}
        {isNew && (
          <span className="absolute top-4 left-4 z-10 bg-amber-400 text-amber-950 font-bold text-xs px-3 py-1 rounded-md shadow-sm">
            {newBadgeText}
          </span>
        )}
      </div>

      {/* Info Section beneath the image */}
      <div className="mt-4 flex flex-col gap-2 w-full px-1">
        {/* Date and Action Pill Row */}
        <div className="flex items-center justify-between gap-2">
          <span className="text-sm text-secondary font-medium">
            {formattedDate}
          </span>
          <span className="text-xs font-semibold text-[#910B09] border border-[#910B09] rounded-full px-4 py-1 group-hover/news:bg-[#910B09] group-hover/news:text-white transition-colors">
            {viewArticleText}
          </span>
        </div>

        {/* Uppercase Bold Title */}
        <h3 className="text-base font-bold text-gray-900 group-hover/news:text-[#910B09] transition-colors line-clamp-2 uppercase tracking-wide leading-snug">
          {item.title}
        </h3>
      </div>
    </div>
  )
}

export default LandingNewsCard
