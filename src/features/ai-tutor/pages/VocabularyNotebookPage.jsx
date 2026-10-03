import React, { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Layers } from "lucide-react"
import { useLanguage } from "@/shared/context/LanguageContext"
import {
  useGetFlashcardHomeQuery,
  useGetFlashcardDecksQuery,
} from "../api/flashcardApi"
import {
  FlashcardHeroBanner,
  FlashcardStatCards,
  RecentWrongList,
  SystemDecksSection,
} from "../components/flashcards"
import { MOCK_FLASHCARD_HOME, MOCK_DECKS } from "@/store/api/flashcardMocks"

/**
 * VocabularyNotebookPage (fc01 - Sổ tay từ vựng)
 *
 * Màn hình trang chủ của tính năng Flashcard SRS trên client.
 * Hiển thị 3 trạng thái chính:
 * 1. HAS_DUE: Có thẻ đến hạn cần ôn hôm nay (due_today_count > 0).
 * 2. ALL_DONE: Đã ôn hết thẻ hôm nay (due_today_count === 0 && total_cards > 0).
 * 3. EMPTY: Chưa có từ vựng nào trong sổ (total_cards === 0).
 */
const VocabularyNotebookPage = () => {
  const navigate = useNavigate()
  const { t } = useLanguage()

  // Lấy dữ liệu thống kê trang chủ và danh sách decks từ API (kèm fallback mock)
  const { data: homeData, isLoading: isHomeLoading } = useGetFlashcardHomeQuery()
  const { data: decksData } = useGetFlashcardDecksQuery()

  // Dev preview state override (null = auto from backend/mock, "has_due" | "done" | "empty")
  const [previewState, setPreviewState] = useState(null)

  // Merge dữ liệu với mock nếu API chưa có
  const currentHome = homeData || MOCK_FLASHCARD_HOME
  const currentDecks = decksData || MOCK_DECKS

  // Dữ liệu hiển thị dựa trên preview state hoặc dữ liệu thực tế
  let totalCards = currentHome.total_cards ?? 87
  let dueCount = currentHome.due_today_count ?? 12
  let recentWrongCount = currentHome.recent_wrong_count ?? 5

  if (previewState === "empty") {
    totalCards = 0
    dueCount = 0
    recentWrongCount = 0
  } else if (previewState === "done") {
    totalCards = totalCards || 128
    dueCount = 0
  } else if (previewState === "has_due") {
    totalCards = totalCards || 128
    dueCount = dueCount || 12
  }

  // Danh sách từ sai gần đây (mock/data)
  const recentWrongItems = [
    { id: "1", word: "银行", pinyin: "yínháng", meaning_vi: "ngân hàng" },
    { id: "2", word: "学习", pinyin: "xuéxí", meaning_vi: "học tập" },
    { id: "3", word: "开会", pinyin: "kāihuì", meaning_vi: "khai mạc / họp" },
  ]

  // Handlers điều hướng
  const handleStartDueReview = () => {
    navigate("/flashcards/review?mode=due")
  }

  const handleStartFreeReview = () => {
    navigate("/flashcards/review?mode=free")
  }

  const handleStartSpeaking = () => {
    navigate("/ai-tutor/speaking-room")
  }

  const handleViewAllDecks = () => {
    navigate("/flashcards/decks")
  }

  const handleSelectDeck = (deckId) => {
    navigate(`/flashcards/decks/${deckId}`)
  }

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 pb-12">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-rose-50 text-rose-800 shadow-xs">
            <Layers className="h-5 w-5 stroke-[2.2]" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
            {t?.aiTutor?.vocabularyNotebook?.title ||
              t?.common?.vocabularyNotebook ||
              "Sổ tay từ vựng"}
          </h1>
        </div>

        {/* State Switcher for Dev / Testing preview */}
        <div className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 p-1 text-xs font-semibold text-slate-600">
          <span className="px-2 text-slate-400">Xem thử:</span>
          <button
            type="button"
            onClick={() => setPreviewState("has_due")}
            className={`rounded-lg px-2.5 py-1 transition-all ${
              previewState === "has_due" || (!previewState && dueCount > 0 && totalCards > 0)
                ? "bg-white font-bold text-rose-800 shadow-xs"
                : "hover:text-slate-900"
            }`}
          >
            Còn thẻ
          </button>
          <button
            type="button"
            onClick={() => setPreviewState("done")}
            className={`rounded-lg px-2.5 py-1 transition-all ${
              previewState === "done" || (!previewState && dueCount === 0 && totalCards > 0)
                ? "bg-white font-bold text-rose-800 shadow-xs"
                : "hover:text-slate-900"
            }`}
          >
            Đã xong
          </button>
          <button
            type="button"
            onClick={() => setPreviewState("empty")}
            className={`rounded-lg px-2.5 py-1 transition-all ${
              previewState === "empty" || (!previewState && totalCards === 0)
                ? "bg-white font-bold text-rose-800 shadow-xs"
                : "hover:text-slate-900"
            }`}
          >
            Sổ rỗng
          </button>
        </div>
      </div>

      {/* Main Hero Banner (3 states: has_due, done, empty) */}
      <FlashcardHeroBanner
        dueCount={dueCount}
        totalCards={totalCards}
        overdueCount={3}
        onStartDue={handleStartDueReview}
        onStartFree={handleStartFreeReview}
        onStartSpeaking={handleStartSpeaking}
      />

      {/* 3 Stat Cards (Tổng thẻ, Đến hạn hôm nay, Streak) */}
      <FlashcardStatCards
        totalCards={totalCards}
        dueCount={dueCount}
        streakDays={5}
      />

      {/* Section Từ sai gần đây (7 ngày) - Ẩn khi sổ rỗng (totalCards === 0) */}
      {totalCards > 0 && (
        <RecentWrongList items={recentWrongItems} />
      )}

      {/* Section Bộ thẻ hệ thống */}
      <SystemDecksSection
        decks={currentDecks}
        onViewAll={handleViewAllDecks}
        onSelectDeck={handleSelectDeck}
      />
    </div>
  )
}

export default VocabularyNotebookPage
