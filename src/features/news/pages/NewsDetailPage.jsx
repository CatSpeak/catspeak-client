import React, { useState, useRef } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { ThumbsUp, Heart, Smile, Share2, MessageCircle } from "lucide-react"
import {
  useGetPostByIdQuery,
  useReactToPostMutation,
  useSharePostMutation,
} from "@/store/api/postsApi"
import { useLanguage } from "@/shared/context/LanguageContext"
import PostContent from "../components/PostContent"
import CommentsSection from "../components/CommentsSection"

import Carousel from "@/shared/components/ui/Carousel"
import BackButton from "@/shared/components/ui/buttons/BackButton"
import Modal from "@/shared/components/ui/Modal"
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

  const { data, isLoading, error } = useGetPostByIdQuery(id)
  const [reactToPost] = useReactToPostMutation()
  const [sharePost] = useSharePostMutation()
  const newsItem = data?.data
  const [isShareModalOpen, setIsShareModalOpen] = useState(false)

  const handleReact = (type) => {
    if (!newsItem?.postId) return
    reactToPost({ postId: newsItem.postId, type })
  }

  const handleShare = async () => {
    if (!newsItem?.postId) return
    try {
      const result = await sharePost(newsItem.postId).unwrap()
      const url = typeof result === "string" ? result : result?.url
      if (url) {
        await navigator.clipboard.writeText(url)
        setIsShareModalOpen(true)
        setTimeout(() => setIsShareModalOpen(false), 3000)
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
      <div className="flex items-center gap-1 text-sm text-[#606060] mb-4">
        <span>{getTranslatedTimeAgo(newsItem.createDate, t.news?.newsCard?.timeAgo)}</span>
        {newsItem.lastEdited && newsItem.lastEdited !== newsItem.createDate && (
          <>
            <span>·</span>
            <span>
              {t.news?.newsDetail?.edited}{" "}
              {getTranslatedTimeAgo(newsItem.lastEdited, t.news?.newsCard?.timeAgo)}
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
          className="rounded-xl mb-3 max-h-[60vh] bg-black/5"
          objectFit="contain"
        />
      )}

      <article className="overflow-hidden bg-white">
        {/* Interaction Stats */}
        <div className="text-[#606060] mb-3">
          {newsItem.totalReactions} {t.news?.newsDetail?.reactions}
        </div>

        {/* Interaction Buttons */}
        <div className="pb-4 border-b border-[#e5e5e5]">
          <div className="inline-flex items-center border border-[#e5e5e5] rounded-full overflow-hidden">
            <button
              onClick={() => handleReact("Like")}
              className={`flex items-center gap-2 h-12 px-4 transition-colors font-medium border-r border-[#e5e5e5] ${
                newsItem.currentUserReaction === "Like"
                  ? "bg-blue-50 text-blue-600"
                  : "bg-white text-[#606060] hover:bg-[#f2f2f2]"
              }`}
            >
              <ThumbsUp
                className={
                  newsItem.currentUserReaction === "Like"
                    ? "text-blue-700 fill-blue-400"
                    : ""
                }
              />
              {t.news?.newsDetail?.like}
            </button>
            <button
              onClick={() => handleReact("Love")}
              className={`flex items-center gap-2 h-12 px-4 transition-colors font-medium border-r border-[#e5e5e5] ${
                newsItem.currentUserReaction === "Love"
                  ? "bg-red-50 text-red-600"
                  : "bg-white text-[#606060] hover:bg-[#f2f2f2]"
              }`}
            >
              <Heart
                className={
                  newsItem.currentUserReaction === "Love"
                    ? "text-red-700 fill-red-400"
                    : ""
                }
              />
              {t.news?.newsDetail?.love}
            </button>
            <button
              onClick={() => handleReact("Haha")}
              className={`flex items-center gap-2 h-12 px-4 transition-colors font-medium border-r border-[#e5e5e5] ${
                newsItem.currentUserReaction === "Haha"
                  ? "bg-yellow-50 text-yellow-600"
                  : "bg-white text-[#606060] hover:bg-[#f2f2f2]"
              }`}
            >
              <Smile
                className={
                  newsItem.currentUserReaction === "Haha"
                    ? "text-yellow-700 fill-yellow-400"
                    : ""
                }
              />
              {t.news?.newsDetail?.haha}
            </button>
            <button
              onClick={() => commentsRef.current?.scrollIntoView({ behavior: 'smooth' })}
              className="flex items-center gap-2 h-12 px-4 font-medium border-r border-[#e5e5e5] bg-white text-[#606060] transition-colors hover:bg-[#f2f2f2]"
            >
              <MessageCircle className="text-[#606060]" />
              {newsItem.totalComments || 0}
            </button>
            <button
              onClick={handleShare}
              className="flex items-center gap-2 h-12 px-4 transition-colors font-medium bg-white text-[#606060] hover:bg-[#f2f2f2]"
            >
              <Share2 className="text-[#606060]" />
              {t.news?.newsDetail?.share || "Share"}
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="space-y-6 text-gray-700 leading-relaxed my-4 text-base">
          <PostContent html={newsItem.content} />
        </div>

        {/* Comments Section */}
        <CommentsSection ref={commentsRef} postId={newsItem.postId} totalComments={newsItem.totalComments || 0} />
      </article>

      {/* Share Success Modal */}
      <Modal 
        open={isShareModalOpen} 
        onClose={() => setIsShareModalOpen(false)}
        title=""
        showCloseButton={false}
        className="max-w-sm rounded-xl p-6 text-center shadow-2xl"
      >
        <div className="flex flex-col items-center justify-center">
          <div className="bg-green-100 text-green-600 rounded-full p-3 mb-4">
            <ThumbsUp size={32} />
          </div>
          <h3 className="text-xl font-bold mb-2">Success</h3>
          <p className="text-gray-600">
            {t.news?.newsDetail?.linkCopied || "Link copied to clipboard!"}
          </p>
        </div>
      </Modal>
    </div>
  )
}

export default NewsDetailPage
