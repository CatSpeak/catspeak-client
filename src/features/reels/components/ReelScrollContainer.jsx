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
const ACTIVE_SNAP_VISIBLE_RATIO = 0.92
const DEFAULT_RENDER_WINDOW = 2
const DEFAULT_PRELOAD_WINDOW = 1

const CONTAINER_STYLE = {
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

const ITEM_STYLE = {
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

const SENTINEL_STYLE = {
  height: "1px",
  width: "100%",
  position: "absolute",
  bottom: "100px",
}

const PLACEHOLDER_STYLE = {
  width: "100%",
  height: "100%",
  background: "#000",
}

const clampIndex = (index, length) => {
  if (length <= 0) return 0
  return Math.min(Math.max(index, 0), length - 1)
}

export default function ReelScrollContainer({
  reels = [],
  onLoadMore,
  hasMore = true,
  isLoading = false,
  initialIndex = 0,
  children,
  onActiveIndexChange,
  renderWindow = DEFAULT_RENDER_WINDOW,
  preloadWindow = DEFAULT_PRELOAD_WINDOW,
}) {
  const containerRef = useRef(null)
  const sentinelRef = useRef(null)
  const activeIndexRef = useRef(initialIndex)
  const renderCenterIndexRef = useRef(initialIndex)
  const scrollRafRef = useRef(null)
  const syncRafRef = useRef(null)
  const hasSyncedInitialScrollRef = useRef(false)
  const [activeIndex, setActiveIndex] = useState(initialIndex)
  const [renderCenterIndex, setRenderCenterIndex] = useState(initialIndex)

  const commitActiveIndex = useCallback((nextIndex) => {
    if (reels.length === 0) return

    const safeIndex = clampIndex(nextIndex, reels.length)
    if (safeIndex === activeIndexRef.current) return

    activeIndexRef.current = safeIndex
    renderCenterIndexRef.current = safeIndex
    setActiveIndex(safeIndex)
    setRenderCenterIndex(safeIndex)
    onActiveIndexChange?.(safeIndex)
  }, [onActiveIndexChange, reels.length])

  // Sync scroll position to match initialIndex (on mount or browser back/forward)
  useEffect(() => {
    const container = containerRef.current
    if (!container || reels.length === 0) return

    const height = container.clientHeight
    if (height <= 0) return

    const safeInitialIndex = clampIndex(initialIndex, reels.length)
    const isInternalUrlSync =
      hasSyncedInitialScrollRef.current &&
      safeInitialIndex === activeIndexRef.current

    if (isInternalUrlSync) return

    activeIndexRef.current = safeInitialIndex
    renderCenterIndexRef.current = safeInitialIndex

    if (syncRafRef.current !== null) {
      window.cancelAnimationFrame(syncRafRef.current)
    }

    syncRafRef.current = window.requestAnimationFrame(() => {
      syncRafRef.current = null
      setActiveIndex(safeInitialIndex)
      setRenderCenterIndex(safeInitialIndex)
    })

    const expectedScrollTop = safeInitialIndex * height
    if (Math.abs(container.scrollTop - expectedScrollTop) > 2) {
      container.scrollTop = expectedScrollTop
    }
    hasSyncedInitialScrollRef.current = true

    return () => {
      if (syncRafRef.current !== null) {
        window.cancelAnimationFrame(syncRafRef.current)
        syncRafRef.current = null
      }
    }
  }, [initialIndex, reels.length])

  const updateActiveIndexFromScroll = useCallback((container) => {
    const height = container.clientHeight
    if (height <= 0 || reels.length === 0) return

    const rawIndex = container.scrollTop / height
    const nearestIndex = clampIndex(Math.round(rawIndex), reels.length)
    const visibleRatio = 1 - Math.min(1, Math.abs(rawIndex - nearestIndex))

    if (nearestIndex !== renderCenterIndexRef.current) {
      renderCenterIndexRef.current = nearestIndex
      setRenderCenterIndex(nearestIndex)
    }

    if (visibleRatio >= ACTIVE_SNAP_VISIBLE_RATIO) {
      commitActiveIndex(nearestIndex)
    }
  }, [commitActiveIndex, reels.length])

  const handleScroll = useCallback((e) => {
    const container = e.currentTarget
    if (scrollRafRef.current !== null) return

    scrollRafRef.current = window.requestAnimationFrame(() => {
      scrollRafRef.current = null
      updateActiveIndexFromScroll(container)
    })
  }, [updateActiveIndexFromScroll])

  useEffect(() => {
    return () => {
      if (scrollRafRef.current !== null) {
        window.cancelAnimationFrame(scrollRafRef.current)
      }
      if (syncRafRef.current !== null) {
        window.cancelAnimationFrame(syncRafRef.current)
      }
    }
  }, [])

  // Setup infinite scroll observer to fetch more reels close to the end
  useEffect(() => {
    if (!onLoadMore || !hasMore || isLoading) return
    const observer = new IntersectionObserver(
      (entries) => { if (entries[0].isIntersecting) onLoadMore() },
      { root: containerRef.current, rootMargin: "300px", threshold: 0.1 }
    )
    const sentinel = sentinelRef.current
    if (sentinel) observer.observe(sentinel)
    return () => { if (sentinel) observer.unobserve(sentinel) }
  }, [onLoadMore, hasMore, isLoading, reels.length])

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
        style={CONTAINER_STYLE}
        onScroll={handleScroll}
      >
        {/* Render actual reels list */}
        {reels.map((reel, index) => {
          const isActive = index === activeIndex
          const distanceFromActive = Math.abs(index - activeIndex)
          const distanceFromRenderCenter = Math.abs(index - renderCenterIndex)
          const shouldRender =
            distanceFromActive <= renderWindow ||
            distanceFromRenderCenter <= renderWindow
          const shouldPreload =
            distanceFromActive <= preloadWindow ||
            distanceFromRenderCenter <= preloadWindow

          return (
            <div
              key={reel.id || index}
              className="reel-scroll-item"
              style={ITEM_STYLE}
              data-reel-index={index}
            >
              {shouldRender && typeof children === "function"
                ? children(reel, index, isActive, {
                  activeIndex,
                  shouldPreload,
                  shouldRender,
                })
                : <div style={PLACEHOLDER_STYLE} aria-hidden="true" />}
            </div>
          )
        })}

        {/* Infinite Scroll Sentinel element */}
        {hasMore && !isLoading && (
          <div ref={sentinelRef} style={SENTINEL_STYLE} />
        )}

        {/* Minimal loading indicator slide at the end */}
        {isLoading && (
          <div style={{ ...ITEM_STYLE, flexDirection: "column", gap: "12px", background: "transparent" }}>
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
              ...ITEM_STYLE,
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
