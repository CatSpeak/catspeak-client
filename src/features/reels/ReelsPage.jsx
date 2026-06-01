import { useCallback, useState, useMemo, useEffect, useRef } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { Loader2 } from "lucide-react"
import { useLanguage } from "@/shared/context/LanguageContext"
import { useAuth } from "@/features/auth"
import { useAuthModal } from "@/shared/context/AuthModalContext"
import toast from "react-hot-toast"
import { mapReelDtoToFrontend } from "./utils/mappers"
import ReelTagBar from "./components/ReelTagBar"
import ReelCard from "./components/ReelCard"
import ReelGrid from "./components/ReelGrid"
import ReelGridSkeleton from "./components/ReelGridSkeleton"
import CreateReelModal from "./components/CreateReelModal"
import {
  useGetReelsFeedQuery,
  useGetActiveChallengesQuery,
  useGetPastChallengesQuery,
  useGetReelsByChallengeQuery,
  useGetChallengeLeaderboardQuery,
} from "@/store/api/reelsApi"

const CHALLENGE_FILTERS = {
  ALL: "All",
  ACTIVE: "Active_Challenge",
  PAST: "Past_Challenge",
}

const DEFAULT_CHALLENGE_PAGE = 1
const DEFAULT_CHALLENGE_PAGE_SIZE = 10

const normalizeChallengeFilter = (value) => {
  const filter = String(value || "").toLowerCase()

  if (filter === "all") return CHALLENGE_FILTERS.ALL
  if (filter === "active" || filter === "active_challenge") return CHALLENGE_FILTERS.ACTIVE
  if (filter === "past" || filter === "past_challenge") return CHALLENGE_FILTERS.PAST

  return null
}

const getPositiveIntegerParam = (value, fallback) => {
  const parsed = Number.parseInt(value, 10)
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback
}

const isChallengeObject = (challenge) =>
  challenge &&
  typeof challenge === "object" &&
  challenge.challengeId

const ReelsPage = () => {
  const { t } = useLanguage()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const [isUploadOpen, setIsUploadOpen] = useState(false)
  const { isAuthenticated } = useAuth()
  const { openAuthModal } = useAuthModal()

  const challengeIdParam = searchParams.get("challengeId")
  const challengeFilterParam = normalizeChallengeFilter(searchParams.get("challengeFilter"))
  const challengePage = getPositiveIntegerParam(searchParams.get("page"), DEFAULT_CHALLENGE_PAGE)
  const challengePageSize = getPositiveIntegerParam(
    searchParams.get("pageSize"),
    DEFAULT_CHALLENGE_PAGE_SIZE
  )

  // Fetch active/past challenges lists
  const { data: activeChallengesResponse } = useGetActiveChallengesQuery()
  const { data: pastChallengesResponse } = useGetPastChallengesQuery()

  const activeChallenges = useMemo(
    () => activeChallengesResponse?.data || [],
    [activeChallengesResponse]
  )
  const pastChallenges = useMemo(
    () => pastChallengesResponse?.data || [],
    [pastChallengesResponse]
  )

  const challengeFromUrl = useMemo(() => {
    if (!challengeIdParam) return null

    return (
      activeChallenges.find(
        (challenge) => String(challenge.challengeId) === String(challengeIdParam)
      ) ||
      pastChallenges.find(
        (challenge) => String(challenge.challengeId) === String(challengeIdParam)
      ) ||
      null
    )
  }, [activeChallenges, challengeIdParam, pastChallenges])

  const activeFilter = useMemo(() => {
    if (challengeFilterParam === CHALLENGE_FILTERS.ACTIVE) return "active"
    if (challengeFilterParam === CHALLENGE_FILTERS.PAST) return "past"

    if (challengeIdParam) {
      const isPastChallenge = pastChallenges.some(
        (challenge) => String(challenge.challengeId) === String(challengeIdParam)
      )

      return isPastChallenge ? "past" : "active"
    }

    if (challengeFilterParam === CHALLENGE_FILTERS.ALL) return "active"

    return "foryou"
  }, [challengeFilterParam, challengeIdParam, pastChallenges])

  const [feedPage, setFeedPage] = useState(1)

  useEffect(() => {
    setFeedPage(1)
  }, [activeFilter])

  const selectedChallenge = useMemo(() => {
    if (activeFilter === "foryou") return null

    if (challengeIdParam) {
      return challengeFromUrl || {
        challengeId: challengeIdParam,
        name: `Challenge #${challengeIdParam}`,
      }
    }

    return activeFilter === "past" ? "all_past" : "all"
  }, [activeFilter, challengeFromUrl, challengeIdParam])

  const hasSpecificChallenge = Boolean(challengeIdParam)
  const uploadChallenge = isChallengeObject(selectedChallenge) ? selectedChallenge : null

  // Fetch the standard feed only when the For You tab is visible.
  const {
    data: feedResponse,
    isLoading: isFeedLoading,
    isFetching: isFeedFetching,
  } = useGetReelsFeedQuery(
    { page: feedPage, pageSize: 20 },
    { skip: activeFilter !== "foryou" }
  )

  // Determine the challengeFilter value based on the active tab/filter
  const challengeFilter = useMemo(() => {
    if (activeFilter === "foryou") return undefined
    if (hasSpecificChallenge) return challengeFilterParam || CHALLENGE_FILTERS.ALL
    if (challengeFilterParam) return challengeFilterParam
    if (activeFilter === "active") return CHALLENGE_FILTERS.ACTIVE
    if (activeFilter === "past") return CHALLENGE_FILTERS.PAST
    return undefined
  }, [activeFilter, challengeFilterParam, hasSpecificChallenge])

  // Fetch reels associated with the selected challenge or filter state
  const {
    currentData: challengeReelsResponse,
    isLoading: isChallengeReelsLoading,
    isFetching: isChallengeReelsFetching,
  } = useGetReelsByChallengeQuery(
    {
      challengeId: hasSpecificChallenge ? challengeIdParam : undefined,
      challengeFilter,
      page: challengePage,
      pageSize: challengePageSize,
    },
    { skip: activeFilter === "foryou" }
  )

  // Fetch leaderboard ranking list for the selected challenge
  const {
    currentData: leaderboardResponse,
    isLoading: isLeaderboardLoading,
    isFetching: isLeaderboardFetching,
  } = useGetChallengeLeaderboardQuery(
    { challengeId: challengeIdParam },
    { skip: !hasSpecificChallenge }
  )

  const feedReels = useMemo(
    () => feedResponse?.data ? feedResponse.data.map(mapReelDtoToFrontend) : [],
    [feedResponse]
  )

  const challengeReels = useMemo(
    () => challengeReelsResponse?.data
      ? challengeReelsResponse.data.map(mapReelDtoToFrontend)
      : [],
    [challengeReelsResponse]
  )

  const challengeReelsByChallenge = useMemo(() => {
    const byId = new Map()
    const byHashtag = new Map()

    const addUnique = (map, key, reel) => {
      if (!key) return
      const normalizedKey = String(key).toLowerCase().replace(/^#/, "")
      const existing = map.get(normalizedKey)

      if (!existing) {
        map.set(normalizedKey, [reel])
        return
      }

      if (!existing.some((item) => item.id === reel.id)) {
        existing.push(reel)
      }
    }

    challengeReels.forEach((reel) => {
      if (Array.isArray(reel.connectedChallenges)) {
        reel.connectedChallenges.forEach((challenge) => {
          addUnique(byId, challenge.challengeId, reel)
        })
      }

      if (Array.isArray(reel.tags)) {
        reel.tags.forEach((tag) => addUnique(byHashtag, tag, reel))
      }
    })

    return { byId, byHashtag }
  }, [challengeReels])

  // Determine display reels based on the selected filters
  const displayReels = useMemo(() => {
    if (activeFilter === "foryou") {
      return feedReels
    }

    if (activeFilter === "active" || activeFilter === "past") {
      return challengeReels
    }

    return []
  }, [activeFilter, feedReels, challengeReels])

  // Group challengeReels by their challenge when no specific challenge is selected
  const reelsSections = useMemo(() => {
    if (hasSpecificChallenge) return null

    const currentChallenges = activeFilter === "active" ? activeChallenges : pastChallenges

    return currentChallenges.map((challenge) => {
      const idKey = String(challenge.challengeId).toLowerCase()
      const hashtagKey = challenge.hashtag
        ? String(challenge.hashtag).toLowerCase().replace(/^#/, "")
        : ""
      const reelsById = challengeReelsByChallenge.byId.get(idKey) || []
      const reelsByHashtag = challengeReelsByChallenge.byHashtag.get(hashtagKey) || []
      const idMatches = new Set(reelsById.map((reel) => reel.id))
      const reelsForChallenge = reelsByHashtag.length > 0
        ? [...reelsById, ...reelsByHashtag.filter((reel) => !idMatches.has(reel.id))]
        : reelsById

      return {
        challenge,
        reels: reelsForChallenge,
      }
    })
  }, [hasSpecificChallenge, activeFilter, activeChallenges, pastChallenges, challengeReelsByChallenge])

  // Determine standard loading states
  const isLoading = useMemo(() => {
    if (activeFilter === "foryou") {
      return isFeedLoading
    }
    return isChallengeReelsLoading || (isChallengeReelsFetching && !challengeReelsResponse)
  }, [
    activeFilter,
    isFeedLoading,
    isChallengeReelsLoading,
    isChallengeReelsFetching,
    challengeReelsResponse,
  ])

  const hasMore = useMemo(() => {
    if (activeFilter === "foryou") {
      return (feedResponse?.lastPageCount || 0) >= 20
    }
    return false
  }, [activeFilter, feedResponse])

  const handleLoadMore = useCallback(() => {
    if (!hasMore || isFeedFetching) return
    setFeedPage((prev) => prev + 1)
  }, [hasMore, isFeedFetching])

  const sentinelRef = useRef(null)

  useEffect(() => {
    if (activeFilter !== "foryou" || !hasMore || isFeedLoading) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          handleLoadMore()
        }
      },
      { threshold: 0.1 }
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
  }, [activeFilter, hasMore, isFeedLoading, handleLoadMore])

  const handleReelClick = useCallback(
    (reel) => {
      const queryString = activeFilter === "foryou" ? "" : searchParams.toString()
      navigate({
        pathname: reel.id,
        search: queryString ? `?${queryString}` : "",
      })
    },
    [activeFilter, navigate, searchParams]
  )

  const handleUploadClick = useCallback(() => {
    if (!isAuthenticated) {
      toast.error(t.catSpeak.reels.loginRequired || "Please log in to upload a Reel.")
      openAuthModal("login")
      return
    }
    setIsUploadOpen(true)
  }, [isAuthenticated, openAuthModal, t.catSpeak.reels.loginRequired])

  const handleUploadClose = useCallback(() => {
    setIsUploadOpen(false)
  }, [])

  const handleSelectFilter = useCallback((filterType, challenge) => {
    const nextParams = new URLSearchParams(searchParams)

    if (filterType === "foryou") {
      nextParams.delete("challengeId")
      nextParams.delete("challengeFilter")
      nextParams.delete("page")
      nextParams.delete("pageSize")
    } else {
      if (isChallengeObject(challenge)) {
        nextParams.set("challengeId", String(challenge.challengeId))
        nextParams.set("challengeFilter", CHALLENGE_FILTERS.ALL)
      } else {
        nextParams.delete("challengeId")
        nextParams.set(
          "challengeFilter",
          filterType === "past" ? CHALLENGE_FILTERS.PAST : CHALLENGE_FILTERS.ACTIVE
        )
      }

      nextParams.set("page", String(DEFAULT_CHALLENGE_PAGE))
      nextParams.set("pageSize", String(challengePageSize))
    }

    setSearchParams(nextParams, { preventScrollReset: true })
  }, [challengePageSize, searchParams, setSearchParams])

  // Render header banners dynamically matching mockup
  const renderBanner = () => {
    if (activeFilter === "foryou") {
      return (
        <div className="bg-gradient-to-r from-rose-50 to-orange-50 border border-orange-100 rounded-2xl p-8 mb-8 flex flex-col md:flex-row justify-between items-center shadow-sm relative overflow-hidden transition-all duration-300">
          <div className="mb-4 md:mb-0 relative z-10">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">{t.catSpeak.reels.createOwnReels}</h2>
            <p className="text-gray-600 mb-4">{t.catSpeak.reels.shareKnowledge}</p>
            <div className="flex items-center space-x-3">
              <span className="text-xs font-semibold text-gray-500 bg-white px-3 py-1.5 rounded-full shadow-sm border border-gray-100">{t.catSpeak.reels.formatLimit}</span>
              <span className="text-xs font-semibold text-gray-500 bg-white px-3 py-1.5 rounded-full shadow-sm border border-gray-100">{t.catSpeak.reels.sizeLimit}</span>
            </div>
          </div>
          <button
            onClick={handleUploadClick}
            className="bg-[#990011] text-white px-8 py-3.5 rounded-xl font-bold shadow-md hover:bg-[#80000e] hover:scale-[1.03] transition-all transform flex items-center space-x-2 shrink-0 relative z-10"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            <span>{t.catSpeak.reels.uploadReel}</span>
          </button>
        </div>
      )
    }

    const isPast = activeFilter === "past"
    const bgGradient = isPast ? "from-purple-600 to-blue-500" : "from-red-600 to-orange-500"

    let tagText = ""
    let titleText = ""
    let descText = ""
    let showLearnMore = false

    if (activeFilter === "active") {
      if (selectedChallenge === "all" || !selectedChallenge) {
        tagText = t.catSpeak.reels.allEvents
        titleText = t.catSpeak.reels.allActiveChallenges
        descText = t.catSpeak.reels.allActiveChallengesDesc
      } else {
        tagText = t.catSpeak.reels.activeEvent
        titleText = selectedChallenge.name || selectedChallenge.hashtag
        descText = selectedChallenge.description || t.catSpeak.reels.joinActiveChallengeDesc
        showLearnMore = true
      }
    } else {
      if (selectedChallenge === "all_past" || !selectedChallenge) {
        tagText = t.catSpeak.reels.pastEvents
        titleText = t.catSpeak.reels.allPastChallenges
        descText = t.catSpeak.reels.allPastChallengesDesc
      } else {
        tagText = t.catSpeak.reels.endedEvent
        titleText = selectedChallenge.name || selectedChallenge.hashtag
        descText = selectedChallenge.description || t.catSpeak.reels.pastChallengeDesc
        showLearnMore = true
      }
    }

    const hasBanner = hasSpecificChallenge && selectedChallenge?.bannerUrl
    const bannerUrl = hasBanner ? selectedChallenge.bannerUrl : null

    return (
      <div className="relative overflow-hidden rounded-2xl p-8 text-white shadow-md mb-8 flex flex-col md:flex-row justify-between items-center transition-all duration-300 gap-6 bg-gray-900 min-h-[220px]">
        {/* Background Layer */}
        {bannerUrl ? (
          <>
            <div
              className="absolute inset-0 bg-cover bg-center transition-all duration-500 transform hover:scale-[1.02]"
              style={{ backgroundImage: `url(${bannerUrl})` }}
            />
            {/* Dark premium overlay gradient to guarantee readability of white text on any background */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/85 via-black/60 to-black/40 md:bg-gradient-to-r md:from-black/85 md:via-black/55 md:to-black/35 transition-all duration-300" />
          </>
        ) : (
          <div className={`absolute inset-0 bg-gradient-to-r ${bgGradient} transition-all duration-500`} />
        )}

        {/* Content */}
        <div className="relative z-10 flex-1">
          <span className="bg-white/20 text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-3 inline-block backdrop-blur-sm border border-white/10">
            {tagText}
          </span>
          <h1 className="text-3xl font-extrabold mb-2 tracking-tight drop-shadow-sm">{titleText}</h1>
          <p className="text-base md:text-lg opacity-95 leading-relaxed drop-shadow-sm">{descText}</p>
        </div>

        {/* Actions */}
        <div className="relative z-10 flex flex-col space-y-3 shrink-0 w-full md:w-auto">
          {!isPast && (
            <button
              onClick={handleUploadClick}
              className="bg-white text-[#990011] px-8 py-3 rounded-xl font-bold shadow-md hover:bg-gray-50 hover:scale-[1.03] transition-all transform w-full"
            >
              + {t.catSpeak.reels.uploadReel}
            </button>
          )}
          {showLearnMore && (
            <button className="bg-transparent border-2 border-white/70 text-white px-8 py-2.5 rounded-xl font-bold hover:bg-white/20 transition-all w-full backdrop-blur-sm">
              {t.catSpeak.reels.learnMore}
            </button>
          )}
        </div>
      </div>
    )
  }

  // Render leaderboard side-panel dynamically matching mockup
  const renderLeaderboard = () => {
    const isPast = activeFilter === "past"
    const leaderboardEntries = leaderboardResponse || []

    return (
      <div className="w-full lg:w-1/3 block sticky top-28 transition-all duration-300">
        <div className="bg-white rounded-2xl shadow border border-gray-100 p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-extrabold text-gray-800">{t.catSpeak.reels.leaderboard}</h2>
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              {isPast ? t.catSpeak.reels.finalRanking : t.catSpeak.reels.thisWeek}
            </span>
          </div>

          <div className="space-y-1">
            {isLeaderboardLoading || (isLeaderboardFetching && !leaderboardResponse) ? (
              <div className="space-y-4 animate-pulse">
                {[1, 2, 3].map((n) => (
                  <div key={n} className="h-14 bg-gray-100 rounded-lg w-full" />
                ))}
              </div>
            ) : leaderboardEntries.length > 0 ? (
              leaderboardEntries.map((entry, idx) => {
                const rank = entry.rank || idx + 1
                const username = entry.reel?.nickname || entry.reel?.username || "Learner"
                const score = entry.score || 0

                let rankBadgeClass = ""
                if (rank === 1) rankBadgeClass = "from-yellow-400 to-yellow-600 text-white shadow-sm"
                else if (rank === 2) rankBadgeClass = "from-gray-300 to-gray-500 text-white shadow-sm"
                else if (rank === 3) rankBadgeClass = "from-orange-300 to-orange-500 text-white shadow-sm"
                else rankBadgeClass = "bg-gray-100 text-gray-600"

                return (
                  <div
                    key={idx}
                    className={`flex items-center justify-between p-3 rounded-lg ${rank === 1 ? "bg-yellow-50" : ""
                      }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`w-8 h-8 bg-gradient-to-br rounded-full flex items-center justify-center font-bold text-sm ${rankBadgeClass}`}>
                        {rank}
                      </div>
                      <span className={`font-semibold text-gray-800 ${rank === 1 ? "font-bold" : ""}`}>
                        @{username}
                      </span>
                    </div>
                    <span className={`text-sm font-extrabold ${rank === 1 ? "text-yellow-600" : "text-gray-500"}`}>
                      {score.toLocaleString()} pts
                    </span>
                  </div>
                )
              })
            ) : (
              <div className="text-center py-8 text-gray-400 text-sm italic">
                {t.catSpeak.reels.noRankings}
              </div>
            )}
          </div>

          <button className="w-full mt-6 py-2 text-sm font-bold text-[#990011] bg-red-50 rounded-lg hover:bg-red-100 transition-all duration-200">
            {t.catSpeak.reels.viewFullRanking}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col">
      {/* Dynamic Page Banner */}
      {renderBanner()}

      {/* Tag filter bar */}
      <ReelTagBar
        activeFilter={activeFilter}
        selectedChallenge={selectedChallenge}
        activeChallenges={activeChallenges}
        pastChallenges={pastChallenges}
        onSelectFilter={handleSelectFilter}
      />

      {/* Grid or loading skeleton with Side-by-Side Leaderboard support */}
      <div className="flex flex-col lg:flex-row gap-8 relative items-start">
        <div
          className={`w-full transition-all duration-300 ${activeFilter === "foryou" ? "w-full" : "lg:w-2/3"
            }`}
        >
          {isLoading ? (
            <ReelGridSkeleton />
          ) : activeFilter !== "foryou" && !hasSpecificChallenge ? (
            /* Render Grouped Challenges Sections */
            <div className="flex flex-col w-full">
              {reelsSections && reelsSections.length > 0 ? (
                reelsSections.map(({ challenge, reels }) => (
                  <div key={challenge.challengeId} className="mb-10 bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-all duration-300">
                    {/* Section Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 pb-4 border-b border-gray-50 gap-4">
                      <div>
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="text-xl">🏆</span>
                          <h3 className="text-lg font-bold text-gray-800 hover:text-[#990011] transition-colors cursor-pointer" onClick={() => handleSelectFilter(activeFilter, challenge)}>
                            {challenge.name || challenge.hashtag}
                          </h3>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${challenge.status === 'active'
                            ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                            : 'bg-gray-100 text-gray-500 border border-gray-200'
                            }`}>
                            {challenge.status}
                          </span>
                        </div>
                        <p className="text-xs text-gray-400 font-semibold mb-2">
                          {challenge.hashtag}
                        </p>
                        {challenge.description && (
                          <p className="text-sm text-gray-600 line-clamp-2">
                            {challenge.description}
                          </p>
                        )}
                      </div>

                      {/* View Challenge Button */}
                      <button
                        onClick={() => handleSelectFilter(activeFilter, challenge)}
                        className="text-xs font-bold text-white bg-[#990011] hover:bg-[#80000e] px-4 py-2 rounded-lg transition-all shrink-0 flex items-center space-x-1 hover:scale-[1.02] active:scale-[0.98]"
                      >
                        <span>{t.catSpeak.reels.viewMore || "View More"}</span>
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    </div>

                    {/* Section Content */}
                    {reels.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
                        {reels.slice(0, 4).map((reel, idx) => (
                          <ReelCard
                            key={reel.id}
                            reel={reel}
                            index={idx}
                            onSelect={handleReelClick}
                          />
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                        <svg className="w-8 h-8 text-gray-300 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                        <p className="text-xs font-semibold text-gray-400">
                          {t.catSpeak.reels.noReelsFound || "No submissions yet."}
                        </p>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center py-12 bg-gray-50 rounded-2xl border border-gray-100">
                  <span className="text-3xl block mb-2">🎈</span>
                  <p className="text-sm font-semibold text-gray-500">{t.catSpeak.reels.noActiveChallenges || "No challenges found."}</p>
                </div>
              )}
            </div>
          ) : (
            /* Render Standard Flat Grid */
            <div className="flex flex-col w-full">
              <ReelGrid reels={displayReels} onReelClick={handleReelClick} />
              {activeFilter === "foryou" && hasMore && (
                <div ref={sentinelRef} className="h-20 w-full flex items-center justify-center mt-6">
                  {isFeedFetching && (
                    <Loader2 className="h-8 w-8 animate-spin text-[#990011]" />
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {activeFilter !== "foryou" && renderLeaderboard()}
      </div>

      {/* Creation Modal */}
      {isUploadOpen && (
        <CreateReelModal
          open={isUploadOpen}
          onClose={handleUploadClose}
          challenge={uploadChallenge}
        />
      )}
    </div>
  )
}

export default ReelsPage
