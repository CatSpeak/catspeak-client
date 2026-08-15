import { useRef, useMemo } from "react"
import { useNavigate, useParams } from "react-router-dom"
import {
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  Newspaper,
} from "lucide-react"
import { useLanguage } from "@/shared/context/LanguageContext"
import { useGetPostsQuery } from "@/store/api/social/postsApi"
import { getImageUrl } from "@/shared/utils/imageUtils"
import { getCommunityName } from "@/features/news/utils/newsUtils"

const isPostNew = (createDate) => {
  if (!createDate) return false
  const postDate = new Date(createDate)
  const now = new Date()
  const diffDays = (now.getTime() - postDate.getTime()) / (1000 * 60 * 60 * 24)
  return diffDays >= 0 && diffDays <= 7
}

const formatNewsDate = (dateString, currentLang = "vi") => {
  if (!dateString) return ""
  const d = new Date(dateString)
  if (isNaN(d.getTime())) return dateString
  try {
    return new Intl.DateTimeFormat(
      currentLang === "vi" ? "vi-VN" : currentLang === "zh" ? "zh-CN" : "en-US",
      {
        day: "numeric",
        month: "long",
        year: "numeric",
      },
    ).format(d)
  } catch {
    return d.toLocaleDateString()
  }
}

const NewsSection = () => {
  const scrollRef = useRef(null)
  const navigate = useNavigate()
  const { lang } = useParams()
  const { language } = useLanguage()

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
      const scrollAmount = direction === "left" ? -350 : 350
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
              Theo dòng sự kiện
            </p>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900">
              Bản tin <span className="text-[#910B09]">Cat Speak</span>
            </h2>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={handleViewAll}
              className="bg-[#910B09] hover:bg-[#7a0907] text-white font-semibold text-sm px-6 py-2.5 rounded-full transition-colors flex items-center gap-2 shadow-sm cursor-pointer"
            >
              <span>Xem chi tiết</span>
              <ArrowRight size={16} />
            </button>

            <div className="flex gap-2">
              <button
                onClick={() => handleScroll("left")}
                className="w-10 h-10 rounded-full border border-[#910B09] text-[#910B09] hover:bg-[#910B09] hover:text-white transition-all flex items-center justify-center cursor-pointer"
                aria-label="Previous news"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                onClick={() => handleScroll("right")}
                className="w-10 h-10 rounded-full border border-[#910B09] text-[#910B09] hover:bg-[#910B09] hover:text-white transition-all flex items-center justify-center cursor-pointer"
                aria-label="Next news"
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
            className="flex gap-4 overflow-x-auto scrollbar-none scroll-smooth py-4 px-1"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {[1, 2, 3, 4].map((index) => (
              <div
                key={index}
                className="flex-shrink-0 w-[300px] sm:w-[360px] bg-white border border-border rounded-xl overflow-hidden shadow-sm flex flex-col animate-pulse"
              >
                <div className="w-full h-[200px] sm:h-[220px] bg-gray-200" />
                <div className="p-6 flex flex-col flex-1 justify-between gap-4">
                  <div className="h-4 w-28 bg-gray-200 rounded" />
                  <div className="space-y-2">
                    <div className="h-5 w-full bg-gray-200 rounded" />
                    <div className="h-5 w-3/4 bg-gray-200 rounded" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : publicPosts.length === 0 ? (
          /* Empty State */
          <div className="flex flex-col items-center justify-center py-16 text-center text-gray-500">
            <Newspaper size={48} className="text-gray-300 mb-3" />
            <p className="font-medium text-gray-600">
              Chưa có bài viết tin tức nào
            </p>
          </div>
        ) : (
          /* News Cards Carousel Container */
          <div
            ref={scrollRef}
            className="flex gap-4 overflow-x-auto scrollbar-none scroll-smooth py-4 px-1"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {publicPosts.map((item) => {
              const id = item.postId || item.id
              const firstMediaUrl =
                item.media && item.media.length > 0
                  ? getImageUrl(item.media[0].mediaUrl)
                  : null
              const isNew = isPostNew(item.createDate)

              return (
                <div
                  key={id}
                  onClick={() => handleCardClick(item)}
                  className="flex-shrink-0 w-[300px] sm:w-[360px] bg-white border border-border rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col group cursor-pointer"
                >
                  {/* Card Thumbnail Container */}
                  <div className="relative w-full h-[200px] sm:h-[220px] bg-gradient-to-br from-red-900 via-rose-900 to-stone-900 p-4 flex flex-col justify-between overflow-hidden">
                    {firstMediaUrl ? (
                      <>
                        <div
                          className="absolute inset-0 z-0 bg-cover bg-center blur-md scale-110 opacity-50"
                          style={{ backgroundImage: `url(${firstMediaUrl})` }}
                        />
                        <img
                          src={firstMediaUrl}
                          alt={item.title}
                          className="relative z-10 w-full h-full object-cover rounded-xl group-hover:scale-105 transition-transform duration-300"
                          loading="lazy"
                        />
                      </>
                    ) : (
                      <>
                        {/* Visual pattern decoration */}
                        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:12px_12px]" />

                        {/* News Image Graphic Placeholder */}
                        <div className="relative z-10 my-auto flex items-center justify-center text-white/40 group-hover:scale-105 transition-transform duration-300">
                          <Newspaper size={64} className="text-white/60" />
                        </div>
                      </>
                    )}

                    {/* Yellow "New" badge */}
                    {isNew && (
                      <span className="absolute top-4 left-4 z-20 bg-amber-400 text-slate-900 font-bold text-xs px-3 py-1 rounded-md shadow-md">
                        New
                      </span>
                    )}
                  </div>

                  {/* Card Body */}
                  <div className="p-6 flex flex-col flex-1 justify-between gap-4">
                    {/* Date */}
                    <div className="flex items-center text-xs text-gray-500 font-medium">
                      <span>{formatNewsDate(item.createDate, language)}</span>
                    </div>

                    {/* Title */}
                    <h3 className="font-bold text-gray-900 text-base sm:text-lg leading-snug group-hover:text-[#910B09] transition-colors line-clamp-2">
                      {item.title}
                    </h3>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </section>
  )
}

export default NewsSection
