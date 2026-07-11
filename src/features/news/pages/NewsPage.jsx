import React, {
  useState,
  useRef,
  useCallback,
  useMemo,
  useEffect,
} from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useLanguage } from "@/shared/context/LanguageContext";
import { useGetPostsQuery } from "@/store/api/postsApi";
import { Breadcrumb } from "@/shared/components/ui/navigation";
import NewsCard from "../components/NewsCard";
import LoadingSpinner from "@/shared/components/ui/indicators/LoadingSpinner";
import ErrorMessage from "@/shared/components/ui/indicators/ErrorMessage";
import EmptyState from "@/shared/components/ui/indicators/EmptyState";

/* ------------------------------------------------------------------ */
/*  Filter Tabs                                                        */
/* ------------------------------------------------------------------ */

const FILTER_TABS = [{ key: "all", label: "Tất cả" }];

const FilterTabs = ({ active, onChange }) => (
  <div className="flex items-center gap-3 px-6">
    {FILTER_TABS.map((tab) => {
      const isActive = active === tab.key;
      return (
        <button
          key={tab.key}
          onClick={() => onChange(tab.key)}
          className={`flex items-center justify-center gap-2 px-4 py-2 rounded-full font-nunito font-medium text-base transition-all ${
            isActive
              ? "bg-[#ffeef0] text-[#be0015] shadow-[0_1px_4px_rgba(12,12,13,0.1),0_1px_2px_rgba(12,12,13,0.05)]"
              : "bg-white text-[#7b7979] hover:bg-gray-50"
          }`}
        >
          {tab.label}
        </button>
      );
    })}
  </div>
);

/* ------------------------------------------------------------------ */
/*  Responsive column count                                            */
/* ------------------------------------------------------------------ */

const useColumnCount = () => {
  const [cols, setCols] = useState(3);

  useEffect(() => {
    const handleResize = () => {
      const w = window.innerWidth;
      if (w >= 1280) setCols(4);
      else if (w >= 768) setCols(3);
      else if (w >= 480) setCols(2);
      else setCols(1);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return cols;
};

/* ------------------------------------------------------------------ */
/*  NewsPage                                                           */
/* ------------------------------------------------------------------ */

const NewsPage = () => {
  const { t } = useLanguage();
  const { lang } = useParams();
  const navigate = useNavigate();
  const currentLang = lang || "vi";

  const [page, setPage] = useState(1);
  const [activeFilter, setActiveFilter] = useState("all");
  const pageSize = 24;

  const { data, isFetching, error } = useGetPostsQuery({
    page,
    pageSize,
  });

  // Only public posts
  const publicPosts = useMemo(() => {
    return data?.data?.filter((post) => post.privacy === "Public") || [];
  }, [data?.data]);

  const columnsCount = useColumnCount();

  // Distribute posts into masonry columns
  const columns = useMemo(() => {
    const colsArray = Array.from({ length: columnsCount }, () => []);
    publicPosts.forEach((post, i) => {
      colsArray[i % columnsCount].push(post);
    });
    return colsArray;
  }, [publicPosts, columnsCount]);

  const hasMore = data?.hasMore ?? false;

  // Infinite scroll observer
  const observer = useRef();
  const lastPostElementRef = useCallback(
    (node) => {
      if (isFetching) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          setPage((prev) => prev + 1);
        }
      });
      if (node) observer.current.observe(node);
    },
    [isFetching, hasMore],
  );

  // ── Error states ──────────────────────────────────────────────────
  if (error && page === 1) {
    if (error?.status === 404) return <EmptyState message="No posts found" />;
    if (error?.status === 401)
      return <EmptyState message={t.catSpeak?.newsLoginPrompt} />;
    return <ErrorMessage message="Error loading posts" />;
  }

  // ── Breadcrumb items ──────────────────────────────────────────────
  const breadcrumbItems = [
    {
      label: "Trang chủ",
      onClick: () => navigate(`/${currentLang}/community`),
    },
    {
      label: "Cat Speak",
      onClick: () => navigate(`/${currentLang}/cat-speak/news`),
    },
    { label: "Bản tin CatSpeak" },
  ];

  const lastPostId = publicPosts[publicPosts.length - 1]?.postId;
  console.log("Post list: ", data);
  // ── Render ────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col w-full gap-7">
      {/* Breadcrumb */}
      <div className="px-6">
        <Breadcrumb items={breadcrumbItems} />
      </div>

      {/* Filter Tabs */}
      <FilterTabs active={activeFilter} onChange={setActiveFilter} />

      {/* Masonry Card Grid */}
      <div className="flex flex-row w-full gap-5 px-6 items-start">
        {columns.map((col, colIndex) => (
          <div key={colIndex} className="flex flex-col flex-1 gap-9 min-w-0">
            {col.map((post) => {
              const isLast = post.postId === lastPostId;
              return (
                <div ref={isLast ? lastPostElementRef : null} key={post.postId}>
                  <NewsCard news={post} />
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* Infinite scroll loading indicator */}
      {isFetching && page > 1 && (
        <div className="flex justify-center py-6">
          <LoadingSpinner />
        </div>
      )}

      {/* Load More fallback */}
      {hasMore && !isFetching && (
        <div className="flex justify-center pb-8">
          <button
            onClick={() => setPage((p) => p + 1)}
            className="rounded-full bg-blue-50 px-6 py-2 text-sm font-medium text-blue-600 transition-colors hover:bg-blue-100"
          >
            {t.news?.loadMore || "Load More"}
          </button>
        </div>
      )}
    </div>
  );
};

export default NewsPage;
