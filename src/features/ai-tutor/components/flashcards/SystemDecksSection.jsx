import React from "react"
import { BookOpen, ChevronRight, Tag, TriangleAlert } from "lucide-react"

/**
 * SystemDecksSection component (fc04 - Danh sách bộ thẻ hệ thống)
 *
 * Hiển thị danh sách các bộ thẻ phân nhóm theo:
 * 1. Theo trình độ HSK (Từ sai gần đây, HSK 1 - HSK 6, Ngoài HSK)
 * 2. Chủ đề (Gọi đồ uống, Đi làm, ...)
 *
 * @param {Object} props
 * @param {Array} [props.decks] - Danh sách bộ thẻ
 * @param {Function} [props.onSelectDeck] - Callback khi bấm vào một bộ thẻ
 */
const SystemDecksSection = ({ decks = [], onSelectDeck }) => {
  // Phân nhóm decks thành HSK và Chủ đề
  const hskDecks = decks.filter((d) => d.category !== "topic")
  const topicDecks = decks.filter((d) => d.category === "topic")

  const renderDeckRow = (deck) => {
    const isRecentWrong = deck.id === "recent-wrong"
    const isTopic = deck.category === "topic"

    return (
      <div
        key={deck.id}
        data-testid={`deck-row-${deck.id}`}
        onClick={() => onSelectDeck?.(deck.id)}
        className="group flex items-center justify-between rounded-2xl border border-slate-100 dark:border-[#3F3F3F] bg-white dark:bg-[#1A1A1A] px-5 py-3.5 shadow-xs transition-all hover:border-rose-100 dark:hover:border-neutral-500 hover:shadow-sm cursor-pointer"
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault()
            onSelectDeck?.(deck.id)
          }
        }}
      >
        {/* Left: Icon + Tên bộ thẻ */}
        <div className="flex items-center gap-3.5 sm:gap-4 min-w-0">
          <div
            className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl ${
              isRecentWrong
                ? "bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400"
                : "bg-rose-50/80 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300"
            }`}
          >
            {isRecentWrong && <TriangleAlert className="h-5 w-5 stroke-[2]" />}
            {!isRecentWrong && isTopic && <Tag className="h-5 w-5 stroke-[2]" />}
            {!isRecentWrong && !isTopic && <BookOpen className="h-5 w-5 stroke-[2]" />}
          </div>

          <span className="font-bold text-slate-900 dark:text-white text-sm sm:text-base truncate group-hover:text-[#680411] dark:group-hover:text-red-400 transition-colors">
            {deck.name}
          </span>
        </div>

        {/* Right: Số lượng thẻ + Badge đến hạn + Mũi tên */}
        <div className="flex items-center gap-3 sm:gap-4 flex-shrink-0">
          <span className="text-xs sm:text-sm font-semibold text-slate-500 dark:text-neutral-400">
            {deck.total_cards} thẻ
          </span>

          {deck.due_count > 0 && (
            <span className="rounded-full bg-rose-50 dark:bg-rose-950/40 px-3 py-1 text-xs font-bold text-[#680411] dark:text-red-400">
              {deck.due_count} đến hạn
            </span>
          )}

          <ChevronRight className="h-4 w-4 text-slate-400 dark:text-neutral-400 stroke-[2.2] transition-transform group-hover:translate-x-0.5" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 pt-2" data-testid="system-decks-section">
      <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
        Bộ thẻ hệ thống
      </h3>

      {/* Nhóm 1: Theo trình độ HSK */}
      <div className="space-y-2.5">
        <h4 className="text-xs sm:text-sm font-bold text-slate-500 dark:text-neutral-400 uppercase tracking-wider">
          Theo trình độ HSK
        </h4>
        <div className="space-y-2">
          {hskDecks.map(renderDeckRow)}
        </div>
      </div>

      {/* Nhóm 2: Chủ đề */}
      {topicDecks.length > 0 && (
        <div className="space-y-2.5 pt-2">
          <h4 className="text-xs sm:text-sm font-bold text-slate-500 dark:text-neutral-400 uppercase tracking-wider">
            Chủ đề
          </h4>
          <div className="space-y-2">
            {topicDecks.map(renderDeckRow)}
          </div>
        </div>
      )}
    </div>
  )
}

export default SystemDecksSection
