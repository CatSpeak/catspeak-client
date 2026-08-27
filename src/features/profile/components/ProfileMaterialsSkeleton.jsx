import React from "react"
import Skeleton from "@/shared/components/ui/indicators/Skeleton"

const ProfileMaterialsSkeleton = ({ isOwnProfile = true }) => {
  return (
    <div className="w-full flex flex-col gap-6 min-h-[500px]">
      {/* Top Toolbar Skeleton */}
      <div
        className={`flex flex-col md:flex-row md:items-center gap-4 ${
          isOwnProfile ? "justify-between" : "justify-end"
        }`}
      >
        {isOwnProfile && (
          <div className="flex items-center gap-2 overflow-hidden">
            <Skeleton className="h-10 w-24 rounded-full" />
            <Skeleton className="h-10 w-28 rounded-full" />
            <Skeleton className="h-10 w-28 rounded-full" />
          </div>
        )}

        <div className="flex flex-row items-center gap-2 shrink-0">
          <Skeleton className="h-10 w-full sm:w-64 rounded-full" />
          <Skeleton className="h-10 w-10 rounded-full shrink-0" />
        </div>
      </div>

      {/* Folders Section Skeleton */}
      <div className="space-y-4">
        <Skeleton className="h-7 w-28 rounded-md" />
        <div className="grid gap-2 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="border border-border rounded-xl p-4 bg-white flex items-center justify-between"
            >
              <div className="flex items-center gap-4 flex-1 min-w-0 mr-2">
                <Skeleton className="w-8 h-8 rounded-md shrink-0" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4 rounded" />
                  <Skeleton className="h-3 w-1/2 rounded" />
                </div>
              </div>
              <Skeleton className="w-6 h-6 rounded-full shrink-0" />
            </div>
          ))}
        </div>
      </div>

      {/* Files Section Skeleton */}
      <div className="space-y-4">
        <Skeleton className="h-7 w-20 rounded-md" />
        <div className="grid gap-2 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="border border-border rounded-xl p-4 bg-white flex flex-col justify-between gap-4 w-full"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-4 min-w-0 flex-1">
                  <Skeleton className="w-6 h-6 rounded shrink-0" />
                  <div className="min-w-0 flex-1 space-y-2">
                    <Skeleton className="h-4 w-3/4 rounded" />
                    <Skeleton className="h-3 w-1/2 rounded" />
                  </div>
                </div>
                <Skeleton className="w-6 h-6 rounded-full shrink-0" />
              </div>
              <Skeleton className="w-full aspect-video rounded-xl" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default ProfileMaterialsSkeleton
