import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Plus } from "lucide-react"
import { useLanguage } from "@/shared/context/LanguageContext"
import { PillButton } from "@/shared/components/ui/buttons"
import { useAuth } from "@/features/auth"
import { useAuthModal } from "@/shared/context/AuthModalContext"
import toast from "react-hot-toast"
import useReels from "./hooks/useReels"
import ReelTagBar from "./components/ReelTagBar"
import ReelGrid from "./components/ReelGrid"
import ReelGridSkeleton from "./components/ReelGridSkeleton"
import CreateReelModal from "./components/CreateReelModal"

const ReelsPage = () => {
  const { t } = useLanguage()
  const navigate = useNavigate()
  const [isUploadOpen, setIsUploadOpen] = useState(false)
  const { isAuthenticated } = useAuth()
  const { openAuthModal } = useAuthModal()

  const {
    filteredReels,
    activeTag,
    tags,
    isLoading,
    setActiveTag,
  } = useReels()

  const handleReelClick = (reel) => {
    navigate(reel.id)
  }

  const handleUploadClick = () => {
    if (!isAuthenticated) {
      toast.error(t.catSpeak.reels.loginRequired || "Please log in to upload a Reel.")
      openAuthModal("login")
      return
    }
    setIsUploadOpen(true)
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">{t.catSpeak.reels.title}</h2>
        <PillButton
          onClick={handleUploadClick}
          startIcon={<Plus size={16} />}
          bgColor="#990011"
          textColor="#ffffff"
          className="h-10 px-4 shadow-sm hover:brightness-110 transition-all duration-200"
        >
          Upload Reel
        </PillButton>
      </div>

      {/* Tag filter bar */}
      <ReelTagBar
        tags={tags}
        activeTag={activeTag}
        onTagClick={setActiveTag}
      />

      {/* Grid or loading skeleton */}
      {isLoading ? (
        <ReelGridSkeleton />
      ) : (
        <ReelGrid reels={filteredReels} onReelClick={handleReelClick} />
      )}

      {/* Creation Modal */}
      <CreateReelModal
        open={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
      />
    </div>
  )
}

export default ReelsPage
