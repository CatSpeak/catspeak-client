import React, { useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { ThumbsUp, Heart, Smile } from "lucide-react"
import {
  useGetPostByIdQuery,
  useReactToPostMutation,
} from "@/store/api/postsApi"
import { useLanguage } from "@/shared/context/LanguageContext"
import PostContent from "../components/PostContent"

import Carousel from "@/shared/components/ui/Carousel"
import BackButton from "@/shared/components/ui/buttons/BackButton"
import {
  getTranslatedTimeAgo,
  formatExactDate,
} from "@/features/news/utils/newsUtils"

import { getImageUrl } from "@/shared/utils/imageUtils"

const NewsDetailPage = () => {
  const { id, lang } = useParams()
  const navigate = useNavigate()
  const { t, language } = useLanguage()

  const { data, isLoading, error } = useGetPostByIdQuery(id)
  const [reactToPost] = useReactToPostMutation()
  const newsItem = data?.data

  const handleReact = (type) => {
    if (!newsItem?.postId) return
    reactToPost({ postId: newsItem.postId, type })
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
              {formatExactDate(newsItem.lastEdited, language)}
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
              className={`flex items-center gap-2 h-12 px-4 transition-colors font-medium ${
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
          </div>
        </div>

        {/* Body */}
        <div className="space-y-6 text-gray-700 leading-relaxed my-4 text-base">
          <PostContent html={newsItem.content} />
        </div>
      </article>
    </div>
  )
}

export default NewsDetailPage
