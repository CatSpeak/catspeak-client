import React, { useRef, useMemo } from "react"
import { useNavigate, useParams } from "react-router-dom"
import {
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  Newspaper,
} from "lucide-react"
import { useLanguage } from "@/shared/context/LanguageContext"
import { useGetPostsQuery } from "@/store/api/social/postsApi"
import { getCommunityName } from "@/features/news/utils/newsUtils"
import LandingNewsCard from "./LandingNewsCard"
import LandingNewsSkeletonCard from "./LandingNewsSkeletonCard"

const NewsSection = () => {
  const scrollRef = useRef(null)
  const navigate = useNavigate()
  const { lang } = useParams()
  const { t, language } = useLanguage()

  const savedLang = localStorage.getItem("communityLanguage")
  const navLang =
    lang || (savedLang && savedLang !== "vi" ? savedLang : language) || "zh"

  const currentCommunity = useMemo(() => {
    return getCommunityName(
      lang || localStorage.getItem("communityLanguage") || language || "en",
    )
  }, [lang, language])

  const { data, isLoading } = useGetPostsQuery({
    page: 1,
    pageSize: 12,
    postType: "1",
  })

  const publicPosts = useMemo(() => {
    const rawList = Array.isArray(data?.data)
      ? data.data
      : Array.isArray(data)
        ? data
        : []
    const targetCommunity = currentCommunity.toLowerCase()

    return rawList.filter((post) => {
      if (post.privacy && post.privacy !== "Public") return false

      const postCommunity = (post.languageCommunity || "All").toLowerCase()
      return postCommunity === "all" || postCommunity === targetCommunity
    })
  }, [data, currentCommunity])

  const handleScroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = direction === "left" ? -380 : 380
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" })
    }
  }

  const handleViewAll = () => {
    navigate(`/${navLang}/cat-speak/news`)
  }

  const handleCardClick = (post) => {
    const targetId = post.slug || post.postId || post.id
    if (!targetId) return
    navigate(`/${navLang}/cat-speak/news/${targetId}`)
  }

  const newsT = t?.landing?.news || {}

  return (
    <section className="relative w-full py-16 lg:py-24 bg-white overflow-hidden">
      {/* Background Translucent Watermark Text */}
      <div className="absolute top-12 left-0 right-0 pointer-events-none select-none overflow-hidden z-0 opacity-15 whitespace-nowrap">
        <span className="text-[120px] font-black text-rose-300 tracking-wider">
          News News News News News News News News
        </span>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-8">
        {/* Header Bar */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
          <div>
            <p className="text-sm font-semibold text-gray-500 tracking-wide uppercase mb-1">
              {newsT.subtitle || "Theo dòng sự kiện"}
            </p>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900">
              {newsT.titlePrefix || "Bản tin"}{" "}
              <span className="text-[#910B09]">
                {newsT.titleSuffix || "Cat Speak"}
              </span>
            </h2>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={handleViewAll}
              className="bg-[#910B09] hover:bg-[#7a0907] text-white font-semibold text-sm px-6 py-2.5 rounded-full transition-colors flex items-center gap-2 shadow-sm cursor-pointer"
            >
              <span>{newsT.viewAll || "Xem chi tiết"}</span>
              <ArrowRight size={16} />
            </button>

            <div className="flex gap-2">
              <button
                onClick={() => handleScroll("left")}
                className="w-10 h-10 rounded-full border border-[#910B09] text-[#910B09] hover:bg-[#910B09] hover:text-white transition-all flex items-center justify-center cursor-pointer shadow-sm"
                aria-label={newsT.prevNews || "Previous news"}
              >
                <ChevronLeft size={20} />
              </button>
              <button
                onClick={() => handleScroll("right")}
                className="w-10 h-10 rounded-full border border-[#910B09] text-[#910B09] hover:bg-[#910B09] hover:text-white transition-all flex items-center justify-center cursor-pointer shadow-sm"
                aria-label={newsT.nextNews || "Next news"}
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        </div>

        {/* Loading State Skeleton Carousel */}
        {isLoading ? (
          <div
            ref={scrollRef}
            className="flex gap-4 sm:gap-6 overflow-x-auto scrollbar-none scroll-smooth py-4 px-1"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {[1, 2, 3, 4].map((index) => (
              <LandingNewsSkeletonCard key={index} />
            ))}
          </div>
        ) : publicPosts.length === 0 ? (
          /* Empty State */
          <div className="flex flex-col items-center justify-center py-16 text-center text-gray-500">
            <Newspaper size={48} className="text-gray-300 mb-3" />
            <p className="font-medium text-gray-600">
              {newsT.emptyText || "Chưa có bài viết tin tức nào"}
            </p>
          </div>
        ) : (
          /* News Cards Carousel Container */
          <div
            ref={scrollRef}
            className="flex gap-4 sm:gap-6 overflow-x-auto scrollbar-none scroll-smooth py-4 px-1"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {publicPosts.map((item) => (
              <LandingNewsCard
                key={item.postId || item.id}
                item={item}
                onClick={() => handleCardClick(item)}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

export default NewsSection
