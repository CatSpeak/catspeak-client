import React from "react"
import { Search } from "lucide-react"

const SpeakingRoomSearchBar = ({
  searchQuery,
  onSearchChange,
  onRandomPick,
  placeholder = "Tìm kiếm chủ đề, từ vựng (ví dụ: mua sắm, 买水果, mai cai, du lịch...)",
}) => {
  return (
    <div className="flex flex-col sm:flex-row items-center gap-3">
      <div className="relative flex-1 w-full">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={placeholder}
          className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#990011]/20 focus:border-[#990011] transition-all shadow-2xs"
        />
      </div>

      <button
        type="button"
        onClick={onRandomPick}
        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-rose-50 text-[#990011] border border-rose-200 font-semibold text-sm hover:bg-rose-100/80 transition-colors shadow-2xs whitespace-nowrap cursor-pointer"
      >
        <span>🎲</span>
        <span>AI Chọn ngẫu nhiên</span>
      </button>
    </div>
  )
}

export default SpeakingRoomSearchBar
