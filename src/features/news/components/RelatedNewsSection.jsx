import { useMemo } from "react";
import { useParams } from "react-router-dom";
import { useLanguage } from "@/shared/context/LanguageContext";
import { useGetPostsQuery } from "@/store/api/social/postsApi";
import LoadingSpinner from "@/shared/components/ui/indicators/LoadingSpinner";
import RelatedNewsCard from "./RelatedNewsCard";
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
    <h2 id="related-news-heading" className="min-w-0 text-lg font-bold leading-tight text-gray-900">
      {labels?.relatedNews || "Related news"}
    </h2>
  );

  return (
    <section aria-labelledby="related-news-heading" className="min-w-0">
      <div className="mb-2">{heading}</div>
      {isLoading ? (
        <div role="status" className="py-8" aria-label={t.loading || "Loading..."}>
          <LoadingSpinner className="flex justify-center [&_svg]:h-6 [&_svg]:w-6" />
        </div>
      ) : error ? (
        <button type="button" onClick={refetch} className="text-left text-sm text-cath-red-700 hover:underline">
          {labels?.retryRelatedNews || "Could not load related news. Try again."}
        </button>
      ) : (
        <ul className="divide-y divide-border">
          {relatedPosts.slice(0, RELATED_NEWS_LIMIT).map((post) => (
            <li key={post.postId || post.id} className="py-4">
              <RelatedNewsCard news={post} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
};

export default RelatedNewsSection;
