import { useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { useLanguage } from "@/shared/context/LanguageContext";
import { useGetPostsQuery } from "@/store/api/social/postsApi";
import LoadingSpinner from "@/shared/components/ui/indicators/LoadingSpinner";
import RelatedNewsCarousel from "./RelatedNewsCarousel";
import { getCommunityName } from "../utils/newsUtils";

const RELATED_NEWS_LIMIT = 10;

const RelatedNewsSection = ({ currentPostId, postType = "1" }) => {
  const { lang } = useParams();
  const { t, language } = useLanguage();
  const labels = t.news?.newsDetail;
  const currentLang = lang || language || "vi";
  const currentCommunity = getCommunityName(currentLang).toLowerCase();
  const { data, isLoading, error, refetch } = useGetPostsQuery({
    page: 1,
    pageSize: 12,
    postType,
  });

  const relatedPosts = useMemo(() => {
    const posts = Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : [];
    return posts.filter((post) => {
      if (String(post.postId ?? post.id) === String(currentPostId)) return false;
      if (post.privacy && post.privacy !== "Public") return false;
      const community = (post.languageCommunity || "All").toLowerCase();
      return community === "all" || community === currentCommunity;
    });
  }, [data, currentPostId, currentCommunity]);

  if (!isLoading && !error && relatedPosts.length === 0) return null;

  const heading = (
    <h2 id="related-news-heading" className="min-w-0 text-xl font-bold leading-tight text-gray-900 sm:text-2xl">
      {labels?.relatedNews || "Related news"}
    </h2>
  );

  return (
    <section aria-labelledby="related-news-heading" className="mt-8 min-w-0">
      {(isLoading || error) && <div className="mb-4">{heading}</div>}
      {isLoading ? (
        <div role="status" className="py-8" aria-label={t.loading || "Loading..."}>
          <LoadingSpinner className="flex justify-center [&_svg]:h-6 [&_svg]:w-6" />
        </div>
      ) : error ? (
        <button type="button" onClick={refetch} className="text-left text-sm text-cath-red-700 hover:underline">
          {labels?.retryRelatedNews || "Could not load related news. Try again."}
        </button>
      ) : (
        <>
          <RelatedNewsCarousel
            key={`${currentPostId}-${postType}-${currentLang}`}
            heading={heading}
            posts={relatedPosts.slice(0, RELATED_NEWS_LIMIT)}
          />
          {/* <Link
            to={`/${currentLang}/cat-speak/${Number(postType) === 2 ? "global-news" : "news"}`}
            className="mt-5 inline-flex min-h-10 items-center gap-1.5 text-sm font-medium text-cath-red-700 hover:underline focus-visible:outline-cath-red-700"
          >
            {labels?.viewAll || "View all"}
            <ArrowRight size={16} aria-hidden="true" />
          </Link> */}
        </>
      )}
    </section>
  );
};

export default RelatedNewsSection;
