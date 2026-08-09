import React from "react"
import { Skeleton } from "@/shared/components/ui/indicators"

/**
 * Loading skeleton UI for bank list selection.
 */
export default function BankListSkeleton({ count = 6 }) {
  return (
    <div className="flex flex-col gap-1 py-1">
      {[...Array(count)].map((_, i) => (
        <div
          key={i}
          className="flex h-[72px] w-full items-center justify-between px-4 rounded-xl"
        >
          <div className="flex items-center gap-4 flex-1">
            <Skeleton className="h-[56px] w-[56px] shrink-0 rounded-xl bg-neutral-200 dark:bg-neutral-800" />
            <div className="flex flex-col justify-center gap-2 flex-1 min-w-0">
              <Skeleton className="h-4 w-32 rounded bg-neutral-200 dark:bg-neutral-800" />
              <Skeleton className="h-3 w-48 rounded bg-neutral-200 dark:bg-neutral-800" />
            </div>
          </div>
          <Skeleton className="h-5 w-5 rounded-full shrink-0 bg-neutral-200 dark:bg-neutral-800" />
        </div>
      ))}
    </div>
  )
}
