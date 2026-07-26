import React from "react"
import Skeleton from "@/shared/components/ui/indicators/Skeleton"

const ASPECT_RATIOS = [
  "aspect-video",
  "aspect-[4/3]",
  "aspect-square",
  "aspect-[16/10]",
]

/**
 * NewsCardSkeleton — Skeleton placeholder matching NewsCard for masonry grid loading.
 *
 * @param {number} index - Position index used to vary aspect ratios and title widths for realistic masonry feel.
 */
const NewsCardSkeleton = ({ index = 0 }) => {
  const aspectClass = ASPECT_RATIOS[index % ASPECT_RATIOS.length]
  const titleWidth = index % 2 === 0 ? "w-3/4" : "w-5/6"

  return (
    <div className="flex flex-col bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
      <Skeleton className={`w-full ${aspectClass} rounded-t-xl`} />
      <div className="flex flex-col gap-2.5 p-3">
        <Skeleton className={`h-5 ${titleWidth} rounded`} />
        <Skeleton className="h-4 w-1/2 rounded" />
        <div className="flex items-center gap-3 pt-2">
          <Skeleton className="h-4 w-12 rounded-full" />
          <Skeleton className="h-4 w-12 rounded-full" />
          <Skeleton className="h-4 w-12 rounded-full" />
        </div>
      </div>
    </div>
  )
}

export default NewsCardSkeleton
