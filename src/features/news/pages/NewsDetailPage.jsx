import React, { useState, useRef, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import NewsDetailActionBar from "../components/NewsDetailActionBar";
import {
  useGetPostByIdQuery,
  useGetPostBySlugQuery,
  useGetSharedPostQuery,
  useReactToPostMutation,
  useSharePostMutation,
} from "@/store/api/social/postsApi";
import { useLanguage } from "@/shared/context/LanguageContext";
import { getShareUrlWithVersion } from "@/shared/utils/shareUtils";
import { Breadcrumb } from "@/shared/components/ui/navigation";
import PostContent from "../components/PostContent";
import CommentsSection from "../components/CommentsSection";
import Carousel from "@/shared/components/ui/Carousel";
import ShareModal from "../components/ShareModal";
import RelatedNewsSection from "../components/RelatedNewsSection";
import { getTranslatedTimeAgo } from "@/features/news/utils/newsUtils";
import { getImageUrl } from "@/shared/utils/imageUtils";
import FluentCard from "@/shared/components/ui/FluentCard";
import { Skeleton } from "@/shared/components/ui/indicators";
import { useAuthModal } from "@/shared/context/AuthModalContext";
import { useAuth } from "@/features/auth";

const NewsDetailSkeleton = () => (
  <div className="w-full min-h-screen bg-primaryBg py-4 px-3 sm:px-5 md:py-6">
    <div className="mx-auto max-w-7xl">
      <div className="grid grid-cols-1 items-start gap-3.5 lg:grid-cols-[minmax(0,2fr)_minmax(300px,1fr)] lg:gap-4.5">
        {/* Left Column: Article Content Skeleton */}
        <div className="flex min-w-0 flex-col gap-3.5">
          {/* Breadcrumb Skeleton */}
          <div className="flex items-center gap-2 px-1">
            <Skeleton className="h-4 w-20" />
            <span className="text-gray-300">/</span>
            <Skeleton className="h-4 w-24" />
            <span className="text-gray-300">/</span>
            <Skeleton className="h-4 w-32" />
          </div>

          {/* Carousel Skeleton Island */}
          <FluentCard
            padding="p-2 sm:p-2.5"
            rounded="rounded-2xl"
            className="shadow-sm border-[#e5e7eb]"
          >
            <Skeleton className="w-full aspect-video rounded-xl" />
          </FluentCard>

          {/* Article Body Skeleton Island */}
          <FluentCard
            padding="p-4 sm:p-5 md:p-6"
            rounded="rounded-2xl"
            className="shadow-sm border-[#e5e7eb] flex flex-col gap-4"
          >
            <div className="flex flex-col gap-2 pb-3 border-b border-border">
              <Skeleton className="h-7 w-4/5" />
              <Skeleton className="h-5 w-3/5" />
              <div className="flex items-center gap-2 mt-1">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-24" />
              </div>
            </div>

            <div className="flex flex-col gap-3 py-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-[95%]" />
              <Skeleton className="h-4 w-[90%]" />
              <Skeleton className="h-4 w-[98%]" />
              <Skeleton className="h-4 w-[75%]" />

              <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-8 w-20 rounded-full" />
                  <Skeleton className="h-8 w-20 rounded-full" />
                </div>
                <Skeleton className="h-8 w-24 rounded-full" />
              </div>
            </div>
          </FluentCard>
        </div>

        {/* Right Column: Comments Sidebar Skeleton Island */}
        <div className="w-full min-w-0 lg:sticky lg:top-[76px] lg:self-start">
          <FluentCard
            padding="p-3.5 sm:p-4"
            rounded="rounded-2xl"
            className="shadow-sm border-[#e5e7eb]"
          >
            <Skeleton className="h-6 w-32 mb-4" />
            <div className="flex flex-col gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex gap-3">
                  <Skeleton className="w-8 h-8 rounded-full shrink-0" />
                  <div className="flex-1 flex flex-col gap-2">
                    <Skeleton className="h-3.5 w-28" />
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className="h-3 w-3/4" />
                  </div>
                </div>
              ))}
            </div>
          </FluentCard>
        </div>
      </div>
    </div>
  </div>
);

const NewsDetailPage = () => {
  const { lang: paramLang, slug } = useParams();
  const { isAuthenticated } = useAuth();
  const { openAuthModal } = useAuthModal();

  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const lang = paramLang || language || "vi";
  const commentsRef = useRef(null);

  const [trySharedFallback, setTrySharedFallback] = useState(false);

  const isNumeric = !isNaN(Number(slug));
  const isSharedTokenInitially =
    !isNumeric && /^[a-zA-Z0-9]{8,}$/.test(slug) && /[A-Z]/.test(slug);
  const isSharedToken = isSharedTokenInitially || trySharedFallback;
  const isSlug = !isNumeric && !isSharedToken;

  const {
    data: slugData,
    isLoading: slugLoading,
    error: slugError,
  } = useGetPostBySlugQuery(slug, { skip: !isSlug });

  const {
    data: normalData,
    isLoading: normalLoading,
    error: normalError,
  } = useGetPostByIdQuery(slug, { skip: !isNumeric });

  const {
    data: sharedData,
    isLoading: sharedLoading,
    error: sharedError,
  } = useGetSharedPostQuery(slug, { skip: !isSharedToken });

  useEffect(() => {
    if (
      slugError &&
      !isNumeric &&
      !isSharedTokenInitially &&
      !trySharedFallback
    ) {
      if (/^[a-zA-Z0-9]{8,}$/.test(slug)) {
        const timer = setTimeout(() => {
          setTrySharedFallback(true);
        }, 0);
        return () => clearTimeout(timer);
      }
    }
  }, [slugError, slug, isNumeric, isSharedTokenInitially, trySharedFallback]);

  const data = isSharedToken ? sharedData : isNumeric ? normalData : slugData;
  const isLoading = isSharedToken
    ? sharedLoading
    : isNumeric
      ? normalLoading
      : slugLoading;
  const error = isSharedToken
    ? sharedError
    : isNumeric
      ? normalError
      : slugError;
  const [reactToPost] = useReactToPostMutation();
  const newsItem = data?.data ?? data ?? null;
  const handleReact = (type) => {
    if (!isAuthenticated) {
      openAuthModal("login");
      return;
    }

    if (!newsItem?.postId) return;

    reactToPost({
      postId: newsItem.postId,
      type,
    });
  };

  const [sharePost] = useSharePostMutation();
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [shareUrl, setShareUrl] = useState("");

  const handleShare = async () => {
    if (!newsItem?.postId) return;
    try {
      const result = await sharePost(newsItem.postId).unwrap();
      let url =
        (typeof result === "string" ? result : result?.shareLink) ||
        window.location.href;

      if (url && !url.startsWith("http")) {
        url = url.startsWith("/") ? url : `/${url}`;
        url = `${window.location.origin}${url}`;
      }

      if (url) {
        setShareUrl(getShareUrlWithVersion(url));
        setIsShareModalOpen(true);
      }
    } catch (e) {
      console.error("Share failed", e);
    }
  };

  if (isLoading) {
    return <NewsDetailSkeleton />;
  }

  if (error || !newsItem || newsItem.privacy !== "Public") {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center bg-primaryBg px-4">
        <h5 className="mb-4 text-2xl font-bold">{t.news?.error?.notFound}</h5>
        <button
          onClick={() => navigate(`/${lang}/cat-speak/news`)}
          className="rounded-full border border-cath-red-700 px-6 py-2 text-sm font-medium text-cath-red-700 transition-colors hover:bg-cath-red-50"
        >
          {t.news?.error?.backToNews}
        </button>
      </div>
    );
  }

  const breadcrumbItems = [
    { label: "Trang chủ", onClick: () => navigate(`/${lang}/community`) },
    {
      label: "Cat Speak",
      onClick: () => navigate(`/${lang}/cat-speak/news`),
    },
    {
      label: "Bản tin CatSpeak",
      onClick: () => navigate(`/${lang}/cat-speak/news`),
    },
    { label: newsItem.title },
  ];

  return (
    <div className="w-full min-h-screen bg-primaryBg py-4 px-3 sm:px-5 md:py-6">
      <div className="mx-auto max-w-7xl flex flex-col gap-5">
        {/* ── Two-column layout ─────────────────────────────────── */}
        <div className="grid grid-cols-1 items-start gap-3.5 lg:grid-cols-[minmax(0,2fr)_minmax(300px,1fr)] lg:gap-4.5">
          {/* ── Left Column: Article Content & Carousel ────────────── */}
          <div className="flex min-w-0 flex-col gap-3.5">
            {/* ── Breadcrumb ─────────────────────────────────────── */}
            <Breadcrumb items={breadcrumbItems} className="w-full px-1" />

            {/* ── Title + Meta ───────────────────────────────────── */}
            <div className="flex flex-col gap-3 md:gap-4">
              <div className="flex flex-col">
                <h1
                  className="text-[24px] font-semibold leading-[1.35] text-black md:text-[32px] line-clamp-2"
                  title={newsItem.title}
                >
                  {newsItem.title}
                </h1>
                {/* Inline dot-separated metadata row */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  {newsItem.viewCount !== undefined && (
                    <span className="font-medium text-sm text-[#7b7979]">
                      {newsItem.viewCount} lượt xem
                    </span>
                  )}
                  <span className="w-1 h-1 rounded-full bg-[#7b7979] inline-block shrink-0" />
                  <span className="font-medium text-sm text-[#7b7979]">
                    {getTranslatedTimeAgo(
                      newsItem.createDate,
                      t.news?.newsCard?.timeAgo,
                    )}
                  </span>
                </div>
              </div>

              {/* ── Hero Image / Carousel ────────────────────────── */}
              {newsItem.media && newsItem.media.length > 0 && (
                <Carousel
                  images={newsItem.media.map((item) => ({
                    url: getImageUrl(item.mediaUrl),
                    alt: newsItem.title,
                  }))}
                  className="rounded-2xl bg-black/5 aspect-video"
                  objectFit="contain"
                />
              )}
            </div>

            {/* ── Article Body Island ───────────────────────────── */}
            <FluentCard
              padding="p-4"
              rounded="rounded-2xl"
              className="shadow-sm border-[#e5e7eb] bg-white flex flex-col gap-4"
            >
              {/* Article Content */}
              <article className="min-w-0">
                <PostContent html={newsItem.content} />

                {/* Action Bar */}
                <NewsDetailActionBar
                  newsItem={newsItem}
                  handleReact={handleReact}
                  handleShare={handleShare}
                  onCommentClick={() =>
                    commentsRef.current?.scrollIntoView({ behavior: "smooth" })
                  }
                />
              </article>
            </FluentCard>
          </div>

          {/* ── Right Column: Comments Sidebar Island ───────────── */}
          <div className="w-full min-w-0 lg:sticky lg:top-[76px] lg:self-start">
            <FluentCard
              padding="p-3.5 sm:p-4"
              rounded="rounded-2xl"
              className="shadow-sm border-[#e5e7eb] lg:max-h-[calc(100vh-96px)] lg:overflow-y-auto"
            >
              <CommentsSection
                ref={commentsRef}
                postId={newsItem.postId}
                totalComments={newsItem.totalComments || 0}
              />
            </FluentCard>
          </div>
        </div>

        {/* ── Related News (full width) ───────────────────────────── */}
        <RelatedNewsSection currentPostId={newsItem.postId} />
      </div>

      {/* ── Share Modal ──────────────────────────────────────────── */}
      <ShareModal
        open={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        shareUrl={shareUrl}
      />
    </div>
  );
};

export default NewsDetailPage;
