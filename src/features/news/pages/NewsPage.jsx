import React, { useState, useEffect } from "react"
import { useLanguage } from "@/shared/context/LanguageContext"
import { useGetPostsQuery } from "@/store/api/postsApi"
import NewsCard from "../components/NewsCard"
import LoadingSpinner from "@/shared/components/ui/indicators/LoadingSpinner"
import ErrorMessage from "@/shared/components/ui/indicators/ErrorMessage"
import EmptyState from "@/shared/components/ui/indicators/EmptyState"

const NewsPage = () => {
  const { t } = useLanguage()
  const [page, setPage] = useState(1)
  const pageSize = 10

  const [accumulatedPosts, setAccumulatedPosts] = useState([])

  const { data, isLoading, isFetching, error } = useGetPostsQuery({
    page,
    pageSize,
  })

  useEffect(() => {
    if (data?.data) {
      const publicPosts = data.data.filter((post) => post.privacy === "Public")
      if (page === 1) {
        setAccumulatedPosts(publicPosts)
      } else {
        setAccumulatedPosts((prev) => [...prev, ...publicPosts])
      }
    }
  }, [data, page])

  const hasMore = data?.data && data.data.length === pageSize

  if (error && page === 1) {
    if (error?.status === 404) {
      return <EmptyState message="No posts found" />
    }

    if (error?.status === 401) {
      return <EmptyState message={t.catSpeak.newsLoginPrompt} />
    }

    return <ErrorMessage message="Error loading posts" />
  }

  return (
    <div className="flex flex-col w-full">
      <div className="columns-2 sm:columns-3 lg:columns-4 xl:columns-5 gap-4">
        {accumulatedPosts.map((post) => (
          <div
            key={`${post.postId}-${page}`}
            className="break-inside-avoid mb-4 sm:mb-6"
          >
            <NewsCard news={post} />
          </div>
        ))}
      </div>

      {hasMore && (
        <div className="mt-8 flex justify-center">
          <button
            onClick={() => setPage((p) => p + 1)}
            disabled={isFetching}
            className="rounded-full bg-blue-50 px-6 py-2 text-sm font-medium text-blue-600 transition-colors hover:bg-blue-100 disabled:opacity-50"
          >
            {isFetching ? "Loading..." : "Load More"}
          </button>
        </div>
      )}
    </div>
  )
}

export default NewsPage
