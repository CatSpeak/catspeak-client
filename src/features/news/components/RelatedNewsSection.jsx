import { useState, useMemo } from "react"
import { useParams } from "react-router-dom"
import { motion, AnimatePresence, useReducedMotion } from "framer-motion"
import { useLanguage } from "@/shared/context/LanguageContext"
import { useGetPostsQuery } from "@/store/api/social/postsApi"
import Skeleton from "@/shared/components/ui/indicators/Skeleton"
import PillButton from "@/shared/components/ui/buttons/PillButton"
import { RotateCcw, ChevronDown } from "lucide-react"
import { M3_MOTION } from "@/shared/constants/motion"
import RelatedNewsCard from "./RelatedNewsCard"
import { getCommunityName } from "../utils/newsUtils"

const INITIAL_LIMIT = 4
const MAX_LIMIT = 8

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
  const prefersReducedMotion = useReducedMotion()
  const [isExpanded, setIsExpanded] = useState(false)

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

      // Filter out empty ghost posts (no text and no media)
      const hasText = Boolean(
        post.title?.trim() || post.excerpt?.trim() || post.content?.trim(),
      )
      const hasMedia = Array.isArray(post.media) && post.media.length > 0
      if (!hasText && !hasMedia) return false

      const community = (post.languageCommunity || "All").toLowerCase()
      return community === "all" || community === currentCommunity
    })
  }, [data, currentPostId, currentCommunity])

  const initialPosts = useMemo(
    () => relatedPosts.slice(0, INITIAL_LIMIT),
    [relatedPosts],
  )
  const extraPosts = useMemo(
    () => relatedPosts.slice(INITIAL_LIMIT, MAX_LIMIT),
    [relatedPosts],
  )
  const hasMore = relatedPosts.length > INITIAL_LIMIT

  if (!isLoading && !error && relatedPosts.length === 0) return null

  const heading = (
    <h2
      id="related-news-heading"
      className="min-w-0 text-base font-bold text-gray-900 dark:text-white"
    >
      {labels?.relatedNews || "Related news"}
    </h2>
  )

  return (
    <section
      aria-labelledby="related-news-heading"
      className={`min-w-0 ${className}`.trim()}
    >
      <div className="flex items-center mb-1">{heading}</div>
      {isLoading ? (
        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-2">
          {[...Array(INITIAL_LIMIT)].map((_, i) => (
            <li
              key={i}
              className="flex w-full h-[120px] items-start gap-4 p-4 rounded-xl border border-border dark:border-[#3F3F3F] bg-white dark:bg-[#1A1A1A] overflow-hidden"
            >
              <Skeleton className="h-16 aspect-video shrink-0 rounded-lg" />
              <div className="flex flex-col justify-between flex-1 min-w-0 h-full">
                <div className="flex flex-col gap-1.5">
                  <Skeleton className="h-4 w-4/5 rounded" />
                  <Skeleton className="h-3 w-1/3 rounded" />
                </div>
                <Skeleton className="h-3 w-1/4 rounded" />
              </div>
            </li>
          ))}
        </ul>
      ) : error ? (
        <div className="py-2">
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
        <>
          <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-2">
            {initialPosts.map((post) => (
              <li key={post.postId || post.id}>
                <RelatedNewsCard news={post} />
              </li>
            ))}
          </ul>

          <AnimatePresence initial={false}>
            {isExpanded && extraPosts.length > 0 && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{
                  height: "auto",
                  opacity: 1,
                  transition: {
                    height: prefersReducedMotion
                      ? { duration: 0 }
                      : M3_MOTION.standard.spatial.fast,
                    opacity: prefersReducedMotion
                      ? { duration: 0 }
                      : M3_MOTION.standard.effects.fast,
                  },
                }}
                exit={{
                  height: 0,
                  opacity: 0,
                  transition: {
                    height: prefersReducedMotion
                      ? { duration: 0 }
                      : M3_MOTION.standard.spatial.fast,
                    opacity: prefersReducedMotion
                      ? { duration: 0 }
                      : M3_MOTION.standard.effects.fast,
                  },
                }}
                className="overflow-hidden"
              >
                <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-2 pt-2">
                  {extraPosts.map((post) => (
                    <li key={post.postId || post.id}>
                      <RelatedNewsCard news={post} />
                    </li>
                  ))}
                </ul>
              </motion.div>
            )}
          </AnimatePresence>

          {hasMore && (
            <div className="pt-2">
              <PillButton
                type="button"
                variant="secondary"
                className="w-full"
                onClick={() => setIsExpanded((prev) => !prev)}
                aria-expanded={isExpanded}
                endIcon={
                  <motion.span
                    animate={{ rotate: isExpanded ? 180 : 0 }}
                    transition={
                      prefersReducedMotion
                        ? { duration: 0 }
                        : M3_MOTION.standard.spatial.fast
                    }
                    className="inline-flex items-center justify-center shrink-0"
                  >
                    <ChevronDown size={20} aria-hidden="true" />
                  </motion.span>
                }
              >
                {isExpanded
                  ? labels?.showLess || "Thu gọn"
                  : labels?.seeMore || "Xem thêm"}
              </PillButton>
            </div>
          )}
        </>
      )}
    </section>
  )
}

export default RelatedNewsSection
