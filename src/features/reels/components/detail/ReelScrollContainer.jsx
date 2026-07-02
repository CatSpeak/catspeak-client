import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
  useLayoutEffect,
  useImperativeHandle,
} from "react";
import { Loader2, ChevronLeft } from "lucide-react";
import { useLanguage } from "@/shared/context/LanguageContext";

/**
 * ReelScrollContainer — A premium, high-performance vertical snap-scrolling wrapper.
 *
 * Supports:
 * - Full viewport height and width (100dvh to handle iOS Safari toolbar layout shifting)
 * - Native CSS scroll snapping (smooth, performance-optimized, works perfectly across touch & trackpads)
 * - Infinite scroll with IntersectionObserver (observes sentinel prior to list end)
 * - Render prop child rendering for flexible parent integration
 */
const ACTIVE_SNAP_VISIBLE_RATIO = 0.92;
const DEFAULT_RENDER_WINDOW = 1;
const DEFAULT_PRELOAD_WINDOW = 1;
const DEFAULT_BOTTOM_GAP = 16;

const DEFAULT_CONTAINER_HEIGHT = "calc(100dvh - 120px)";

const CONTAINER_STYLE = {
  width: "100%",
  height: DEFAULT_CONTAINER_HEIGHT,
  overflowY: "scroll",
  scrollSnapType: "y mandatory",
  WebkitOverflowScrolling: "touch",
  scrollbarWidth: "none",
  msOverflowStyle: "none",
  backgroundColor: "transparent",
  position: "relative",
  boxSizing: "border-box",
  borderRadius: "16px",
};

const ITEM_STYLE = {
  scrollSnapAlign: "start",
  scrollSnapStop: "always",
  width: "100%",
  height: DEFAULT_CONTAINER_HEIGHT,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  boxSizing: "border-box",
  position: "relative",
  overflow: "hidden",
};

const SENTINEL_STYLE = {
  height: "1px",
  width: "100%",
  position: "absolute",
  bottom: "100px",
};

const PLACEHOLDER_STYLE = {
  width: "100%",
  height: "100%",
  background: "transparent",
};

const getAncestorBottomPadding = (element) => {
  let current = element.parentElement;
  let largestPadding = 0;

  while (current && current !== document.body) {
    const computedStyle = window.getComputedStyle(current);
    if (computedStyle.position === "fixed") break;
    const paddingBottom = parseFloat(computedStyle.paddingBottom);
    if (Number.isFinite(paddingBottom)) {
      largestPadding = Math.max(largestPadding, paddingBottom);
    }
    current = current.parentElement;
  }

  return largestPadding;
};

const clampIndex = (index, length) => {
  if (length <= 0) return 0;
  return Math.min(Math.max(index, 0), length - 1);
};

const ReelScrollContainer = React.forwardRef(function ReelScrollContainer(
  {
    reels = [],
    onLoadMore,
    hasMore = true,
    isLoading = false,
    initialIndex = 0,
    children,
    onActiveIndexChange,
    renderWindow = DEFAULT_RENDER_WINDOW,
    preloadWindow = DEFAULT_PRELOAD_WINDOW,
    containerHeight = DEFAULT_CONTAINER_HEIGHT,
    bottomGap = DEFAULT_BOTTOM_GAP,
    isMobile = false,
    disableScroll = false,
    onClose,
  },
  ref,
) {
  const { t } = useLanguage();
  const containerRef = useRef(null);
  const sentinelRef = useRef(null);
  const activeIndexRef = useRef(initialIndex);
  const renderCenterIndexRef = useRef(initialIndex);
  const scrollRafRef = useRef(null);
  const syncRafRef = useRef(null);
  const measureRafRef = useRef(null);
  const scrollEndTimerRef = useRef(null);
  const hasSyncedInitialScrollRef = useRef(false);
  const [activeIndex, setActiveIndex] = useState(initialIndex);
  const [renderCenterIndex, setRenderCenterIndex] = useState(initialIndex);
  const [measuredContainerHeight, setMeasuredContainerHeight] = useState(null);

  const effectiveContainerHeight = measuredContainerHeight
    ? `${measuredContainerHeight}px`
    : containerHeight;

  const containerStyle = useMemo(
    () => ({
      ...CONTAINER_STYLE,
      height: effectiveContainerHeight,
      overflowY: disableScroll ? "hidden" : "scroll",
      ...(isMobile ? { borderRadius: 0 } : {}),
    }),
    [effectiveContainerHeight, isMobile, disableScroll],
  );

  const itemStyle = useMemo(
    () => ({
      ...ITEM_STYLE,
      height: effectiveContainerHeight,
    }),
    [effectiveContainerHeight],
  );

  const trailingSlideCount = (isLoading ? 1 : 0) + (!hasMore ? 1 : 0);
  const snapItemCount = reels.length + trailingSlideCount;

  useEffect(() => {
    if (typeof window === "undefined") return;

    let lastWidth = window.innerWidth;

    const measureAvailableHeight = () => {
      const container = containerRef.current;
      if (!container) return;

      const currentWidth = window.innerWidth;
      const isWidthChanged = currentWidth !== lastWidth;
      lastWidth = currentWidth;

      const isInputFocused =
        document.activeElement &&
        ["INPUT", "TEXTAREA"].includes(document.activeElement.tagName);

      // Ignore height changes caused by the virtual keyboard opening on mobile,
      // unless the device was also rotated.
      if (isInputFocused && !isWidthChanged) {
        return;
      }

      const viewportHeight = window.innerHeight;
      const { top } = container.getBoundingClientRect();
      const reservedBottomSpace = Math.max(
        bottomGap,
        getAncestorBottomPadding(container),
      );
      const nextHeight = Math.max(
        1,
        Math.floor(viewportHeight - Math.max(top, 0) - reservedBottomSpace),
      );

      setMeasuredContainerHeight((currentHeight) => {
        if (
          currentHeight !== null &&
          Math.abs(currentHeight - nextHeight) <= 1
        ) {
          return currentHeight;
        }
        return nextHeight;
      });
    };

    const scheduleMeasure = () => {
      if (measureRafRef.current !== null) return;
      measureRafRef.current = window.requestAnimationFrame(() => {
        measureRafRef.current = null;
        measureAvailableHeight();
      });
    };

    measureAvailableHeight();
    scheduleMeasure();
    const settleTimer = window.setTimeout(scheduleMeasure, 350);
    const visualViewport = window.visualViewport;

    window.addEventListener("resize", scheduleMeasure);
    window.addEventListener("orientationchange", scheduleMeasure);
    window.addEventListener("scroll", scheduleMeasure, { passive: true });
    visualViewport?.addEventListener("resize", scheduleMeasure);
    visualViewport?.addEventListener("scroll", scheduleMeasure);

    return () => {
      window.clearTimeout(settleTimer);
      window.removeEventListener("resize", scheduleMeasure);
      window.removeEventListener("orientationchange", scheduleMeasure);
      window.removeEventListener("scroll", scheduleMeasure);
      visualViewport?.removeEventListener("resize", scheduleMeasure);
      visualViewport?.removeEventListener("scroll", scheduleMeasure);

      if (measureRafRef.current !== null) {
        window.cancelAnimationFrame(measureRafRef.current);
        measureRafRef.current = null;
      }
    };
  }, [bottomGap]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || reels.length === 0) return;

    const height = container.clientHeight;
    if (height <= 0) return;

    const expectedScrollTop = activeIndexRef.current * height;
    if (Math.abs(container.scrollTop - expectedScrollTop) > 2) {
      container.scrollTop = expectedScrollTop;
    }
  }, [effectiveContainerHeight, reels.length]);

  const commitActiveIndex = useCallback(
    (nextIndex) => {
      if (snapItemCount === 0) return;

      const safeIndex = clampIndex(nextIndex, snapItemCount);
      if (safeIndex === activeIndexRef.current) return;

      activeIndexRef.current = safeIndex;
      renderCenterIndexRef.current = safeIndex;
      setActiveIndex(safeIndex);
      setRenderCenterIndex(safeIndex);
      if (safeIndex < reels.length) {
        onActiveIndexChange?.(safeIndex);
      }
    },
    [onActiveIndexChange, reels.length, snapItemCount],
  );

  // Sync scroll position to match initialIndex (on mount or browser back/forward)
  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container || reels.length === 0) return;

    const height = container.clientHeight;
    if (height <= 0) return;

    const safeInitialIndex = clampIndex(initialIndex, reels.length);
    const isInternalUrlSync =
      hasSyncedInitialScrollRef.current &&
      safeInitialIndex === activeIndexRef.current;

    if (isInternalUrlSync) return;

    activeIndexRef.current = safeInitialIndex;
    renderCenterIndexRef.current = safeInitialIndex;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setActiveIndex(safeInitialIndex);
    setRenderCenterIndex(safeInitialIndex);

    const expectedScrollTop = safeInitialIndex * height;
    if (Math.abs(container.scrollTop - expectedScrollTop) > 2) {
      container.scrollTop = expectedScrollTop;
    }
    hasSyncedInitialScrollRef.current = true;
  }, [initialIndex, reels.length]);

  const updateActiveIndexFromScroll = useCallback(
    (container, forceCommit = false) => {
      const height = container.clientHeight;
      if (height <= 0 || snapItemCount === 0) return;

      const rawIndex = container.scrollTop / height;
      const nearestIndex = clampIndex(Math.round(rawIndex), snapItemCount);
      const visibleRatio = 1 - Math.min(1, Math.abs(rawIndex - nearestIndex));

      if (nearestIndex !== renderCenterIndexRef.current) {
        renderCenterIndexRef.current = nearestIndex;
        setRenderCenterIndex(nearestIndex);
      }

      if (forceCommit || visibleRatio >= ACTIVE_SNAP_VISIBLE_RATIO) {
        commitActiveIndex(nearestIndex);
      }
    },
    [commitActiveIndex, snapItemCount],
  );

  // Fired when scroll-snap finishes — guarantees active index is committed
  const handleScrollEnd = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;
    updateActiveIndexFromScroll(container, true);
  }, [updateActiveIndexFromScroll]);

  const handleScroll = useCallback(
    (e) => {
      const container = e.currentTarget;
      if (scrollRafRef.current !== null) return;

      scrollRafRef.current = window.requestAnimationFrame(() => {
        scrollRafRef.current = null;
        updateActiveIndexFromScroll(container);
      });

      // Debounced fallback for browsers without native scrollend support
      if (scrollEndTimerRef.current !== null) {
        window.clearTimeout(scrollEndTimerRef.current);
      }
      scrollEndTimerRef.current = window.setTimeout(() => {
        scrollEndTimerRef.current = null;
        handleScrollEnd();
      }, 150);
    },
    [updateActiveIndexFromScroll, handleScrollEnd],
  );

  // Attach native scrollend event for reliable snap detection
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener("scrollend", handleScrollEnd);
    return () => container.removeEventListener("scrollend", handleScrollEnd);
  }, [handleScrollEnd]);

  useEffect(() => {
    const scrollRaf = scrollRafRef.current;
    const syncRaf = syncRafRef.current;
    const measureRaf = measureRafRef.current;
    const scrollEndTimer = scrollEndTimerRef.current;

    return () => {
      if (scrollRaf !== null) {
        window.cancelAnimationFrame(scrollRaf);
      }
      if (syncRaf !== null) {
        window.cancelAnimationFrame(syncRaf);
      }
      if (measureRaf !== null) {
        window.cancelAnimationFrame(measureRaf);
      }
      if (scrollEndTimer !== null) {
        window.clearTimeout(scrollEndTimer);
      }
    };
  }, []);

  // Setup infinite scroll observer to fetch more reels close to the end
  useEffect(() => {
    if (!onLoadMore || !hasMore || isLoading) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) onLoadMore();
      },
      { root: containerRef.current, rootMargin: "300px", threshold: 0.1 },
    );
    const sentinel = sentinelRef.current;
    if (sentinel) observer.observe(sentinel);
    return () => {
      if (sentinel) observer.unobserve(sentinel);
    };
  }, [onLoadMore, hasMore, isLoading, reels.length]);

  useImperativeHandle(
    ref,
    () => ({
      scrollToIndex: (index) => {
        const container = containerRef.current;
        if (!container || reels.length === 0) return;
        const safeIndex = clampIndex(index, snapItemCount - 1);
        const expectedScrollTop = safeIndex * container.clientHeight;
        container.scrollTo({ top: expectedScrollTop, behavior: "smooth" });
      },
      scrollToNext: () => {
        const container = containerRef.current;
        if (!container || reels.length === 0) return;
        const nextIndex = clampIndex(
          activeIndexRef.current + 1,
          snapItemCount - 1,
        );
        container.scrollTo({
          top: nextIndex * container.clientHeight,
          behavior: "smooth",
        });
      },
      scrollToPrev: () => {
        const container = containerRef.current;
        if (!container || reels.length === 0) return;
        const prevIndex = clampIndex(
          activeIndexRef.current - 1,
          snapItemCount - 1,
        );
        container.scrollTo({
          top: prevIndex * container.clientHeight,
          behavior: "smooth",
        });
      },
    }),
    [reels.length, snapItemCount],
  );

  return (
    <div
      ref={containerRef}
      className="w-full overflow-y-auto snap-y snap-mandatory bg-transparent scrollbar-hidden"
      style={containerStyle}
      onScroll={handleScroll}
    >
      {/* Render actual reels list */}
      {reels.map((reel, index) => {
        const isActive = index === activeIndex;
        const distanceFromActive = Math.abs(index - activeIndex);
        const distanceFromRenderCenter = Math.abs(index - renderCenterIndex);
        const shouldRender =
          distanceFromActive <= renderWindow ||
          distanceFromRenderCenter <= renderWindow;
        const shouldPreload =
          distanceFromActive <= preloadWindow ||
          distanceFromRenderCenter <= preloadWindow;

        return (
          <div
            key={reel.id || index}
            className="reel-scroll-item"
            style={itemStyle}
            data-reel-index={index}
          >
            {shouldRender && typeof children === "function" ? (
              children(reel, index, isActive, {
                activeIndex,
                shouldPreload,
                shouldRender,
              })
            ) : (
              <div style={PLACEHOLDER_STYLE} aria-hidden="true" />
            )}
          </div>
        );
      })}

      {/* Infinite Scroll Sentinel element */}
      {hasMore && !isLoading && (
        <div ref={sentinelRef} style={SENTINEL_STYLE} />
      )}

      {/* Minimal loading indicator slide at the end */}
      {isLoading && (
        <div
          style={{
            ...itemStyle,
            flexDirection: "column",
            gap: "12px",
            background: "transparent",
          }}
        >
          <Loader2
            className="animate-spin"
            style={{
              width: "40px",
              height: "40px",
              color: "#990011",
            }}
          />
          <span
            style={{ color: "#4b5563", fontSize: "14px", fontWeight: "500" }}
          >
            Loading more reels...
          </span>
        </div>
      )}

      {/* Premium End of Feed Message Slide */}
      {!hasMore && (
        <div
          style={{
            ...itemStyle,
            flexDirection: "column",
            gap: "16px",
            background: "#fafafa",
            color: "#1a1a1a",
          }}
        >
          {isMobile && onClose && (
            <div className="absolute top-6 left-4 z-20">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onClose();
                }}
                className="w-10 h-10 rounded-full bg-white flex items-center justify-center cursor-pointer transition-colors duration-200 border border-gray-200 shadow-[0_2px_8px_rgba(0,0,0,0.08)] hover:bg-gray-50"
                aria-label="Back"
              >
                <ChevronLeft size={24} className="text-gray-700" />
              </button>
            </div>
          )}
          <div
            style={{
              width: "64px",
              height: "64px",
              borderRadius: "50%",
              background: "#fef2f2",
              border: "1px solid #fca5a5",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#990011",
            }}
          >
            <svg
              style={{ width: "32px", height: "32px" }}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          </div>
          <span
            style={{ fontSize: "18px", fontWeight: "600", color: "#111827" }}
          >
            {t?.catSpeak?.reels?.detail?.caughtUp || "You're all caught up"}
          </span>
          <span style={{ fontSize: "14px", color: "#4b5563" }}>
            {t?.catSpeak?.reels?.detail?.watchedAll ||
              "You've watched all the available reels"}
          </span>
        </div>
      )}
    </div>
  );
});

export default ReelScrollContainer;
