import React, { useState, useRef, useMemo, useEffect } from "react"
import { Newspaper } from "lucide-react"
import { useLanguage } from "@/shared/context/LanguageContext"
import { useGetPostsQuery } from "@/store/api/social/postsApi"
import NewsCard from "../components/NewsCard"
import NewsCardSkeleton from "../components/NewsCardSkeleton"
import ErrorMessage from "@/shared/components/ui/indicators/ErrorMessage"
import EmptyState from "@/shared/components/ui/indicators/EmptyState"
import useColumnCount from "@/shared/hooks/useColumnCount"

/* ------------------------------------------------------------------ */
/*  NewsPage                                                           */
/* ------------------------------------------------------------------ */

const NewsPage = ({ postType = "1" }) => {
  const { t } = useLanguage()

  const [page, setPage] = useState(1)
  const pageSize = 26

  const { data, error, isLoading, isFetching } = useGetPostsQuery({
    page,
    pageSize,
    postType,
  })

  // Only public posts
  const publicPosts = useMemo(() => {
    return data?.data?.filter((post) => post.privacy === "Public") || []
  }, [data?.data])

  const columnsCount = useColumnCount()

  // Distribute posts into masonry columns
  const columns = useMemo(() => {
    const colsArray = Array.from({ length: columnsCount }, () => [])
    publicPosts.forEach((post, i) => {
      colsArray[i % columnsCount].push(post)
    })
    return colsArray
  }, [publicPosts, columnsCount])

  // Infinite scroll observer — trigger fetch when the second-to-last post appears
  const secondLastPostElementRef = useRef(null)
  useEffect(() => {
    if (!secondLastPostElementRef.current) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setPage((p) => p + 1)
        }
      },
      {
        rootMargin: "200px",
      },
    )
    observer.observe(secondLastPostElementRef.current)
    return () => observer.disconnect()
  }, [publicPosts])

  // ── Initial Loading State ─────────────────────────────────────────
  if (isLoading && publicPosts.length === 0) {
    const skeletonCols = Array.from({ length: columnsCount }, () => [])
    const totalSkeletons = columnsCount * 3
    for (let i = 0; i < totalSkeletons; i++) {
      skeletonCols[i % columnsCount].push(i)
    }

    return (
      <div className="flex flex-col w-full gap-4 sm:gap-6 p-4 sm:p-6">
        <div className="flex flex-row w-full gap-4 items-start">
          {skeletonCols.map((col, colIndex) => (
            <div key={colIndex} className="flex flex-col flex-1 gap-4 min-w-0">
              {col.map((itemIndex) => (
                <NewsCardSkeleton key={itemIndex} index={itemIndex} />
              ))}
            </div>
          ))}
        </div>
      </div>
    )
  }

  // ── Error State ───────────────────────────────────────────────────
  if (error && page === 1) {
    if (error?.status === 404) {
      return (
        <div className="flex flex-col w-full gap-4 sm:gap-6 p-4 sm:p-6 min-h-[60vh] justify-center items-center">
          <EmptyState
            message={t.news?.empty?.title || "Chưa có tin tức nào"}
            description={
              t.news?.empty?.description ||
              "Hiện tại chưa có bài đăng tin tức nào. Hãy quay lại sau!"
            }
            icon={Newspaper}
            variant="page"
          />
        </div>
      )
    }
    if (error?.status === 401) {
      return <EmptyState message={t.catSpeak?.newsLoginPrompt} variant="page" />
    }
    return <ErrorMessage message="Error loading posts" />
  }

  // ── Empty State ───────────────────────────────────────────────────
  if (!isLoading && publicPosts.length === 0) {
    return (
      <div className="flex flex-col w-full gap-4 sm:gap-6 p-4 sm:p-6 min-h-[60vh] justify-center items-center">
        <EmptyState
          message={t.news?.empty?.title || "Chưa có tin tức nào"}
          description={
            t.news?.empty?.description ||
            "Hiện tại chưa có bài đăng tin tức nào. Hãy quay lại sau!"
          }
          icon={Newspaper}
          variant="page"
        />
      </div>
    )
  }

  const secondLastPostId =
    publicPosts[publicPosts.length - 2]?.postId ??
    publicPosts[publicPosts.length - 1]?.postId

  // ── Render ────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col w-full gap-4 sm:gap-6 p-4 sm:p-6">
      {/* Masonry Card Grid */}
      <div className="flex flex-row w-full gap-4 items-start">
        {columns.map((col, colIndex) => (
          <div key={colIndex} className="flex flex-col flex-1 gap-4 min-w-0">
            {col.map((post) => {
              const isSecondLast = post.postId === secondLastPostId
              return (
                <div
                  ref={isSecondLast ? secondLastPostElementRef : null}
                  key={post.postId}
                >
                  <NewsCard news={post} />
                </div>
              )
            })}
          </div>
        ))}
      </div>

      {/* Pagination Fetching Skeleton */}
      {isFetching && publicPosts.length > 0 && (
        <div className="flex justify-center py-4">
          <div className="w-8 h-8 border-2 border-rose-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}
    </div>
  )
}

export default NewsPage

