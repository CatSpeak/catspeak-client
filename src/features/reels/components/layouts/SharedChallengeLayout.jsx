import React, { useMemo, useEffect, useState } from "react"
import { Flame, Trophy, ChevronLeft, ChevronRight } from "lucide-react"
import { useLanguage } from "@/shared/context/LanguageContext"
import { useMediaQuery } from "@/shared/hooks/useMediaQuery"
import ChallengeCard from "../cards/ChallengeCard"
import ChallengeStatusPills from "../navigation/ChallengeStatusPills"
import {
  useGetActiveChallengesQuery,
  useGetPastChallengesQuery,
} from "@/store/api/reelsApi"

export default function SharedChallengeLayout({ 
  challengeStatus, 
  setChallengeStatus, 
  challengeId, 
  onSelectChallenge,
  renderContent
}) {
  const { t } = useLanguage()

  // Responsive Pagination Logic
  const isXl = useMediaQuery("(min-width: 1280px)")
  const isLg = useMediaQuery("(min-width: 1024px)")
  const itemsPerPage = isXl ? 5 : isLg ? 4 : 2

  const [page, setPage] = useState(0)

  // Fetch active/past challenges lists
  const { data: activeChallengesResponse } = useGetActiveChallengesQuery()
  const { data: pastChallengesResponse } = useGetPastChallengesQuery()

  const activeChallenges = useMemo(() => {
    if (!activeChallengesResponse) return []
    return Array.isArray(activeChallengesResponse) 
      ? activeChallengesResponse 
      : (activeChallengesResponse.data || [])
  }, [activeChallengesResponse])
  
  const pastChallenges = useMemo(() => {
    if (!pastChallengesResponse) return []
    return Array.isArray(pastChallengesResponse) 
      ? pastChallengesResponse 
      : (pastChallengesResponse.data || [])
  }, [pastChallengesResponse])

  const challengesList = challengeStatus === "active" ? activeChallenges : pastChallenges

  const totalPages = Math.ceil(challengesList.length / itemsPerPage)
  const visibleChallenges = challengesList.slice(page * itemsPerPage, (page + 1) * itemsPerPage)

  const handlePrevPage = () => {
    if (page > 0) setPage((p) => p - 1)
  }

  const handleNextPage = () => {
    if (page < totalPages - 1) setPage((p) => p + 1)
  }

  // Reset page when switching tabs or resizing
  useEffect(() => {
    setPage(0)
  }, [challengeStatus, itemsPerPage])

  const selectedChallenge = useMemo(() => {
    if (!challengeId) return null
    return challengesList.find((c) => String(c.challengeId) === String(challengeId)) || null
  }, [challengeId, challengesList])
  
  // Auto-select first challenge if none is selected
  useEffect(() => {
    if (!challengeId && challengesList.length > 0) {
      onSelectChallenge(challengesList[0].challengeId)
    }
  }, [challengeId, challengesList, onSelectChallenge])

  return (
    <div className="flex flex-col w-full">
      {/* Secondary Navigation Pills */}
      <ChallengeStatusPills 
        challengeStatus={challengeStatus} 
        setChallengeStatus={setChallengeStatus} 
        onSelectChallenge={onSelectChallenge} 
      />

      {/* Horizontal List of Challenges */}
      <div className="mb-6 w-full">
        <div className="flex justify-between items-end mb-5">
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-1">
              {challengeStatus === "active" ? (t.catSpeak.reels.activeEvent || "Thử thách đang diễn ra") : (t.catSpeak.reels.pastEvents || "Thử thách đã diễn ra")}
            </h2>
            <p className="text-sm text-gray-500">
              {challengeStatus === "active" 
                ? (t.catSpeak.reels.featuredChallengesDescActive || "Tham gia ngay các thử thách đang diễn ra")
                : (t.catSpeak.reels.featuredChallengesDescPast || "Các thử thách đã kết thúc")}
            </p>
          </div>
          <div className="flex items-center text-[13px] font-semibold text-gray-500 gap-3">
            <button 
              onClick={handlePrevPage} 
              disabled={page === 0}
              aria-label="Previous challenges"
              className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-[#F8F8F8] shadow-sm border border-[#C6C6C6] transition-all duration-200 hover:bg-[#F0F0F0] active:scale-95 disabled:opacity-30 disabled:pointer-events-none"
            >
              <ChevronLeft size={18} />
            </button>
            <span>{(t.catSpeak.reels.challengeCount || "{{count}} thử thách").replace("{{count}}", challengesList.length)}</span>
            <button 
              onClick={handleNextPage} 
              disabled={page >= totalPages - 1}
              aria-label="Next challenges"
              className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-[#F8F8F8] shadow-sm border border-[#C6C6C6] transition-all duration-200 hover:bg-[#F0F0F0] active:scale-95 disabled:opacity-30 disabled:pointer-events-none"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
        
        {visibleChallenges.length > 0 ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-5 pb-4 pt-2">
            {visibleChallenges.map((challenge, index) => (
              <div key={challenge.challengeId} className="flex h-full">
                <ChallengeCard
                  challenge={challenge}
                  isHot={challengeStatus === "active" && (page === 0 && index < 2)}
                  isSelected={String(challengeId) === String(challenge.challengeId)}
                  isPast={challengeStatus === "past"}
                  onJoin={() => onSelectChallenge(challenge.challengeId)}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="w-full flex flex-col items-center justify-center py-16 px-4 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 my-4">
            <div className="w-16 h-16 bg-white shadow-sm rounded-full flex items-center justify-center mb-4">
              <span className="text-3xl block">🎈</span>
            </div>
            <p className="text-[15px] font-semibold text-gray-600 text-center">
              {t.catSpeak.reels.noActiveChallenges || "Không tìm thấy thử thách nào."}
            </p>
            <p className="text-[13px] text-gray-400 text-center mt-1">
              {challengeStatus === "active" 
                ? "Các thử thách mới đang được chuẩn bị. Hãy quay lại sau nhé!"
                : "Chưa có thử thách nào đã kết thúc."}
            </p>
          </div>
        )}
      </div>

      {/* Render Dynamic View */}
      {renderContent && renderContent({ challengeId, selectedChallenge, challengeStatus })}
    </div>
  )
}
