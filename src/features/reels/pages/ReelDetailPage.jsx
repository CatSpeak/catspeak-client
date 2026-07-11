import React, { useState, useRef, useCallback, useEffect, useMemo } from "react"
import { useParams, useNavigate, useSearchParams } from "react-router-dom"

import {
  X,
  Play,
  Heart,
  MessageCircle,
  Share,
  Bookmark,
  VolumeX,
  Volume1,
  Volume2,
  Maximize,
  Minimize,
  Loader2,
  ArrowUp,
  ArrowDown,
  RefreshCw,
} from "lucide-react"
import Avatar from "@/shared/components/ui/Avatar"
import ReelMoreMenu from "../components/detail/ReelMoreMenu"
import useReelDetail from "../hooks/useReelDetail"

import { useLanguage } from "@/shared/context/LanguageContext"
import {
  useGetReelsFeedQuery,
  useGetUserReelsQuery,
  useGetReelsByChallengeQuery,
  useGetChallengeLeaderboardQuery,
  useGetBookmarkedReelsQuery,
} from "@/store/api/reelsApi"
import { useAuth } from "@/features/auth"

import { mapReelDtoToFrontend } from "../utils/mappers"
import ReelScrollContainer from "../components/detail/ReelScrollContainer"
import ReelDetailSlide from "../components/detail/ReelDetailSlide"
import useMediaQuery from "@/shared/hooks/useMediaQuery"
import {
  REEL_MUTED_STORAGE_KEY,
  REEL_VOLUME_STORAGE_KEY,
  readStoredReelMuted,

  readStoredReelVolume,
  writeReelPreference
} from "../utils/preferences"
import ReelDetailSlideMobile from "../components/detail/ReelDetailSlideMobile"


const DETAIL_PAGE_SIZE = 20

/**
 * Shared snapped scroller for public Reels and the workspace-owned Reels list.
 */
export const ReelDetailPageBase = ({ source = "feed" } = {}) => {
  const { t } = useLanguage()
  const { id, lang } = useParams()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const isWorkspace = source === "workspace"
  const { user } = useAuth()
  const userId = user?.accountId
  const [feedPage, setFeedPage] = useState(1)
  
  const isMobile = useMediaQuery("(max-width: 768px)")

  const challengeIdParam = searchParams.get("challengeId") || undefined
  const challengeFilterParam = searchParams.get("challengeFilter") || undefined
  const playlistIdParam = searchParams.get("playlistId") || undefined

  const hasChallengeContext = useMemo(() => {
    return Boolean(challengeIdParam || challengeFilterParam)
  }, [challengeIdParam, challengeFilterParam])

  const isPlaylistMode = Boolean(playlistIdParam)

  // Track the initial deep-linked ID to keep the prepended list stable
  const [initialId, setInitialId] = useState(id)

  // Fetch the current single reel (deep-linked)
  const { reel: currentReel, isLoading: isDetailLoading, notFound, refetch: refetchDetail } = useReelDetail(initialId)

  // Fetch the general "For You" feed — skip when viewing a challenge or workspace or playlist.
  const {
    data: publicFeedResponse,
    isLoading: isPublicFeedLoading,
    isFetching: isPublicFeedFetching,
    refetch: refetchPublic,
  } = useGetReelsFeedQuery(undefined, { skip: isWorkspace || hasChallengeContext || isPlaylistMode })

  const sourceParam = searchParams.get("source") || undefined
  const isLeaderboard = sourceParam === "leaderboard"

  // Fetch challenge reels — only when navigated from a challenge tab, and NOT leaderboard.
  const {
    data: challengeFeedResponse,
    isLoading: isChallengeFeedLoading,
    isFetching: isChallengeFeedFetching,
    refetch: refetchChallenge,
  } = useGetReelsByChallengeQuery(
    {
      challengeId: challengeIdParam,
      challengeFilter: challengeFilterParam,
      page: feedPage,
      pageSize: DETAIL_PAGE_SIZE,
    },
    { skip: !hasChallengeContext || isWorkspace || isLeaderboard }
  )

  // Fetch leaderboard reels — only when navigated from the leaderboard tab.
  const {
    data: leaderboardResponse,
    isLoading: isLeaderboardLoading,
  } = useGetChallengeLeaderboardQuery(
    {
      challengeId: challengeIdParam,
      take: 50,
    },
    { skip: !isLeaderboard || !challengeIdParam }
  )

  const {
    data: workspaceFeedResponse,
    isLoading: isWorkspaceFeedLoading,
    isFetching: isWorkspaceFeedFetching,
    refetch: refetchWorkspace,
  } = useGetUserReelsQuery(
    { userId, page: feedPage, pageSize: DETAIL_PAGE_SIZE },
    { skip: !isWorkspace || !userId }
  )

  const {
    data: playlistFeedResponse,
    isLoading: isPlaylistFeedLoading,
    isFetching: isPlaylistFeedFetching,
    refetch: refetchPlaylist,
  } = useGetBookmarkedReelsQuery(
    playlistIdParam,
    { skip: !isPlaylistMode }
  )

  const feedResponse = isPlaylistMode
    ? playlistFeedResponse
    : isWorkspace
      ? workspaceFeedResponse
      : isLeaderboard
        ? leaderboardResponse
        : hasChallengeContext
          ? challengeFeedResponse
          : publicFeedResponse
  const isFeedLoading = isPlaylistMode
    ? isPlaylistFeedLoading
    : isWorkspace
      ? isWorkspaceFeedLoading
      : isLeaderboard
        ? isLeaderboardLoading
        : hasChallengeContext
          ? isChallengeFeedLoading
          : isPublicFeedLoading

  // Mapped reels list from the feed query
  const feedReels = useMemo(() => {
    if (isPlaylistMode && feedResponse) {
      // useGetBookmarkedReelsQuery returns an array directly
      let entries = []
      if (Array.isArray(feedResponse)) entries = feedResponse
      else if (Array.isArray(feedResponse.data)) entries = feedResponse.data
      return entries.map(mapReelDtoToFrontend)
    }

    if (isLeaderboard && feedResponse) {
        let entries = []
        if (Array.isArray(feedResponse)) entries = feedResponse
        else if (Array.isArray(feedResponse.data)) entries = feedResponse.data
        else if (Array.isArray(feedResponse.data?.entries)) entries = feedResponse.data.entries
        else if (Array.isArray(feedResponse.entries)) entries = feedResponse.entries

        return entries.filter(e => e.reel).map(e => mapReelDtoToFrontend(e.reel))
    }

    if (feedResponse?.data && feedResponse.data.length > 0) {
      return feedResponse.data.map(mapReelDtoToFrontend)
    }
    return []
  }, [feedResponse, isLeaderboard, isPlaylistMode])

  const [hiddenReelIds, setHiddenReelIds] = useState(new Set())
  useEffect(() => {
    const handler = (e) => setHiddenReelIds(prev => new Set([...prev, e.detail]))
    window.addEventListener('hideReel', handler)
    return () => window.removeEventListener('hideReel', handler)
  }, [])

  // Combine feed with the deep-linked currentReel.
  // If the reel is already in the feed, we replace it to ensure full data without destroying the playlist order.
  const combinedReels = useMemo(() => {
    let list = feedReels
    if (currentReel) {
      const existsInFeed = feedReels.some((r) => r.id === currentReel.id)
      if (!existsInFeed) {
        list = [currentReel, ...feedReels]
      } else {
        list = feedReels.map((r) => (r.id === currentReel.id ? currentReel : r))
      }
    }
    return list.filter(r => !hiddenReelIds.has(r.id))
  }, [currentReel, feedReels, hiddenReelIds])

  // Sync initialId if the URL ID changes to a reel not currently present in the list
  const hasReel = useMemo(() => {
    return combinedReels.some((r) => r.id === id)
  }, [combinedReels, id])

  useEffect(() => {
    if (id && !hasReel) {
      const timer = setTimeout(() => {
        setInitialId(id)
      }, 0)
      return () => clearTimeout(timer)
    }
  }, [id, hasReel])

  // Global shared volume state across slides
  const [sharedVolume, setSharedVolume] = useState(readStoredReelVolume)
  const [sharedMuted, setSharedMutedState] = useState(readStoredReelMuted)

  // Lifted state to persist comments drawer visibility across reels
  const [showComments, setShowComments] = useState(false)

  // Track whether the user has interacted with the page (for mobile autoplay policy)
  const hasUserInteracted = useRef(false)
  useEffect(() => {
    const markInteracted = () => {
      hasUserInteracted.current = true
      // Clean up after first interaction — we only need to detect it once
      document.removeEventListener("touchstart", markInteracted, true)
      document.removeEventListener("click", markInteracted, true)
      document.removeEventListener("scroll", markInteracted, true)
    }
    document.addEventListener("touchstart", markInteracted, { capture: true })
    document.addEventListener("click", markInteracted, { capture: true })
    document.addEventListener("scroll", markInteracted, { capture: true, passive: true })
    return () => {
      document.removeEventListener("touchstart", markInteracted, true)
      document.removeEventListener("click", markInteracted, true)
      document.removeEventListener("scroll", markInteracted, true)
    }
  }, [])

  const setSharedMuted = useCallback((muted, { persist = true } = {}) => {
    setSharedMutedState(muted)
    if (persist) {
      writeReelPreference(REEL_MUTED_STORAGE_KEY, muted)
    }
  }, [])

  // Save volume updates to local storage
  const handleVolumeChange = useCallback((vol) => {
    setSharedVolume(vol)
    writeReelPreference(REEL_VOLUME_STORAGE_KEY, vol)
  }, [])

  // Calculate the correct initial active index based on URL parameter ID
  const initialIndex = useMemo(() => {
    if (!id || combinedReels.length === 0) return 0
    const idx = combinedReels.findIndex((r) => r.id === id)
    return idx !== -1 ? idx : 0
  }, [combinedReels, id])

  const getListPath = useCallback(() => {
    return isWorkspace ? "/workspace/reels" : `/${lang}/cat-speak/reels`
  }, [isWorkspace, lang])

  const getDetailPath = useCallback((reelId) => {
    return isWorkspace ? `/workspace/reels/${reelId}` : `/${lang}/cat-speak/reels/${reelId}`
  }, [isWorkspace, lang])

  const handleClose = useCallback(() => {
    navigate(getListPath())
  }, [getListPath, navigate])

  // Dynamic URL Sync on scrolling
  const handleActiveIndexChange = useCallback((index) => {
    const activeReel = combinedReels[index]
    if (activeReel && activeReel.id !== id) {
      // Preserve challenge and playlist search params when scrolling between reels
      const queryStr = (hasChallengeContext || isPlaylistMode) ? `?${searchParams.toString()}` : ""
      navigate(getDetailPath(activeReel.id) + queryStr, { replace: true })
    }
  }, [combinedReels, getDetailPath, hasChallengeContext, isPlaylistMode, id, navigate, searchParams])

  const isFeedFetching = isWorkspace
    ? isWorkspaceFeedFetching
    : hasChallengeContext
      ? isChallengeFeedFetching
      : isPublicFeedFetching

  const hasMore = isWorkspace
    ? (workspaceFeedResponse?.lastPageCount || 0) >= DETAIL_PAGE_SIZE
    : hasChallengeContext
      ? (challengeFeedResponse?.data?.length || 0) >= DETAIL_PAGE_SIZE
      : (publicFeedResponse?.lastPageCount || 0) >= DETAIL_PAGE_SIZE

  const handleLoadMore = useCallback(() => {
    if (!hasMore || isFeedFetching) return
    setFeedPage((page) => page + 1)
  }, [hasMore, isFeedFetching])

  const isLoading = (isDetailLoading || isFeedLoading) && combinedReels.length === 0

  const scrollRef = useRef(null)

  const currentIndex = useMemo(() => {
    return combinedReels.findIndex((r) => r.id === id)
  }, [combinedReels, id])

  const isAtTop = currentIndex <= 0

  if (isLoading) {
    return (
      <div className="absolute inset-0 z-10 w-full h-full bg-[#f8f9fa] flex items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-cath-red-700" />
      </div>
    )
  }

  const isReelNotFound = notFound && !feedReels.some((r) => r.id === id)

  if (isReelNotFound || combinedReels.length === 0) {
    return (
      <div className="absolute inset-0 z-10 w-full h-full bg-[#f8f9fa] flex flex-col items-center justify-center py-15 px-5 text-lighttextGray text-center gap-3">
        <svg
          className="text-[#d4d4d4]"
          width="48"
          height="48"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polygon points="23 7 16 12 23 17 23 7" />
          <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
        </svg>
        <span className="text-[15px] font-medium text-[#525252]">{t?.catSpeak?.reels?.detail?.reelNotFound || "Reel not found"}</span>
        <span className="text-[13px] text-lighttextGray">
          {t?.catSpeak?.reels?.detail?.reelNotFoundDesc || "The reel you're looking for doesn't exist or has been removed."}
        </span>
        <button className="mt-3 px-6 py-2.5 rounded-lg text-sm font-semibold bg-cath-red-700 text-white border-none cursor-pointer transition-colors duration-200 hover:bg-[#7a000e]" onClick={handleClose}>
          {t?.catSpeak?.reels?.detail?.backToReels || "← Back to Reels"}
        </button>
      </div>
    )
  }

  return (
    <div className={`inset-0 w-full h-[100dvh] overflow-hidden flex flex-col ${isMobile ? "fixed z-[9999] bg-black" : "absolute z-10 bg-[#f8f9fa]"}`}>
      {/* Floating Close Button */}
      {!isMobile && (
        <button
          onClick={handleClose}
          className="absolute top-6 left-6 z-50 w-10 h-10 rounded-full bg-white shadow-[0_2px_8px_rgba(0,0,0,0.08)] flex items-center justify-center cursor-pointer transition-all hover:scale-105 hover:bg-gray-50 border border-gray-100"
          aria-label="Close"
        >
          <X size={20} className="text-gray-600" />
        </button>
      )}

      {/* Main Scroll Container */}
      <ReelScrollContainer
        ref={scrollRef}
        reels={combinedReels}
        initialIndex={initialIndex}
        hasMore={hasMore}
        isLoading={isFeedFetching && combinedReels.length > 0}
        onLoadMore={handleLoadMore}
        onActiveIndexChange={handleActiveIndexChange}
        containerHeight="100%"
        isMobile={isMobile}
        bottomGap={isMobile ? 0 : 16}
        disableScroll={isMobile && showComments}
        onClose={handleClose}
      >
        {(reel, index, isActive, preloadState = {}) => {
          const SlideComponent = isMobile ? ReelDetailSlideMobile : ReelDetailSlide
          return (
            <SlideComponent
              reel={reel}
              isActive={isActive}
              shouldPreload={preloadState.shouldPreload}
              onClose={handleClose}
              sharedMuted={sharedMuted}
              setSharedMuted={setSharedMuted}
              sharedVolume={sharedVolume}
              setSharedVolume={handleVolumeChange}
              hasUserInteracted={hasUserInteracted}
              showComments={showComments}
              setShowComments={setShowComments}
            />
          )
        }}
      </ReelScrollContainer>

      {/* Right Floating Navigation Controls */}
      {!isMobile && (
        <div className="absolute right-6 top-1/2 -translate-y-1/2 flex flex-col gap-3 z-50">
          <button
            onClick={() => scrollRef.current?.scrollToPrev()}
            disabled={isAtTop}
            className={`w-10 h-10 rounded-full bg-white shadow-[0_2px_8px_rgba(0,0,0,0.08)] flex items-center justify-center transition-all border border-gray-100 ${isAtTop ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:scale-105 hover:bg-gray-50"}`}
            aria-label="Previous reel"
          >
            <ArrowUp size={20} className="text-gray-600" />
          </button>
          <button
            onClick={() => scrollRef.current?.scrollToNext()}
            className="w-10 h-10 rounded-full bg-white shadow-[0_2px_8px_rgba(0,0,0,0.08)] flex items-center justify-center cursor-pointer transition-all hover:scale-105 hover:bg-gray-50 border border-gray-100"
            aria-label="Next reel"
          >
            <ArrowDown size={20} className="text-gray-600" />
          </button>
        </div>
      )}

      {/* Right Floating Refresh Control */}
      {!isMobile && (
        <div className="absolute right-6 bottom-6 z-50">
          <button
            onClick={() => {
              scrollRef.current?.scrollToIndex?.(0)
              setInitialId(id)
              setFeedPage(1)
              refetchDetail()
              if (isWorkspace) {
                refetchWorkspace()
              } else if (hasChallengeContext) {
                refetchChallenge()
              } else {
                refetchPublic()
              }
            }}
            className="w-10 h-10 rounded-full bg-white shadow-[0_2px_8px_rgba(0,0,0,0.08)] flex items-center justify-center cursor-pointer transition-all hover:scale-105 hover:bg-gray-50 border border-gray-100"
            aria-label="Refresh feed"
          >
            <RefreshCw size={20} className={`text-gray-600 ${isFeedFetching || isDetailLoading ? "animate-spin text-cath-red-600" : ""}`} />
          </button>
        </div>
      )}
    </div>
  )
}

const ReelDetailPage = () => <ReelDetailPageBase source="feed" />

export default ReelDetailPage
