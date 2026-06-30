import { useCallback, useState } from "react"
import { useNavigate, useSearchParams, Outlet, useParams } from "react-router-dom"
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
  const [searchParams, setSearchParams] = useSearchParams()
  const [isUploadOpen, setIsUploadOpen] = useState(false)
  const { isAuthenticated } = useAuth()
  const { openAuthModal } = useAuthModal()
  const { id } = useParams()

  // State for Tabs
  const [activeTab, setActiveTab] = useState("foryou") // "foryou" | "challenges" | "leaderboard"
  const [challengeStatus, setChallengeStatus] = useState("active") // "active" | "past"
  const [challengeId, setChallengeId] = useState(null)

  const handleReelClick = useCallback(
    (reel) => {
      if (!reel || !reel.id) return
      // Use query string to allow back navigation to the same state
      const queryString = searchParams.toString()
      navigate({
        pathname: String(reel.id),
        search: queryString ? `?${queryString}` : "",
      })
    },
    [navigate, searchParams],
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

  const handleSelectTab = useCallback(
    (tabId) => {
      setActiveTab(tabId)
      // Reset challengeId when switching tabs
      setChallengeId(null)
    },
    [],
  )

  return (
    <div className="flex flex-col pb-12">
      {/* Breadcrumbs always visible */}
      <Breadcrumb 
        items={[
          { label: "Cat Speak"},
          { label: t.catSpeak.reels.title || "Reels" }
        ]} 
      />

      {/* Tabs - Hide when viewing a detail reel */}
      {!id && (
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
            />
          )}

          {activeTab === "leaderboard" && (
            <LeaderboardTab
              challengeStatus={challengeStatus}
              setChallengeStatus={setChallengeStatus}
              challengeId={challengeId}
              onSelectChallenge={setChallengeId}
              onReelClick={handleReelClick}
            />
          )}
        </div>
      )}

      {/* Create Reel Modal */}
      {isUploadOpen && (
        <CreateReelModal
          open={isUploadOpen}
          onClose={handleUploadClose}
          challenge={{ challengeId }}
        />
      )}
    </div>
  )
}

export default ReelsPage
