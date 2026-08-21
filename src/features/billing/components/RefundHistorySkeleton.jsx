import React from "react";
import { Skeleton } from "@/shared/components/ui/indicators";

export default function RefundHistorySkeleton() {
  return (
    <div className="!justify-start gap-6 min-h-[500px]">
      {/* Filters & Refresh Button Skeleton */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-6">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-1">
          <Skeleton className="w-full sm:max-w-sm h-10 rounded-full" />
          <Skeleton className="w-full sm:w-40 h-10 rounded-full" />
        </div>
        <Skeleton className="w-28 h-10 rounded-full shrink-0 self-start sm:self-auto" />
      </div>

      {/* Table Skeleton */}
      <div className="border border-gray-200 rounded-xl overflow-hidden bg-white shadow-xs">
        {/* Table Header */}
        <div className="bg-gray-50 border-b border-gray-200 px-4 py-3 grid grid-cols-6 gap-4">
          <Skeleton className="h-4 w-20 rounded" />
          <Skeleton className="h-4 w-24 rounded" />
          <Skeleton className="h-4 w-20 rounded" />
          <Skeleton className="h-4 w-28 rounded" />
          <Skeleton className="h-4 w-16 rounded" />
          <Skeleton className="h-4 w-24 rounded" />
        </div>

        {/* Table Rows (5 rows) */}
        <div className="divide-y divide-gray-100">
          {Array.from({ length: 5 }).map((_, idx) => (
            <div key={idx} className="px-4 py-4 grid grid-cols-6 gap-4 items-center">
              <Skeleton className="h-4 w-24 rounded" />
              <Skeleton className="h-4 w-20 rounded" />
              <Skeleton className="h-4 w-24 rounded" />
              <Skeleton className="h-4 w-32 rounded" />
              <Skeleton className="h-6 w-16 rounded-full" />
              <Skeleton className="h-4 w-28 rounded" />
            </div>
          ))}
        </div>
      </div>

      {/* Pagination Skeleton */}
      <div className="flex justify-center mt-6">
        <Skeleton className="h-9 w-56 rounded-lg" />
      </div>
    </div>
  );
}
