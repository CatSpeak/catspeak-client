import Skeleton from "@/shared/components/ui/indicators/Skeleton"

/**
 * ChatMessagesSkeleton — renders skeleton placeholder bubbles during initial message loading.
 */
const ChatMessagesSkeleton = () => {
  return (
    <div className="flex flex-col gap-4 p-4 h-full justify-end">
      {/* Other User Message Skeleton */}
      <div className="flex items-end gap-2 max-w-[70%]">
        <Skeleton className="w-8 h-8 rounded-full shrink-0" />
        <div className="flex flex-col gap-1">
          <Skeleton className="h-3 w-16 rounded" />
          <Skeleton className="h-10 w-48 rounded-2xl rounded-bl-none" />
        </div>
      </div>

      {/* Current User Message Skeleton */}
      <div className="flex items-end gap-2 max-w-[70%] self-end flex-row-reverse">
        <div className="flex flex-col items-end gap-1">
          <Skeleton className="h-10 w-36 rounded-2xl rounded-br-none" />
        </div>
      </div>

      {/* Other User Message Skeleton */}
      <div className="flex items-end gap-2 max-w-[70%]">
        <Skeleton className="w-8 h-8 rounded-full shrink-0" />
        <div className="flex flex-col gap-1">
          <Skeleton className="h-3 w-20 rounded" />
          <Skeleton className="h-14 w-64 rounded-2xl rounded-bl-none" />
        </div>
      </div>

      {/* Current User Message Skeleton */}
      <div className="flex items-end gap-2 max-w-[70%] self-end flex-row-reverse">
        <div className="flex flex-col items-end gap-1">
          <Skeleton className="h-10 w-52 rounded-2xl rounded-br-none" />
        </div>
      </div>
    </div>
  )
}

export default ChatMessagesSkeleton
