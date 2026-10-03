import React from "react"
import { ArrowRight, BookOpen } from "lucide-react"

/**
 * SystemDecksSection component (fc01)
 *
 * @param {Object} props
 * @param {Array} [props.decks] - Danh sách bộ thẻ hệ thống
 * @param {Function} [props.onViewAll] - Callback khi bấm "Xem tất cả"
 * @param {Function} [props.onSelectDeck] - Callback khi chọn 1 bộ thẻ
 */
const SystemDecksSection = ({ decks = [], onViewAll, onSelectDeck }) => {
  return (
    <div className="space-y-4" data-testid="system-decks-section">
      <div className="flex items-center justify-between">
        <h3 className="text-base sm:text-lg font-bold text-slate-900">
          Bộ thẻ hệ thống
        </h3>
        <button
          type="button"
          onClick={onViewAll}
          className="group inline-flex items-center gap-1 text-sm font-bold text-[#680411] transition-colors hover:text-rose-950"
        >
          <span>Xem tất cả</span>
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </button>
      </div>

      {decks && decks.length > 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {decks.slice(0, 4).map((deck) => (
            <button
              key={deck.id}
              type="button"
              onClick={() => onSelectDeck?.(deck.id)}
              className="flex flex-col justify-between rounded-2xl border border-slate-100 bg-white p-4 text-left shadow-xs transition-all hover:border-rose-100 hover:shadow-md"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-50 text-slate-600">
                  <BookOpen className="h-4 w-4" />
                </div>
                {deck.due_count > 0 && (
                  <span className="rounded-full bg-rose-50 px-2.5 py-0.5 text-xs font-bold text-[#680411]">
                    {deck.due_count} đến hạn
                  </span>
                )}
              </div>

              <div className="mt-3">
                <h4 className="font-bold text-slate-900 text-sm">{deck.name}</h4>
                <p className="mt-1 line-clamp-1 text-xs text-slate-500 font-normal">
                  {deck.description || `${deck.total_cards} thẻ từ vựng`}
                </p>
                <div className="mt-2 text-xs font-semibold text-slate-400">
                  {deck.total_cards} thẻ
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default SystemDecksSection
