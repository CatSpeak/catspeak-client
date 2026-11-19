import React from "react"
import { Newspaper } from "lucide-react"
import FluentCard from "@/shared/components/ui/FluentCard"
import EmptyState from "@/shared/components/ui/indicators/EmptyState"
import ErrorMessage from "@/shared/components/ui/indicators/ErrorMessage"
import ProfilePostCard from "./ProfilePostCard"
import ProfilePostCardSkeleton from "./ProfilePostCardSkeleton"
import InFeedRecommendationSection from "@/features/news/components/recommendations/InFeedRecommendationSection"

const PostFeedList = ({
  posts = [],
  isLoading = false,
  isFetching = false,
  isFilterLoading = false,
  error = null,
  errorMessage = "",
  skeletonCount = 3,
  emptyMessage = "Chưa có bài viết nào.",
  emptyIcon: EmptyIcon = Newspaper,
  emptyDescription = null,
  emptyVariant = "card", // "card" | "page"
  isOwnProfile = false,
  lastPostRef = null,
  className = "",
  showRecommendations = false,
  languageCommunity = 0,
  searchKeyword = "",
}) => {
  const isInitialOrFilterLoading = isLoading || isFilterLoading

  // Initial Loading or Filter Loading State (when no posts are rendered)
  if (isInitialOrFilterLoading && posts.length === 0) {
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

  // Empty State (only when NOT loading and posts is empty)
  if (!isInitialOrFilterLoading && posts.length === 0) {
    if (emptyVariant === "page") {
      return (
        <div className="flex-1 flex flex-col items-center justify-center w-full my-auto">
          <EmptyState message={emptyMessage} icon={EmptyIcon} variant="page">
            {emptyDescription && (
              <p className="text-sm text-secondary dark:text-[#AAAAAA] mt-1 text-center max-w-sm">
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
              <p className="text-sm text-secondary dark:text-[#AAAAAA] mt-1 text-center max-w-sm">
                {emptyDescription}
              </p>
            )}
          </EmptyState>
        </FluentCard>
      </div>
    )
  }

  // Posts Feed List (with dimming transition if refetching/applying filter over existing posts)
  const CYCLE_TYPES = ["teacher", "group", "user"]

  return (
    <div
      className={`${className} transition-opacity duration-200 ${
        isFilterLoading
          ? "opacity-50 pointer-events-none filter blur-[0.5px]"
          : "opacity-100"
      }`}
    >
      {posts.map((post, index) => {
        const isLast = index === posts.length - 1
        // BR-DX-06: Chèn section sau mỗi 5-10 bài tin (ở đây chèn sau các bài thứ 5, 12, 19...)
        const shouldInsertRecommendation =
          showRecommendations &&
          (index + 1 >= 5) &&
          ((index + 1 - 5) % 7 === 0)
        const recIndex = Math.floor((index + 1 - 5) / 7)
        const cycleType = CYCLE_TYPES[recIndex % CYCLE_TYPES.length]

        return (
          <React.Fragment key={post.postId || index}>
            <div ref={isLast ? lastPostRef : null}>
              <ProfilePostCard
                post={post}
                isOwnProfile={isOwnProfile}
                searchKeyword={searchKeyword}
              />
            </div>

            {shouldInsertRecommendation && (
              <InFeedRecommendationSection
                cycleType={cycleType}
                languageCommunity={languageCommunity}
              />
            )}
          </React.Fragment>
        )
      })}

      {/* Pagination Fetching Skeleton */}
      {isFetching && <ProfilePostCardSkeleton />}
    </div>
  )
}

export default PostFeedList
