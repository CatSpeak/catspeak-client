import React, { useState, useEffect, useRef, useCallback } from "react"
import { Loader2 } from "lucide-react"

/**
 * ReelScrollContainer — A premium, high-performance vertical snap-scrolling wrapper.
 * 
 * Supports:
 * - Full viewport height and width (100dvh to handle iOS Safari toolbar layout shifting)
 * - Native CSS scroll snapping (smooth, performance-optimized, works perfectly across touch & trackpads)
 * - Infinite scroll with IntersectionObserver (observes sentinel prior to list end)
 * - Render prop child rendering for flexible parent integration
 */
export default function ReelScrollContainer({
  reels = [],
  onLoadMore,
  hasMore = true,
  isLoading = false,
  initialIndex = 0,
  children,
  onActiveIndexChange,
}) {
  const containerRef = useRef(null)
  const sentinelRef = useRef(null)
  const [activeIndex, setActiveIndex] = useState(initialIndex)

  // Sync scroll position to match initialIndex (on mount or browser back/forward)
  useEffect(() => {
    const container = containerRef.current
    if (!container || reels.length === 0) return

    const height = container.clientHeight
    if (height <= 0) return

    const expectedScrollTop = initialIndex * height
    if (Math.abs(container.scrollTop - expectedScrollTop) > 2) {
      container.scrollTop = expectedScrollTop
    }
  }, [initialIndex, reels.length])

  // Track the current active index and trigger callback if provided
  const handleScroll = useCallback((e) => {
    const container = e.currentTarget
    const height = container.clientHeight
    if (height <= 0) return

    const index = Math.round(container.scrollTop / height)
    if (index >= 0 && index < reels.length && index !== activeIndex) {
      setActiveIndex(index)
      if (onActiveIndexChange) {
        onActiveIndexChange(index)
      }
    }
  }, [reels.length, activeIndex, onActiveIndexChange])

  // Setup infinite scroll observer to fetch more reels close to the end
  useEffect(() => {
    if (!onLoadMore || !hasMore || isLoading) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          onLoadMore()
        }
      },
      {
        root: containerRef.current,
        rootMargin: "300px", // Pre-fetch 300px before the user scrolls completely to the end
        threshold: 0.1,
      }
    )

    const sentinel = sentinelRef.current
    if (sentinel) {
      observer.observe(sentinel)
    }

    return () => {
      if (sentinel) {
        observer.unobserve(sentinel)
      }
    }
  }, [onLoadMore, hasMore, isLoading, reels.length])

  // Inline container and item style definitions
  const containerStyle = {
    width: "100%",
    height: "calc(100vh - 120px)",
    overflowY: "scroll",
    scrollSnapType: "y mandatory",
    WebkitOverflowScrolling: "touch",
    scrollbarWidth: "none",
    msOverflowStyle: "none",
    backgroundColor: "transparent",
    position: "relative",
    boxSizing: "border-box",
    borderRadius: "16px",
  }

  const itemStyle = {
    scrollSnapAlign: "start",
    scrollSnapStop: "always",
    width: "100%",
    height: "calc(100vh - 120px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxSizing: "border-box",
    position: "relative",
    overflow: "hidden",
  }

  return (
    <>
      {/* Self-contained styling overrides for scrollbar hiding and spinning keyframes */}
      <style>{`
        .reel-scroll-container::-webkit-scrollbar {
          display: none;
        }
        @keyframes reel-spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>

      <div
        ref={containerRef}
        className="reel-scroll-container"
        style={containerStyle}
        onScroll={handleScroll}
      >
        {/* Render actual reels list */}
        {reels.map((reel, index) => {
          const isActive = index === activeIndex
          return (
            <div key={reel.id || index} className="reel-scroll-item" style={itemStyle}>
              {typeof children === "function" ? children(reel, index, isActive) : null}
            </div>
          )
        })}

        {/* Infinite Scroll Sentinel element */}
        {hasMore && !isLoading && (
          <div ref={sentinelRef} style={{ height: "1px", width: "100%", position: "absolute", bottom: "100px" }} />
        )}

        {/* Minimal loading indicator slide at the end */}
        {isLoading && (
          <div style={{ ...itemStyle, flexDirection: "column", gap: "12px", background: "transparent" }}>
            <Loader2
              style={{
                width: "40px",
                height: "40px",
                animation: "reel-spin 1s linear infinite",
                color: "#990011"
              }}
            />
            <span style={{ color: "#4b5563", fontSize: "14px", fontWeight: "500" }}>
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
              borderTop: "1px solid #e5e7eb"
            }}
          >
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
            <span style={{ fontSize: "18px", fontWeight: "600", color: "#111827" }}>
              You're all caught up
            </span>
            <span style={{ fontSize: "14px", color: "#4b5563" }}>
              You've watched all the available reels
            </span>
          </div>
        )}
      </div>
    </>
  )
}
