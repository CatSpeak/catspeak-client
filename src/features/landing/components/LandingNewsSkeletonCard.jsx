import React from "react"
import { Skeleton } from "@/shared/components/ui/indicators"

const LandingNewsSkeletonCard = () => (
  <div className="flex-shrink-0 w-[300px] sm:w-[350px] lg:w-[370px] flex flex-col">
    <Skeleton className="w-full h-[190px] sm:h-[210px] lg:h-[220px] !rounded-xl" />
    <div className="mt-4 flex items-center justify-between gap-2 px-1">
      <Skeleton className="h-4 w-28 rounded" />
      <Skeleton className="h-6 w-24 !rounded-full" />
    </div>
    <div className="mt-2 space-y-1.5 px-1">
      <Skeleton className="h-5 w-full rounded" />
      <Skeleton className="h-5 w-3/4 rounded" />
    </div>
  </div>
)

export default LandingNewsSkeletonCard
