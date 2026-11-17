import React, { useState, useRef, useEffect, useMemo } from "react"
import { useParams } from "react-router-dom"
import { Globe } from "lucide-react"
import { useLanguage } from "@/shared/context/LanguageContext"
import { useGetPostsQuery } from "@/store/api/social/postsApi"
import PostFeedList from "@/features/profile/components/PostFeedList"
import CreatePostBox from "@/features/profile/components/CreatePostBox"
import {
  getCommunityName,
  getCommunityLanguageId,
  isPostInCommunity,
} from "../utils/newsUtils"

const GlobalNewsPage = () => {
  const { lang } = useParams()
  const { t, language } = useLanguage()
  const [page, setPage] = useState(1)
  const pageSize = 10

  const currentCommunity = useMemo(() => {
    return getCommunityName(
      lang || localStorage.getItem("communityLanguage") || language || "en",
    )
  }, [lang, language])

  const currentCommunityId = useMemo(() => {
    return getCommunityLanguageId(lang || currentCommunity)
  }, [lang, currentCommunity])

  // Reset page when community changes
  useEffect(() => {
    setPage(1)
  }, [currentCommunityId])

  // Fetch social posts using postType = 2 (SocialPost) and languageCommunity
  const { data, error, isLoading, isFetching } = useGetPostsQuery({
    page,
    pageSize,
    postType: 2,
    languageCommunity: currentCommunityId,
  })

  // Filter public posts belonging to current community
  const posts = useMemo(() => {
    const rawList = Array.isArray(data?.data)
      ? data.data
      : Array.isArray(data)
        ? data
        : []
    return rawList.filter(
      (post) =>
        (!post.privacy || String(post.privacy).toLowerCase() === "public") &&
        isPostInCommunity(post, currentCommunityId),
    )
  }, [data, currentCommunityId])

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
    <div className="flex flex-col w-full max-w-3xl mx-auto p-4 gap-4">
      <CreatePostBox defaultCommunity={currentCommunity} />

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
  )
}

export default GlobalNewsPage
