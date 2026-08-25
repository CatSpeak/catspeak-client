import { useMemo } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { ArrowRight, Newspaper } from "lucide-react"
import { useLanguage } from "@/shared/context/LanguageContext"
import { useGetLandingPostsQuery } from "@/store/api/social/postsApi"
import { PillButton } from "@/shared/components/ui/buttons"
import LandingNewsCard from "./LandingNewsCard"
import LandingNewsSkeletonCard from "./LandingNewsSkeletonCard"
import ScrollReveal, { ScrollItem } from "./ScrollReveal"

const NewsSection = () => {
  const navigate = useNavigate()
  const { lang } = useParams()
  const { t, language } = useLanguage()

  const savedLang = localStorage.getItem("communityLanguage")
  const navLang =
    lang || (savedLang && savedLang !== "vi" ? savedLang : language) || "zh"

  const { data, isLoading } = useGetLandingPostsQuery(12)

  const publicPosts = useMemo(() => {
    const rawList = Array.isArray(data?.data)
      ? data.data
      : Array.isArray(data)
        ? data
        : []

    return rawList.filter(
      (post) => !post.privacy || post.privacy === "Public",
    )
  }, [data])

  const displayPosts = useMemo(
    () => publicPosts.slice(0, 6),
    [publicPosts],
  )

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
    <section className="relative w-full py-12 sm:py-16 md:py-20 lg:py-24 bg-white overflow-hidden">
      {/* Background Translucent Watermark Text */}
      <div className="absolute top-12 left-0 right-0 pointer-events-none select-none overflow-hidden z-0 opacity-15 whitespace-nowrap">
        <span className="text-[120px] font-black text-rose-300 tracking-wider">
          News News News News News News News News
        </span>
      </div>

      <ScrollReveal stagger className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-6">
          <div>
            <ScrollItem>
              <p className="text-sm font-semibold text-gray-500 tracking-wide uppercase mb-1">
                {newsT.subtitle || "Theo dòng sự kiện"}
              </p>
            </ScrollItem>
            <ScrollItem>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900">
                {newsT.titlePrefix || "Bản tin"}{" "}
                <span className="text-[#910B09]">
                  {newsT.titleSuffix || "Cat Speak"}
                </span>
              </h2>
            </ScrollItem>
          </div>

          <ScrollItem>
            <PillButton
              variant="primary"
              onClick={handleViewAll}
              endIcon={<ArrowRight />}
              className="self-start sm:self-auto"
            >
              {newsT.viewAll || "Xem tất cả"}
            </PillButton>
          </ScrollItem>
        </div>

        {/* Loading State */}
        {isLoading ? (
          <ScrollItem>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {[1, 2, 3, 4, 5, 6].map((index) => (
                <LandingNewsSkeletonCard key={index} />
              ))}
            </div>
          </ScrollItem>
        ) : displayPosts.length === 0 ? (
          /* Empty State */
          <ScrollItem>
            <div className="flex flex-col items-center justify-center py-16 text-center text-gray-500">
              <Newspaper size={48} className="text-gray-300 mb-3" />
              <p className="font-medium text-gray-600">
                {newsT.emptyText || "Chưa có bài viết tin tức nào"}
              </p>
            </div>
          </ScrollItem>
        ) : (
          /* Fixed 2-Row News Grid - 6 Items */
          <ScrollItem>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {displayPosts.map((item) => (
                <LandingNewsCard
                  key={item.postId || item.id}
                  item={item}
                  onClick={() => handleCardClick(item)}
                />
              ))}
            </div>
          </ScrollItem>
        )}
      </ScrollReveal>
    </section>
  )
}

export default NewsSection
