import React from "react"
import FluentCard from "@/shared/components/ui/FluentCard"
import Divider from "@/shared/components/ui/Divider"
import Skeleton from "@/shared/components/ui/indicators/Skeleton"
import FloatingActionDock from "@/shared/components/ui/containers/FloatingActionDock"

/**
 * VoucherFormSkeleton - Loading skeleton placeholder for Create/Edit Voucher Form Page
 */
const VoucherFormSkeleton = () => {
  return (
    <div className="w-full space-y-6 pb-28 animate-in fade-in duration-300">
      {/* Contextual Breadcrumb Skeleton */}
      <div className="flex items-center gap-2">
        <Skeleton className="h-4 w-28 rounded-md" />
        <span className="text-slate-300">/</span>
        <Skeleton className="h-4 w-44 rounded-md" />
        <span className="text-slate-300">/</span>
        <Skeleton className="h-4 w-36 rounded-md" />
      </div>

      {/* Page Title Skeleton */}
      <Skeleton className="h-8 w-60 rounded-xl" />

      {/* Stepper Skeleton */}
      <div className="flex items-center gap-3">
        <Skeleton className="h-10 w-36 rounded-full" />
        <Skeleton className="h-10 w-28 rounded-full" />
      </div>

      {/* Main 12-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Basic info, Discount, Scope config (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Card 1: Thông tin cơ bản */}
          <FluentCard className="space-y-4">
            <Skeleton className="h-5 w-36 rounded" />
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Skeleton className="h-4 w-24 rounded" />
                <Skeleton className="h-10 w-full rounded-xl" />
              </div>
              <div className="space-y-1.5">
                <Skeleton className="h-4 w-28 rounded" />
                <Skeleton className="h-10 w-full rounded-xl" />
              </div>
              <div className="space-y-1.5">
                <Skeleton className="h-4 w-20 rounded" />
                <Skeleton className="h-20 w-full rounded-xl" />
              </div>
            </div>
          </FluentCard>

          {/* Card 2: Cấu hình giảm giá */}
          <FluentCard className="space-y-4">
            <Skeleton className="h-5 w-40 rounded" />
            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Skeleton className="h-12 w-full rounded-xl" />
                <Skeleton className="h-12 w-full rounded-xl" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                <div className="space-y-1.5">
                  <Skeleton className="h-4 w-20 rounded" />
                  <Skeleton className="h-10 w-full rounded-xl" />
                </div>
                <div className="space-y-1.5">
                  <Skeleton className="h-4 w-28 rounded" />
                  <Skeleton className="h-10 w-full rounded-xl" />
                </div>
              </div>
            </div>
          </FluentCard>

          {/* Card 3: Cấu hình khác & Phạm vi */}
          <FluentCard className="space-y-4">
            <Skeleton className="h-5 w-32 rounded" />
            <div className="space-y-3">
              <Skeleton className="h-10 w-full rounded-xl" />
              <div className="space-y-2 pt-2">
                <Skeleton className="h-5 w-48 rounded" />
                <Skeleton className="h-5 w-56 rounded" />
              </div>
            </div>
          </FluentCard>
        </div>

        {/* Right Column: Validity, Usage Limits, Estimate (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Card 4: Thời gian hiệu lực */}
          <FluentCard className="space-y-4">
            <Skeleton className="h-5 w-36 rounded" />
            <div className="space-y-3">
              <div className="space-y-1.5">
                <Skeleton className="h-4 w-20 rounded" />
                <Skeleton className="h-10 w-full rounded-xl" />
              </div>
              <div className="space-y-1.5">
                <Skeleton className="h-4 w-20 rounded" />
                <Skeleton className="h-10 w-full rounded-xl" />
              </div>
            </div>
          </FluentCard>

          {/* Card 5: Giới hạn sử dụng */}
          <FluentCard className="space-y-4">
            <Skeleton className="h-5 w-32 rounded" />
            <div className="space-y-3">
              <div className="space-y-1.5">
                <Skeleton className="h-4 w-28 rounded" />
                <Skeleton className="h-10 w-full rounded-xl" />
              </div>
              <div className="space-y-1.5">
                <Skeleton className="h-4 w-32 rounded" />
                <Skeleton className="h-10 w-full rounded-xl" />
              </div>
            </div>
          </FluentCard>

          {/* Card 6: Ước tính (1 học viên) */}
          <FluentCard className="space-y-4">
            <Skeleton className="h-5 w-40 rounded" />
            <div className="space-y-2.5">
              <div className="flex justify-between">
                <Skeleton className="h-4 w-24 rounded" />
                <Skeleton className="h-4 w-20 rounded" />
              </div>
              <div className="flex justify-between">
                <Skeleton className="h-4 w-28 rounded" />
                <Skeleton className="h-4 w-16 rounded" />
              </div>
              <div className="flex justify-between">
                <Skeleton className="h-4 w-32 rounded" />
                <Skeleton className="h-4 w-16 rounded" />
              </div>
              <Divider className="!my-2" />
              <div className="flex justify-between">
                <Skeleton className="h-5 w-32 rounded" />
                <Skeleton className="h-5 w-24 rounded" />
              </div>
            </div>
          </FluentCard>
        </div>
      </div>

      {/* Floating Action Dock Skeleton */}
      <FloatingActionDock>
        <div />
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-24 rounded-full" />
          <Skeleton className="h-10 w-28 rounded-full" />
        </div>
      </FloatingActionDock>
    </div>
  )
}

export default VoucherFormSkeleton
