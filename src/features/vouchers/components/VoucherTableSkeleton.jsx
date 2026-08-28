import React from "react"
import { Skeleton } from "@/shared/components/ui/indicators"
import FluentCard from "@/shared/components/ui/FluentCard"

/**
 * VoucherTableSkeleton - Loading placeholder for voucher table and mobile cards.
 *
 * @param {number} rows - Number of skeleton rows to display on desktop (default: 5)
 */
const VoucherTableSkeleton = ({ rows = 5 }) => {
  return (
    <>
      {/* Desktop Table Skeleton */}
      <FluentCard
        padding="!p-0"
        className="overflow-hidden flex-1 hidden md:block shadow-none !border-border !rounded-xl"
      >
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/80 border-b border-border text-sm font-semibold">
              <th className="p-4 w-[16%]">
                <Skeleton className="h-4 w-24 rounded" />
              </th>
              <th className="p-4 w-[14%]">
                <Skeleton className="h-4 w-20 rounded" />
              </th>
              <th className="p-4 w-[18%]">
                <Skeleton className="h-4 w-16 rounded" />
              </th>
              <th className="p-4 w-[20%]">
                <Skeleton className="h-4 w-24 rounded" />
              </th>
              <th className="p-4 w-[12%]">
                <Skeleton className="h-4 w-16 rounded" />
              </th>
              <th className="p-4 w-[10%]">
                <Skeleton className="h-4 w-20 rounded" />
              </th>
              <th className="p-4 w-[10%]">
                <Skeleton className="h-4 w-12 rounded ml-auto" />
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-border">
            {Array.from({ length: rows }).map((_, idx) => (
              <tr key={idx} className="border-b border-border last:border-0">
                {/* Code & Title */}
                <td className="px-4 py-3.5 w-[16%]">
                  <div className="space-y-1.5">
                    <Skeleton className="h-5 w-24 rounded-md" />
                    <Skeleton className="h-3 w-32 rounded" />
                  </div>
                </td>
                {/* Type */}
                <td className="px-4 py-3.5 w-[14%]">
                  <Skeleton className="h-4 w-20 rounded" />
                </td>
                {/* Value */}
                <td className="px-4 py-3.5 w-[18%]">
                  <Skeleton className="h-5 w-20 rounded" />
                </td>
                {/* Validity */}
                <td className="px-4 py-3.5 w-[20%]">
                  <div className="space-y-1">
                    <Skeleton className="h-4 w-28 rounded" />
                  </div>
                </td>
                {/* Usage */}
                <td className="px-4 py-3.5 w-[12%]">
                  <div className="space-y-1.5">
                    <Skeleton className="h-3.5 w-16 rounded" />
                    <Skeleton className="h-1.5 w-20 rounded-full" />
                  </div>
                </td>
                {/* Status */}
                <td className="px-4 py-3.5 w-[10%]">
                  <Skeleton className="h-6 w-20 rounded-full" />
                </td>
                {/* Actions */}
                <td className="px-4 py-3.5 w-[10%]">
                  <div className="flex justify-end">
                    <Skeleton className="h-8 w-8 rounded-lg" />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </FluentCard>

      {/* Mobile Card Skeleton */}
      <div className="flex flex-col gap-3 md:hidden">
        {Array.from({ length: 3 }).map((_, idx) => (
          <div
            key={idx}
            className="p-4 rounded-2xl bg-white border border-slate-200/80 space-y-3 shadow-xs"
          >
            {/* Header: Code & Status */}
            <div className="flex items-center justify-between gap-2">
              <Skeleton className="h-6 w-28 rounded-lg" />
              <Skeleton className="h-6 w-20 rounded-full" />
            </div>

            {/* Title & Description */}
            <div className="space-y-1.5">
              <Skeleton className="h-4 w-3/4 rounded" />
              <Skeleton className="h-3 w-1/2 rounded" />
            </div>

            {/* Meta Grid */}
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
              <div className="space-y-1">
                <Skeleton className="h-3 w-14 rounded" />
                <Skeleton className="h-4 w-20 rounded" />
              </div>
              <div className="space-y-1">
                <Skeleton className="h-3 w-14 rounded" />
                <Skeleton className="h-4 w-16 rounded" />
              </div>
            </div>

            {/* Progress / Footer */}
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
              <Skeleton className="h-3.5 w-24 rounded" />
              <Skeleton className="h-3.5 w-20 rounded" />
            </div>
          </div>
        ))}
      </div>
    </>
  )
}

export default VoucherTableSkeleton
