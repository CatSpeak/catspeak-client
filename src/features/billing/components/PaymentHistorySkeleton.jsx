import React from "react";
import { Skeleton } from "@/shared/components/ui/indicators";

export default function PaymentHistorySkeleton() {
  return (
    <div className="!justify-start gap-6 min-h-[500px]">
      {/* Filters Skeleton */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <Skeleton className="w-full sm:flex-1 sm:max-w-sm h-10 rounded-full" />
        <Skeleton className="w-full sm:w-36 h-10 rounded-full" />
        <Skeleton className="w-full sm:w-36 h-10 rounded-full" />
      </div>

      {/* Table Skeleton */}
      <div className="border border-gray-200 rounded-xl overflow-hidden bg-white shadow-xs">
        {/* Table Header */}
        <div className="bg-gray-50 border-b border-gray-200 px-4 py-3 grid grid-cols-6 gap-4">
          <Skeleton className="h-4 w-20 rounded" />
          <Skeleton className="h-4 w-24 rounded" />
          <Skeleton className="h-4 w-16 rounded" />
          <Skeleton className="h-4 w-20 rounded" />
          <Skeleton className="h-4 w-16 rounded" />
          <Skeleton className="h-4 w-16 rounded justify-self-end" />
        </div>

        {/* Table Rows (5 rows) */}
        <div className="divide-y divide-gray-100">
          {Array.from({ length: 5 }).map((_, idx) => (
            <div key={idx} className="px-4 py-4 grid grid-cols-6 gap-4 items-center">
              <Skeleton className="h-4 w-28 rounded" />
              <Skeleton className="h-4 w-20 rounded" />
              <Skeleton className="h-4 w-16 rounded" />
              <Skeleton className="h-4 w-24 rounded" />
              <Skeleton className="h-6 w-20 rounded-full" />
              <Skeleton className="h-8 w-20 rounded-lg justify-self-end" />
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
