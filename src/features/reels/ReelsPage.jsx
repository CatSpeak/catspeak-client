import { useCallback, useState } from "react"
import { useNavigate, useSearchParams, Outlet, useParams } from "react-router-dom"
import { useMediaQuery } from "@/shared/hooks/useMediaQuery"
import { useLanguage } from "@/shared/context/LanguageContext"
import { useAuth } from "@/features/auth"
import { useAuthModal } from "@/shared/context/AuthModalContext"
import toast from "react-hot-toast"
import Breadcrumb from "@/shared/components/ui/navigation/Breadcrumb"
import ReelTagBar from "./components/navigation/ReelTagBar"
import CreateReelModal from "./components/modals/CreateReelModal"
import ForYouTab from "./components/tabs/ForYouTab"
import ChallengesTab from "./components/tabs/ChallengesTab"
import LeaderboardTab from "./components/tabs/LeaderboardTab"

const ReelsPage = () => {
  const { t } = useLanguage()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [searchQuery, setSearchQuery] = useState("")
  const [isUploadOpen, setIsUploadOpen] = useState(false)
  const [uploadChallenge, setUploadChallenge] = useState(null)
  const { isAuthenticated } = useAuth()
  const { openAuthModal } = useAuthModal()
    const { id } = useParams()

  // State for Tabs
  const [activeTab, setActiveTab] = useState("foryou") // "foryou" | "challenges" | "leaderboard"
  const [challengeStatus, setChallengeStatus] = useState("active") // "active" | "past"
  const [challengeId, setChallengeId] = useState(null)
  const [showMobileDetail, setShowMobileDetail] = useState(false)
  const isLg = useMediaQuery("(min-width: 1024px)")

  const handleReelClick = useCallback(
    (reel) => {
      if (!reel || !reel.id) return
      
      // Use query string to allow back navigation to the same state
      const newSearchParams = new URLSearchParams(searchParams)
      
      // If we are viewing a specific challenge, pass it to the detail page
      if ((activeTab === "challenges" || activeTab === "leaderboard") && challengeId) {
        newSearchParams.set("challengeId", challengeId)
        if (activeTab === "leaderboard") {
          newSearchParams.set("source", "leaderboard")
        }
      }

      const queryString = newSearchParams.toString()
      navigate({
        pathname: String(reel.id),
        search: queryString ? `?${queryString}` : "",
      })
    },
    [navigate, searchParams, activeTab, challengeId],
  )

  const handleUploadClick = useCallback((challengeObj = null) => {
    if (!isAuthenticated) {
      toast.error(
        t.catSpeak.reels.loginRequired || "Please log in to upload a Reel.",
      )
      openAuthModal("login")
      return
    }
    setUploadChallenge(challengeObj)
    setIsUploadOpen(true)
  }, [isAuthenticated, openAuthModal, t.catSpeak.reels.loginRequired])

  const handleUploadClose = useCallback(() => {
    setIsUploadOpen(false)
    setTimeout(() => setUploadChallenge(null), 300)
  }, [])

  const handleSelectTab = useCallback(
    (tabId) => {
      setActiveTab(tabId)
      // Reset challengeId when switching tabs
      setChallengeId(null)
      setShowMobileDetail(false)
    },
    [],
  )

  return (
    <div className="flex flex-col pb-12">
      {/* Breadcrumbs always visible unless mobile detail view */}
      {(!showMobileDetail || isLg) && (
        <Breadcrumb 
          items={[
            { label: t?.nav?.home || "Home", onClick: () => navigate("/") },
            { label: t?.nav?.catSpeak || "Cat Speak"},
            { label: t.catSpeak?.reels?.title || "Reels" }
          ]} 
        />
      )}

      {/* Tabs - Hide when viewing a detail reel or mobile detail view */}
      {!id && (!showMobileDetail || isLg) && (
        <ReelTagBar
          activeFilter={activeTab}
          onSelectFilter={handleSelectTab}
        />
      )}

      {id ? (
        <Outlet />
      ) : (
        <div className="flex flex-col w-full relative items-start">
          {activeTab === "foryou" && (
            <div className="w-full flex flex-col">
              {/* <div className="w-full max-w-md mb-6 self-end relative">
                <input
                  type="text"
                  placeholder={t.catSpeak?.reels?.searchPlaceholder || "Tìm kiếm Reels..."}
                  className="w-full h-10 pl-4 pr-10 border border-gray-200 rounded-full text-sm focus:outline-none focus:border-cath-red-700 transition-colors bg-white shadow-sm"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <div className="absolute right-3 top-2.5 text-gray-400">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
                </div>
              </div> */}
              <ForYouTab 
                searchQuery={searchQuery}
                onReelClick={handleReelClick} 
                isAuthenticated={isAuthenticated}
                onUploadClick={handleUploadClick}
              />
            </div>
          )}

          {activeTab === "challenges" && (
            <ChallengesTab
              challengeStatus={challengeStatus}
              setChallengeStatus={setChallengeStatus}
              challengeId={challengeId}
              onSelectChallenge={setChallengeId}
              onReelClick={handleReelClick}
              onParticipate={handleUploadClick}
            />
          )}

          {activeTab === "leaderboard" && (
            <LeaderboardTab
              challengeStatus={challengeStatus}
              setChallengeStatus={setChallengeStatus}
              challengeId={challengeId}
              onSelectChallenge={setChallengeId}
              onReelClick={handleReelClick}
              onParticipate={handleUploadClick}
              showMobileDetail={showMobileDetail}
              onMobileDetailChange={setShowMobileDetail}
            />
          )}
        </div>
      )}

      {/* Create Reel Modal */}
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
