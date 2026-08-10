import React, { useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import { useLanguage } from "@/shared/context/LanguageContext";
import { useGetPostsQuery } from "@/store/api/social/postsApi";
import { ArrowRight } from "lucide-react";
import RelatedNewsCard from "./RelatedNewsCard";
import { getCommunityName } from "../utils/newsUtils";

/**
 * RelatedNewsSection — Displays a clean, curated 4-item grid of related news articles.
 */
const RelatedNewsSection = ({ currentPostId, postType = "1" }) => {
  const { lang } = useParams();
  const { t, language } = useLanguage();
  const newsDetail = t.news?.newsDetail;
  const currentLang = lang || "vi";

  const currentCommunity = useMemo(() => {
    return getCommunityName(
      lang || localStorage.getItem("communityLanguage") || language || "en",
    );
  }, [lang, language]);

  const { data, isLoading } = useGetPostsQuery({
    page: 1,
    pageSize: 12,
    postType,
  });

  // Filter out current post, non-public posts, filter by community, limit to 4 posts
  const { displayPosts, hasMore } = useMemo(() => {
    const rawList = Array.isArray(data?.data)
      ? data.data
      : Array.isArray(data)
        ? data
        : [];
    const targetCommunity = currentCommunity.toLowerCase();

    const filtered = rawList.filter((post) => {
      const postId = post.postId || post.id;
      if (postId === currentPostId) return false;
      if (post.privacy && post.privacy !== "Public") return false;

      const postCommunity = (post.languageCommunity || "All").toLowerCase();
      return postCommunity === "all" || postCommunity === targetCommunity;
    });

    return {
      displayPosts: filtered.slice(0, 4),
      hasMore: filtered.length > 4,
    };
  }, [data, currentPostId, currentCommunity]);

  // ── Initial Loading State ─────────────────────────────────────────
  if (isLoading) {
    return (
      <section className="w-full pt-6 pb-8 border-t border-gray-200/60 mt-10">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-bold text-2xl text-gray-900">
            {newsDetail?.relatedNews || "Bản tin liên quan"}
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
          {[1, 2, 3, 4].map((index) => (
            <div
              key={index}
              className="flex flex-col bg-gray-100 rounded-2xl animate-pulse h-[280px]"
            />
          ))}
        </div>
      </section>
    );
  }

  // ── Empty State ───────────────────────────────────────────────────
  if (displayPosts.length === 0) {
    return null;
  }

  // ── Main Layout ───────────────────────────────────────────────────
  return (
    <section className="w-full pt-8 pb-10 border-t border-gray-200/80 mt-10">
      {/* Header with Title and View All Link */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-bold text-2xl md:text-3xl text-gray-900 tracking-tight">
          {newsDetail?.relatedNews || "Bản tin liên quan"}
        </h2>

        {hasMore && (
          <Link
            to={`/${currentLang}/cat-speak/news`}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-cath-red-700 hover:text-cath-red-800 transition-colors group"
          >
            <span>{newsDetail?.viewAll || "Xem tất cả bản tin"}</span>
            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        )}
      </div>

      {/* Responsive 4-card Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6 items-start">
        {displayPosts.map((post) => (
          <RelatedNewsCard key={post.postId || post.id} news={post} />
        ))}
      </div>
    </section>
  );
};

export default RelatedNewsSection;
