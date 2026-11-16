import React from "react"
import Skeleton from "@/shared/components/ui/indicators/Skeleton"

/**
 * NewsDetailSkeleton — Mirrors the exact dual-card layout of NewsDetailPage
 * to provide a seamless, non-shifting skeleton loading state.
 */
const NewsDetailSkeleton = () => {
  return (
    <div className="min-h-screen w-full bg-primaryBg dark:bg-[#0F0F0F]">
      <div className="mx-auto w-full max-w-7xl p-4">
        {/* ── Back Navigation Placeholder ── */}
        <div className="mb-2 relative z-10 flex items-center gap-2 py-3">
          <Skeleton className="h-5 w-5 rounded-full shrink-0" />
          <Skeleton className="h-4 w-32 rounded" />
        </div>

        {/* ── Dual-Card Layout Skeleton ── */}
        <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-[minmax(0,1fr)_360px]">
          {/* ── Left Column: Article Card Skeleton ── */}
          <div className="min-w-0">
            <div className="rounded-2xl border border-border dark:border-[#3F3F3F] bg-white dark:bg-[#1A1A1A] p-4 shadow-xs">
              <header className="min-w-0">
                {/* Title */}
                <Skeleton className="h-9 w-4/5 rounded-lg mb-2" />
                <Skeleton className="h-9 w-3/5 rounded-lg mb-3" />

                {/* Metadata row (Date & Views) */}
                <div className="flex items-center gap-2 mb-4">
                  <Skeleton className="h-4 w-24 rounded" />
                  <Skeleton className="h-1 w-1 rounded-full" />
                  <Skeleton className="h-4 w-20 rounded" />
                </div>

                {/* Hero Carousel Image */}
                <Skeleton className="aspect-video w-full rounded-2xl mb-4" />

                {/* Topic Chips */}
                <div className="flex items-center gap-2 mb-6">
                  <Skeleton className="h-7 w-20 rounded-full" />
                  <Skeleton className="h-7 w-24 rounded-full" />
                  <Skeleton className="h-7 w-16 rounded-full" />
                </div>
              </header>

              {/* Content Body paragraphs */}
              <div className="space-y-2.5 pt-2">
                <Skeleton className="h-4 w-full rounded" />
                <Skeleton className="h-4 w-full rounded" />
                <Skeleton className="h-4 w-11/12 rounded" />
                <Skeleton className="h-4 w-4/5 rounded" />
                <Skeleton className="h-4 w-3/5 rounded" />

                <div className="py-2" />

                <Skeleton className="h-4 w-full rounded" />
                <Skeleton className="h-4 w-5/6 rounded" />
                <Skeleton className="h-4 w-4/6 rounded" />
              </div>

              {/* Action Bar */}
              <div className="mt-8 border-t border-border dark:border-[#3F3F3F] pt-4 flex items-center justify-between gap-4">
                <Skeleton className="h-10 w-28 rounded-xl" />
                <Skeleton className="h-10 w-28 rounded-xl" />
                <Skeleton className="h-10 w-28 rounded-xl" />
              </div>
            </div>
          </div>

          {/* ── Right Column: Sidebar Card Skeleton ── */}
          <aside className="min-w-0 lg:sticky lg:top-20 lg:self-start">
            <div className="rounded-2xl border border-border dark:border-[#3F3F3F] bg-white dark:bg-[#1A1A1A] shadow-xs overflow-hidden">
              {/* Header */}
              <div className="p-4">
                <Skeleton className="h-6 w-36 rounded" />
              </div>

              {/* Related News List */}
              <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1">
                {[...Array(5)].map((_, i) => (
                  <li key={i} className="flex w-full items-start gap-4 px-4 py-3">
                    <Skeleton className="h-[56px] aspect-video rounded-lg shrink-0" />
                    <div className="flex flex-col flex-1 gap-2 min-w-0 pt-0.5">
                      <Skeleton className="h-4 w-4/5 rounded" />
                      <Skeleton className="h-3 w-1/3 rounded" />
                      <Skeleton className="h-3 w-1/2 rounded" />
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}

export default NewsDetailSkeleton

