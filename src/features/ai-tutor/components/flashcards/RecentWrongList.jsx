import React from "react"
import { ChevronRight, Mic, TriangleAlert } from "lucide-react"

/**
 * RecentWrongList component (fc01)
 *
 * Bấm vào khối -> fc05 deck "Từ sai gần đây". "Luyện phát âm" -> màn luyện phát âm
 * các từ sai gần đây (FR-FC-020).
 *
 * @param {Object} props
 * @param {Array} [props.items] - Danh sách từ sai gần đây
 * @param {number} [props.total] - Tổng số từ sai trong 7 ngày
 * @param {Function} [props.onOpen] - Mở deck "Từ sai gần đây"
 * @param {Function} [props.onPractice] - Mở luyện phát âm
 */
const RecentWrongList = ({ items = [], total = 0, onOpen, onPractice }) => {
  // Thẻ Nghĩa và thẻ Phát âm của cùng một từ: hiện một dòng.
  const seen = new Set()
  const words = items.filter((it) => {
    const key = `${it.word}|${it.pinyin || ""}`
    if (seen.has(key)) return false
    seen.add(key)
    return true
  }).slice(0, 3)
  return (
    <div className="space-y-3" data-testid="recent-wrong-section">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-base sm:text-lg font-bold text-slate-900">
          Từ sai gần đây (7 ngày)
        </h3>
        <div className="flex items-center gap-2">
          {words.length > 0 && (
            <button
              type="button"
              onClick={onPractice}
              className="inline-flex items-center gap-1.5 rounded-full border border-rose-200 bg-rose-50 px-3.5 py-1.5 text-xs sm:text-sm font-bold text-[#680411] hover:bg-rose-100"
            >
              <Mic className="h-4 w-4" />
              Luyện phát âm
            </button>
          )}
          <button
            type="button"
            onClick={onOpen}
            className="inline-flex items-center gap-1 text-xs sm:text-sm font-bold text-slate-600 hover:text-[#680411]"
          >
            {total > 0 ? `Xem tất cả (${total} thẻ)` : "Xem deck"}
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm divide-y divide-slate-100">
        {words.length === 0 ? (
          <div className="p-6 text-center text-sm font-medium text-slate-400">
            Không có từ sai nào trong 7 ngày qua.
          </div>
        ) : (
          words.map((item, index) => (
            <button
              type="button"
              key={item.card_id || index}
              onClick={onOpen}
              className="flex w-full items-center gap-3 px-5 py-4 text-left transition-colors hover:bg-slate-50/70"
            >
              <TriangleAlert className="h-5 w-5 flex-shrink-0 text-amber-500" />
              <div className="text-sm sm:text-base font-semibold text-slate-800">
                <span className="font-medium text-slate-900" lang="zh">{item.word}</span>
                {item.pinyin && <span className="ml-1 font-normal text-slate-500">({item.pinyin})</span>}
                <span className="mx-2 text-slate-400">·</span>
                <span className={item.meaning_vi ? "font-normal text-slate-600" : "font-normal italic text-slate-400"}>
                  {item.meaning_vi || "Đang cập nhật nghĩa"}
                </span>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  )
}

export default RecentWrongList
