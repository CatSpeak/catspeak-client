import { useCallback, useState, useMemo } from "react"
import { useNavigate } from "react-router-dom"
import { useLanguage } from "@/shared/context/LanguageContext"
import { useAuth } from "@/features/auth"
import { useAuthModal } from "@/shared/context/AuthModalContext"
import toast from "react-hot-toast"
import { mapReelDtoToFrontend } from "./utils/mappers"
import ReelTagBar from "./components/ReelTagBar"
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

const ReelsPage = () => {
  const { t } = useLanguage()
  const navigate = useNavigate()
  const [isUploadOpen, setIsUploadOpen] = useState(false)
  const { isAuthenticated } = useAuth()
  const { openAuthModal } = useAuthModal()

  // State management for filters and challenge selections
  const [activeFilter, setActiveFilter] = useState("foryou") // 'foryou', 'active', 'past'
  const [selectedChallenge, setSelectedChallenge] = useState(null) // ChallengeDto or 'all'/'all_past' or null

  // Fetch standard feed
  const { data: feedResponse, isLoading: isFeedLoading } = useGetReelsFeedQuery()

  // Fetch active/past challenges lists
  const { data: activeChallengesResponse } = useGetActiveChallengesQuery()
  const { data: pastChallengesResponse } = useGetPastChallengesQuery()

  const activeChallenges = activeChallengesResponse?.data || []
  const pastChallenges = pastChallengesResponse?.data || []

  // Check if a specific challenge object with challengeId is selected
  const hasSpecificChallenge = useMemo(() => {
    return (
      selectedChallenge &&
      typeof selectedChallenge === "object" &&
      selectedChallenge.challengeId
    )
  }, [selectedChallenge])

  // Fetch reels associated with a specific challenge
  const {
    data: challengeReelsResponse,
    isLoading: isChallengeReelsLoading,
  } = useGetReelsByChallengeQuery(
    { challengeId: selectedChallenge?.challengeId },
    { skip: !hasSpecificChallenge }
  )

  // Fetch leaderboard ranking list for the selected challenge
  const {
    data: leaderboardResponse,
    isLoading: isLeaderboardLoading,
  } = useGetChallengeLeaderboardQuery(
    { challengeId: selectedChallenge?.challengeId },
    { skip: !hasSpecificChallenge }
  )

  // Determine display reels based on the selected filters
  const displayReels = useMemo(() => {
    const feedReels = feedResponse?.data ? feedResponse.data.map(mapReelDtoToFrontend) : []

    if (activeFilter === "foryou") {
      return feedReels
    }

    if (activeFilter === "active") {
      if (selectedChallenge === "all" || !selectedChallenge) {
        // Filter feed reels containing hashtags of any active challenge
        const activeHashtags = activeChallenges
          .map((c) => c.hashtag?.replace("#", "").toLowerCase())
          .filter(Boolean)

        return feedReels.filter((reel) =>
          reel.tags.some((tag) => activeHashtags.includes(tag.toLowerCase()))
        )
      }

      // Show reels from specific active challenge reels endpoint
      return challengeReelsResponse?.data
        ? challengeReelsResponse.data.map(mapReelDtoToFrontend)
        : []
    }

    if (activeFilter === "past") {
      if (selectedChallenge === "all_past" || !selectedChallenge) {
        // Filter feed reels containing hashtags of any past challenge
        const pastHashtags = pastChallenges
          .map((c) => c.hashtag?.replace("#", "").toLowerCase())
          .filter(Boolean)

        return feedReels.filter((reel) =>
          reel.tags.some((tag) => pastHashtags.includes(tag.toLowerCase()))
        )
      }

      // Show reels from specific past challenge reels endpoint
      return challengeReelsResponse?.data
        ? challengeReelsResponse.data.map(mapReelDtoToFrontend)
        : []
    }

    return []
  }, [
    activeFilter,
    selectedChallenge,
    feedResponse,
    activeChallenges,
    pastChallenges,
    challengeReelsResponse,
  ])

  // Determine standard loading states
  const isLoading = useMemo(() => {
    if (activeFilter === "foryou") {
      return isFeedLoading
    }
    if (hasSpecificChallenge) {
      return isChallengeReelsLoading
    }
    return isFeedLoading
  }, [activeFilter, hasSpecificChallenge, isFeedLoading, isChallengeReelsLoading])

  const handleReelClick = useCallback(
    (reel) => {
      navigate(reel.id)
    },
    [navigate]
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
    setActiveFilter(filterType)
    setSelectedChallenge(challenge)
  }, [])

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
              <path strokeLinecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
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

    return (
      <div className={`bg-gradient-to-r ${bgGradient} rounded-2xl p-8 text-white shadow-md mb-8 flex flex-col md:flex-row justify-between items-center transition-all duration-300 gap-6`}>
        <div>
          <span className="bg-white/20 text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-3 inline-block">
            {tagText}
          </span>
          <h1 className="text-3xl font-bold mb-2">{titleText}</h1>
          <p className="text-lg opacity-95">{descText}</p>
        </div>
        <div className="flex flex-col space-y-3 shrink-0 w-full md:w-auto">
          <button
            onClick={handleUploadClick}
            className="bg-white text-[#990011] px-8 py-3 rounded-xl font-bold shadow-md hover:bg-gray-50 hover:scale-[1.03] transition-all transform w-full"
          >
            + {t.catSpeak.reels.uploadReel}
          </button>
          {showLearnMore && (
            <button className="bg-transparent border-2 border-white/70 text-white px-8 py-2.5 rounded-xl font-bold hover:bg-white/20 transition-all w-full">
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

          <div className="space-y-5">
            {isLeaderboardLoading ? (
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
                    className={`flex items-center justify-between p-3 rounded-lg border ${rank === 1 ? "bg-yellow-50 border-yellow-100" : "border-gray-50"
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
    <div className="flex flex-col gap-4">
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
          ) : (
            <ReelGrid reels={displayReels} onReelClick={handleReelClick} />
          )}
        </div>

        {activeFilter !== "foryou" && renderLeaderboard()}
      </div>

      {/* Creation Modal */}
      {isUploadOpen && (
        <CreateReelModal open={isUploadOpen} onClose={handleUploadClose} />
      )}
    </div>
  )
}

export default ReelsPage
