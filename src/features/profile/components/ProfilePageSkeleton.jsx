import React from "react"
import FluentCard from "@/shared/components/ui/FluentCard"
import Skeleton from "@/shared/components/ui/indicators/Skeleton"
import ProfilePostCardSkeleton from "./ProfilePostCardSkeleton"

/**
 * Full page skeleton layout matching the Social Profile structure
 */
const ProfilePageSkeleton = () => {
  return (
    <div className="w-full min-h-[calc(100vh-70px)] bg-primaryBg">
      <div className="w-full max-w-[1200px] mx-auto flex flex-col relative z-10">
        {/* Profile Header Skeleton */}
        <div className="w-full bg-white border border-[#e5e5e5] rounded-xl overflow-hidden mb-6">
          {/* Cover Photo */}
          <Skeleton className="w-full h-48 md:h-[280px] !rounded-none" />

          {/* Header Info Area */}
          <div className="p-4 sm:p-6 relative border-b border-gray-100 flex flex-wrap sm:flex-nowrap items-start sm:items-end justify-between gap-4">
            <div className="flex-1 min-w-0">
              {/* Avatar circle */}
              <div className="-mt-24 md:-mt-28 mb-5 relative z-10 p-1 bg-white rounded-full w-fit shadow-sm">
                <Skeleton className="w-[120px] h-[120px] md:w-[140px] md:h-[140px] rounded-full" />
              </div>

              {/* Name & Follower counts */}
              <div className="flex flex-col gap-2">
                <Skeleton className="h-8 w-52 rounded-lg" />
                <Skeleton className="h-4 w-36 rounded" />
              </div>
            </div>

            {/* Action buttons skeleton */}
            <div className="ml-auto flex items-center gap-2">
              <Skeleton className="h-10 w-28 rounded-full" />
            </div>
          </div>
        </div>

        {/* Tab Navigation Skeleton */}
        <div className="flex items-center gap-2 mb-6 overflow-x-auto scrollbar-hidden">
          <Skeleton className="h-10 w-20 rounded-xl shrink-0" />
          <Skeleton className="h-10 w-24 rounded-xl shrink-0" />
          <Skeleton className="h-10 w-28 rounded-xl shrink-0" />
          <Skeleton className="h-10 w-24 rounded-xl shrink-0" />
          <Skeleton className="h-10 w-44 rounded-xl shrink-0" />
        </div>

        {/* Tab Content Skeleton (Home Tab default grid) */}
        <div className="lg:grid lg:grid-cols-3 gap-6">
          {/* Left Feed */}
          <div className="lg:col-span-2 space-y-4">
            {/* Create Post Prompt Box */}
            <FluentCard className="p-4">
              <div className="flex items-center gap-3">
                <Skeleton className="w-10 h-10 rounded-full shrink-0" />
                <Skeleton className="h-10 flex-1 rounded-full" />
              </div>
            </FluentCard>

            {/* Post Feed Skeletons */}
            <ProfilePostCardSkeleton />
            <ProfilePostCardSkeleton />
          </div>

          {/* Right Sidebar Skeleton */}
          <div className="lg:col-span-1 hidden lg:block">
            <FluentCard padding="p-0" className="overflow-hidden flex flex-col">
              <div className="h-14 px-6 flex items-center border-b border-border">
                <Skeleton className="h-5 w-32 rounded" />
              </div>
              <div className="flex flex-col gap-1 p-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-[72px] px-4 flex items-center gap-4 rounded-xl"
                  >
                    <Skeleton className="w-10 h-10 rounded-full shrink-0" />
                    <div className="flex flex-col gap-2 flex-1 min-w-0">
                      <Skeleton className="h-4 w-28 rounded" />
                      <Skeleton className="h-3 w-16 rounded" />
                    </div>
                  </div>
                ))}
              </div>
            </FluentCard>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProfilePageSkeleton
