import React, { memo } from "react"
import { useLanguage } from "@/shared/context/LanguageContext"
import ReelCard from "../cards/ReelCard"

/**
 * Pinterest-style masonry grid of reel cards.
 *
 * @param {{ reels: Reel[], onReelClick: (reel: Reel) => void }} props
 */
const ReelGrid = memo(function ReelGrid({ reels, onReelClick }) {
  const { t } = useLanguage()

  if (reels.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center px-4">
        <svg
          className="w-12 h-12 text-gray-300 mb-4"
          width="48"
          height="48"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polygon points="23 7 16 12 23 17 23 7" />
          <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
        </svg>
        <span className="text-lg font-bold text-gray-700 mb-2">{t.catSpeak.reels.noReelsFound}</span>
        <span className="text-sm text-gray-400">
          {t.catSpeak.reels.trySelectingDifferentTag}
        </span>
      </div>
    )
  }

  return (
    <div className="columns-2 sm:columns-3 lg:columns-4 xl:columns-5 gap-3 sm:gap-4 md:gap-5 lg:gap-6">
      {reels.map((reel, index) => (
        <div
          key={reel.id}
          className="break-inside-avoid mb-3 sm:mb-4 md:mb-5 lg:mb-6"
        >
          <ReelCard
            reel={reel}
            index={index}
            onSelect={onReelClick}
          />
        </div>
      ))}
    </div>
  )
})

export default ReelGrid
