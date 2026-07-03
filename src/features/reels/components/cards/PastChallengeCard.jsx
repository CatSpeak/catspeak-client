import React from "react"
import { useGetChallengeLeaderboardQuery } from "@/store/api/reelsApi"
import { ArrowRight, Calendar, Heart, Trophy } from "lucide-react"
import { getImageUrl } from "@/shared/utils/imageUtils"
import { useLanguage } from "@/shared/context/LanguageContext"
import { formatScore, formatChallengeDate } from "../../utils/formatters"

export default function PastChallengeCard({ challenge, isSelected, onSelectChallenge }) {
  const { t } = useLanguage()
  const { data: leaderboardResponse } = useGetChallengeLeaderboardQuery(
    { challengeId: challenge.challengeId, take: 1 },
    { skip: !challenge.challengeId }
  )

  const getWinnerEntry = (res) => {
    if (!res) return null
    if (Array.isArray(res)) return res[0]
    if (Array.isArray(res.data?.entries)) return res.data.entries[0]
    if (Array.isArray(res.entries)) return res.entries[0]
    if (Array.isArray(res.data)) return res.data[0]
    return null
  }

  const winnerEntry = getWinnerEntry(leaderboardResponse)
  
  // Extract real winner info (or fallback if loading/empty)
  const winnerScore = formatScore(winnerEntry?.score || 0)
  const winnerNickname = winnerEntry?.reel?.nickname || winnerEntry?.reel?.username || "User"
  const winnerUsername = winnerEntry?.reel?.username || "unknown"

  return (
    <div 
      onClick={() => onSelectChallenge(challenge.challengeId)}
      className={`flex flex-col sm:flex-row gap-4 p-4 rounded-2xl border transition-all cursor-pointer ${
        isSelected 
          ? "border-cath-red-700 bg-[#FFF9F9] shadow-[0_0_0_1px_rgba(202,30,44,0.1)]" 
          : "border-gray-200 bg-white hover:border-gray-300"
      }`}
    >
      {/* Thumbnail */}
      <div className="relative w-full sm:w-[130px] h-[180px] sm:h-[130px] rounded-xl overflow-hidden shrink-0 shadow-sm">
        <img 
          src={getImageUrl(challenge.bannerUrl || challenge.thumbnailUrl || challenge.coverUrl) || "https://res.cloudinary.com/di8uvvqf2/image/upload/v1780664239/catspeak/uploads/jt8dilomjdizdwkut1qv.png"} 
          alt={challenge.hashtag || challenge.name} 
          className="w-full h-full object-cover"
          onError={(e) => {
            e.currentTarget.src = "https://res.cloudinary.com/di8uvvqf2/image/upload/v1780664239/catspeak/uploads/jt8dilomjdizdwkut1qv.png"
          }}
        />
        <div className="absolute top-2 left-2 bg-gray-400 text-white text-[11px] font-medium px-2.5 py-1 rounded-md">
          {t?.catSpeak?.reels?.ended || "Đã kết thúc"}
        </div>
      </div>
      
      {/* Content Container */}
      <div className="flex flex-col sm:flex-row flex-1 min-w-0 justify-between items-start sm:items-center py-0.5 gap-4">
        
        {/* Left: Title, Desc, Dates */}
        <div className="flex flex-col justify-between min-w-0 flex-1 self-stretch">
          <div>
            <h3 className="font-bold text-[15px] text-gray-900 truncate mb-1">
              {challenge.hashtag || challenge.name}
            </h3>
            <p className="text-[13px] text-gray-500 line-clamp-2">
              {challenge.description || t?.catSpeak?.reels?.challengeDescPlaceholder || "Thử thách hấp dẫn"}
            </p>
          </div>
          <div className="flex items-center gap-1.5 text-gray-500 text-[12px] font-medium mt-auto pt-4">
            <Calendar size={13} />
            <span>
              {formatChallengeDate(challenge.startDate)} - {formatChallengeDate(challenge.endDate)}
            </span>
          </div>
        </div>

        {/* Divider on mobile */}
        <div className="w-full h-[1px] bg-gray-100 sm:hidden"></div>

        {/* Middle: Winner Info */}
        <div className="flex flex-row sm:flex-col items-center sm:items-start justify-between sm:justify-center shrink-0 w-full sm:w-auto sm:min-w-[160px]">
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5 bg-[#FDE68A] px-3 py-1.5 rounded-full text-[#92400E] font-bold text-[12px] w-max shadow-sm mb-0 sm:mb-3">
              <Trophy size={14} /> {t?.catSpeak?.reels?.leaderboard?.winner || "Người chiến thắng"}
            </div>
            
            {!winnerEntry && (
              <div className="text-[12px] text-gray-400 mt-1 sm:ml-2 italic">{t?.catSpeak?.reels?.leaderboard?.updating || "Đang cập nhật..."}</div>
            )}
          </div>
          
          {winnerEntry && (
            <div className="flex items-center sm:block">
              <div className="flex items-center gap-2 sm:mb-1.5 sm:ml-2">
                <img src={getImageUrl(winnerEntry?.reel?.coverUrl || winnerEntry?.reel?.thumbnailUrl) || `https://api.dicebear.com/7.x/avataaars/svg?seed=${winnerUsername}`} className="w-8 h-8 rounded-full bg-gray-200 shrink-0 border border-gray-100" />
                <div className="flex flex-col min-w-0 text-left">
                  <span className="text-[13px] font-bold text-gray-900 leading-tight truncate w-full max-w-[100px]">{winnerNickname}</span>
                  <span className="text-[11px] text-gray-500 leading-tight truncate w-full max-w-[100px]">@{winnerUsername}</span>
                </div>
              </div>
              <div className="hidden sm:flex items-center gap-1 text-[13px] font-bold text-gray-900 ml-12">
                <Heart size={13} className="text-cath-red-700 fill-cath-red-700" /> {winnerScore}
              </div>
            </div>
          )}
        </div>

        {/* Right: View Leaderboard Button */}
        <div className="flex shrink-0 w-full sm:w-auto mt-2 sm:mt-0">
          <div className="flex items-center justify-center w-full gap-1 text-[13px] font-bold text-cath-red-700 bg-white px-4 py-2.5 sm:py-2 rounded-xl sm:rounded-full border border-cath-red-700 shadow-sm group-hover:bg-red-50 transition-colors">
            {t?.catSpeak?.reels?.leaderboard?.viewLeaderboard || "Xem bảng xếp hạng"} <ArrowRight size={14} />
          </div>
        </div>
      </div>
    </div>
  )
}
