import React from "react"
import FluentCard from "@/shared/components/ui/FluentCard"
import Skeleton from "@/shared/components/ui/indicators/Skeleton"

const ProfilePostCardSkeleton = () => {
  return (
    <FluentCard className="space-y-4">
      {/* Header Skeleton */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <Skeleton className="w-10 h-10 rounded-full shrink-0" />
          {/* User Name & Time */}
          <div className="space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-20" />
          </div>
        </div>
        {/* Options Icon */}
        <Skeleton className="w-8 h-8 rounded-full" />
      </div>

      {/* Content Skeleton */}
      <div className="space-y-2 py-1">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-1/2" />
      </div>

      {/* Divider */}
      <div className="h-px bg-[#E5E5E5]" />

      {/* Action Bar Skeleton */}
      <div className="flex items-center justify-between pt-1">
        <Skeleton className="h-8 w-20 rounded-md" />
        <Skeleton className="h-8 w-20 rounded-md" />
        <Skeleton className="h-8 w-20 rounded-md" />
      </div>
    </FluentCard>
  )
}

export default ProfilePostCardSkeleton
