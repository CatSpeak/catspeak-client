import { Skeleton } from "@/shared/components/ui/indicators"

const LandingNewsSkeletonCard = () => (
  <div className="w-full flex flex-col">
    <Skeleton className="w-full h-[180px] sm:h-[195px] lg:h-[210px] !rounded-xl" />
    <div className="mt-3.5 space-y-2">
      <Skeleton className="h-4 w-24 rounded" />
      <Skeleton className="h-5 w-full rounded" />
      <Skeleton className="h-5 w-3/4 rounded" />
    </div>
  </div>
)

export default LandingNewsSkeletonCard
