import React, { useState, useMemo } from "react"
import { useNavigate } from "react-router-dom"
import { toast } from "@/shared/utils/toastBridge"
import {
  SpeakingRoomHeader,
  SpeakingRoomQuotaBanner,
  SpeakingRoomSearchBar,
  SpeakingRoomFilterTabs,
  TopicList,
  SpeakingRoomStickyBottomBar,
} from "../index"
import {
  useGetActiveSpeakingSessionQuery,
  useGetSpeakingLevelQuery,
  useGetSpeakingQuotaQuery,
  useGetSpeakingTopicsQuery,
  useEndSpeakingSessionMutation,
} from "../../../api/speakingApi"


// --- Default Fallbacks & Configurations ---
const DEFAULT_QUOTA = {
  currentPlan: "Gói Free: 2 buổi/ngày",
  used: 0,
  total: 2,
  percent: 0,
  resetTime: "00:00 hàng ngày",
  upgradeUrl: "/pricing",
}

const USER_LEVEL = {
  current: "HSK 3 (B1)",
  options: [
    { label: "HSK 1 (A1)", value: 1 },
    { label: "HSK 2 (A2)", value: 2 },
    { label: "HSK 3 (B1)", value: 3 },
    { label: "HSK 4 (B2)", value: 4 },
    { label: "HSK 5 (C1)", value: 5 },
    { label: "HSK 6 (C2)", value: 6 },
  ],
}

const HSK_EMOJIS = {
  1: ["☕", "🍎", "🏠", "🐱", "☀️"],
  2: ["🍲", "🛒", "🚌", "🌦️", "⚽"],
  3: ["🚇", "🏨", "🛍️", "🚕", "🏥", "☕"],
  4: ["💼", "📱", "🏃", "✈️", "🎬"],
  5: ["🤖", "🌿", "🎨", "🌍", "📚"],
  6: ["📈", "🎓", "🌏", "🏛️", "💡"],
}

function getTopicEmoji(topic, index = 0) {
  const level = topic.hsk_level || 1
  const list = HSK_EMOJIS[level] || HSK_EMOJIS[1]
  return list[index % list.length]
}

const SelectionPage = ({ onStartSpeaking, onQuotaExceeded }) => {
  const navigate = useNavigate()
  const { data: rawTopics = [], isLoading: isLoadingTopics, isError: topicsError, refetch: refetchTopics } = useGetSpeakingTopicsQuery()
  const { data: quotaData } = useGetSpeakingQuotaQuery()
  const { data: levelProfile } = useGetSpeakingLevelQuery()
  const { data: activeSession } = useGetActiveSpeakingSessionQuery(undefined, { refetchOnMountOrArgChange: true })
  const [endSession, { isLoading: isEndingSession }] = useEndSpeakingSessionMutation()
  const [manualHskNumber, setManualHskNumber] = useState(null)
  const [selectedTopicId, setSelectedTopicId] = useState("")
  const [selectedFilter, setSelectedFilter] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const profileLevel = Number(levelProfile?.current_hsk_level)
  const currentHskNumber = manualHskNumber ?? (profileLevel >= 1 && profileLevel <= 6 ? profileLevel : 3)

  const hasActiveSession = activeSession && !["completed", "abandoned"].includes(activeSession.status)
  const closeActiveSession = async () => {
    if (isEndingSession) return
    try {
      await endSession({ sessionId: activeSession.session_id }).unwrap()
    } catch (error) {
      toast.error(error?.message || "Không thể đóng phiên cũ. Hãy thử lại.")
    }
  }

  const currentLevel = USER_LEVEL.options.find((option) => option.value === currentHskNumber)?.label || USER_LEVEL.current

  // Map raw API topics to UI card models
  const allTopics = useMemo(() => {
    return rawTopics.map((t, idx) => {
      const hskNum = t.hsk_level || 1
      const isHigherLevel = hskNum > currentHskNumber
      return {
        id: t.id,
        emoji: getTopicEmoji(t, idx),
        title: t.title_vi,
        sub: `${t.title_zh}${t.opening_zh ? " · " + t.opening_zh : ""}`,
        tags: [
          `HSK ${hskNum}`,
          `💬 ${t.script_turns || 3} câu`,
          t.is_premium ? "⭐ Premium" : "Đàm thoại 2 chiều",
        ],
        vocab: Array.isArray(t.keywords) ? t.keywords.join(" · ") : (t.keywords || ""),
        hskLevel: `HSK ${hskNum}`,
        hskNumber: hskNum,
        isLocked: isHigherLevel,
        lockBadge: isHigherLevel ? `HSK ${hskNum}+` : undefined,
        isRecommended: hskNum === currentHskNumber,
        isPremium: t.is_premium,
        scriptTurns: t.script_turns,
        openingZh: t.opening_zh,
        raw: t,
      }
    })
  }, [rawTopics, currentHskNumber])

  const selectedTopic = useMemo(() => {
    const selected = allTopics.find((t) => t.id === selectedTopicId && !t.isLocked)
    return selected || allTopics.find((t) => !t.isLocked) || allTopics[0] || null
  }, [allTopics, selectedTopicId])

  // Quota banner data calculation
  const quota = useMemo(() => {
    if (!quotaData) return DEFAULT_QUOTA
    const used = quotaData.used_sessions ?? 0
    const total = quotaData.max_sessions ?? 2
    const isPremium = quotaData.is_premium
    const percent = total > 0 ? Math.min(100, Math.round((used / total) * 100)) : 0
    return {
      currentPlan: isPremium ? "Gói Pro: Không giới hạn" : `Gói Free: ${total} buổi/ngày`,
      used,
      total,
      percent,
      resetTime: "00:00 hàng ngày",
      upgradeUrl: "/pricing",
    }
  }, [quotaData])

  // ponytail: Tạm thời comment logic kiểm tra giới hạn quota để tiện test tính năng
  const isQuotaExceeded = useMemo(() => {
    return quotaData?.can_start_session === false
  }, [quotaData])

  // Dynamic filter tabs with real topic counts
  const filterTabs = useMemo(() => {
    const hsk1_2 = allTopics.filter((t) => t.hskNumber <= 2).length
    const hsk3 = allTopics.filter((t) => t.hskNumber === 3).length
    const hsk4_5 = allTopics.filter((t) => t.hskNumber >= 4 && t.hskNumber <= 5).length
    const hsk6 = allTopics.filter((t) => t.hskNumber === 6).length

    return [
      { id: "all", label: "Tất cả", count: allTopics.length },
      { id: "hsk1-2", label: "HSK 1-2", count: hsk1_2 },
      { id: "hsk3", label: "HSK 3", count: hsk3 },
      { id: "hsk4-5", label: "HSK 4-5", count: hsk4_5 },
      { id: "hsk6", label: "HSK 6", count: hsk6 },
    ]
  }, [allTopics])

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

  // Filter topics and group into structured sections
  const filteredSections = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()

    const filtered = allTopics.filter((topic) => {
      // Tab filtering
      if (selectedFilter === "hsk1-2" && ![1, 2].includes(topic.hskNumber)) {
        return false
      }
      if (selectedFilter === "hsk3" && topic.hskNumber !== 3) {
        return false
      }
      if (selectedFilter === "hsk4-5" && ![4, 5].includes(topic.hskNumber)) {
        return false
      }
      if (selectedFilter === "hsk6" && topic.hskNumber !== 6) {
        return false
      }

      // Search filtering
      if (query) {
        const matchTitle = topic.title?.toLowerCase().includes(query)
        const matchSub = topic.sub?.toLowerCase().includes(query)
        const matchVocab = topic.vocab?.toLowerCase().includes(query)
        return matchTitle || matchSub || matchVocab
      }

      return true
    })

    if (query) {
      return [
        {
          typeTitle: "🔍 KẾT QUẢ TÌM KIẾM",
          badge: `${filtered.length} chủ đề phù hợp`,
          topics: filtered,
        },
      ]
    }

    if (selectedFilter === "all") {
      const rec = filtered.filter((t) => t.hskNumber === currentHskNumber)
      const standard = filtered.filter((t) => t.hskNumber <= 3 && t.hskNumber !== currentHskNumber)
      const advanced = filtered.filter((t) => t.hskNumber >= 4)

      const result = []
      if (rec.length > 0) {
        result.push({
          typeTitle: "⭐ AI GỢI Ý RIÊNG CHO BẠN",
          badge: `${rec.length} chủ đề đề xuất (HSK ${currentHskNumber})`,
          topics: rec,
        })
      }
      if (standard.length > 0) {
        result.push({
          typeTitle: "📌 CHỦ ĐỀ GIAO TIẾP HSK 1-3",
          badge: `${standard.length} chủ đề`,
          topics: standard,
        })
      }
      if (advanced.length > 0) {
        result.push({
          typeTitle: "🔒 CHỦ ĐỀ CÔNG SỞ & THỬ THÁCH NÂNG CAO (HSK 4+)",
          badge: `${advanced.length} chủ đề`,
          topics: advanced,
        })
      }
      return result
    }

    // Specific tab selected
    const recInTab = filtered.filter((t) => t.hskNumber === currentHskNumber)
    const otherInTab = filtered.filter((t) => t.hskNumber !== currentHskNumber)

    const result = []
    if (recInTab.length > 0) {
      result.push({
        typeTitle: `⭐ ĐỀ XUẤT HSK ${currentHskNumber}`,
        badge: `${recInTab.length} chủ đề`,
        topics: recInTab,
      })
    }
    if (otherInTab.length > 0) {
      result.push({
        typeTitle: `📌 CHỦ ĐỀ KHÁC`,
        badge: `${otherInTab.length} chủ đề`,
        topics: otherInTab,
      })
    }
    return result.length > 0 ? result : [{ typeTitle: "DANH SÁCH CHỦ ĐỀ", topics: filtered }]
  }, [allTopics, searchQuery, selectedFilter, currentHskNumber])

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 pb-52 sm:pb-36">
      {/* 1. Header with title & level selector */}
      <SpeakingRoomHeader
        currentLevel={currentLevel}
        onSelectLevel={setManualHskNumber}
        levelOptions={USER_LEVEL.options}
      />

      {/* 2. Quota & Usage Banner */}
      <SpeakingRoomQuotaBanner quota={quota} />

      {hasActiveSession && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          <p>Bạn còn một phiên luyện nói chưa kết thúc. Hãy tiếp tục hoặc đóng phiên trước khi bắt đầu buổi mới.</p>
          <div className="mt-3 flex flex-wrap gap-3">
            <button type="button" disabled={isEndingSession} className="font-bold underline" onClick={() => navigate(`sessions/${activeSession.session_id}`)}>Tiếp tục phiên</button>
            <button type="button" disabled={isEndingSession} className="font-bold underline disabled:opacity-50" onClick={closeActiveSession}>{isEndingSession ? "Đang đóng phiên..." : "Đóng phiên cũ"}</button>
          </div>
        </div>
      )}

      {/* 3. Search & Filter Controls */}
      <div className="space-y-2.5">
        <SpeakingRoomSearchBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onRandomPick={handleRandomPick}
        />
        <SpeakingRoomFilterTabs
          tabs={filterTabs}
          selectedFilter={selectedFilter}
          onSelectFilter={setSelectedFilter}
        />
      </div>

      {/* 4. Topic List / Sections */}
      {isLoadingTopics ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 p-8 space-y-3 shadow-2xs">
          <div className="w-8 h-8 border-4 border-rose-200 border-t-[#990011] rounded-full animate-spin mx-auto" />
          <p className="text-sm font-semibold text-slate-700">Đang tải danh sách chủ đề đàm thoại...</p>
        </div>
      ) : (
        <TopicList
          sections={filteredSections}
          selectedTopicId={selectedTopicId}
          onSelectTopic={setSelectedTopicId}
          errorMessage={topicsError ? "Không thể tải danh sách chủ đề." : null}
          hasTopics={allTopics.length > 0}
          onRetry={refetchTopics}
        />
      )}

      {/* 5. Sticky Floating Bottom Action Bar */}
      <SpeakingRoomStickyBottomBar
        selectedTopic={selectedTopic}
        isQuotaExceeded={isQuotaExceeded}
        onStartSpeaking={() => {
          if (hasActiveSession) {
            toast.error("Hãy tiếp tục hoặc đóng phiên cũ trước khi bắt đầu buổi mới.")
            return
          }
          if (isQuotaExceeded) {
            onQuotaExceeded?.()
            return
          }
          onStartSpeaking?.(selectedTopic, currentHskNumber)
        }}
      />

      {/* 6. Quota Exceeded Modal */}
    </div>
  )
}

export default SelectionPage
