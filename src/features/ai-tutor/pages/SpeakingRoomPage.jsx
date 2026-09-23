import React, { useState, useMemo } from "react"
import { useLanguage } from "@/shared/context/LanguageContext"
import RECOMMEND_TOPICS from "../mock-data/recommendTopics"
import { USER_QUOTA, USER_LEVEL, FILTER_TABS } from "../mock-data/speakingRoomConfig"
import {
  SpeakingRoomHeader,
  SpeakingRoomQuotaBanner,
  SpeakingRoomSearchBar,
  SpeakingRoomFilterTabs,
  TopicList,
  SpeakingRoomStickyBottomBar,
} from "../components/speakingRoom"

const SpeakingRoomPage = () => {
  const { currentLanguage } = useLanguage()

  // State management
  const [selectedTopicId, setSelectedTopicId] = useState("buy-fruits")
  const [selectedFilter, setSelectedFilter] = useState("hsk3")
  const [searchQuery, setSearchQuery] = useState("")
  const [currentLevel, setCurrentLevel] = useState(USER_LEVEL.current)

  // Find all topics and currently selected topic
  const allTopics = useMemo(() => {
    return RECOMMEND_TOPICS.flatMap((section) => section.topics)
  }, [])

  const selectedTopic = useMemo(() => {
    return allTopics.find((t) => t.id === selectedTopicId) || allTopics[0]
  }, [allTopics, selectedTopicId])

  // Handle AI Random Topic Pick
  const handleRandomPick = () => {
    const unlockedTopics = allTopics.filter((t) => !t.isLocked)
    if (unlockedTopics.length === 0) return
    const randomIndex = Math.floor(Math.random() * unlockedTopics.length)
    const randomTopic = unlockedTopics[randomIndex]
    setSelectedTopicId(randomTopic.id)

    // Scroll to the topic card smoothly
    const element = document.getElementById(`topic-card-${randomTopic.id}`)
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "center" })
    }
  }

  // Filter topics based on active tab and search query
  const filteredSections = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()

    return RECOMMEND_TOPICS.map((section) => {
      const filteredTopics = section.topics.filter((topic) => {
        // Tab filtering
        if (selectedFilter === "hsk1-2" && !["HSK 1", "HSK 2", "HSK 1-2"].includes(topic.hskLevel)) {
          return false
        }
        if (selectedFilter === "hsk3" && topic.hskLevel !== "HSK 3") {
          return false
        }
        if (selectedFilter === "hsk4-5" && !["HSK 4", "HSK 5", "HSK 4-5"].includes(topic.hskLevel)) {
          return false
        }
        if (selectedFilter === "hsk6" && topic.hskLevel !== "HSK 6") {
          return false
        }

        // Search filtering
        if (query) {
          const matchTitle = topic.title.toLowerCase().includes(query)
          const matchSub = topic.sub.toLowerCase().includes(query)
          const matchVocab = topic.vocab?.toLowerCase().includes(query)
          return matchTitle || matchSub || matchVocab
        }

        return true
      })

      return {
        ...section,
        topics: filteredTopics,
      }
    }).filter((section) => section.topics.length > 0)
  }, [searchQuery, selectedFilter])

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 pb-12">
      {/* 1. Header with title & level selector */}
      <SpeakingRoomHeader
        currentLevel={currentLevel}
        onSelectLevel={setCurrentLevel}
        levelOptions={USER_LEVEL.options}
      />

      {/* 2. Quota & Usage Banner */}
      <SpeakingRoomQuotaBanner quota={USER_QUOTA} />

      {/* 3. Search & Filter Controls */}
      <div className="space-y-2.5">
        <SpeakingRoomSearchBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onRandomPick={handleRandomPick}
        />
        <SpeakingRoomFilterTabs
          tabs={FILTER_TABS}
          selectedFilter={selectedFilter}
          onSelectFilter={setSelectedFilter}
        />
      </div>

      {/* 5. Topic List / Sections */}
      <TopicList
        sections={filteredSections}
        selectedTopicId={selectedTopicId}
        onSelectTopic={setSelectedTopicId}
      />

      {/* 6. Sticky Floating Bottom Action Bar */}
      <SpeakingRoomStickyBottomBar
        selectedTopic={selectedTopic}
        onStartSpeaking={() => {
          // Placeholder for starting speech session
        }}
      />
    </div>
  )
}

export default SpeakingRoomPage
