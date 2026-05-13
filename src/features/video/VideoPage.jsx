import { useNavigate } from "react-router-dom"
import { useLanguage } from "@/shared/context/LanguageContext"
import useVideoReels from "./hooks/useVideoReels"
import VideoTagBar from "./components/VideoTagBar"
import VideoGrid from "./components/VideoGrid"
import VideoGridSkeleton from "./components/VideoGridSkeleton"

const VideoPage = () => {
  const { t } = useLanguage()
  const navigate = useNavigate()

  const {
    filteredVideos,
    activeTag,
    tags,
    isLoading,
    setActiveTag,
  } = useVideoReels()

  const handleVideoClick = (video) => {
    navigate(video.id)
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">{t.catSpeak.video.title}</h2>
      </div>

      {/* Tag filter bar */}
      <VideoTagBar
        tags={tags}
        activeTag={activeTag}
        onTagClick={setActiveTag}
      />

      {/* Grid or loading skeleton */}
      {isLoading ? (
        <VideoGridSkeleton />
      ) : (
        <VideoGrid videos={filteredVideos} onVideoClick={handleVideoClick} />
      )}
    </div>
  )
}

export default VideoPage

