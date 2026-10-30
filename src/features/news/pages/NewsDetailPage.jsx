import React, { useState, useRef, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import NewsDetailActionBar from "../components/NewsDetailActionBar";
import {
  useGetPostByIdQuery,
  useGetPostBySlugQuery,
  useGetSharedPostQuery,
  useGetPostReactionsQuery,
  useReactToPostMutation,
  useSharePostMutation,
} from "@/store/api/social/postsApi";
import { useLanguage } from "@/shared/context/LanguageContext";
import { getShareUrlWithVersion } from "@/shared/utils/shareUtils";
import { Breadcrumb } from "@/shared/components/ui/navigation";
import PostContent from "../components/PostContent";
import CommentsSection from "../components/CommentsSection";
import NewsArticleHeader from "../components/NewsArticleHeader";
import ShareModal from "../components/ShareModal";
import RelatedNewsSection from "../components/RelatedNewsSection";
import { getImageUrl } from "@/shared/utils/imageUtils";
import LoadingSpinner from "@/shared/components/ui/indicators/LoadingSpinner";
import { useAuthModal } from "@/shared/context/AuthModalContext";
import { useAuth } from "@/features/auth";
import FilePreviewModal from "@/shared/components/ui/FilePreviewModal";
import FileAttachmentItem from "@/shared/components/ui/FileAttachmentItem";
import IconButton from "@/shared/components/ui/buttons/IconButton";
import { Download } from "lucide-react";

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
    refetch: refetchSlug,
  } = useGetPostBySlugQuery(slug, { skip: !isSlug });

  const {
    data: normalData,
    isLoading: normalLoading,
    error: normalError,
    refetch: refetchNormal,
  } = useGetPostByIdQuery(slug, { skip: !isNumeric });

  const {
    data: sharedData,
    isLoading: sharedLoading,
    error: sharedError,
    refetch: refetchShared,
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
  const postId = newsItem?.postId;
  const {
    data: postReactions,
    refetch: refetchReactions,
  } = useGetPostReactionsQuery(postId, { skip: !postId });

  const handleReact = async (type) => {
    if (!isAuthenticated) {
      openAuthModal("login");
      return;
    }

    if (!newsItem?.postId) return;

    try {
      await reactToPost({
        postId: newsItem.postId,
        type,
      }).unwrap();
    } catch (e) {
      console.error("React failed", e);
    } finally {
      refetchReactions?.();
      if (isSharedToken) {
        refetchShared();
      } else if (isNumeric) {
        refetchNormal();
      } else {
        refetchSlug();
      }
    }
  };

  const [sharePost] = useSharePostMutation();
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [shareUrl, setShareUrl] = useState("");
  const [previewDoc, setPreviewDoc] = useState(null);

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

      const finalShareUrl = url ? getShareUrlWithVersion(url) : window.location.href;

      if (navigator.share) {
        try {
          await navigator.share({
            title: newsItem.title || "CatSpeak",
            text: newsItem.excerpt || newsItem.title || "",
            url: finalShareUrl,
          });
        } catch (err) {
          if (err.name === "NotAllowedError") {
            setShareUrl(finalShareUrl);
            setIsShareModalOpen(true);
          } else if (err.name !== "AbortError") {
            console.error("Share failed", err);
          }
        }
      } else {
        setShareUrl(finalShareUrl);
        setIsShareModalOpen(true);
      }
    } catch (e) {
      if (navigator.share) {
        try {
          await navigator.share({
            title: newsItem?.title || "CatSpeak",
            text: newsItem?.excerpt || newsItem?.title || "",
            url: window.location.href,
          });
        } catch (err) {
          if (err.name !== "AbortError") {
            console.error("Share failed", err);
          }
        }
      } else {
        console.error("Share failed", e);
      }
    }
  };

  if (isLoading) {
    return (
      <div role="status" aria-label={t.loading || "Loading..."} className="flex min-h-[50vh] items-center justify-center bg-primaryBg">
        <LoadingSpinner />
      </div>
    );
  }

  const isGlobalNews = Number(newsItem?.postType) === 2;

  if (error || !newsItem || newsItem.privacy !== "Public") {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center bg-primaryBg px-4">
        <h5 className="mb-4 text-2xl font-bold">{t.news?.error?.notFound}</h5>
        <button
          onClick={() =>
            navigate(
              `/${lang}/cat-speak/${isGlobalNews ? "global-news" : "news"}`,
            )
          }
          className="rounded-full border border-cath-red-700 px-6 py-2 text-sm font-medium text-cath-red-700 transition-colors hover:bg-cath-red-50"
        >
          {t.news?.error?.backToNews}
        </button>
      </div>
    );
  }

  const breadcrumbItems = [
    { label: t.nav?.home || "Home", onClick: () => navigate(`/${lang}/community`) },
    {
      label: isGlobalNews
        ? t.news?.globalNews || "Bản tin thế giới"
        : t.news?.catSpeakNews || "Bản tin CatSpeak",
      onClick: () =>
        navigate(
          `/${lang}/cat-speak/${isGlobalNews ? "global-news" : "news"}`,
        ),
    },
    { label: newsItem.title },
  ];

  const videoMedia = (newsItem.media || []).filter((item) => item.mediaType === "Video");
  const documentMedia = (newsItem.media || []).filter(
    (item) => item.mediaType !== "Image" && item.mediaType !== "Video",
  );
  const labels = t.news?.newsDetail;

  return (
    <div className="min-h-screen w-full bg-primaryBg">
      <div className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-8 px-4 py-6 sm:px-6 lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-10 lg:px-8 lg:py-8">
        <div className="min-w-0">
          <nav aria-label="Breadcrumb" className="mb-5">
            <Breadcrumb items={breadcrumbItems} className="w-full !gap-2 !text-xs" />
          </nav>
          <article aria-labelledby="news-article-title" className="min-w-0">
            <NewsArticleHeader key={postId || slug} newsItem={newsItem} />
            <div className="pt-5 sm:pt-6">
              {videoMedia.map((item) => (
                <video key={item.postMediaId || item.mediaUrl} controls preload="metadata" className="mb-5 max-h-[560px] w-full bg-black" aria-label={newsItem.title}>
                  <source src={getImageUrl(item.mediaUrl)} />
                </video>
              ))}

              <PostContent
                html={newsItem.content}
                contentUrl={newsItem.contentUrl || newsItem.ContentUrl}
                className="[&>div:first-child>:first-child]:!mt-0 [&_img]:!rounded-none [&_img]:!shadow-none [&_figure]:max-w-full [&_iframe]:max-w-full [&_video]:max-w-full [&_table]:block [&_table]:max-w-full [&_table]:overflow-x-auto"
              />

              {documentMedia.length > 0 && (
                <section className="mt-6 flex flex-col gap-3 border-t border-border pt-4">
                  <h2 className="text-sm font-semibold text-gray-700">
                    {labels?.attachments || "Attachments"} ({documentMedia.length})
                  </h2>
                  {documentMedia.map((doc) => (
                    <FileAttachmentItem
                      key={doc.postMediaId || doc.mediaUrl}
                      fileName={doc.fileName || labels?.document || "Document"}
                      fileSize={doc.fileSize}
                      onClick={() => setPreviewDoc(doc)}
                      className="cursor-pointer transition-colors hover:bg-gray-50"
                      rightAction={
                        <IconButton
                          as="a"
                          href={getImageUrl(doc.mediaUrl)}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          variant="ghost"
                          size="sm"
                          className="shrink-0"
                          title={labels?.download || "Download"}
                        >
                          <Download size={20} />
                        </IconButton>
                      }
                    />
                  ))}
                </section>
              )}

              <div className="mt-6">
                <NewsDetailActionBar
                  newsItem={newsItem}
                  reactions={postReactions}
                  handleReact={handleReact}
                  handleShare={handleShare}
                  onCommentClick={() => commentsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })}
                />
              </div>
            </div>
          </article>

          <div className="flow-root pb-8">
            <section ref={commentsRef} aria-label={labels?.comment || "Comments"} className="mt-8 scroll-mt-24 border-t border-border pt-6">
              <CommentsSection
                key={postId}
                postId={newsItem.postId || newsItem.id}
                totalComments={newsItem.totalComments ?? newsItem.commentCount ?? 0}
              />
            </section>
          </div>

        </div>
        <aside className="min-w-0 border-t border-border pt-6 lg:border-t-0 lg:pt-0">
          <RelatedNewsSection currentPostId={newsItem.postId || newsItem.id} postType={isGlobalNews ? "2" : "1"} />
        </aside>
      </div>

      {/* ── Share Modal ──────────────────────────────────────────── */}
      <ShareModal
        open={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        shareUrl={shareUrl}
      />

      {/* ── Document Preview Modal ──────────────────────────────── */}
      {previewDoc && (
        <FilePreviewModal
          open={Boolean(previewDoc)}
          onClose={() => setPreviewDoc(null)}
          item={previewDoc}
          recordMaterialView={false}
        />
      )}
    </div>
  );
};

export default NewsDetailPage;
