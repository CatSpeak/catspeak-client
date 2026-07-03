import React from "react"
import { Heart } from "lucide-react"
import { formatScore } from "../../utils/formatters"

export default function PodiumItem({ entry, rank, onClick }) {
  if (!entry) return <div className="flex-1" />

  const username = entry.reel?.nickname || entry.reel?.username || "User name"
  const handle = entry.reel?.username || "username"
  const score = entry.score || 0

  // Rank 1 is middle, Rank 2 is left, Rank 3 is right
  const heights = {
    1: "h-32 sm:h-40",
    2: "h-24 sm:h-32",
    3: "h-20 sm:h-24"
  }
  
  const avatarSizes = {
    1: "w-14 h-14 sm:w-16 sm:h-16",
    2: "w-12 h-12 sm:w-14 sm:h-14",
    3: "w-12 h-12 sm:w-14 sm:h-14"
  }

  const isRank1 = rank === 1

  return (
    <div 
      className={`flex flex-col items-center justify-end flex-1 ${isRank1 ? "z-10" : "z-0"} cursor-pointer hover:opacity-90 transition-opacity`}
      onClick={onClick}
    >
      <div className="flex flex-col items-center mb-3 px-1">
        <div className={`${avatarSizes[rank]} rounded-full bg-gray-200 overflow-hidden border-2 ${isRank1 ? "border-[#F59E0B]" : "border-gray-200"} shadow-sm mb-2 relative z-10`}>
          <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${handle}`} alt="" className="w-full h-full object-cover" />
        </div>
        <span className="font-bold text-gray-900 text-[12px] sm:text-[13px] text-center leading-tight mb-0.5 break-words max-w-[100px]">{username}</span>
        <span className="text-gray-500 text-[10px] sm:text-[11px] text-center leading-tight break-words max-w-[100px]">@{handle}</span>
        <span className="font-bold text-[11px] sm:text-[12px] mt-1 flex items-center gap-1 text-gray-900">
          {formatScore(score)} <Heart size={12} className="text-cath-red-700 fill-cath-red-700" />
        </span>
      </div>
      <div className={`w-16 sm:w-24 bg-[#FCE38A] flex items-center justify-center font-bold text-lg sm:text-xl text-[#92400E] rounded-xl shadow-sm ${heights[rank]} relative mt-1`}>
        {rank}
      </div>
    </div>
  )
}
