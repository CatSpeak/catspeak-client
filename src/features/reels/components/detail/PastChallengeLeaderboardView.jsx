import React, { useMemo } from "react"
import { Calendar, Heart, Play, Lock, Trophy, Info } from "lucide-react"
import { useLanguage } from "@/shared/context/LanguageContext"
import { useGetChallengeLeaderboardQuery } from "@/store/api/reelsApi"

const RankRow = ({ rank, username, handle, score, coverUrl, onClick }) => {
  const formatCount = (c) => {
    const num = Math.round(Number(c) || 0)
    return num >= 1000 ? `${(num/1000).toFixed(1)}K` : String(num)
  }

  return (
    <div 
      className="flex items-center justify-between p-3 sm:p-4 hover:bg-gray-50 transition-colors bg-white cursor-pointer"
      onClick={onClick}
    >
      <div className="flex items-center gap-3 sm:gap-4 min-w-0">
        <div className="w-8 flex justify-center shrink-0">
          <div className="w-7 h-7 flex items-center justify-center font-bold text-[15px] text-[#F59E0B]">{rank}</div>
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
          {formatCount(score)} <Heart size={14} className="text-cath-red-700 fill-cath-red-700" />
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

const PodiumItem = ({ entry, rank }) => {
  if (!entry) return <div className="flex-1" />

  const username = entry.reel?.nickname || entry.reel?.username || "User name"
  const handle = entry.reel?.username || "username"
  const score = entry.score || 0
  const formatCount = (c) => {
    const num = Math.round(Number(c) || 0)
    return num >= 1000 ? `${(num/1000).toFixed(1)}K` : String(num)
  }

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
    <div className={`flex flex-col items-center justify-end flex-1 ${isRank1 ? "z-10" : "z-0"}`}>
      <div className="flex flex-col items-center mb-3 px-1">
        <div className={`${avatarSizes[rank]} rounded-full bg-gray-200 overflow-hidden border-2 ${isRank1 ? "border-[#F59E0B]" : "border-gray-200"} shadow-sm mb-2 relative z-10`}>
          <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${handle}`} alt="" className="w-full h-full object-cover" />
        </div>
        <span className="font-bold text-gray-900 text-[12px] sm:text-[13px] text-center leading-tight mb-0.5 break-words max-w-[100px]">{username}</span>
        <span className="text-gray-500 text-[10px] sm:text-[11px] text-center leading-tight break-words max-w-[100px]">@{handle}</span>
        <span className="font-bold text-[11px] sm:text-[12px] mt-1 flex items-center gap-1 text-gray-900">
          {formatCount(score)} <Heart size={12} className="text-cath-red-700 fill-cath-red-700" />
        </span>
      </div>
      <div className={`w-16 sm:w-24 bg-[#FCE38A] flex items-center justify-center font-bold text-lg sm:text-xl text-[#92400E] rounded-xl shadow-sm ${heights[rank]} relative mt-1`}>
        {rank}
      </div>
    </div>
  )
}

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

  const formatDate = (dateString) => {
    if (!dateString) return ""
    const date = new Date(dateString)
    return `${date.getDate().toString().padStart(2, "0")}/${(date.getMonth() + 1).toString().padStart(2, "0")}/${date.getFullYear()}`
  }

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
              {formatDate(selectedChallenge.startDate)} - {formatDate(selectedChallenge.endDate)}
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
