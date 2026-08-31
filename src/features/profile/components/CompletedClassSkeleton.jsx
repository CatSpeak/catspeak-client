import React from "react"
import FluentCard from "@/shared/components/ui/FluentCard"
import { Skeleton } from "@/shared/components/ui/indicators"

const CompletedClassSkeleton = ({ count = 6 }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 w-full animate-in fade-in duration-300">
      {Array.from({ length: count }).map((_, index) => (
        <FluentCard
          key={index}
          className="relative flex flex-col h-full overflow-hidden border border-border bg-white rounded-2xl !p-0"
        >
          {/* Top Hero Thumbnail Skeleton */}
          <div className="w-full h-44 relative shrink-0">
            <Skeleton className="w-full h-full rounded-none" />
          </div>

          {/* Body Content Skeleton */}
          <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              {/* Title Skeleton */}
              <Skeleton className="h-5 w-3/4 rounded-md" />
              <Skeleton className="h-4 w-1/2 rounded-md" />

              {/* Teacher Row Skeleton */}
              <div className="flex items-center gap-2 pt-1">
                <Skeleton className="w-6 h-6 rounded-full shrink-0" />
                <Skeleton className="h-3.5 w-28 rounded" />
              </div>

              {/* Schedule Info Skeleton */}
              <div className="space-y-2 pt-2 border-t border-gray-100">
                <Skeleton className="h-3.5 w-40 rounded" />
                <Skeleton className="h-3.5 w-48 rounded" />
                <Skeleton className="h-3.5 w-24 rounded" />
              </div>

              {/* Progress Skeleton */}
              <div className="space-y-1.5 pt-2 border-t border-gray-100">
                <div className="flex justify-between">
                  <Skeleton className="h-3 w-20 rounded" />
                  <Skeleton className="h-3 w-24 rounded" />
                </div>
                <Skeleton className="h-1.5 w-full rounded-full" />
              </div>
            </div>

            {/* Bottom Actions Skeleton */}
            <div className="pt-3 border-t border-gray-100 flex items-center justify-between gap-2">
              <Skeleton className="h-9 flex-1 rounded-full" />
              <Skeleton className="h-9 flex-1 rounded-full" />
            </div>
          </div>
        </FluentCard>
      ))}
    </div>
  )
}

export default CompletedClassSkeleton
