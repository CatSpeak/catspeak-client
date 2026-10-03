import React from "react"
import { TriangleAlert } from "lucide-react"

/**
 * RecentWrongList component (fc01)
 *
 * @param {Object} props
 * @param {Array} [props.items] - Danh sách từ sai gần đây
 */
const RecentWrongList = ({
  items = [
    { id: "1", word: "银行", pinyin: "yínháng", meaning_vi: "ngân hàng" },
    { id: "2", word: "学习", pinyin: "xuéxí", meaning_vi: "học tập" },
    { id: "3", word: "开会", pinyin: "kāihuì", meaning_vi: "khai mạc / họp" },
  ],
}) => {
  return (
    <div className="space-y-3" data-testid="recent-wrong-section">
      <h3 className="text-base sm:text-lg font-bold text-slate-900">
        Từ sai gần đây (7 ngày)
      </h3>

      <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm divide-y divide-slate-100">
        {items.length === 0 ? (
          <div className="p-6 text-center text-sm font-medium text-slate-400">
            Không có từ sai nào trong 7 ngày qua.
          </div>
        ) : (
          items.map((item, index) => (
            <div
              key={item.id || index}
              className="flex items-center gap-3 px-5 py-4 transition-colors hover:bg-slate-50/70"
            >
              <TriangleAlert className="h-5 w-5 flex-shrink-0 text-amber-500" />
              <div className="text-sm sm:text-base font-semibold text-slate-800">
                <span className="font-medium text-slate-900">{item.pinyin}</span>
                <span className="mx-2 text-slate-400">·</span>
                <span className="font-normal text-slate-600">{item.meaning_vi}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default RecentWrongList
