import React from "react"
import FluentCard from "@/shared/components/ui/FluentCard"
import Divider from "@/shared/components/ui/Divider"
import Skeleton from "@/shared/components/ui/indicators/Skeleton"

/**
 * VoucherDetailSkeleton - Loading skeleton placeholder for VoucherDetailPage
 */
const VoucherDetailSkeleton = () => {
  return (
    <div className="w-full space-y-6 text-base animate-in fade-in duration-300">
      {/* Back Button Skeleton */}
      <Skeleton className="h-9 w-24 rounded-full" />

      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-4 min-w-0">
          <Skeleton className="h-8 w-44 rounded-md" />
          <Skeleton className="h-6 w-28 rounded-full" />
        </div>
        <div className="flex items-center justify-end gap-2">
          <Skeleton className="h-9 w-24 rounded-full" />
        </div>
      </div>

      {/* Top 12-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Config & Deposit Card Skeleton */}
        <div className="lg:col-span-5">
          <FluentCard className="space-y-6">
            {/* Config section */}
            <div className="space-y-4">
              <Skeleton className="h-5 w-36 rounded" />
              <div className="flex flex-col gap-2.5">
                {[...Array(7)].map((_, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <Skeleton className="h-4 w-24 rounded" />
                    <Skeleton className="h-4 w-28 rounded" />
                  </div>
                ))}
              </div>
            </div>

            <Divider />

            {/* Deposit section */}
            <div className="space-y-4">
              <Skeleton className="h-5 w-24 rounded" />
              <div className="flex flex-col gap-2.5">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <Skeleton className="h-4 w-20 rounded" />
                    <Skeleton className="h-4 w-24 rounded" />
                  </div>
                ))}
              </div>
            </div>
          </FluentCard>
        </div>

        {/* Right Column: Stats & Refund Card Skeletons */}
        <div className="lg:col-span-7 space-y-6">
          {/* Stats Card Skeleton */}
          <FluentCard className="space-y-6">
            <Skeleton className="h-5 w-32 rounded" />

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-20 rounded" />
                <Skeleton className="h-4 w-24 rounded" />
              </div>
              <Skeleton className="h-2 w-full rounded-full" />
            </div>

            {/* 2 Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              <div className="p-4 rounded-xl bg-slate-50 border border-border flex flex-col gap-2">
                <Skeleton className="h-3.5 w-28 rounded" />
                <Skeleton className="h-7 w-32 rounded" />
              </div>
              <div className="p-4 rounded-xl bg-slate-50 border border-border flex flex-col gap-2">
                <Skeleton className="h-3.5 w-28 rounded" />
                <Skeleton className="h-7 w-16 rounded" />
              </div>
            </div>
          </FluentCard>

          {/* Refund Card Skeleton */}
          <FluentCard className="space-y-4">
            <Skeleton className="h-5 w-36 rounded" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-full rounded" />
              <Skeleton className="h-4 w-4/5 rounded" />
            </div>
            <div className="flex items-center gap-2 pt-1">
              <Skeleton className="h-5 w-5 rounded-full" />
              <Skeleton className="h-4 w-48 rounded" />
            </div>
          </FluentCard>
        </div>
      </div>

      {/* Bottom Table Skeleton */}
      <FluentCard className="space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <Skeleton className="h-5 w-32 rounded" />
          <div className="flex items-center gap-2">
            <Skeleton className="h-10 w-48 sm:w-64 rounded-full" />
            <Skeleton className="h-10 w-36 rounded-full" />
          </div>
        </div>

        {/* Table Rows Skeleton */}
        <div className="overflow-x-auto -mx-6 px-6 pt-2">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <Skeleton className="h-3.5 w-20 rounded" />
            <Skeleton className="h-3.5 w-28 rounded" />
            <Skeleton className="h-3.5 w-24 rounded" />
            <Skeleton className="h-3.5 w-20 rounded" />
            <Skeleton className="h-3.5 w-20 rounded" />
          </div>

          <div className="divide-y divide-border">
            {[...Array(4)].map((_, idx) => (
              <div key={idx} className="flex items-center justify-between py-4">
                <Skeleton className="h-4 w-24 rounded" />
                <div className="flex items-center gap-2.5">
                  <Skeleton className="w-8 h-8 rounded-full" />
                  <Skeleton className="h-4 w-28 rounded" />
                </div>
                <Skeleton className="h-4 w-32 rounded" />
                <Skeleton className="h-4 w-20 rounded" />
                <Skeleton className="h-6 w-20 rounded-full" />
              </div>
            ))}
          </div>
        </div>
      </FluentCard>
    </div>
  )
}

export default VoucherDetailSkeleton
