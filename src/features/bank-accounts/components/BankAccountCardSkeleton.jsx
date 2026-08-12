import React from "react"
import FluentCard from "@/shared/components/ui/FluentCard"
import { Skeleton } from "@/shared/components/ui/indicators"

/**
 * Skeleton placeholder for instructor bank account cards grid.
 */
export default function BankAccountCardSkeleton({ count = 3 }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {[...Array(count)].map((_, i) => (
        <FluentCard
          key={i}
          padding="p-4"
          className="flex flex-col justify-between h-[180px] border-neutral-200/80"
        >
          {/* Section 1: Header (Radio, Bank Name & Status Badge) */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <Skeleton className="h-5 w-5 rounded-full shrink-0" />
              <div className="flex flex-col gap-2 min-w-0 flex-1">
                <Skeleton className="h-4 w-28 rounded" />
                <Skeleton className="h-3 w-40 rounded" />
              </div>
            </div>
            <Skeleton className="h-5 w-16 rounded-full shrink-0" />
          </div>

          {/* Section 2: Account Details */}
          <div className="flex flex-col gap-2 my-3">
            <Skeleton className="h-3 w-20 rounded" />
            <Skeleton className="h-5 w-44 rounded" />
          </div>

          {/* Section 3: Footer Action */}
          <div className="flex items-center justify-between">
            <Skeleton className="h-3.5 w-28 rounded" />
            <Skeleton className="h-7 w-7 rounded-lg shrink-0" />
          </div>
        </FluentCard>
      ))}
    </div>
  )
}
