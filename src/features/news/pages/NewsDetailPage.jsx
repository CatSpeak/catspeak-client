import React, { useState, useRef, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import NewsDetailActionBar from "../components/NewsDetailActionBar"
import {
  useGetPostByIdQuery,
  useGetPostBySlugQuery,
  useGetSharedPostQuery,
  useReactToPostMutation,
  useSharePostMutation,
} from "@/store/api/social/postsApi"
import { useLanguage } from "@/shared/context/LanguageContext"
import { Breadcrumb } from "@/shared/components/ui/navigation"
import PostContent from "../components/PostContent"
import CommentsSection from "../components/CommentsSection"
import Carousel from "@/shared/components/ui/Carousel"
import ShareModal from "../components/ShareModal"
import RelatedNewsSection from "../components/RelatedNewsSection"
import { getTranslatedTimeAgo } from "@/features/news/utils/newsUtils"
import { getImageUrl } from "@/shared/utils/imageUtils"

const NewsDetailPage = () => {
  const { lang: paramLang, slug } = useParams()
  const navigate = useNavigate()
  const { t, language } = useLanguage()
  const lang = paramLang || language || "vi"
  const commentsRef = useRef(null)

  const [trySharedFallback, setTrySharedFallback] = useState(false)

  const isNumeric = !isNaN(Number(slug))
  const isSharedTokenInitially =
    !isNumeric && /^[a-zA-Z0-9]{8,}$/.test(slug) && /[A-Z]/.test(slug)
  const isSharedToken = isSharedTokenInitially || trySharedFallback
  const isSlug = !isNumeric && !isSharedToken

  const {
    data: slugData,
    isLoading: slugLoading,
    error: slugError,
  } = useGetPostBySlugQuery(slug, { skip: !isSlug })

  const {
    data: normalData,
    isLoading: normalLoading,
    error: normalError,
  } = useGetPostByIdQuery(slug, { skip: !isNumeric })

  const {
    data: sharedData,
    isLoading: sharedLoading,
    error: sharedError,
  } = useGetSharedPostQuery(slug, { skip: !isSharedToken })

  useEffect(() => {
    if (
      slugError &&
      !isNumeric &&
      !isSharedTokenInitially &&
      !trySharedFallback
    ) {
      if (/^[a-zA-Z0-9]{8,}$/.test(slug)) {
        const timer = setTimeout(() => {
          setTrySharedFallback(true)
        }, 0)
        return () => clearTimeout(timer)
      }
    }
  }, [slugError, slug, isNumeric, isSharedTokenInitially, trySharedFallback])

  const data = isSharedToken ? sharedData : isNumeric ? normalData : slugData
  const isLoading = isSharedToken
    ? sharedLoading
    : isNumeric
      ? normalLoading
      : slugLoading
  const error = isSharedToken
    ? sharedError
    : isNumeric
      ? normalError
      : slugError
  const [reactToPost] = useReactToPostMutation()
  const [sharePost] = useSharePostMutation()
  const newsItem = data?.data
  const [isShareModalOpen, setIsShareModalOpen] = useState(false)
  const [shareUrl, setShareUrl] = useState("")

  const handleReact = (type) => {
    if (!newsItem?.postId) return
    reactToPost({ postId: newsItem.postId, type })
  }

  const handleShare = async () => {
    if (!newsItem?.postId) return
    try {
      const result = await sharePost(newsItem.postId).unwrap()
      let url =
        (typeof result === "string" ? result : result?.shareLink) ||
        window.location.href

      if (url && !url.startsWith("http")) {
        url = url.startsWith("/") ? url : `/${url}`
        url = `${window.location.origin}${url}`
      }

      if (url) {
        setShareUrl(url)
        setIsShareModalOpen(true)
      }
    } catch (e) {
      console.error("Share failed", e)
    }
  }

  if (isLoading) {
    return <div className="min-h-[50vh]" />
  }

  if (error || !newsItem || newsItem.privacy !== "Public") {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center">
        <h5 className="mb-4 text-2xl font-bold">{t.news?.error?.notFound}</h5>
        <button
          onClick={() => navigate(`/${lang}/cat-speak/news`)}
          className="rounded-full border border-cath-red-700 px-6 py-2 text-sm font-medium text-cath-red-700 transition-colors hover:bg-cath-red-50"
        >
          {t.news?.error?.backToNews}
        </button>
      </div>
    )
  }

  const breadcrumbItems = [
    { label: "Trang chủ", onClick: () => navigate(`/${lang}/community`) },
    {
      label: "Cat Speak",
      onClick: () => navigate(`/${lang}/cat-speak/news`),
    },
    {
      label: "Bản tin CatSpeak",
      onClick: () => navigate(`/${lang}/cat-speak/news`),
    },
    { label: newsItem.title },
  ]

  return (
    <div className="w-full px-3 md:px-4">
      {/* ── Two-column layout ─────────────────────────────────── */}
      <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(300px,1fr)] xl:gap-5">
        {/* ── Left Column: Article Content ─────────────────────── */}
        <div className="flex min-w-0 flex-col gap-4">
          {/* ── Breadcrumb ─────────────────────────────────────── */}
          <Breadcrumb items={breadcrumbItems} className="w-full" />

          {/* ── Title + Meta ───────────────────────────────────── */}
          <div className="flex flex-col gap-3 md:gap-4">
            <div className="flex flex-col">
              <h1
                className="font-nunito text-[24px] font-semibold leading-[1.35] text-black md:text-[32px] line-clamp-2"
                title={newsItem.title}
              >
                {newsItem.title}
              </h1>
              <div className="flex items-center gap-1 shrink-0">
                {newsItem.viewCount !== undefined && (
                  <span className="font-nunito font-medium text-sm text-[#7b7979]">
                    {newsItem.viewCount} lượt xem
                  </span>
                )}
                <span className="font-nunito font-medium text-sm text-[#7b7979]">
                  {" "}
                  •{" "}
                </span>
                <span className="font-nunito font-medium text-sm text-[#7b7979]">
                  {getTranslatedTimeAgo(
                    newsItem.createDate,
                    t.news?.newsCard?.timeAgo,
                  )}
                </span>
              </div>
            </div>

            {/* ── Hero Image / Carousel ────────────────────────── */}
            {newsItem.media && newsItem.media.length > 0 && (
              <Carousel
                images={newsItem.media.map((item) => ({
                  url: getImageUrl(item.mediaUrl),
                  alt: newsItem.title,
                }))}
                className="rounded-2xl bg-black/5"
                objectFit="contain"
              />
            )}
          </div>

          {/* ── Article Body ───────────────────────────────────── */}
          <article className="bg-white py-4 md:py-5">
            <PostContent html={newsItem.content} />

            {/* Action Bar */}
            <NewsDetailActionBar
              newsItem={newsItem}
              handleReact={handleReact}
              handleShare={handleShare}
              onCommentClick={() =>
                commentsRef.current?.scrollIntoView({ behavior: "smooth" })
              }
            />
          </article>
        </div>

        {/* ── Right Column: Comments Sidebar (desktop) / Below (mobile) */}
        <div className="w-full h-full min-w-0">
          <div className="lg:sticky lg:top-[76px]">
            <div className="rounded-2xl bg-white p-3 shadow-[0_1px_4px_rgba(12,12,13,0.1),0_1px_2px_rgba(12,12,13,0.05)] md:p-4 lg:max-h-[calc(100vh-96px)] lg:overflow-y-auto">
              <CommentsSection
                ref={commentsRef}
                postId={newsItem.postId}
                totalComments={newsItem.totalComments || 0}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ── Related News (full width) ───────────────────────────── */}
      <RelatedNewsSection currentPostId={newsItem.postId} />

      {/* ── Share Modal ──────────────────────────────────────────── */}
      <ShareModal
        open={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        shareUrl={shareUrl}
      />
    </div>
  )
}

export default NewsDetailPage
