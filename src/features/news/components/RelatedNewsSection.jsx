import { useMemo } from "react"
import { useParams } from "react-router-dom"
import { useLanguage } from "@/shared/context/LanguageContext"
import { useGetPostsQuery } from "@/store/api/social/postsApi"
import LoadingSpinner from "@/shared/components/ui/indicators/LoadingSpinner"
import Skeleton from "@/shared/components/ui/indicators/Skeleton"
import PillButton from "@/shared/components/ui/buttons/PillButton"
import { RotateCcw } from "lucide-react"
import RelatedNewsCard from "./RelatedNewsCard"
import { getCommunityName } from "../utils/newsUtils"

const RELATED_NEWS_LIMIT = 10

const RelatedNewsSection = ({
  currentPostId,
  postType = "1",
  className = "",
}) => {
  const { lang } = useParams()
  const { t, language } = useLanguage()
  const labels = t.news?.newsDetail
  const currentLang = lang || language || "vi"
  const currentCommunity = getCommunityName(currentLang).toLowerCase()
  const { data, isLoading, error, refetch } = useGetPostsQuery({
    page: 1,
    pageSize: 12,
    postType,
  })

  const relatedPosts = useMemo(() => {
    const posts = Array.isArray(data?.data)
      ? data.data
      : Array.isArray(data)
        ? data
        : []
    return posts.filter((post) => {
      if (String(post.postId ?? post.id) === String(currentPostId)) return false
      if (post.privacy && post.privacy !== "Public") return false
      const community = (post.languageCommunity || "All").toLowerCase()
      return community === "all" || community === currentCommunity
    })
  }, [data, currentPostId, currentCommunity])

  if (!isLoading && !error && relatedPosts.length === 0) return null

  const heading = (
    <h2
      id="related-news-heading"
      className="min-w-0 text-xl font-bold text-gray-900 dark:text-white"
    >
      {labels?.relatedNews || "Related news"}
    </h2>
  )

  return (
    <section
      aria-labelledby="related-news-heading"
      className={`min-w-0 ${className}`.trim()}
    >
      <div className="p-4">{heading}</div>
      {isLoading ? (
        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1">
          {[...Array(6)].map((_, i) => (
            <li key={i} className="flex w-full items-start gap-4 px-4 py-3">
              <Skeleton className="h-[56px] aspect-video rounded-lg shrink-0" />
              <div className="flex flex-col flex-1 gap-2 min-w-0 pt-0.5">
                <Skeleton className="h-4 w-4/5 rounded" />
                <Skeleton className="h-3 w-1/3 rounded" />
                <Skeleton className="h-3 w-1/2 rounded" />
              </div>
            </li>
          ))}
        </ul>
      ) : error ? (
        <div className="px-4 py-3">
          <PillButton
            type="button"
            variant="secondary"
            onClick={refetch}
            startIcon={<RotateCcw size={16} />}
          >
            {labels?.retryRelatedNews || "Try again"}
          </PillButton>
        </div>
      ) : (
        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1">
          {relatedPosts.slice(0, RELATED_NEWS_LIMIT).map((post) => (
            <li key={post.postId || post.id}>
              <RelatedNewsCard news={post} />
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

export default RelatedNewsSection
