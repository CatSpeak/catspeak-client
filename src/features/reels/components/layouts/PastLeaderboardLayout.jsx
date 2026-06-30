import React, { useMemo, useEffect, useState } from "react"
import { useLanguage } from "@/shared/context/LanguageContext"
import { useGetPastChallengesQuery } from "@/store/api/reelsApi"
import ChallengeStatusPills from "../navigation/ChallengeStatusPills"
import { ArrowRight } from "lucide-react"
import { useMediaQuery } from "@/shared/hooks/useMediaQuery"
import PastChallengeCard from "../cards/PastChallengeCard"


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
