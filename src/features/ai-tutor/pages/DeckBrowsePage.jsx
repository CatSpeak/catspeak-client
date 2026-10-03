import React, { useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { ArrowLeft, ArrowRight, Lock, Volume2 } from "lucide-react"
import {
  useGetDeckCardsQuery,
  useGetFlashcardDecksQuery,
} from "../api/flashcardApi"
import { useLanguage } from "@/shared/context/LanguageContext"
import { MOCK_DECKS, getMockCardsForDeck } from "@/store/api/flashcardMocks"

/**
 * DeckBrowsePage (fc05 - Chi tiết bộ thẻ / Browse Mode)
 *
 * Cho phép người dùng duyệt danh sách từ vựng trong một bộ thẻ ở chế độ chỉ đọc,
 * xem Hán tự, Pinyin, Nghĩa tiếng Việt và nghe phát âm thanh.
 */
const DeckBrowsePage = () => {
  const navigate = useNavigate()
  const { lang: paramLang, deckId = "hsk2" } = useParams()
  const { language } = useLanguage()
  const currentLang = paramLang || language || "vi"

  // Tab filter: "all" (Tất cả) | "mastered" (Nhớ lâu dài)
  const [activeTab, setActiveTab] = useState("all")
  // State từ đang phát âm
  const [playingWord, setPlayingWord] = useState(null)

  // Lấy thông tin danh sách decks và thẻ của deck hiện tại
  const { data: decksData } = useGetFlashcardDecksQuery()
  const { data: deckCardsData, isLoading } = useGetDeckCardsQuery({ deckId })

  const allDecks = decksData || MOCK_DECKS
  const currentDeck = allDecks.find((d) => d.id === deckId) || {
    id: deckId,
    name: deckId.toUpperCase(),
    total_cards: 0,
  }

  const cardsResponse = deckCardsData || getMockCardsForDeck(deckId)
  const allCards = cardsResponse.items || []

  // Lọc thẻ theo tab
  const displayedCards =
    activeTab === "mastered"
      ? allCards.filter((c) => c.is_mastered)
      : allCards

  // Phát âm từ vựng
  const handlePlayAudio = (word, audioUrl) => {
    setPlayingWord(word)
    if (audioUrl) {
      const audio = new Audio(audioUrl)
      audio.onended = () => setPlayingWord(null)
      audio.onerror = () => {
        // Fallback sang Web Speech API
        if ("speechSynthesis" in window) {
          window.speechSynthesis.cancel()
          const utterance = new SpeechSynthesisUtterance(word)
          utterance.lang = "zh-CN"
          utterance.onend = () => setPlayingWord(null)
          window.speechSynthesis.speak(utterance)
        } else {
          setPlayingWord(null)
        }
      }
      audio.play().catch(() => {
        if ("speechSynthesis" in window) {
          window.speechSynthesis.cancel()
          const utterance = new SpeechSynthesisUtterance(word)
          utterance.lang = "zh-CN"
          utterance.onend = () => setPlayingWord(null)
          window.speechSynthesis.speak(utterance)
        } else {
          setPlayingWord(null)
        }
      })
      return
    }

    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel()
      const utterance = new SpeechSynthesisUtterance(word)
      utterance.lang = "zh-CN"
      utterance.onend = () => setPlayingWord(null)
      window.speechSynthesis.speak(utterance)
    } else {
      setTimeout(() => setPlayingWord(null), 1000)
    }
  }

  const handleStartReview = () => {
    navigate(`/${currentLang}/flashcards/review?deck_id=${encodeURIComponent(deckId)}&mode=due`)
  }

  const handleBack = () => {
    navigate(`/${currentLang}/ai-tutor/vocabulary-notebook`)
  }

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 pb-12">
      {/* Back Button Link */}
      <div>
        <button
          type="button"
          onClick={handleBack}
          className="inline-flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-rose-800 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 stroke-[2.5]" />
          <span>Quay lại Sổ tay từ vựng</span>
        </button>
      </div>

      {/* Page Header: Title + Card Count + Review Button */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-baseline gap-3">
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
            Bộ thẻ: {currentDeck.name}
          </h1>
          <span className="text-sm sm:text-base font-semibold text-slate-500">
            {currentDeck.total_cards} thẻ
          </span>
        </div>

        <button
          type="button"
          onClick={handleStartReview}
          className="inline-flex items-center gap-2 rounded-xl bg-[#680411] px-6 py-2.5 text-sm sm:text-base font-bold text-white shadow-sm transition-all hover:bg-[#52030d] active:scale-98"
        >
          <span>Ôn tập</span>
          <ArrowRight className="h-4 w-4 stroke-[2.5]" />
        </button>
      </div>

      {/* Notice Bar: Chỉ đọc — không ảnh hưởng lịch ôn */}
      <div>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 px-3.5 py-1 text-xs sm:text-sm font-bold text-[#680411]">
          <Lock className="h-3.5 w-3.5 stroke-[2.5]" />
          <span>Chỉ đọc — không ảnh hưởng lịch ôn</span>
        </span>
      </div>

      {/* Filter Tabs (Tất cả / Nhớ lâu dài) */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setActiveTab("all")}
          className={`rounded-full px-5 py-1.5 text-xs sm:text-sm font-bold transition-all ${
            activeTab === "all"
              ? "bg-[#680411] text-white shadow-xs"
              : "border border-slate-200 bg-white text-slate-600 hover:text-slate-900"
          }`}
        >
          Tất cả
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("mastered")}
          className={`rounded-full px-5 py-1.5 text-xs sm:text-sm font-bold transition-all ${
            activeTab === "mastered"
              ? "bg-[#680411] text-white shadow-xs"
              : "border border-slate-200 bg-white text-slate-600 hover:text-slate-900"
          }`}
        >
          Nhớ lâu dài
        </button>
      </div>

      {/* Vocabulary Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
        {/* Table Header */}
        <div className="grid grid-cols-4 items-center gap-4 bg-slate-50/90 px-6 py-3.5 text-xs sm:text-sm font-bold text-slate-600 border-b border-slate-100">
          <div>Hán tự</div>
          <div>Pinyin</div>
          <div>Nghĩa</div>
          <div>Audio</div>
        </div>

        {/* Table Body */}
        {isLoading ? (
          <div className="p-8 text-center text-sm font-medium text-slate-400">
            Đang tải danh sách thẻ...
          </div>
        ) : displayedCards.length === 0 ? (
          <div className="p-8 text-center text-sm font-medium text-slate-400">
            {activeTab === "mastered"
              ? "Chưa có từ nào thuộc danh sách Nhớ lâu dài."
              : "Chưa có từ vựng nào trong bộ thẻ này."}
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {displayedCards.map((card) => (
              <div
                key={card.card_id}
                className="grid grid-cols-4 items-center gap-4 px-6 py-4 transition-colors hover:bg-slate-50/60"
              >
                {/* Hán tự */}
                <div className="text-base sm:text-lg font-bold text-slate-900">
                  {card.word}
                </div>

                {/* Pinyin */}
                <div className="text-sm sm:text-base font-medium text-slate-700">
                  {card.pinyin || "—"}
                </div>

                {/* Nghĩa */}
                <div className="text-sm sm:text-base font-normal text-slate-600">
                  {card.meaning_vi || "—"}
                </div>

                {/* Audio Button */}
                <div>
                  <button
                    type="button"
                    onClick={() => handlePlayAudio(card.word, card.audio_url)}
                    className={`inline-flex items-center gap-1.5 text-sm font-bold transition-all ${
                      playingWord === card.word
                        ? "text-rose-600 animate-pulse"
                        : "text-[#680411] hover:text-[#52030d] hover:underline"
                    }`}
                  >
                    <Volume2 className="h-4 w-4 stroke-[2.2]" />
                    <span>Nghe</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default DeckBrowsePage
