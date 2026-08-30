import React from "react"
import FluentCard from "@/shared/components/ui/FluentCard"
import { Skeleton } from "@/shared/components/ui/indicators"

const CompletedClassSkeleton = ({ count = 3 }) => {
  return (
    <div className="flex flex-col gap-2 w-full animate-in fade-in duration-300">
      {Array.from({ length: count }).map((_, index) => (
        <FluentCard
          key={index}
          className="flex flex-col items-stretch gap-4 md:flex-row md:items-center bg-white"
        >
          <div className="flex flex-1 flex-col gap-2">
            {/* Top Badges */}
            <div className="flex flex-wrap items-center gap-2">
              <Skeleton className="h-4 w-12 rounded-full" />
              <Skeleton className="h-4 w-16 rounded-full" />
              <Skeleton className="h-4 w-28 rounded-full" />
            </div>

            {/* Title and Metadata */}
            <div className="space-y-2">
              <Skeleton className="h-5 w-3/4 sm:w-1/2 rounded-md" />
              <div className="flex flex-col md:flex-row md:items-center gap-2">
                <Skeleton className="h-4 w-40 rounded" />
                <Skeleton className="hidden md:inline-block h-1 w-1 rounded-full" />
                <Skeleton className="h-4 w-32 rounded" />
                <Skeleton className="hidden md:inline-block h-1 w-1 rounded-full" />
                <Skeleton className="h-4 w-44 rounded" />
              </div>
            </div>
          </div>

          {/* Right Action Button */}
          <div className="flex shrink-0 flex-col items-stretch gap-2 md:items-end">
            <Skeleton className="h-10 w-full md:w-28 rounded-full" />
          </div>
        </FluentCard>
      ))}
    </div>
  )
}

export default CompletedClassSkeleton
