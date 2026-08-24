import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
  useCallback,
} from "react";
import { Upload, Users } from "lucide-react";
import { useLanguage } from "@/shared/context/LanguageContext";
import ReelGrid from "../grid/ReelGrid";
import ReelGridSkeleton from "../grid/ReelGridSkeleton";
import {
  useLazyGetReelsFeedQuery,
  useGetCreatorCountQuery,
} from "@/store/api/reelsApi";
import { mapReelDtoToFrontend } from "../../utils/mappers";
import { Loader2 } from "lucide-react";

const PAGE_SIZE = 20;

export default function ForYouTab({
  onReelClick,
  onUploadClick,
  searchQuery = "",
}) {
  const { t } = useLanguage();
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  // Accumulate reels across pages to avoid relying solely on RTK merge
  const [allReels, setAllReels] = useState([]);
  const seenIdsRef = useRef(new Set());
  // Sentinel element at the bottom — watched by IntersectionObserver
  const sentinelRef = useRef(null);
  // Guard: track whether a page-increment request is already in-flight
  const isFetchingNextRef = useRef(false);

  // Reset everything when searchQuery changes
  useEffect(() => {
    setAllReels([]);
    setHasMore(true);
    setHasLoadedOnce(false);
    seenIdsRef.current = new Set();
    isFetchingNextRef.current = false;
  }, [searchQuery]);

  const [fetchReels, { data: feedResponse, isLoading, isFetching }] =
    useLazyGetReelsFeedQuery();

  const requestNextReels = useCallback(
    async (excludeIds) => {
      if (isFetchingNextRef.current || !hasMore) return;

      isFetchingNextRef.current = true;

      try {
        const response = await fetchReels({
          page: 1,
          pageSize: PAGE_SIZE,
          search: searchQuery,
          excludeReelIds: excludeIds,
        }).unwrap();

        const incoming = Array.isArray(response?.data) ? response.data : [];

        const mapped = incoming.map(mapReelDtoToFrontend).filter((reel) => {
          const id = String(reel.id ?? reel.reelId);

          if (seenIdsRef.current.has(id)) return false;

          seenIdsRef.current.add(id);
          return true;
        });

        if (mapped.length > 0) {
          setAllReels((previous) => [...previous, ...mapped]);
        }

        // BE trả ít hơn PAGE_SIZE nghĩa là đã hết dữ liệu
        setHasMore(incoming.length === PAGE_SIZE);
        setHasLoadedOnce(true);
      } catch (error) {
        console.error("Load reels failed:", error);
      } finally {
        isFetchingNextRef.current = false;
      }
    },
    [fetchReels, searchQuery, hasMore],
  );

  useEffect(() => {
    if (!hasLoadedOnce && allReels.length === 0 && hasMore) {
      requestNextReels([]);
    }
  }, [hasLoadedOnce, allReels.length, hasMore, requestNextReels]);

  // Accumulate incoming reels; detect end-of-feed
  // useEffect(() => {
  //   if (!feedResponse?.data) return;

  //   const incoming = feedResponse.data || [];
  //   const lastPageCount = feedResponse.lastPageCount ?? incoming.length;

  //   const mapped = incoming.map(mapReelDtoToFrontend).filter((r) => {
  //     const key = String(r.id ?? r.reelId);
  //     if (seenIdsRef.current.has(key)) return false;
  //     seenIdsRef.current.add(key);
  //     return true;
  //   });

  //   if (page === 1) {
  //     setAllReels(mapped);
  //   } else {
  //     setAllReels((prev) => [...prev, ...mapped]);
  //   }

  //   // If server returned fewer items than requested → no more pages
  //   if (lastPageCount < PAGE_SIZE) {
  //     setHasMore(false);
  //   } else {
  //     setHasMore(true);
  //   }

  //   isFetchingNextRef.current = false;
  // }, [feedResponse, page]);

  // IntersectionObserver — fires once when sentinel enters viewport
  const loadMore = useCallback(() => {
    if (isFetchingNextRef.current || isFetching || !hasMore) return;

    const excludeIds = allReels
      .map((reel) => reel.reelId ?? reel.id)
      .filter(Boolean);

    requestNextReels(excludeIds);
  }, [allReels, isFetching, hasMore, requestNextReels]);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMore();
        }
      },
      {
        // Trigger 400 px before the sentinel reaches the viewport edge
        rootMargin: "0px 0px 400px 0px",
        threshold: 0,
      },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [loadMore]);

  const dateParams = useMemo(() => {
    const now = new Date();
    const from = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    const to = new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      0,
      23,
      59,
      59,
      999,
    ).toISOString();
    return { from, to };
  }, []);
  const { data: creatorCount } = useGetCreatorCountQuery(dateParams);

  return (
    <div className="w-full">
      {/* Dynamic Page Banner */}
      <div className="bg-gradient-to-r from-[#FFF1F2] to-[#FFF6ED] border border-[#f3d6a9] rounded-xl p-5 sm:p-6 md:px-8 md:py-6 mb-8 flex flex-col md:flex-row justify-between shadow-sm relative overflow-hidden transition-all duration-300">
        {/* Left Side */}
        <div className="flex flex-col flex-1 z-10 w-full">
          <h2 className="text-xl md:text-2xl font-semibold text-headingColor mb-2 tracking-wide">
            {t.catSpeak.reels.createOwnReels ||
              "Sáng tạo nội dung của riêng bạn"}
          </h2>
          <p className="text-[13px] md:text-[14px] text-gray-700 mb-5 md:mb-8">
            {t.catSpeak.reels.shareKnowledge ||
              "Chia sẻ kiến thức và luyện tập nhập vai cùng cộng đồng Cat Speak."}
          </p>
          <div className="flex flex-wrap items-center gap-2.5 mt-auto">
            <span className="text-[12px] md:text-[13px] font-medium text-textColor bg-white px-3.5 md:px-4 py-1.5 rounded-full shadow-[0_1px_2px_rgba(0,0,0,0.02)] border border-border">
              {t.catSpeak.reels.formatLimit || "Định dạng MP4, MOV"}
            </span>
            <span className="text-[12px] md:text-[13px] font-medium text-textColor bg-white px-3.5 md:px-4 py-1.5 rounded-full shadow-[0_1px_2px_rgba(0,0,0,0.02)] border border-border">
              {t.catSpeak.reels.sizeLimit || "Tối đa 5 phút, 150MB"}
            </span>
          </div>
        </div>

        {/* Right Side */}
        <div className="flex flex-col justify-between items-end mt-6 md:mt-0 z-10 shrink-0 min-w-[200px] w-full md:w-auto">
          <div className="flex flex-row justify-between items-center md:flex-col md:items-end mb-4 md:mb-6 w-full md:w-auto">
            <span className="text-[13px] text-lighttextGray mb-0 md:mb-1">
              {t.catSpeak.reels.monthlyCreator || "Monthly creator"}
            </span>
            <div className="flex items-center text-[#fbbf24] font-medium text-[15px] space-x-1.5">
              <Users size={16} />
              <span>{creatorCount?.count ?? "..."}</span>
            </div>
          </div>
          <button
            onClick={onUploadClick}
            className="bg-cath-red-700 text-white w-full md:w-auto justify-center px-6 py-2.5 rounded-full font-medium hover:bg-cath-red-600 transition-colors flex items-center space-x-2 shadow-sm"
          >
            <Upload size={16} />
            <span>{t.catSpeak.reels.uploadReel || "Đăng tải Reel"}</span>
          </button>
        </div>
      </div>

      {isLoading && allReels.length === 0 ? (
        <ReelGridSkeleton />
      ) : (
        <>
          <ReelGrid reels={allReels} onReelClick={onReelClick} />

          {/* Spinner shown while fetching next page */}
          {isFetching && allReels.length > 0 && (
            <div className="flex justify-center my-6">
              <Loader2 className="w-8 h-8 animate-spin text-cath-red-700" />
            </div>
          )}

          {/* Sentinel: IntersectionObserver target — invisible placeholder */}
          {hasMore && !isFetching && (
            <div ref={sentinelRef} className="h-1 w-full" aria-hidden="true" />
          )}

          {/* End-of-feed indicator */}
          {!hasMore && allReels.length > 0 && (
            <p className="text-center text-sm text-lighttextGray py-8">
              {t.catSpeak?.reels?.endOfFeed ||
                "Bạn đã xem hết tất cả nội dung 🎉"}
            </p>
          )}
        </>
      )}
    </div>
  );
}
