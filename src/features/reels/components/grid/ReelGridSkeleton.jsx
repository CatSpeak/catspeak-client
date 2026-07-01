import React, { memo } from "react"

/**
 * Heights cycled to mimic the masonry visual during loading.
 */
const SKELETON_HEIGHTS = [260, 320, 220, 280, 340, 240, 300, 250]

/**
 * Skeleton placeholder grid displayed while reels are loading.
 *
 * @param {{ count?: number }} props
 */
const ReelGridSkeleton = memo(function ReelGridSkeleton({ count = 12 }) {
  return (
    <div className="columns-2 sm:columns-3 lg:columns-4 xl:columns-5 gap-4">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="break-inside-avoid mb-4 sm:mb-6">
          <div
            className="bg-gray-200 animate-pulse rounded-[20px] w-full"
            style={{ height: SKELETON_HEIGHTS[i % SKELETON_HEIGHTS.length] }}
          />
          {/* Footer skeleton */}
          <div className="px-3 py-2.5">
            <div
              className="bg-gray-200 animate-pulse rounded-md w-4/5 mb-2"
              style={{ height: 14 }}
            />
            <div className="flex items-center gap-1.5">
              <div
                className="bg-gray-200 animate-pulse rounded-full"
                style={{ width: 22, height: 22 }}
              />
              <div
                className="bg-gray-200 animate-pulse rounded-md"
                style={{ height: 12, width: 80 }}
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
})

export default ReelGridSkeleton
