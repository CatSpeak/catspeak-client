import React, { useState, useRef, useCallback, useMemo, useEffect } from "react"
import { useLanguage } from "@/shared/context/LanguageContext"
import { useGetPostsQuery } from "@/store/api/postsApi"
import NewsCard from "../components/NewsCard"
import LoadingSpinner from "@/shared/components/ui/indicators/LoadingSpinner"
import ErrorMessage from "@/shared/components/ui/indicators/ErrorMessage"
import EmptyState from "@/shared/components/ui/indicators/EmptyState"

const useColumnCount = () => {
  const [cols, setCols] = useState(2)

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth
      if (width >= 1280)
        setCols(5) // xl
      else if (width >= 1024)
        setCols(4) // lg
      else if (width >= 640)
        setCols(3) // sm
      else setCols(2) // default
    }

    handleResize()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  return cols
}

const NewsPage = () => {
  const { t } = useLanguage()
  const [page, setPage] = useState(1)
  const pageSize = 24

  const { data, isLoading, isFetching, error } = useGetPostsQuery({
    page,
    pageSize,
  })

  // Filter for public posts (backend already sorts by createDate descending)
  const publicPosts = useMemo(() => {
    return data?.data?.filter((post) => post.privacy === "Public") || []
  }, [data?.data])

  const columnsCount = useColumnCount()

  // Distribute posts into columns left-to-right
  const columns = useMemo(() => {
    const colsArray = Array.from({ length: columnsCount }, () => [])
    publicPosts.forEach((post, i) => {
      colsArray[i % columnsCount].push(post)
    })
    return colsArray
  }, [publicPosts, columnsCount])

  const hasMore = data?.hasMore ?? false

  // Infinite Scroll logic
  const observer = useRef()
  const lastPostElementRef = useCallback(
    (node) => {
      if (isFetching) return
      if (observer.current) observer.current.disconnect()
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          setPage((prevPage) => prevPage + 1)
        }
      })
      if (node) observer.current.observe(node)
    },
    [isFetching, hasMore],
  )

  if (error && page === 1) {
    if (error?.status === 404) {
      return <EmptyState message="No posts found" />
    }

    if (error?.status === 401) {
      return <EmptyState message={t.catSpeak.newsLoginPrompt} />
    }

    return <ErrorMessage message="Error loading posts" />
  }

  const lastPostId = publicPosts[publicPosts.length - 1]?.postId

  return (
    <div className="flex flex-col w-full">
      <div className="flex flex-row w-full gap-4 items-start">
        {columns.map((col, colIndex) => (
          <div
            key={colIndex}
            className="flex flex-col flex-1 gap-4 sm:gap-6 min-w-0"
          >
            {col.map((post) => {
              const isLast = post.postId === lastPostId
              return (
                <div ref={isLast ? lastPostElementRef : null} key={post.postId}>
                  <NewsCard news={post} />
                </div>
              )
            })}
          </div>
        ))}
      </div>

      {/* Optional fallback Load More button if infinite scroll doesn't trigger */}
      {hasMore && !isFetching && (
        <div className="mt-4 mb-8 flex justify-center w-full">
          <button
            onClick={() => setPage((p) => p + 1)}
            className="rounded-full bg-blue-50 px-6 py-2 text-sm font-medium text-blue-600 transition-colors hover:bg-blue-100"
          >
            {t.news?.loadMore || "Load More"}
          </button>
        </div>
      )}
    </div>
  )
}

export default NewsPage
