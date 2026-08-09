import React, { useMemo } from "react"
import { Calendar, Heart, Lock, Trophy, Info } from "lucide-react"
import { useLanguage } from "@/shared/context/LanguageContext"
import { useTimezone } from "@/shared/hooks/useTimezone"
import { useGetChallengeLeaderboardQuery } from "@/store/api/reelsApi"
import RankRow from "./RankRow"
import PodiumItem from "./PodiumItem"
import fallbackChallengeCard from "@/shared/assets/images/reels/ChallengeCard.png"


export default function PastChallengeLeaderboardView({ 
  challengeId, 
  selectedChallenge, 
  onReelClick
}) {
  const { t } = useLanguage()
  const { formatDate } = useTimezone()
  
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
      <div className="p-4 sm:p-5 border-b border-gray-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-gradient-to-r from-red-50/40 to-white">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl overflow-hidden shrink-0 shadow-sm border border-gray-100 bg-gray-100">
            <img 
              src={selectedChallenge.bannerUrl || selectedChallenge.thumbnailUrl || selectedChallenge.coverUrl || fallbackChallengeCard} 
              alt={selectedChallenge.hashtag || selectedChallenge.name} 
              className="w-full h-full object-cover" 
              onError={(e) => {
                e.currentTarget.src = fallbackChallengeCard
              }}
            />
          </div>
          <div className="flex flex-col min-w-0">
            <h2 className="text-base sm:text-lg font-bold text-gray-900 truncate">
              {selectedChallenge.hashtag || selectedChallenge.name}
            </h2>
            <div className="flex flex-wrap items-center gap-2 mt-1">
              <div className="flex items-center gap-1.5 text-xs text-gray-500 font-medium whitespace-nowrap">
                <Calendar size={13} className="text-gray-400 shrink-0" />
                <span className="whitespace-nowrap">
                  {formatDate(selectedChallenge.startDate)} - {formatDate(selectedChallenge.endDate)}
                </span>
              </div>
              <div className="flex items-center gap-1 text-[11px] text-gray-500 bg-gray-100 px-2 py-0.5 rounded-md shrink-0">
                <Lock size={11} />
                <span>{t?.catSpeak?.reels?.leaderboard?.votingClosed || "Đã đóng cổng bình chọn"}</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Kết quả chung cuộc Badge */}
        <div className="flex items-center gap-1.5 bg-amber-100 border border-amber-200 text-amber-900 font-bold text-xs px-3 py-1.5 rounded-full shrink-0 self-start sm:self-center">
          <Trophy size={14} className="text-amber-600" />
          <span>{t?.catSpeak?.reels?.leaderboard?.finalResults || "Kết quả chung cuộc"}</span>
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
              <PodiumItem 
                entry={top3[2]} 
                rank={3} 
                onClick={() => {
                  const reelData = top3[2]?.reel || top3[2];
                  if (reelData && (reelData.reelId || reelData.id)) {
                    onReelClick && onReelClick({ id: reelData.reelId || reelData.id, ...reelData });
                  }
                }} 
              />
              <PodiumItem 
                entry={top3[1]} 
                rank={2} 
                onClick={() => {
                  const reelData = top3[1]?.reel || top3[1];
                  if (reelData && (reelData.reelId || reelData.id)) {
                    onReelClick && onReelClick({ id: reelData.reelId || reelData.id, ...reelData });
                  }
                }} 
              />
              <PodiumItem 
                entry={top3[0]} 
                rank={1} 
                onClick={() => {
                  const reelData = top3[0]?.reel || top3[0];
                  if (reelData && (reelData.reelId || reelData.id)) {
                    onReelClick && onReelClick({ id: reelData.reelId || reelData.id, ...reelData });
                  }
                }} 
              />
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
              <span>{t?.catSpeak?.reels?.leaderboard?.dataFrozenAt || "Dữ liệu đã được đóng tại thời điểm kết thúc thử thách"} ({formatDate(selectedChallenge.endDate)}) 23:59</span>
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
