import React from "react"
import { useGetChallengeLeaderboardQuery } from "@/store/api/reelsApi"
import { ArrowRight, Calendar, Trophy } from "lucide-react"
import { getImageUrl } from "@/shared/utils/imageUtils"
import { useLanguage } from "@/shared/context/LanguageContext"
import { formatScore, formatChallengeDate } from "../../utils/formatters"
import fallbackChallengeCard from "@/shared/assets/images/reels/ChallengeCard.png"

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
  const winnerNickname = winnerEntry?.reel?.nickname || winnerEntry?.reel?.username || "User"

  const startDateFormatted = formatChallengeDate(challenge.startDate)
  const endDateFormatted = formatChallengeDate(challenge.endDate)

  return (
    <div 
      onClick={() => onSelectChallenge(challenge.challengeId)}
      className={`group flex flex-col sm:flex-row items-start sm:items-center gap-3.5 p-3.5 sm:p-4 rounded-2xl border transition-all cursor-pointer ${
        isSelected 
          ? "border-cath-red-700 bg-[#FFF9F9] shadow-sm" 
          : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm"
      }`}
    >
      {/* Thumbnail */}
      <div className="relative w-full sm:w-28 sm:h-28 h-36 rounded-xl overflow-hidden shrink-0 bg-gray-100 border border-gray-100">
        <img 
          src={getImageUrl(challenge.bannerUrl || challenge.thumbnailUrl || challenge.coverUrl) || fallbackChallengeCard} 
          alt={challenge.hashtag || challenge.name} 
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          onError={(e) => {
            e.currentTarget.src = fallbackChallengeCard
          }}
        />
        <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-sm text-white text-[10px] font-semibold px-2 py-0.5 rounded-md">
          {t?.catSpeak?.reels?.ended || "Đã kết thúc"}
        </div>
      </div>
      
      {/* Main Content Area */}
      <div className="flex flex-col flex-1 min-w-0 justify-between self-stretch gap-2">
        {/* Header & Desc */}
        <div className="min-w-0">
          <h3 className="font-bold text-sm sm:text-base text-gray-900 truncate">
            {challenge.hashtag || challenge.name}
          </h3>
          {challenge.name && challenge.hashtag && (
            <p className="text-xs text-gray-500 truncate mt-0.5">
              {challenge.name}
            </p>
          )}
        </div>

        {/* Date Range */}
        <div className="flex items-center gap-1.5 text-xs text-gray-500 font-medium whitespace-nowrap">
          <Calendar size={13} className="shrink-0 text-gray-400" />
          <span className="whitespace-nowrap">
            {startDateFormatted} - {endDateFormatted}
          </span>
        </div>

        {/* Footer Row: Winner & Button */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-gray-100/80 mt-1">
          {/* Winner info */}
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-900 text-[11px] font-bold px-2 py-0.5 rounded-full shrink-0">
              <Trophy size={12} className="text-amber-600" />
              {t?.catSpeak?.reels?.leaderboard?.winner || "Người chiến thắng"}
            </span>
            {winnerEntry ? (
              <span className="text-xs font-semibold text-gray-800 truncate max-w-[110px]">
                {winnerNickname}
              </span>
            ) : (
              <span className="text-[11px] text-gray-400 italic truncate">
                {t?.catSpeak?.reels?.leaderboard?.updating || "Đang cập nhật..."}
              </span>
            )}
          </div>

          {/* Action Button */}
          <button 
            type="button"
            className="inline-flex items-center gap-1 text-xs font-bold text-cath-red-700 bg-red-50 group-hover:bg-cath-red-700 group-hover:text-white px-3 py-1.5 rounded-full border border-cath-red-200 transition-all duration-200 shrink-0 ml-auto"
          >
            <span>{t?.catSpeak?.reels?.leaderboard?.viewLeaderboard || "Xem bảng xếp hạng"}</span>
            <ArrowRight size={13} />
          </button>
        </div>
      </div>
    </div>
  )
}
