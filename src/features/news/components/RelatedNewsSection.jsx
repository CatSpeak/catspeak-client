import React, { useRef, useMemo, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { useLanguage } from "@/shared/context/LanguageContext";
import { useGetPostsQuery } from "@/store/api/social/postsApi";
import { incrementPage, selectNewsPage } from "@/store/slices/newsSlice";
import NewsCard from "./NewsCard";
import NewsCardSkeleton from "./NewsCardSkeleton";
import useColumnCount from "@/shared/hooks/useColumnCount";
import { getCommunityName } from "../utils/newsUtils";

/**
 * RelatedNewsSection — displays related news in responsive masonry columns with infinite scroll.
 */
const RelatedNewsSection = ({ currentPostId, postType = "1" }) => {
  const { lang } = useParams();
  const { t, language } = useLanguage();
  const newsDetail = t.news?.newsDetail;
  const dispatch = useDispatch();

  const currentCommunity = useMemo(() => {
    return getCommunityName(
      lang || localStorage.getItem("communityLanguage") || language || "en",
    );
  }, [lang, language]);

  const page = useSelector(selectNewsPage);
  const pageSize = 26;

  const { data, isLoading, isFetching } = useGetPostsQuery({
    page,
    pageSize,
    postType,
  });

  // Filter out current post, non-public posts, and filter by current language community or "All"
  const relatedPosts = useMemo(() => {
    if (!data?.data) return [];
    const targetCommunity = currentCommunity.toLowerCase();

    return data.data.filter((post) => {
      if (post.postId === currentPostId) return false;
      if (post.privacy !== "Public") return false;

      const postCommunity = (post.languageCommunity || "All").toLowerCase();
      return postCommunity === "all" || postCommunity === targetCommunity;
    });
  }, [data?.data, currentPostId, currentCommunity]);

  const columnsCount = useColumnCount();

  // Distribute posts into masonry columns
  const columns = useMemo(() => {
    const colsArray = Array.from({ length: columnsCount }, () => []);
    relatedPosts.forEach((post, i) => {
      colsArray[i % columnsCount].push(post);
    });
    return colsArray;
  }, [relatedPosts, columnsCount]);

  // Infinite scroll observer — trigger fetch when the second-to-last post appears
  const secondLastPostElementRef = useRef(null);
  useEffect(() => {
    if (
      !secondLastPostElementRef.current ||
      isFetching ||
      data?.hasMore === false
    )
      return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          dispatch(incrementPage());
        }
      },
      {
        rootMargin: "200px",
      },
    );
    observer.observe(secondLastPostElementRef.current);
    return () => observer.disconnect();
  }, [relatedPosts, isFetching, data?.hasMore, dispatch]);

  // ── Initial Loading State ─────────────────────────────────────────
  if (isLoading && relatedPosts.length === 0) {
    const skeletonCols = Array.from({ length: columnsCount }, () => []);
    const totalSkeletons = columnsCount * 3;
    for (let i = 0; i < totalSkeletons; i++) {
      skeletonCols[i % columnsCount].push(i);
    }

    return (
      <section className="w-full pb-4 sm:pb-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-bold text-[28px] leading-[1.4] text-black">
            {newsDetail?.relatedNews || "Bản tin liên quan"}
          </h2>
        </div>
        <div className="flex flex-row w-full gap-4 items-start">
          {skeletonCols.map((col, colIndex) => (
            <div key={colIndex} className="flex flex-col flex-1 gap-4 min-w-0">
              {col.map((itemIndex) => (
                <NewsCardSkeleton key={itemIndex} index={itemIndex} />
              ))}
            </div>
          ))}
        </div>
      </section>
    );
  }

  // ── Empty State ───────────────────────────────────────────────────
  if (!isLoading && relatedPosts.length === 0) {
    return (
      <section className="w-full pb-4 sm:pb-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-bold text-[28px] leading-[1.4] text-black">
            {newsDetail?.relatedNews || "Bản tin liên quan"}
          </h2>
        </div>
        <p className="text-base text-[#7b7979] leading-[1.4]">
          {newsDetail?.noRelatedNews || "Không có bản tin liên quan."}
        </p>
      </section>
    );
  }

  const secondLastPostId =
    relatedPosts[relatedPosts.length - 2]?.postId ??
    relatedPosts[relatedPosts.length - 1]?.postId;

  // ── Main Layout with Masonry Grid & Infinite Scroll Spinner ────────
  return (
    <section className="w-full pb-4 sm:pb-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <h2 className="font-bold text-[28px] leading-[1.4] text-black">
          {newsDetail?.relatedNews || "Bản tin liên quan"}
        </h2>
      </div>

      {/* Masonry Card Grid */}
      <div className="flex flex-row w-full gap-4 items-start">
        {columns.map((col, colIndex) => (
          <div key={colIndex} className="flex flex-col flex-1 gap-4 min-w-0">
            {col.map((post) => {
              const isSecondLast = post.postId === secondLastPostId;
              return (
                <div
                  ref={isSecondLast ? secondLastPostElementRef : null}
                  key={post.postId}
                >
                  <NewsCard news={post} />
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* Infinite Scroll Fetching Spinner */}
      {isFetching && relatedPosts.length > 0 && (
        <div className="flex justify-center py-4">
          <div className="w-8 h-8 border-2 border-rose-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}
    </section>
  );
};

export default RelatedNewsSection;
