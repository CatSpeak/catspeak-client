import React, { useRef, useMemo, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { Newspaper, Search, X } from "lucide-react";
import { useParams, useSearchParams } from "react-router-dom";
import { useLanguage } from "@/shared/context/LanguageContext";
import { useGetPostsQuery } from "@/store/api/social/postsApi";
import { resetPage, setPage as setPageAction } from "@/store/slices/newsSlice";
import NewsCard from "../components/NewsCard";
import NewsCardSkeleton from "../components/NewsCardSkeleton";
import TopicFilter from "../components/TopicFilter";
import ErrorMessage from "@/shared/components/ui/indicators/ErrorMessage";
import EmptyState from "@/shared/components/ui/indicators/EmptyState";
import useColumnCount from "@/shared/hooks/useColumnCount";
import { getCommunityName } from "../utils/newsUtils";
import {
  NEWS_SORT_OPTIONS,
  applyNewsFilter,
  parseNewsFilter,
} from "../utils/newsFilters";

const NewsPage = ({ postType = "1" }) => {
  const { lang } = useParams();
  const { t, language } = useLanguage();
  const dispatch = useDispatch();
  const [searchParams, setSearchParams] = useSearchParams();

  const filters = useMemo(
    () => parseNewsFilter(searchParams.toString()),
    [searchParams],
  );

  const currentCommunity = useMemo(() => {
    return getCommunityName(
      lang || localStorage.getItem("communityLanguage") || language || "en",
    );
  }, [lang, language]);

  const filterKey = useMemo(() => {
    const topicsKey = (filters.topicIds || []).slice().sort().join(",");
    return `${postType}_${filters.searchKeyword}_${filters.sortBy}_${topicsKey}`;
  }, [postType, filters.searchKeyword, filters.sortBy, filters.topicIds]);

  const [page, setPage] = useState(1);
  const [prevFilterKey, setPrevFilterKey] = useState(filterKey);

  // Synchronously reset page to 1 during render when filterKey changes,
  // preventing any outdated fetch with (newFilters, oldPage).
  if (filterKey !== prevFilterKey) {
    setPrevFilterKey(filterKey);
    setPage(1);
  }

  const pageSize = 26;

  const queryArgs = useMemo(
    () => ({
      page,
      pageSize,
      postType,
      searchKeyword: filters.searchKeyword || undefined,
      sortBy: filters.sortBy,
      topicIds:
        filters.topicIds && filters.topicIds.length > 0
          ? filters.topicIds
          : undefined,
    }),
    [
      page,
      pageSize,
      postType,
      filters.searchKeyword,
      filters.sortBy,
      filters.topicIds,
    ],
  );

  const { data, error, isLoading, isFetching } = useGetPostsQuery(queryArgs);

  // Search input is local state (for snappy typing); URL only updates when the
  // user commits the keyword (Enter key or leaving the field).
  const [searchInput, setSearchInput] = useState(filters.searchKeyword);
  const [prevKeyword, setPrevKeyword] = useState(filters.searchKeyword);

  // Sync the input when the URL keyword changes externally (back/forward/share links),
  // while keeping the typed value authoritative while the user is editing.
  if (filters.searchKeyword !== prevKeyword) {
    setPrevKeyword(filters.searchKeyword);
    setSearchInput(filters.searchKeyword);
  }

  // Update URL filters only when actual values have changed
  const updateUrlFilters = ({ searchKeyword, sortBy, topicIds }) => {
    const nextKeyword =
      searchKeyword !== undefined ? searchKeyword : filters.searchKeyword;
    const nextSortBy = sortBy !== undefined ? sortBy : filters.sortBy;
    const nextTopicIds =
      topicIds !== undefined ? topicIds : filters.topicIds;

    const isSameKeyword = nextKeyword === filters.searchKeyword;
    const isSameSort = nextSortBy === filters.sortBy;
    const isSameTopics =
      (nextTopicIds || []).slice().sort().join(",") ===
      (filters.topicIds || []).slice().sort().join(",");

    if (isSameKeyword && isSameSort && isSameTopics) {
      return;
    }

    setSearchParams(
      applyNewsFilter(searchParams, {
        searchKeyword: nextKeyword,
        sortBy: nextSortBy,
        topicIds: nextTopicIds,
      }),
    );
  };

  // Commit a keyword to the URL. No-op when the value already matches the current filter.
  const commitSearch = (keyword = searchInput) => {
    const trimmed = (keyword || "").trim();
    if (trimmed === filters.searchKeyword) return;
    updateUrlFilters({ searchKeyword: trimmed });
  };

  // Whenever the URL filters change, scroll to top only if scrolled down, and reset Redux page.
  const isFirstRender = useRef(true);
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    dispatch(resetPage());
    if (
      typeof window !== "undefined" &&
      (window.scrollY > 150 || document.documentElement.scrollTop > 150)
    ) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [filterKey, dispatch]);

  // Public posts filtered by current language community or "All"
  const publicPosts = useMemo(() => {
    const rawList = Array.isArray(data?.data)
      ? data.data
      : Array.isArray(data)
        ? data
        : [];
    const targetCommunity = currentCommunity.toLowerCase();

    return rawList.filter((post) => {
      if (post.privacy !== "Public") return false;

      const postCommunity = (post.languageCommunity || "All").toLowerCase();
      return postCommunity === "all" || postCommunity === targetCommunity;
    });
  }, [data, currentCommunity]);

  const columnsCount = useColumnCount();

  // Distribute posts into masonry columns
  const columns = useMemo(() => {
    const colsArray = Array.from({ length: columnsCount }, () => []);
    publicPosts.forEach((post, i) => {
      colsArray[i % columnsCount].push(post);
    });
    return colsArray;
  }, [publicPosts, columnsCount]);

  // Infinite scroll observer — trigger fetch when the second-to-last post appears
  const secondLastPostElementRef = useRef(null);
  const hasMore = data?.hasMore ?? (publicPosts.length >= pageSize);

  useEffect(() => {
    if (
      !secondLastPostElementRef.current ||
      isFetching ||
      isLoading ||
      !hasMore
    ) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isFetching && !isLoading && hasMore) {
          setPage((prev) => {
            const next = prev + 1;
            dispatch(setPageAction(next));
            return next;
          });
        }
      },
      {
        rootMargin: "200px",
      },
    );

    observer.observe(secondLastPostElementRef.current);
    return () => observer.disconnect();
  }, [publicPosts, isFetching, isLoading, hasMore, dispatch]);

  const handleSortChange = (sortBy) => {
    if (sortBy === filters.sortBy) return;
    updateUrlFilters({ sortBy });
  };

  const handleTopicChange = (topicIds) => {
    updateUrlFilters({ topicIds });
  };

  const handleSearchChange = (value) => {
    setSearchInput(value);
  };

  const handleSearchKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      commitSearch();
    }
  };

  const handleSearchBlur = () => {
    commitSearch();
  };

  const handleClearSearch = () => {
    setSearchInput("");
    commitSearch("");
  };

  const filterBar = (
    <div className="flex flex-col w-full gap-3">
      <div className="flex flex-col w-full gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Search box */}
        <div className="relative w-full sm:max-w-xs">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9ca3af]"
          />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => handleSearchChange(e.target.value)}
            onKeyDown={handleSearchKeyDown}
            onBlur={handleSearchBlur}
            placeholder={t.news?.filters?.searchPlaceholder || "Search articles..."}
            className="w-full rounded-xl border border-border bg-white py-2 pl-10 pr-9 text-sm text-foreground placeholder:text-[#9ca3af] focus:outline-none focus:ring-2 focus:ring-primary/40"
            aria-label={t.news?.filters?.searchPlaceholder || "Search articles..."}
          />
          {searchInput && (
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={handleClearSearch}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-[#9ca3af] hover:text-foreground"
              aria-label="Clear search"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Sort chips */}
        <div className="flex items-center gap-2 overflow-x-auto">
          {NEWS_SORT_OPTIONS.map((option) => {
            const labelMap = {
              createDate: t.news?.filters?.newest || "Newest",
              viewCount: t.news?.filters?.mostViewed || "Most viewed",
              reactionCount: t.news?.filters?.mostReactions || "Most reactions",
            };
            const isActive = filters.sortBy === option;
            return (
              <button
                key={option}
                type="button"
                onClick={() => handleSortChange(option)}
                className={`whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-primary text-white"
                    : "bg-gray-100 text-[#606060] hover:bg-gray-200"
                }`}
              >
                {labelMap[option]}
              </button>
            );
          })}
        </div>
      </div>

      {/* Topic Filter row */}
      <TopicFilter
        selectedTopicIds={filters.topicIds}
        onTopicChange={handleTopicChange}
      />
    </div>
  );

  const isInitialLoading = isLoading && publicPosts.length === 0;
  const isFilterFetching = isFetching && page === 1;

  const skeletonCols = useMemo(() => {
    const cols = Array.from({ length: columnsCount }, () => []);
    const totalSkeletons = columnsCount * 3;
    for (let i = 0; i < totalSkeletons; i++) {
      cols[i % columnsCount].push(i);
    }
    return cols;
  }, [columnsCount]);

  const renderSkeletons = () => (
    <div className="flex flex-row w-full gap-4 sm:gap-6 items-start">
      {skeletonCols.map((col, colIndex) => (
        <div
          key={colIndex}
          className="flex flex-col flex-1 gap-4 sm:gap-6 min-w-0"
        >
          {col.map((itemIndex) => (
            <NewsCardSkeleton key={itemIndex} index={itemIndex} />
          ))}
        </div>
      ))}
    </div>
  );

  const secondLastPostId =
    publicPosts[publicPosts.length - 2]?.postId ??
    publicPosts[publicPosts.length - 1]?.postId;

  // ── Render ────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col w-full gap-4 sm:gap-6 p-4 sm:p-6">
      {filterBar}

      {/* ── Filter Transition Loading Progress Bar ── */}
      {isFilterFetching && !isInitialLoading && (
        <div className="w-full h-1 bg-primary/10 rounded-full overflow-hidden -mt-2">
          <div className="w-1/3 h-full bg-primary rounded-full animate-pulse" />
        </div>
      )}

      {/* ── 1. Skeleton Loading State (Only on initial load when no posts exist yet) ── */}
      {isInitialLoading ? (
        renderSkeletons()
      ) : error && page === 1 ? (
        /* ── 2. Error State ── */
        <div className="flex flex-col w-full min-h-[50vh] justify-center items-center">
          {error?.status === 404 ? (
            <EmptyState
              message={t.news?.empty?.title || "Chưa có tin tức nào"}
              description={
                t.news?.empty?.description ||
                "Hiện tại chưa có bài đăng tin tức nào. Hãy quay lại sau!"
              }
              icon={Newspaper}
              variant="page"
            />
          ) : error?.status === 401 ? (
            <EmptyState message={t.catSpeak?.newsLoginPrompt} variant="page" />
          ) : (
            <ErrorMessage message="Error loading posts" />
          )}
        </div>
      ) : publicPosts.length === 0 ? (
        /* ── 3. Empty State ── */
        <div className="flex-1 flex flex-col justify-center items-center w-full min-h-[50vh]">
          <EmptyState
            message={t.news?.empty?.title || "Chưa có tin tức nào"}
            description={
              t.news?.empty?.description ||
              "Hiện tại chưa có bài đăng tin tức nào. Hãy quay lại sau!"
            }
            icon={Newspaper}
            variant="page"
          />
        </div>
      ) : (
        /* ── 4. Content Masonry Grid (Preserved smoothly during filter fetch) ── */
        <>
          <div
            className={`flex flex-row w-full gap-4 sm:gap-6 items-start transition-opacity duration-200 ${
              isFilterFetching ? "opacity-60 pointer-events-none" : "opacity-100"
            }`}
          >
            {columns.map((col, colIndex) => (
              <div
                key={colIndex}
                className="flex flex-col flex-1 gap-4 sm:gap-6 min-w-0"
              >
                {col.map((post) => {
                  const isSecondLast = post.postId === secondLastPostId;
                  return (
                    <div
                      ref={isSecondLast ? secondLastPostElementRef : null}
                      key={post.postId}
                      className="w-full"
                    >
                      <NewsCard news={post} />
                    </div>
                  );
                })}
              </div>
            ))}
          </div>

          {/* Pagination Fetching Spinner (for infinite scroll page > 1) */}
          {isFetching && page > 1 && (
            <div className="flex justify-center py-4">
              <div className="w-8 h-8 border-2 border-rose-500 border-t-transparent rounded-full animate-spin" />
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default NewsPage;