import React from "react"
import { Newspaper } from "lucide-react"
import FluentCard from "@/shared/components/ui/FluentCard"
import EmptyState from "@/shared/components/ui/indicators/EmptyState"
import ErrorMessage from "@/shared/components/ui/indicators/ErrorMessage"
import ProfilePostCard from "./ProfilePostCard"
import ProfilePostCardSkeleton from "./ProfilePostCardSkeleton"

const PostFeedList = ({
  posts = [],
  isLoading = false,
  isFetching = false,
  error = null,
  errorMessage = "",
  skeletonCount = 3,
  emptyMessage = "Chưa có bài viết nào.",
  emptyIcon: EmptyIcon = Newspaper,
  emptyDescription = null,
  emptyVariant = "card", // "card" | "page"
  isOwnProfile = false,
  lastPostRef = null,
  className = "space-y-4",
}) => {
  // Initial Loading State
  if (isLoading && posts.length === 0) {
    return (
      <div className={className}>
        {Array.from({ length: skeletonCount }).map((_, i) => (
          <ProfilePostCardSkeleton key={i} />
        ))}
      </div>
    )
  }

  // Error State
  if (error && posts.length === 0) {
    return (
      <div className={className}>
        <ErrorMessage message={errorMessage || "Không thể tải bài viết."} />
      </div>
    )
  }

  // Empty State
  if (!isLoading && posts.length === 0) {
    if (emptyVariant === "page") {
      return (
        <div className="flex-1 flex flex-col items-center justify-center w-full my-auto">
          <EmptyState message={emptyMessage} icon={EmptyIcon} variant="page">
            {emptyDescription && (
              <p className="text-sm text-[#606060] mt-1 text-center max-w-sm">
                {emptyDescription}
              </p>
            )}
          </EmptyState>
        </div>
      )
    }

    return (
      <div className={className}>
        <FluentCard>
          <EmptyState message={emptyMessage} icon={EmptyIcon} variant="simple">
            {emptyDescription && (
              <p className="text-sm text-[#606060] mt-1 text-center max-w-sm">
                {emptyDescription}
              </p>
            )}
          </EmptyState>
        </FluentCard>
      </div>
    )
  }

  // Posts Feed List
  return (
    <div className={className}>
      {posts.map((post, index) => {
        const isLast = index === posts.length - 1
        return (
          <div key={post.postId || index} ref={isLast ? lastPostRef : null}>
            <ProfilePostCard post={post} isOwnProfile={isOwnProfile} />
          </div>
        )
      })}

      {/* Pagination Fetching Skeleton */}
      {isFetching && <ProfilePostCardSkeleton />}
    </div>
  )
}

export default PostFeedList
