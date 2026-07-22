import React from "react"
import { useNavigate, useParams } from "react-router-dom"
import { useLanguage } from "@/shared/context/LanguageContext"
import { ArrowRight } from "lucide-react"
import { useGetPostsQuery } from "@/store/api/social/postsApi"
import NewsCard from "./NewsCard"
import PillButton from "@/shared/components/ui/buttons/PillButton"

const RELATED_COUNT = 4

/**
 * RelatedNewsSection — matches Figma node 5032:15676.
 *
 * Full-width section placed outside the two-column layout.
 * Header: title (28px Bold) + "Xem tất cả" pill button.
 * Cards: grid with gap-3, reuses the shared NewsCard component.
 */
const RelatedNewsSection = ({ currentPostId }) => {
  const navigate = useNavigate()
  const { lang } = useParams()
  const { t } = useLanguage()
  const newsDetail = t.news?.newsDetail

  const { data } = useGetPostsQuery({ page: 1, pageSize: 20 })

  const relatedPosts = (data?.data || [])
    .filter(
      (post) => post.postId !== currentPostId && post.privacy === "Public",
    )
    .slice(0, RELATED_COUNT)

  return (
    <section className="w-full pb-4 sm:pb-6">
      {/* ── Header ──────────────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-5">
        <h2 className="font-nunito font-bold text-[28px] leading-[1.4] text-black">
          {newsDetail?.relatedNews || "Bản tin liên quan"}
        </h2>
        {relatedPosts.length > 0 && (
          <PillButton
            variant="outline"
            onClick={() => navigate(`/${lang}/cat-speak/news`)}
            endIcon={<ArrowRight size={12} />}
          >
            {newsDetail?.viewAll || "Xem tất cả"}
          </PillButton>
        )}
      </div>

      {/* ── Cards row or empty state ────────────────────────────── */}
      {relatedPosts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 items-start">
          {relatedPosts.map((post) => (
            <NewsCard key={post.postId} news={post} />
          ))}
        </div>
      ) : (
        <p className="font-nunito text-base text-[#7b7979] leading-[1.4]">
          {newsDetail?.noRelatedNews || "Không có bản tin liên quan."}
        </p>
      )}
    </section>
  )
}

export default RelatedNewsSection
