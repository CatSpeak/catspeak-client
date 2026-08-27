import { Skeleton } from "@/shared/components/ui/indicators"

const InstructorSkeletonCard = () => (
  <div className="flex-shrink-0 w-[210px] sm:w-[230px] lg:w-[245px] flex flex-col items-center snap-start">
    <Skeleton className="w-full h-[280px] sm:h-[300px] lg:h-[320px] !rounded-xl" />
    <Skeleton className="mt-4 w-3/4 h-6 rounded" />
    <Skeleton className="mt-2 w-1/2 h-4 rounded" />
  </div>
)

export default InstructorSkeletonCard
