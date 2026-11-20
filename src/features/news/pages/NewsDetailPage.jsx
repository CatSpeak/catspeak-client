import React, { useState, useRef, useEffect } from "react"
import { useParams, useNavigate, Link } from "react-router-dom"
import NewsDetailActionBar from "../components/NewsDetailActionBar"
import {
  useGetPostByIdQuery,
  useGetPostBySlugQuery,
  useGetSharedPostQuery,
  useGetPostReactionsQuery,
} from "@/store/api/social/postsApi"
import useSharePost from "@/shared/hooks/useSharePost"
import usePostReaction from "@/shared/hooks/usePostReaction"
import { useLanguage } from "@/shared/context/LanguageContext"
import { getShareUrlWithVersion } from "@/shared/utils/shareUtils"
import PostContent from "../components/PostContent"
import CommentsSection from "../components/CommentsSection"
import NewsArticleHeader from "../components/NewsArticleHeader"
import ShareModal from "../components/ShareModal"
import RelatedNewsSection from "../components/RelatedNewsSection"
import NewsDetailSkeleton from "../components/NewsDetailSkeleton"
import { getImageUrl } from "@/shared/utils/imageUtils"
import LoadingSpinner from "@/shared/components/ui/indicators/LoadingSpinner"
import { useAuthModal } from "@/shared/context/AuthModalContext"
import { useAuth } from "@/features/auth"
import FilePreviewModal from "@/shared/components/ui/FilePreviewModal"
import FileAttachmentItem from "@/shared/components/ui/FileAttachmentItem"
import IconButton from "@/shared/components/ui/buttons/IconButton"
import { ArrowLeft, Download } from "lucide-react"

const NewsDetailPage = () => {
  const { lang: paramLang, slug } = useParams()
  const { isAuthenticated } = useAuth()
  const { openAuthModal } = useAuthModal()

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
    refetch: refetchSlug,
  } = useGetPostBySlugQuery(slug, { skip: !isSlug })

  const {
    data: normalData,
    isLoading: normalLoading,
    error: normalError,
    refetch: refetchNormal,
  } = useGetPostByIdQuery(slug, { skip: !isNumeric })

  const {
    data: sharedData,
    isLoading: sharedLoading,
    error: sharedError,
    refetch: refetchShared,
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
  const newsItem = data?.data ?? data ?? null
  const postId = newsItem?.postId
  const { data: postReactions } = useGetPostReactionsQuery(postId, {
    skip: !postId,
  })
  const { handleReact } = usePostReaction(newsItem)

  const [previewDoc, setPreviewDoc] = useState(null)
  const {
    shareUrl,
    isShareModalOpen,
    setIsShareModalOpen,
    handleShare: triggerShare,
  } = useSharePost()

  const handleShare = (e) => {
    triggerShare(e, {
      ...newsItem,
      url: window.location.href,
    })
  }

  if (isLoading) {
    return <NewsDetailSkeleton />
  }

  const isGlobalNews = Number(newsItem?.postType) === 2

  if (error || !newsItem || newsItem.privacy !== "Public") {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center bg-primaryBg px-4">
        <h5 className="mb-4 text-2xl font-bold">{t.news?.error?.notFound}</h5>
        <button
          onClick={() =>
            navigate(
              `/${lang}/cat-speak/${isGlobalNews ? "global-news" : "news"}`,
            )
          }
          className="rounded-full border border-cath-red-700 dark:border-red-400 px-6 py-2 text-sm font-medium text-cath-red-700 dark:text-red-400 transition-colors hover:bg-cath-red-50 dark:hover:bg-red-950/30"
        >
          {t.news?.error?.backToNews}
        </button>
      </div>
    )
  }

  const backPath = `/${lang}/cat-speak/${isGlobalNews ? "global-news" : "news"}`

  const videoMedia = (newsItem.media || []).filter(
    (item) => item.mediaType === "Video",
  )
  const documentMedia = (newsItem.media || []).filter(
    (item) => item.mediaType !== "Image" && item.mediaType !== "Video",
  )
  const labels = t.news?.newsDetail

  return (
    <div className="min-h-screen w-full bg-primaryBg">
      <div className="mx-auto w-full max-w-7xl p-4">
        {/* ── Back Navigation Link ── */}
        <div className="mb-2 relative z-10">
          <Link
            to={backPath}
            className="group relative z-10 inline-flex items-center gap-2 min-h-[48px] min-w-[48px] -my-3 py-3 text-sm text-gray-500 transition-colors hover:text-gray-900 dark:text-[#AAAAAA] dark:hover:text-white focus:outline-none touch-manipulation cursor-pointer"
            aria-label={labels?.back || "Back"}
          >
            <ArrowLeft className="h-5 w-5 transition-transform duration-200 ease-out group-hover:-translate-x-1 motion-reduce:transform-none" />
            <span>
              {isGlobalNews
                ? t.news?.globalNews || "Bản tin thế giới"
                : t.news?.catSpeakNews || "Bản tin CatSpeak"}
            </span>
          </Link>
        </div>

        {/* ── Main Layout: Article (Left) & Related News (Right) ── */}
        <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-[minmax(0,1fr)_360px]">
          {/* ── Left Column: Main Article & Comments ── */}
          <div className="min-w-0">
            <article aria-labelledby="news-article-title" className="min-w-0">
              <NewsArticleHeader key={postId || slug} newsItem={newsItem} />

              <div className="pt-4">
                {videoMedia.map((item) => (
                  <video
                    key={item.postMediaId || item.mediaUrl}
                    controls
                    preload="metadata"
                    className="mb-5 max-h-[560px] w-full rounded-2xl bg-black"
                    aria-label={newsItem.title}
                  >
                    <source src={getImageUrl(item.mediaUrl)} />
                  </video>
                ))}

                <PostContent
                  html={newsItem.content}
                  contentUrl={newsItem.contentUrl || newsItem.ContentUrl}
                  className="[&>div:first-child>:first-child]:!mt-0 [&_img]:!rounded-none [&_img]:!shadow-none [&_figure]:max-w-full [&_iframe]:max-w-full [&_video]:max-w-full [&_table]:block [&_table]:max-w-full [&_table]:overflow-x-auto"
                />

                {documentMedia.length > 0 && (
                  <section className="mt-6 flex flex-col gap-3 border-t border-border dark:border-[#3F3F3F] pt-4">
                    <h2 className="text-sm font-semibold text-gray-700 dark:text-neutral-200">
                      {labels?.attachments || "Attachments"} (
                      {documentMedia.length})
                    </h2>
                    {documentMedia.map((doc) => (
                      <FileAttachmentItem
                        key={doc.postMediaId || doc.mediaUrl}
                        fileName={
                          doc.fileName || labels?.document || "Document"
                        }
                        fileSize={doc.fileSize}
                        onClick={() => setPreviewDoc(doc)}
                        className="cursor-pointer transition-colors hover:bg-gray-50 dark:hover:bg-[#272727]"
                        rightAction={
                          <IconButton
                            as="a"
                            href={getImageUrl(doc.mediaUrl)}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            variant="ghost"
                            size="sm"
                            className="shrink-0"
                            title={labels?.download || "Download"}
                          >
                            <Download size={20} />
                          </IconButton>
                        }
                      />
                    ))}
                  </section>
                )}

                <div className="mt-4">
                  <NewsDetailActionBar
                    newsItem={newsItem}
                    reactions={postReactions}
                    handleReact={handleReact}
                    handleShare={handleShare}
                    onCommentClick={() =>
                      commentsRef.current?.scrollIntoView({
                        behavior: "smooth",
                        block: "start",
                      })
                    }
                  />
                </div>
              </div>
            </article>

            <div className="flow-root">
              <section
                ref={commentsRef}
                aria-label={labels?.comment || "Comments"}
                className="scroll-mt-24 pt-4"
              >
                <CommentsSection
                  key={postId}
                  postId={newsItem.postId || newsItem.id}
                  totalComments={
                    newsItem.totalComments ?? newsItem.commentCount ?? 0
                  }
                />
              </section>
            </div>
          </div>

          {/* ── Right Column: Related News (Sticky Sidebar) ── */}
          <aside className="min-w-0 lg:sticky lg:top-20 lg:self-start">
            <RelatedNewsSection
              currentPostId={newsItem.postId || newsItem.id}
              postType={isGlobalNews ? "2" : "1"}
            />
          </aside>
        </div>
      </div>

      {/* ── Share Modal ──────────────────────────────────────────── */}
      <ShareModal
        open={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        shareUrl={shareUrl}
      />

      {/* ── Document Preview Modal ──────────────────────────────── */}
      {previewDoc && (
        <FilePreviewModal
          open={Boolean(previewDoc)}
          onClose={() => setPreviewDoc(null)}
          item={previewDoc}
          recordMaterialView={false}
        />
      )}
    </div>
  )
}

export default NewsDetailPage
