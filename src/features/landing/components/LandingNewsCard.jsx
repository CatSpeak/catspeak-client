import { useState } from "react"
import { Newspaper } from "lucide-react"
import { useLanguage } from "@/shared/context/LanguageContext"
import { useTimezone } from "@/shared/hooks/useTimezone"
import { getImageUrl } from "@/shared/utils/imageUtils"
import { isPostNew } from "../utils/landingNewsUtils"

const LandingNewsCard = ({ item, onClick, className = "" }) => {
  const { t } = useLanguage()
  const { formatCustom } = useTimezone()
  const [imgError, setImgError] = useState(false)

  const newsT = t?.landing?.news || {}
  const newBadgeText = newsT.newBadge || "New"

  const firstMediaUrl =
    item?.media && item.media.length > 0
      ? getImageUrl(item.media[0].mediaUrl)
      : null

  const isNew = isPostNew(item?.createDate)
  const formattedDate = formatCustom(item?.createDate, {
    day: "numeric",
    month: "long",
    year: "numeric",
  })

  if (!item) return null

  return (
    <div
      onClick={onClick}
      className={`w-full flex flex-col group/news cursor-pointer ${className}`}
    >
      {/* Top Image Showcase Frame */}
      <div className="relative w-full h-[180px] sm:h-[195px] lg:h-[210px] rounded-xl overflow-hidden bg-stone-100 flex items-center justify-center">
        {firstMediaUrl && !imgError ? (
          <img
            src={firstMediaUrl}
            alt={item.title}
            className="w-full h-full object-cover group-hover/news:opacity-90 group-hover/news:brightness-95 transition-all duration-300"
            onError={() => setImgError(true)}
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center p-6 bg-gradient-to-b from-stone-100 to-stone-200/60 text-gray-400">
            <Newspaper size={44} strokeWidth={1.5} />
          </div>
        )}

        {/* Yellow "New" badge */}
        {isNew && (
          <span className="absolute top-3 left-3 z-10 bg-amber-400 text-amber-950 font-bold text-xs px-2.5 py-0.5 rounded-md shadow-sm">
            {newBadgeText}
          </span>
        )}
      </div>

      {/* Info Section beneath the image */}
      <div className="mt-4 flex flex-col w-full">
        {/* Date */}
        <span className="text-sm text-secondary">{formattedDate}</span>

        {/* Uppercase Bold Title */}
        <h3 className="group-hover/news:text-[#910B09] transition-colors line-clamp-2">
          {item.title}
        </h3>
      </div>
    </div>
  )
}

export default LandingNewsCard
