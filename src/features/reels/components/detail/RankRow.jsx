import React from "react"
import { Heart, Play } from "lucide-react"
import { formatScore } from "../../utils/formatters"

export default function RankRow({ rank, username, handle, score, coverUrl, onClick }) {
  const getRankBadge = (r) => {
    if (r <= 3) {
      return (
        <div className="w-7 h-7 rounded-full bg-[#F59E0B] text-gray-900 flex items-center justify-center font-bold text-sm">
          {r}
        </div>
      )
    }
    return (
      <div className="w-7 h-7 flex items-center justify-center font-bold text-[15px] text-[#F59E0B]">
        {r}
      </div>
    )
  }

  return (
    <div 
      className="flex items-center justify-between p-3 sm:p-4 hover:bg-gray-50 transition-colors bg-white cursor-pointer"
      onClick={onClick}
    >
      <div className="flex items-center gap-3 sm:gap-4 min-w-0">
        <div className="w-8 flex justify-center shrink-0">
          {getRankBadge(rank)}
        </div>
        <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden shrink-0 border border-gray-100">
          <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${handle}`} alt="" className="w-full h-full object-cover" />
        </div>
        <div className="flex flex-col min-w-0">
          <span className="font-semibold text-gray-900 text-[14px] truncate">{username}</span>
          <span className="text-gray-500 text-[12px] truncate">@{handle}</span>
        </div>
      </div>
      
      <div className="flex items-center gap-4 sm:gap-6 shrink-0 pl-2">
        <span className="font-bold text-[14px] flex items-center gap-1.5">
          {formatScore(score)} <Heart size={14} className="text-cath-red-700 fill-cath-red-700" />
        </span>
        <div className="w-16 h-10 rounded-lg overflow-hidden relative shrink-0 shadow-sm border border-gray-200 bg-gray-100">
          {coverUrl && <img src={coverUrl} alt="" className="w-full h-full object-cover" />}
          <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
            <Play size={16} className="text-white fill-white" />
          </div>
        </div>
      </div>
    </div>
  )
}
