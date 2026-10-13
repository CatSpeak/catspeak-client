import React from "react"

const LearnerDashboardSkeleton = () => {
  return (
    <div className="w-full space-y-6 animate-pulse" aria-busy="true" aria-label="Loading dashboard">
      {/* Header Skeleton */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-4 w-32 bg-gray-200 rounded" />
          <div className="h-7 w-64 bg-gray-200 rounded" />
        </div>
        <div className="h-9 w-24 bg-gray-200 rounded" />
      </div>

      {/* Filter Bar Skeleton */}
      <div className="h-20 bg-gray-200 rounded-xl" />

      {/* 6 KPI Cards Skeleton */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-28 bg-gray-200 rounded-xl" />
        ))}
      </div>

      {/* Main Charts Row Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="h-72 bg-gray-200 rounded-xl" />
        <div className="h-72 bg-gray-200 rounded-xl" />
      </div>

      {/* Mid Row Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="h-64 bg-gray-200 rounded-xl" />
        <div className="h-64 bg-gray-200 rounded-xl" />
      </div>

      {/* Bottom Row Skeleton */}
      <div className="h-48 bg-gray-200 rounded-xl" />
    </div>
  )
}

export default LearnerDashboardSkeleton
