import React, { useState, useMemo } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "@/features/auth"
import { toast } from "@/shared/utils/toastBridge"
import { useLanguage } from "@/shared/context/LanguageContext"
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
const GUEST_FALLBACK_TOPICS = [
  {
    id: "hsk1-intro",
    hsk_level: 1,
    title_vi: "Chào hỏi & Giới thiệu bản thân",
    title_en: "Greetings & self-introduction",
    title_ja: "あいさつと自己紹介",
    title_zh: "问候与自我介绍",
    opening_zh: "你好！很高兴认识你。",
    script_turns: 3,
    keywords: ["你好", "名字", "认识"],
    is_premium: false,
  },
  {
    id: "hsk1-daily",
    hsk_level: 1,
    title_vi: "Ăn uống & Gọi món đơn giản",
    title_en: "Dining & simple ordering",
    title_ja: "食事と簡単な注文",
    title_zh: "简单点餐",
    opening_zh: "你想吃什么？",
    script_turns: 3,
    keywords: ["米饭", "喝水", "喜欢"],
    is_premium: false,
  },
  {
    id: "hsk2-shopping",
    hsk_level: 2,
    title_vi: "Mua sắm ở siêu thị",
    title_en: "Supermarket shopping",
    title_ja: "スーパーで買い物",
    title_zh: "超市购物",
    opening_zh: "这个多少钱？",
    script_turns: 3,
    keywords: ["多少钱", "太贵了", "买"],
    is_premium: false,
  },
  {
    id: "hsk2-traffic",
    hsk_level: 2,
    title_vi: "Hỏi đường & Đi lại",
    title_en: "Asking for directions & transport",
    title_ja: "道案内と交通",
    title_zh: "问路与交通",
    opening_zh: "请问地铁站在哪里？",
    script_turns: 3,
    keywords: ["地铁", "出租车", "怎么走"],
    is_premium: false,
  },
  {
    id: "hsk3-travel",
    hsk_level: 3,
    title_vi: "Kế hoạch đi du lịch",
    title_en: "Travel planning",
    title_ja: "旅行の計画",
    title_zh: "旅游计划",
    opening_zh: "你周末打算去哪儿玩？",
    script_turns: 4,
    keywords: ["旅游", "风景", "打算"],
    is_premium: false,
  },
  {
    id: "hsk4-work",
    hsk_level: 4,
    title_vi: "Phỏng vấn & Môi trường làm việc",
    title_en: "Interviews & the workplace",
    title_ja: "面接と職場環境",
    title_zh: "面试与工作环境",
    opening_zh: "你能谈谈你的工作经历吗？",
    script_turns: 4,
    keywords: ["经历", "负责", "机会"],
    is_premium: true,
  },
]

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

const fillTemplate = (template, values) =>
  Object.entries(values).reduce(
    (text, [key, value]) => text.replaceAll(`{{${key}}}`, String(value)),
    template,
  )

const getLocalizedTopicTitle = (topic, language) => {
  if (language === "vi") return topic.title_vi || topic.title_zh
  if (language === "en") return topic.title_en || topic.title_zh
  if (language === "ja") return topic.title_ja || topic.title_zh
  return topic.title_zh
}

const SelectionPage = ({ onStartSpeaking, onQuotaExceeded, onActiveSessionConflict, isStarting = false }) => {
  const navigate = useNavigate()
  const { t, language } = useLanguage()
  const roomText = t?.aiTutor?.speakingRoom || {}
  const sectionText = roomText.sections || {}
  const quotaText = roomText.quota || {}
  const activeText = roomText.activeSession || {}
  const topicCardText = roomText.topicCard || {}
  const { isAuthenticated } = useAuth()
  const { data: rawTopics = [], isLoading: isLoadingTopics, isError: topicsError, refetch: refetchTopics } = useGetSpeakingTopicsQuery()
  const { data: quotaData } = useGetSpeakingQuotaQuery(undefined, { skip: !isAuthenticated })
  const { data: levelProfile } = useGetSpeakingLevelQuery(undefined, { skip: !isAuthenticated })
  const { data: activeSession } = useGetActiveSpeakingSessionQuery(undefined, {
    skip: !isAuthenticated,
    refetchOnMountOrArgChange: true,
  })
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
      toast.error(
        error?.message ||
          activeText.closeFailed ||
          "Không thể đóng phiên cũ. Hãy thử lại.",
      )
    }
  }

  const currentLevel = USER_LEVEL.options.find((option) => option.value === currentHskNumber)?.label || USER_LEVEL.current

  const effectiveTopics = useMemo(() => {
    if (rawTopics && rawTopics.length > 0) return rawTopics
    return GUEST_FALLBACK_TOPICS
  }, [rawTopics])

  // Map raw API topics to UI card models
  const allTopics = useMemo(() => {
    return effectiveTopics.map((t, idx) => {
      const hskNum = t.hsk_level || 1
      const isHigherLevel = hskNum > currentHskNumber
      return {
        id: t.id,
        emoji: getTopicEmoji(t, idx),
        title: getLocalizedTopicTitle(t, language),
        sub: `${t.title_zh}${t.opening_zh ? " · " + t.opening_zh : ""}`,
        tags: [
          `HSK ${hskNum}`,
          `💬 ${fillTemplate(topicCardText.questions || "{{count}} câu", {
            count: t.script_turns || 3,
          })}`,
          t.is_premium
            ? topicCardText.premium || "⭐ Premium"
            : topicCardText.twoWay || "Đàm thoại 2 chiều",
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
  }, [effectiveTopics, currentHskNumber, language, topicCardText.questions, topicCardText.premium, topicCardText.twoWay])

  const selectedTopic = useMemo(() => {
    const selected = allTopics.find((t) => t.id === selectedTopicId && !t.isLocked)
    return selected || allTopics.find((t) => !t.isLocked) || allTopics[0] || null
  }, [allTopics, selectedTopicId])

  // Quota banner data calculation
  const quota = useMemo(() => {
    if (!quotaData) {
      return {
        ...DEFAULT_QUOTA,
        currentPlan: fillTemplate(
          quotaText.freePlan || "Gói Free: {{count}} buổi/ngày",
          { count: DEFAULT_QUOTA.total },
        ),
        resetTime: "00:00",
      }
    }
    const used = quotaData.used_sessions ?? 0
    const total = quotaData.max_sessions ?? 2
    const isPremium = quotaData.is_premium
    const percent = total > 0 ? Math.min(100, Math.round((used / total) * 100)) : 0
    return {
      currentPlan: isPremium
        ? quotaText.proPlan || "Gói Pro: Không giới hạn"
        : fillTemplate(quotaText.freePlan || "Gói Free: {{count}} buổi/ngày", {
            count: total,
          }),
      used,
      total,
      percent,
      resetTime: "00:00",
      upgradeUrl: "/pricing",
    }
  }, [quotaData, quotaText.freePlan, quotaText.proPlan])

  // BUG-SS-02 (E-SS-002): Free đã dùng hết buổi trong ngày thì không cho vào
  // phòng, kể cả khi máy chủ đang bật cờ bỏ qua hạn mức để thử nghiệm.
  const isQuotaExceeded = useMemo(() => {
    if (!quotaData) return false
    if (quotaData.can_start_session === false) return true
    const remaining = Number(quotaData.remaining_sessions)
    return !quotaData.is_premium && Number.isFinite(remaining) && remaining <= 0
  }, [quotaData])

  // Dynamic filter tabs with real topic counts
  const filterTabs = useMemo(() => {
    const hsk1_2 = allTopics.filter((t) => t.hskNumber <= 2).length
    const hsk3 = allTopics.filter((t) => t.hskNumber === 3).length
    const hsk4_5 = allTopics.filter((t) => t.hskNumber >= 4 && t.hskNumber <= 5).length
    const hsk6 = allTopics.filter((t) => t.hskNumber === 6).length

    return [
      { id: "all", label: roomText.tabs?.all || "Tất cả", count: allTopics.length },
      { id: "hsk1-2", label: "HSK 1-2", count: hsk1_2 },
      { id: "hsk3", label: "HSK 3", count: hsk3 },
      { id: "hsk4-5", label: "HSK 4-5", count: hsk4_5 },
      { id: "hsk6", label: "HSK 6", count: hsk6 },
    ]
  }, [allTopics, roomText.tabs?.all])

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
          typeTitle: sectionText.searchResults || "🔍 KẾT QUẢ TÌM KIẾM",
          badge: fillTemplate(
            sectionText.searchBadge || "{{count}} chủ đề phù hợp",
            { count: filtered.length },
          ),
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
          typeTitle: sectionText.recommended || "⭐ AI GỢI Ý RIÊNG CHO BẠN",
          badge: fillTemplate(
            sectionText.recommendedBadge ||
              "{{count}} chủ đề đề xuất (HSK {{level}})",
            { count: rec.length, level: currentHskNumber },
          ),
          topics: rec,
        })
      }
      if (standard.length > 0) {
        result.push({
          typeTitle: sectionText.standard || "📌 CHỦ ĐỀ GIAO TIẾP HSK 1-3",
          badge: fillTemplate(sectionText.countBadge || "{{count}} chủ đề", {
            count: standard.length,
          }),
          topics: standard,
        })
      }
      if (advanced.length > 0) {
        result.push({
          typeTitle:
            sectionText.advanced ||
            "🔒 CHỦ ĐỀ CÔNG SỞ & THỬ THÁCH NÂNG CAO (HSK 4+)",
          badge: fillTemplate(sectionText.countBadge || "{{count}} chủ đề", {
            count: advanced.length,
          }),
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
        typeTitle: fillTemplate(
          sectionText.tabRecommended || "⭐ ĐỀ XUẤT HSK {{level}}",
          { level: currentHskNumber },
        ),
        badge: fillTemplate(sectionText.countBadge || "{{count}} chủ đề", {
          count: recInTab.length,
        }),
        topics: recInTab,
      })
    }
    if (otherInTab.length > 0) {
      result.push({
        typeTitle: sectionText.others || "📌 CHỦ ĐỀ KHÁC",
        badge: fillTemplate(sectionText.countBadge || "{{count}} chủ đề", {
          count: otherInTab.length,
        }),
        topics: otherInTab,
      })
    }
    return result.length > 0
      ? result
      : [
          {
            typeTitle: sectionText.fallback || "DANH SÁCH CHỦ ĐỀ",
            topics: filtered,
          },
        ]
  }, [
    allTopics,
    searchQuery,
    selectedFilter,
    currentHskNumber,
    sectionText.searchResults,
    sectionText.searchBadge,
    sectionText.recommended,
    sectionText.recommendedBadge,
    sectionText.standard,
    sectionText.advanced,
    sectionText.tabRecommended,
    sectionText.others,
    sectionText.fallback,
    sectionText.countBadge,
  ])

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
        <div className="rounded-2xl border border-amber-200 dark:border-amber-800/60 bg-amber-50 dark:bg-amber-950/20 p-4 text-sm text-amber-900 dark:text-amber-200">
          <p>{activeText.notice || "Bạn còn một phiên luyện nói chưa kết thúc. Hãy tiếp tục hoặc đóng phiên trước khi bắt đầu buổi mới."}</p>
          <div className="mt-3 flex flex-wrap gap-3">
            <button type="button" disabled={isEndingSession} className="font-bold underline" onClick={() => navigate(`sessions/${activeSession.session_id}`)}>
              {activeText.continue || "Tiếp tục phiên"}
            </button>
            <button type="button" disabled={isEndingSession} className="font-bold underline disabled:opacity-50" onClick={closeActiveSession}>
              {isEndingSession
                ? activeText.closing || "Đang đóng phiên..."
                : activeText.closeOld || "Đóng phiên cũ"}
            </button>
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
        <div className="text-center py-16 bg-white dark:bg-[#1A1A1A] rounded-2xl border border-slate-200 dark:border-[#3F3F3F] p-8 space-y-3 shadow-2xs">
          <div className="w-8 h-8 border-4 border-rose-200 dark:border-rose-900/50 border-t-[#990011] dark:border-t-red-400 rounded-full animate-spin mx-auto" />
          <p className="text-sm font-semibold text-slate-700 dark:text-neutral-200">
            {roomText.loadingTopics ||
              "Đang tải danh sách chủ đề đàm thoại..."}
          </p>
        </div>
      ) : (
        <TopicList
          sections={filteredSections}
          selectedTopicId={selectedTopicId}
          onSelectTopic={setSelectedTopicId}
          errorMessage={topicsError && effectiveTopics.length === 0 ? roomText.topicError || "Không thể tải danh sách chủ đề." : null}
          hasTopics={allTopics.length > 0}
          onRetry={refetchTopics}
        />
      )}

      {/* 5. Sticky Floating Bottom Action Bar */}
      <SpeakingRoomStickyBottomBar
        selectedTopic={selectedTopic}
        isQuotaExceeded={isQuotaExceeded}
        onStartSpeaking={() => {
          if (isStarting) return
          if (hasActiveSession) {
            // BUG-SS-08: đã có phiên đang chạy (tab/thiết bị khác) thì hiện ss08
            if (onActiveSessionConflict) onActiveSessionConflict(activeSession)
            else toast.error(activeText.conflictStart || "Hãy tiếp tục hoặc đóng phiên cũ trước khi bắt đầu buổi mới.")
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
