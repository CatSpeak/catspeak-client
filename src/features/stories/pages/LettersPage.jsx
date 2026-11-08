import React, { useState, useMemo } from "react"
import { useParams } from "react-router-dom"
import { MessageSquare } from "lucide-react"
import toast from "react-hot-toast"
import { useLanguage } from "@/shared/context/LanguageContext"
import PageTitle from "@/shared/components/ui/PageTitle"
import LoadingSpinner from "@/shared/components/ui/indicators/LoadingSpinner"
import EmptyState from "@/shared/components/ui/indicators/EmptyState"
import useStories from "../hooks/useStories"
import useDanmaku from "../hooks/useDanmaku"
import StoryInputBar from "../components/StoryInputBar"
import StoryDetailModal from "../components/StoryDetailModal"
import MyStoryModal from "../components/MyStoryModal"
import ShowStory from "../components/ShowStory"

// Normalize URL lang codes to canonical backend community names
const LANG_TO_COMMUNITY = {
  vi: "Vietnamese",
  vn: "Vietnamese",
  vietnam: "Vietnamese",
  vietnamese: "Vietnamese",
  en: "English",
  eng: "English",
  english: "English",
  zh: "Chinese",
  cn: "Chinese",
  china: "Chinese",
  chinese: "Chinese",
  ja: "Japanese",
  jp: "Japanese",
  japan: "Japanese",
  japanese: "Japanese",
}

export default function LettersPage() {
  const { lang } = useParams()
  const languageCommunity = LANG_TO_COMMUNITY[lang?.toLowerCase()] || undefined

  const {
    stories,
    myStories,
    inputValue,
    setInputValue,
    handleCreate,
    handleInteract,
    handleDelete,
    handleReport,
    loadingStories,
    loadingMyStories,
  } = useStories(languageCommunity)

  const { t } = useLanguage()
  const [selectedStory, setSelectedStory] = useState(null)
  const [selectedMyStory, setSelectedMyStory] = useState(null)

  const [sortOrder, setSortOrder] = useState("newest") // "newest" | "oldest"
  const [displayMode, setDisplayMode] = useState("float") // "grid" | "float"

  // Combine stories with isOwn flag
  const combinedStories = useMemo(() => {
    const merged = [
      ...stories.map((story) => ({ ...story, isOwn: false })),
      ...myStories.map((story) => ({ ...story, isOwn: true })),
    ]
    return merged.sort((a, b) => {
      const tA = new Date(a.createDate ?? 0).getTime()
      const tB = new Date(b.createDate ?? 0).getTime()
      return sortOrder === "newest" ? tB - tA : tA - tB
    })
  }, [stories, myStories, sortOrder])

  const { stageRef, danmakuItems } = useDanmaku(combinedStories)

  const myCount = myStories.length
  const totalCount = stories.length + myStories.length

  const handleSend = () => {
    if (!inputValue || !inputValue.trim()) {
      toast.error(
        t.catSpeak?.mail?.emptyInputError ||
          "Please enter content before sending.",
      )
      return
    }
    handleCreate(inputValue)
  }

  const isLoading = loadingStories || loadingMyStories
  const isEmpty = !isLoading && combinedStories.length === 0

  // Interaction handlers
  const handleItemClick = (story) => {
    if (story.isOwn) {
      setSelectedMyStory(story)
    } else {
      setSelectedStory(story)
    }
  }

  const handleConnect = (story) => {
    handleInteract(story.storyId, 1)
  }

  const handlePass = (story) => {
    handleInteract(story.storyId, 2)
  }

  const handleReportAction = async (story) => {
    try {
      await handleReport(story.storyId)
      toast.success(t.catSpeak?.reportSuccess || "Story reported successfully.")
    } catch (error) {
      if (error?.status === 404) {
        toast.error(t.catSpeak?.storyNotFound || "Story not found or has expired.")
      } else if (error?.status === 400) {
        toast.error(t.catSpeak?.cannotReportOwn || "You cannot report your own story.")
      } else {
        toast.error(t.catSpeak?.reportFailed || "Failed to report story.")
      }
    }
  }

  return (
    <div className="flex flex-1 flex-col w-full h-full min-h-0 max-w-full text-gray-800 dark:text-neutral-200">
      {/* Page Title */}
      <div className="p-4 shrink-0">
        <PageTitle>{t.catSpeak?.sidebar?.letters || t.nav?.letters || "Letters"}</PageTitle>
      </div>

      {/* Main content */}
      <div className="relative flex w-full max-w-full flex-1 min-h-0 flex-col gap-4">
        <div className="shrink-0">
          <StoryInputBar
            inputValue={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onSend={handleSend}
            myCount={myCount}
            totalCount={totalCount}
            sortOrder={sortOrder}
            onSortChange={setSortOrder}
            displayMode={displayMode}
            onDisplayModeChange={setDisplayMode}
          />
        </div>

        {isLoading ? (
          <div className="flex-1 flex items-center justify-center min-h-[40vh]">
            <LoadingSpinner size="lg" />
          </div>
        ) : isEmpty ? (
          <EmptyState
            variant="page"
            icon={MessageSquare}
            title={t.catSpeak?.mail?.noStories}
            description={t.catSpeak?.mail?.placeholderEmpty}
          />
        ) : (
          <ShowStory
            listStories={combinedStories}
            danmakuItems={danmakuItems}
            stageRef={stageRef}
            onItemClick={handleItemClick}
            displayMode={displayMode}
          />
        )}

        <StoryDetailModal
          open={!!selectedStory}
          story={selectedStory}
          onConnect={handleConnect}
          onReport={handleReportAction}
          onClose={() => setSelectedStory(null)}
        />
        <MyStoryModal
          open={!!selectedMyStory}
          story={selectedMyStory}
          onClose={() => setSelectedMyStory(null)}
          onDelete={handleDelete}
        />
      </div>
    </div>
  )
}

export { LettersPage }

