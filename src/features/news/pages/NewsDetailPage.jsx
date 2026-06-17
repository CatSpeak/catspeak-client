import React, { useState, useRef } from "react"
import { useParams, useNavigate } from "react-router-dom"
import NewsDetailActionBar from "../components/NewsDetailActionBar"
import {
  useGetPostByIdQuery,
  useGetSharedPostQuery,
  useReactToPostMutation,
  useSharePostMutation,
} from "@/store/api/postsApi"
import { useLanguage } from "@/shared/context/LanguageContext"
import PostContent from "../components/PostContent"
import CommentsSection from "../components/CommentsSection"

import Carousel from "@/shared/components/ui/Carousel"
import BackButton from "@/shared/components/ui/buttons/BackButton"
import ShareModal from "../components/ShareModal"
import {
  getTranslatedTimeAgo,
  formatExactDate,
} from "@/features/news/utils/newsUtils"

import { getImageUrl } from "@/shared/utils/imageUtils"

const NewsDetailPage = () => {
  const { id, lang } = useParams()
  const navigate = useNavigate()
  const { t, language } = useLanguage()
  const commentsRef = useRef(null)

  const isSharedToken = isNaN(Number(id))
  
  const { data: normalData, isLoading: normalLoading, error: normalError } = useGetPostByIdQuery(id, { skip: isSharedToken })
  const { data: sharedData, isLoading: sharedLoading, error: sharedError } = useGetSharedPostQuery(id, { skip: !isSharedToken })
  
  const data = isSharedToken ? sharedData : normalData
  const isLoading = isSharedToken ? sharedLoading : normalLoading
  const error = isSharedToken ? sharedError : normalError
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
    return <div className="min-h-[50vh]"></div>
  }

  if (error || !newsItem || newsItem.privacy !== "Public") {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center">
        <h5 className="mb-4 text-2xl font-bold">{t.news?.error?.notFound}</h5>
        <BackButton onClick={() => navigate(`/${lang}/cat-speak/news`)}>
          {t.news?.error?.backToNews}
        </BackButton>
      </div>
    )
  }

  return (
    <div className="w-full">
      {/* Back Button */}
      <BackButton to={`/${lang}/cat-speak/news`}>
        {t.news?.newsDetail?.back}
      </BackButton>

      {/* Title */}
      <h1 className="text-2xl mt-4 mb-2 font-semibold">{newsItem.title}</h1>
      <div className="flex items-center gap-1.5 text-sm text-[#606060] mb-4">
        {newsItem.viewCount !== undefined && (
          <>
            <span title={t.news?.newsDetail?.views || "views"}>
              {newsItem.viewCount} {t.news?.newsDetail?.views || "views"}
            </span>
            <span>·</span>
          </>
        )}
        <span>
          {getTranslatedTimeAgo(newsItem.createDate, t.news?.newsCard?.timeAgo)}
        </span>
        {newsItem.lastEdited && newsItem.lastEdited !== newsItem.createDate && (
          <>
            <span>·</span>
            <span>
              {t.news?.newsDetail?.edited}{" "}
              {getTranslatedTimeAgo(
                newsItem.lastEdited,
                t.news?.newsCard?.timeAgo,
              )}
            </span>
          </>
        )}
      </div>

      {/* Hero Image / Carousel */}
      {newsItem.media && newsItem.media.length > 0 && (
        <Carousel
          images={newsItem.media.map((item) => ({
            url: getImageUrl(item.mediaUrl),
            alt: newsItem.title,
          }))}
          className="rounded-2xl mb-3 max-h-[60vh] bg-black/5"
          objectFit="contain"
        />
      )}

      <article className="bg-white">
        {/* Interaction Buttons */}
        <NewsDetailActionBar
          newsItem={newsItem}
          handleReact={handleReact}
          handleShare={handleShare}
          onCommentClick={() =>
            commentsRef.current?.scrollIntoView({ behavior: "smooth" })
          }
        />

        {/* Body */}
        <div className="space-y-6 text-gray-700 leading-relaxed my-4 text-base">
          <PostContent html={newsItem.content} />
        </div>

        <CommentsSection
          ref={commentsRef}
          postId={newsItem.postId}
          totalComments={newsItem.totalComments || 0}
        />
      </article>

      {/* Share Modal */}
      <ShareModal
        open={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        shareUrl={shareUrl}
      />
    </div>
  )
}

export default NewsDetailPage
