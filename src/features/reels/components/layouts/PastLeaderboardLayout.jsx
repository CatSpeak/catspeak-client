import React, { useMemo, useEffect, useState } from "react"
import { useLanguage } from "@/shared/context/LanguageContext"
import { useGetPastChallengesQuery, useGetChallengeLeaderboardQuery } from "@/store/api/reelsApi"
import ChallengeStatusPills from "../navigation/ChallengeStatusPills"
import { ArrowRight, Calendar, Heart, Trophy } from "lucide-react"
import { getImageUrl } from "@/shared/utils/imageUtils"
import { useMediaQuery } from "@/shared/hooks/useMediaQuery"

const formatCount = (c) => {
  const num = Math.ceil(Number(c) || 0)
  return num >= 1000 ? `${(num / 1000).toFixed(1)}K` : num.toString()
}

const PastChallengeCard = ({ challenge, isSelected, onSelectChallenge, t, formatDate }) => {
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
  const winnerScore = formatCount(winnerEntry?.score || 0)
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
          src={getImageUrl(challenge.bannerUrl || challenge.thumbnailUrl || challenge.coverUrl)} 
          alt={challenge.hashtag || challenge.name} 
          className="w-full h-full object-cover"
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
              {formatDate(challenge.startDate)} - {formatDate(challenge.endDate)}
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

export default function PastLeaderboardLayout({
  challengeStatus,
  setChallengeStatus,
  challengeId,
  onSelectChallenge,
  renderContent,
  showMobileDetail,
  onMobileDetailChange
}) {
  const { t } = useLanguage()
  const isLg = useMediaQuery("(min-width: 1024px)")
  const { data: pastChallengesResponse, isLoading } = useGetPastChallengesQuery()

  const pastChallenges = useMemo(() => {
    if (!pastChallengesResponse) return []
    return Array.isArray(pastChallengesResponse) 
      ? pastChallengesResponse 
      : (pastChallengesResponse.data || [])
  }, [pastChallengesResponse])

  const selectedChallenge = useMemo(() => {
    if (!challengeId) return null
    return pastChallenges.find((c) => String(c.challengeId) === String(challengeId)) || null
  }, [challengeId, pastChallenges])

  // Auto-select first challenge if none is selected
  useEffect(() => {
    if (!challengeId && pastChallenges.length > 0) {
      onSelectChallenge(pastChallenges[0].challengeId)
    }
  }, [challengeId, pastChallenges, onSelectChallenge])

  const formatDate = (dateString) => {
    if (!dateString) return ""
    const date = new Date(dateString)
    return `${date.getDate().toString().padStart(2, "0")}/${(date.getMonth() + 1).toString().padStart(2, "0")}/${date.getFullYear()}`
  }

  return (
    <div className="flex flex-col w-full">
      {/* Navigation Pills */}
      {(!showMobileDetail || isLg) && (
        <ChallengeStatusPills 
          challengeStatus={challengeStatus} 
          setChallengeStatus={setChallengeStatus} 
          onSelectChallenge={onSelectChallenge} 
        />
      )}

      <div className="mb-6 w-full">
        {(!showMobileDetail || isLg) && (
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-1">
              {t?.catSpeak?.reels?.leaderboard?.pastLeaderboardTitle || "Bảng xếp hạng đã kết thúc"}
            </h2>
            <p className="text-[13px] text-gray-500 mb-6">
              {t?.catSpeak?.reels?.leaderboard?.pastLeaderboardDesc || "Khám phá kết quả chung cuộc các thử thách đã khép lại"}
            </p>
          </div>
        )}
        
        {/* Main 2-column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          
          {/* Left Column: Vertical List of Past Challenges */}
          {(!showMobileDetail || isLg) && (
            <div className="lg:col-span-7 flex flex-col gap-4">
            {isLoading ? (
              <div className="animate-pulse flex flex-col gap-4">
                {[1, 2, 3].map(n => <div key={n} className="h-36 bg-gray-100 rounded-2xl w-full" />)}
              </div>
            ) : pastChallenges.length > 0 ? (
              pastChallenges.map((challenge) => (
                <PastChallengeCard
                  key={challenge.challengeId}
                  challenge={challenge}
                  isSelected={isLg && String(challengeId) === String(challenge.challengeId)}
                  onSelectChallenge={(id) => {
                    onSelectChallenge(id)
                    if (onMobileDetailChange) onMobileDetailChange(true)
                  }}
                  t={t}
                  formatDate={formatDate}
                />
              ))
            ) : (
              <div className="py-12 px-4 bg-gray-50 rounded-2xl border border-gray-200 text-center">
                <p className="text-[14px] font-semibold text-gray-600">{t?.catSpeak?.reels?.noPastChallenges || "Chưa có thử thách nào đã kết thúc."}</p>
              </div>
            )}
          </div>
          )}

          {/* Right Column: Leaderboard Detail */}
          {(showMobileDetail || isLg) && (
            <div className="lg:col-span-5 w-full lg:sticky lg:top-24">
              {/* Mobile Back Button */}
              {!isLg && (
                <div className="mb-4">
                  <button 
                    onClick={() => onMobileDetailChange && onMobileDetailChange(false)}
                    className="flex items-center gap-2 text-gray-600 font-semibold py-2 active:opacity-70"
                  >
                    <ArrowRight size={18} className="rotate-180" /> 
                    {t?.catSpeak?.reels?.back || "Trở lại danh sách"}
                  </button>
                </div>
              )}
              {renderContent && renderContent({ challengeId, selectedChallenge, challengeStatus })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
