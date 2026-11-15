import { useState } from "react"
import { Link, useParams } from "react-router-dom"
import { Eye, ImageIcon, MessageSquare } from "lucide-react"
import { useLanguage } from "@/shared/context/LanguageContext"
import { getImageUrl } from "@/shared/utils/imageUtils"
import { getTranslatedTimeAgo } from "../utils/newsUtils"

const RelatedNewsCard = ({ news }) => {
  const { lang } = useParams()
  const { t, language } = useLanguage()
  const labels = t.news?.newsDetail
  const image = news.media?.find(
    (item) => item.mediaType === "Image" && item.mediaUrl,
  )
  const imageUrl = image ? getImageUrl(image.mediaUrl) : null
  const [failedImage, setFailedImage] = useState(null)
  const timeAgo = getTranslatedTimeAgo(
    news.createDate,
    t.news?.newsCard?.timeAgo,
  )
  const comments = news.totalComments ?? news.commentCount ?? news.commentsCount

  const displayTitle =
    (news.title && news.title.trim() !== "" && news.title !== "Untitled"
      ? news.title.trim()
      : news.excerpt?.trim()) ||
    labels?.untitled ||
    "Bài viết"

  return (
    <Link
      to={`/${lang || language || "vi"}/cat-speak/news/${news.slug || news.postId || news.id}`}
      className="group flex w-full h-[120px] items-start gap-4 p-4 rounded-xl border border-border dark:border-[#3F3F3F] bg-white dark:bg-[#1A1A1A] hover:bg-[#F2F2F2] dark:hover:bg-[#272727] active:bg-[#E6E6E6] dark:active:bg-[#3D3D3D] select-none cursor-pointer outline-offset-4 touch-manipulation focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cath-red-700"
    >
      {/* ── Left: Thumbnail (locked at h-16 / 64px, aspect-video = ~114px) ── */}
      <div className="relative h-16 aspect-video shrink-0 overflow-hidden rounded-lg bg-gray-200 dark:bg-[#222222]">
        {imageUrl && failedImage !== imageUrl ? (
          <img
            src={imageUrl}
            alt=""
            loading="lazy"
            decoding="async"
            fetchPriority="low"
            onError={() => setFailedImage(imageUrl)}
            className="h-full w-full object-cover aspect-video"
          />
        ) : (
          <div
            className="flex h-full w-full items-center justify-center bg-gray-200 dark:bg-[#222222]"
            aria-hidden="true"
          >
            <ImageIcon
              size={20}
              className="text-gray-500 dark:text-neutral-400"
            />
          </div>
        )}

        {/* Image overlay on hover */}
        <div className="absolute inset-0 z-10 rounded-lg bg-black/0 pointer-events-none group-hover:bg-black/20 dark:group-hover:bg-black/35" />
      </div>

      {/* ── Right: Content (Title + Time at top, stats at bottom, full height) ── */}
      <div className="flex flex-col justify-between flex-1 min-w-0 h-full">
        {/* 1. Header Group: Title + Time */}
        <div className="flex flex-col">
          <h3 className="line-clamp-2 break-words text-base text-gray-900 dark:text-white">
            {displayTitle}
          </h3>
          {timeAgo && (
            <div className="text-sm text-secondary dark:text-[#AAAAAA] whitespace-nowrap">
              {timeAgo}
            </div>
          )}
        </div>

        {/* 2. Stats (Pinned to bottom via justify-between) */}
        <div className="flex items-center gap-x-4 text-sm text-secondary dark:text-[#AAAAAA]">
          {news.viewCount != null && (
            <span className="inline-flex items-center gap-2 shrink-0">
              <Eye size={20} className="shrink-0" aria-hidden="true" />
              <span>{news.viewCount}</span>
            </span>
          )}
          {comments != null && (
            <span className="inline-flex items-center gap-2 shrink-0">
              <MessageSquare
                size={20}
                className="shrink-0"
                aria-hidden="true"
              />
              <span>{comments}</span>
            </span>
          )}
        </div>
      </div>
    </Link>
  )
}

export default RelatedNewsCard
