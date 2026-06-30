import React, { useMemo } from "react"
import { Calendar, Heart, Lock, Trophy, Info } from "lucide-react"
import { useLanguage } from "@/shared/context/LanguageContext"
import { useGetChallengeLeaderboardQuery } from "@/store/api/reelsApi"
import RankRow from "./RankRow"
import PodiumItem from "./PodiumItem"
import { formatChallengeDate } from "../../utils/formatters"


export default function PastChallengeLeaderboardView({ 
  challengeId, 
  selectedChallenge, 
  challengeStatus,
  onReelClick
}) {
  const { t } = useLanguage()
  
  const {
    currentData: leaderboardResponse,
    isLoading,
  } = useGetChallengeLeaderboardQuery(
    { challengeId, take: 50 },
    { skip: !challengeId }
  )

  const leaderboardEntries = useMemo(() => {
    if (!leaderboardResponse) return []
    if (Array.isArray(leaderboardResponse)) return leaderboardResponse
    if (Array.isArray(leaderboardResponse.data?.entries)) return leaderboardResponse.data.entries
    if (Array.isArray(leaderboardResponse.entries)) return leaderboardResponse.entries
    return []
  }, [leaderboardResponse])

  if (!challengeId || !selectedChallenge) return null



  const top3 = leaderboardEntries.slice(0, 3)
  const restEntries = leaderboardEntries.slice(3)

  return (
    <div className="w-full bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
      {/* Header */}
      <div className="p-4 sm:p-6 border-b border-gray-100 flex items-center gap-4">
        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden shrink-0 shadow-sm border border-gray-100">
          <img 
            src={selectedChallenge.bannerUrl || selectedChallenge.thumbnailUrl || selectedChallenge.coverUrl} 
            alt={selectedChallenge.hashtag || selectedChallenge.name} 
            className="w-full h-full object-cover" 
          />
        </div>
        <div className="flex flex-col flex-1 min-w-0 pt-0.5">
          <h2 className="text-[17px] sm:text-[18px] font-bold text-gray-900 truncate mb-1">
            {selectedChallenge.hashtag || selectedChallenge.name}
          </h2>
          <div className="flex items-center gap-1.5 text-gray-500 text-[13px] font-medium mb-1.5">
            <Calendar size={14} />
            <span>
              {formatChallengeDate(selectedChallenge.startDate)} - {formatChallengeDate(selectedChallenge.endDate)}
            </span>
          </div>
          <div className="flex items-center gap-1 text-gray-500 text-[12px] bg-gray-100 px-2 py-0.5 rounded-md w-max">
            <Lock size={12} />
            <span>{t?.catSpeak?.reels?.leaderboard?.votingClosed || "Đã đóng cổng bình chọn"}</span>
          </div>
        </div>
        
        {/* Kết quả chung cuộc Badge */}
        <div className="hidden sm:flex items-center gap-1.5 bg-[#FEF3C7] px-3 py-1.5 rounded-full border border-[#FDE68A] text-[#92400E] font-bold text-[13px] shrink-0">
          <Trophy size={14} /> {t?.catSpeak?.reels?.leaderboard?.finalResults || "Kết quả chung cuộc"}
        </div>
      </div>

      {isLoading ? (
        <div className="p-8 flex items-center justify-center">
          <div className="animate-spin w-8 h-8 border-4 border-gray-200 border-t-cath-red-700 rounded-full"></div>
        </div>
      ) : leaderboardEntries.length > 0 ? (
        <div className="flex flex-col flex-1">
          {/* Podium */}
          {top3.length > 0 && (
            <div className="flex items-end justify-center px-4 pt-10 pb-6 gap-3 sm:gap-6 border-b border-gray-100 max-w-md mx-auto w-full">
              <PodiumItem entry={top3[2]} rank={3} />
              <PodiumItem entry={top3[1]} rank={2} />
              <PodiumItem entry={top3[0]} rank={1} />
            </div>
          )}

          {/* List of remaining ranks */}
          <div className="flex flex-col divide-y divide-gray-100">
            {restEntries.map((entry, idx) => {
              const actualRank = entry.rank || (idx + 4)
              const username = entry.reel?.nickname || entry.reel?.username || "User name"
              const handle = entry.reel?.username || "username"
              const score = entry.score || 0
              const coverUrl = entry.reel?.coverUrl || entry.reel?.thumbnailUrl

              return (
                <RankRow 
                  key={entry.id || idx} 
                  rank={actualRank} 
                  username={username} 
                  handle={handle} 
                  score={score} 
                  coverUrl={coverUrl} 
                  onClick={() => {
                     if (onReelClick) {
                       const reelData = entry.reel || entry
                       const reelId = reelData.reelId || reelData.id || entry.id || entry.reelId
                       if (reelId) {
                         onReelClick({ id: reelId, ...reelData })
                       }
                     }
                  }}
                />
              )
            })}
          </div>

          {/* Footer Info */}
          <div className="p-4 sm:p-5 bg-gray-50 border-t border-gray-200 mt-auto flex items-start gap-2.5 text-gray-500">
            <Info size={16} className="shrink-0 mt-0.5" />
            <div className="flex flex-col text-[12px] sm:text-[13px] font-medium leading-relaxed">
              <span>{t?.catSpeak?.reels?.leaderboard?.dataFrozenAt || "Dữ liệu đã được đóng tại thời điểm kết thúc thử thách"} ({formatChallengeDate(selectedChallenge.endDate)}) 23:59</span>
              <span className="text-gray-400">{t?.catSpeak?.reels?.leaderboard?.dataFrozenNotice || "Kết quả sẽ không thay đổi dù lượt thích có thay đổi sau thời điểm này"}</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="py-20 flex flex-col items-center justify-center text-gray-500">
          <span className="text-4xl mb-3">👻</span>
          <span className="font-semibold text-gray-600">{t?.catSpeak?.reels?.leaderboard?.emptyLeaderboard || "Bảng xếp hạng trống"}</span>
        </div>
      )}
    </div>
  )
}
