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
  const { t, language } = useLanguage()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [isUploadOpen, setIsUploadOpen] = useState(false)
  const [uploadChallenge, setUploadChallenge] = useState(null)
  const { isAuthenticated } = useAuth()
  const { openAuthModal } = useAuthModal()
    const { id, lang: paramLang } = useParams()
    const lang = paramLang || language || "vi"

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
            { label: t?.nav?.home || "Home", onClick: () => navigate(`/${lang}/community`) },
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
            <ForYouTab 
              onReelClick={handleReelClick} 
              isAuthenticated={isAuthenticated}
              onUploadClick={handleUploadClick}
            />
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
