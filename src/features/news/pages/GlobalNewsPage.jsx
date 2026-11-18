import React, { useState, useRef, useEffect, useMemo } from "react"
import { useParams } from "react-router-dom"
import { Globe } from "lucide-react"
import { useLanguage } from "@/shared/context/LanguageContext"
import { useGetPostsQuery } from "@/store/api/social/postsApi"
import PostFeedList from "@/features/profile/components/PostFeedList"
import DailyVocabWidget from "../components/daily-vocab/DailyVocabWidget"

const GlobalNewsPage = () => {
  const { lang } = useParams()
  const { t, language } = useLanguage()
  const currentLang = lang || language || "en"
  const [page, setPage] = useState(1)
  const pageSize = 10

  // Fetch social posts using postType = 2 (SocialPost)
  const { data, error, isLoading, isFetching } = useGetPostsQuery({
    page,
    pageSize,
    postType: 2,
  })

  // Filter public posts
  const posts = useMemo(() => {
    const rawList = Array.isArray(data?.data)
      ? data.data
      : Array.isArray(data)
        ? data
        : []
    return rawList.filter(
      (post) =>
        !post.privacy || String(post.privacy).toLowerCase() === "public",
    )
  }, [data])

  // Infinite scroll observer for vertical social feed
  const lastPostRef = useRef(null)
  useEffect(() => {
    if (!lastPostRef.current || !data?.hasMore || isFetching) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setPage((p) => p + 1)
        }
      },
      { rootMargin: "200px" },
    )
    observer.observe(lastPostRef.current)
    return () => observer.disconnect()
  }, [posts, data?.hasMore, isFetching])

  return (
    <div className="flex flex-col lg:flex-row gap-6 w-full max-w-7xl mx-auto p-4 sm:p-6 items-start">
      {/* Cột trái: Feed bản tin thế giới */}
      <div className="flex-1 min-w-0 w-full max-w-3xl mx-auto">
        <PostFeedList
          posts={posts}
          isLoading={isLoading && page === 1}
          isFetching={isFetching && page > 1}
          error={error && page === 1}
          errorMessage="Không thể tải tin tức thế giới"
          emptyMessage={t.news?.empty?.title || "Chưa có bài đăng nào"}
          emptyIcon={Globe}
          emptyDescription={
            t.news?.empty?.description ||
            "Hiện tại chưa có bài đăng nào trong bản tin thế giới. Hãy quay lại sau!"
          }
          emptyVariant="page"
          lastPostRef={lastPostRef}
          className="flex flex-col gap-2 w-full flex-1"
        />
      </div>

      {/* Cột phải: Thẻ Từ vựng của ngày / Ôn tập từ vựng BR-VOCAB-01 */}
      <aside className="w-full lg:w-80 xl:w-96 shrink-0 lg:sticky lg:top-20">
        <DailyVocabWidget lang={currentLang} />
      </aside>
    </div>
  )
}

export default GlobalNewsPage
