import React, { useState, useMemo } from "react"
import { useLanguage } from "@/shared/context/LanguageContext"
import {
  SpeakingRoomHeader,
  SpeakingRoomQuotaBanner,
  SpeakingRoomSearchBar,
  SpeakingRoomFilterTabs,
  TopicList,
  SpeakingRoomStickyBottomBar,
} from "../index"

// --- Mock Data & Configurations ---
export const USER_QUOTA = {
  currentPlan: "Gói Free: 2 buổi/ngày",
  used: 1,
  total: 2,
  percent: 50,
  resetTime: "00:00 hàng ngày",
  upgradeUrl: "/pricing",
}

export const USER_LEVEL = {
  current: "HSK 3 (B1)",
  options: [
    { label: "HSK 1 (A1)", value: "HSK 1" },
    { label: "HSK 2 (A2)", value: "HSK 2" },
    { label: "HSK 3 (B1)", value: "HSK 3" },
    { label: "HSK 4 (B2)", value: "HSK 4" },
    { label: "HSK 5 (C1)", value: "HSK 5" },
    { label: "HSK 6 (C2)", value: "HSK 6" },
  ],
}

export const FILTER_TABS = [
  { id: "all", label: "Tất cả", count: 48 },
  { id: "hsk1-2", label: "HSK 1-2", count: 12 },
  { id: "hsk3", label: "HSK 3 (Khuyên dùng ★ 18)", count: 18, isRecommended: true },
  { id: "hsk4-5", label: "HSK 4-5", count: 14 },
  { id: "hsk6", label: "HSK 6", count: 4 },
]

export const RECOMMEND_TOPICS = [
  {
    typeTitle: "⭐ AI GỢI Ý RIÊNG CHO BẠN",
    badge: "2 chủ đề đề xuất",
    topics: [
      {
        id: "buy-fruits",
        emoji: "🍎",
        title: "Mua hoa quả ở chợ",
        sub: "买水果 · Mặc cả & Cân ký",
        tags: ["HSK 3", "💬 4-6 câu", "Đàm thoại 2 chiều"],
        vocab: "苹果 (táo) · 多少钱 (bao nhiêu) · 太贵了 (đắt)",
        hskLevel: "HSK 3",
        isRecommended: true,
      },
      {
        id: "order-food",
        emoji: "🍲",
        title: "Gọi món tại nhà hàng",
        sub: "点菜 · Đặt món & Thanh toán",
        tags: ["HSK 3", "💬 4-6 câu", "Đàm thoại 2 chiều"],
        vocab: "服务员 (phục vụ) · 买单 (tính tiền) · 菜单 (thực đơn)",
        hskLevel: "HSK 3",
        isRecommended: true,
      },
    ],
  },
  {
    typeTitle: "📌 CHỦ ĐỀ HSK 3 PHỔ BIẾN",
    badge: "18 chủ đề · Cuộn để xem thêm ▾",
    topics: [
      {
        id: "ask-directions",
        emoji: "🚇",
        title: "Hỏi đường ga tàu ngầm",
        sub: "问路 · Chỉ hướng & Di chuyển",
        tags: ["HSK 3", "💬 4-6 câu", "Đàm thoại 2 chiều"],
        vocab: "地铁站 (ga tàu) · 怎么走 (đi sao) · 一直走 (đi thẳng)",
        hskLevel: "HSK 3",
      },
      {
        id: "book-hotel",
        emoji: "🏨",
        title: "Đặt phòng khách sạn",
        sub: "订酒店 · Check-in & Thủ tục",
        tags: ["HSK 3", "💬 4-6 câu", "Đàm thoại 2 chiều"],
        vocab: "预订 (đặt trước) · 单人房 (phòng đơn) · 押金 (tiền cọc)",
        hskLevel: "HSK 3",
      },
      {
        id: "shopping-clothes",
        emoji: "🛍️",
        title: "Mua sắm quần áo",
        sub: "买衣服 · Thử đồ & Khuyến mãi",
        tags: ["HSK 3", "💬 4-6 câu", "Đàm thoại 2 chiều"],
        vocab: "试衣间 (phòng thử) · 打折 (giảm giá) · 适合 (vừa vặn)",
        hskLevel: "HSK 3",
      },
      {
        id: "take-taxi",
        emoji: "🚕",
        title: "Bắt xe taxi di chuyển",
        sub: "打车 · Điểm đến & Tính tiền",
        tags: ["HSK 3", "💬 4-6 câu", "Đàm thoại 2 chiều"],
        vocab: "师傅 (bác tài) · 堵车 (kẹt xe) · 靠边停 (tấp lề)",
        hskLevel: "HSK 3",
      },
      {
        id: "doctor-visit",
        emoji: "🏥",
        title: "Khám bệnh tại bệnh viện",
        sub: "看病 · Triệu chứng & Đơn thuốc",
        tags: ["HSK 3", "💬 4-6 câu", "Đàm thoại 2 chiều"],
        vocab: "感冒 (cảm cúm) · 发烧 (sốt) · 吃药 (uống thuốc)",
        hskLevel: "HSK 3",
      },
      {
        id: "coffee-shop",
        emoji: "☕",
        title: "Hẹn cà phê cùng bạn bè",
        sub: "喝咖啡 · Chọn thức uống & Trò chuyện",
        tags: ["HSK 3", "💬 4-6 câu", "Đàm thoại 2 chiều"],
        vocab: "拿铁 (latte) · 少糖 (ít đường) · 冰的 (đá)",
        hskLevel: "HSK 3",
      },
    ],
  },
  {
    typeTitle: "🔒 CHỦ ĐỀ CÔNG SỞ & THỬ THÁCH NÂNG CAO",
    badge: "14 chủ đề · HSK 4+",
    topics: [
      {
        id: "job-interview",
        emoji: "💼",
        title: "Phỏng vấn xin việc",
        sub: "面试 · Trả lời phỏng vấn",
        tags: ["HSK 4+", "Phỏng vấn"],
        vocab: "简历 (sơ yếu lý lịch) · 经验 (kinh nghiệm) · 优势 (ưu điểm)",
        isLocked: true,
        lockBadge: "HSK 4+",
        hskLevel: "HSK 4-5",
      },
      {
        id: "business-negotiation",
        emoji: "🤝",
        title: "Đàm phán thương mại",
        sub: "商务谈判 · Thỏa thuận hợp đồng",
        tags: ["HSK 5+", "Thương mại"],
        vocab: "合同 (hợp đồng) · 合作 (hợp tác) · 价格 (giá cả)",
        isLocked: true,
        lockBadge: "HSK 5+",
        hskLevel: "HSK 4-5",
      },
      {
        id: "project-presentation",
        emoji: "📊",
        title: "Báo cáo tiến độ dự án",
        sub: "工作汇报 · Thuyết trình kết quả",
        tags: ["HSK 5+", "Báo cáo"],
        vocab: "项目 (dự án) · 进度 (tiến độ) · 达成 (đạt được)",
        isLocked: true,
        lockBadge: "HSK 5+",
        hskLevel: "HSK 4-5",
      },
      {
        id: "academic-debate",
        emoji: "🎓",
        title: "Tranh biện học thuật chuyên sâu",
        sub: "学术辩论 · Luận điểm chuyên môn",
        tags: ["HSK 6", "Học thuật"],
        vocab: "观点 (quan điểm) · 逻辑 (logic) · 论证 (luận chứng)",
        isLocked: true,
        lockBadge: "HSK 6",
        hskLevel: "HSK 6",
      },
    ],
  },
]

const SelectionPage = () => {
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

      {/* 4. Topic List / Sections */}
      <TopicList
        sections={filteredSections}
        selectedTopicId={selectedTopicId}
        onSelectTopic={setSelectedTopicId}
      />

      {/* 5. Sticky Floating Bottom Action Bar */}
      <SpeakingRoomStickyBottomBar
        selectedTopic={selectedTopic}
        onStartSpeaking={() => {
          // Placeholder for starting speech session
        }}
      />
    </div>
  )
}

export default SelectionPage
