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
import Avatar from "@/shared/components/ui/Avatar"
import { formatDaysAgo, formatExactDate } from "@/features/news/utils/newsUtils"

import { getImageUrl } from "@/shared/utils/imageUtils"

const NewsDetailPage = () => {
  const { id, lang } = useParams()
  const navigate = useNavigate()
  const { t } = useLanguage()

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

  const avatarSrc = getImageUrl(newsItem.avatarUrl)

  return (
    <div className="w-full">
      {/* Back Button */}
      <BackButton to={`/${lang}/cat-speak/news`}>
        {t.news?.newsDetail?.back}
      </BackButton>

      {/* Author */}
      <div className="flex items-center gap-3 mt-3 mb-3">
        <Avatar
          size={40}
          src={avatarSrc}
          name={newsItem.authorName}
          alt={newsItem.authorName}
        />
        <div className="flex flex-col">
          <span className="text-base font-semibold">{newsItem.authorName}</span>
          <div className="flex flex-wrap items-center gap-1 text-sm text-[#7A7574]">
            {/* <span>{formatExactDate(newsItem.createDate)}</span>
            <span>·</span> */}
            <span>{formatDaysAgo(newsItem.createDate)}</span>
            {/* {newsItem.lastEdited && (
              <>
                <span>·</span>
                <span>Edited {formatExactDate(newsItem.lastEdited)}</span>
              </>
            )} */}
          </div>
        </div>
      </div>

      {/* Title */}
      <h1 className="mb-3">{newsItem.title}</h1>

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
        <div className="text-sm text-[#606060] mb-3">
          {newsItem.totalReactions} {t.news?.newsDetail?.reactions}
        </div>

        {/* Interaction Buttons */}
        <div className="flex flex-wrap items-center gap-2 pb-4 border-b border-[#e5e5e5]">
          <button
            onClick={() => handleReact("Like")}
            className={`flex items-center gap-2 h-10 px-3 rounded-lg text-sm transition-colors ${
              newsItem.currentUserReaction === "Like"
                ? "bg-blue-600 text-white font-medium hover:bg-blue-700"
                : "bg-[#F2F2F2] text-[#606060] hover:bg-[#E5E5E5]"
            }`}
          >
            <ThumbsUp
              className={`${newsItem.currentUserReaction === "Like" ? "fill-white" : ""}`}
            />
            {t.news?.newsDetail?.like}
          </button>
          <button
            onClick={() => handleReact("Love")}
            className={`flex items-center gap-2 h-10 px-3 rounded-lg text-sm transition-colors ${
              newsItem.currentUserReaction === "Love"
                ? "bg-red-500 text-white font-medium hover:bg-red-600"
                : "bg-[#F2F2F2] text-[#606060] hover:bg-[#E5E5E5]"
            }`}
          >
            <Heart
              className={`${newsItem.currentUserReaction === "Love" ? "fill-white" : ""}`}
            />
            {t.news?.newsDetail?.love}
          </button>
          <button
            onClick={() => handleReact("Haha")}
            className={`flex items-center gap-2 h-10 px-3 rounded-lg text-sm transition-colors ${
              newsItem.currentUserReaction === "Haha"
                ? "bg-yellow-500 text-white font-medium hover:bg-yellow-600"
                : "bg-[#F2F2F2] text-[#606060] hover:bg-[#E5E5E5]"
            }`}
          >
            <Smile
              className={`${newsItem.currentUserReaction === "Haha" ? "fill-white text-yellow-500" : ""}`}
            />
            {t.news?.newsDetail?.haha}
          </button>
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
