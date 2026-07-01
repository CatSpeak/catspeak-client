import React, { useState, useMemo } from "react"
import { ChevronDown } from "lucide-react"
import { useLanguage } from "@/shared/context/LanguageContext"
import FilterDropdown from "../ui/FilterDropdown"
import ReelGrid from "../grid/ReelGrid"
import ReelGridSkeleton from "../grid/ReelGridSkeleton"
import { useGetReelsByChallengeQuery } from "@/store/api/reelsApi"
import { mapReelDtoToFrontend } from "../../utils/mappers"
import { formatCompactCount } from "../../utils/formatters"

export default function ChallengeReelsView({ challengeId, selectedChallenge, challengeStatus, onReelClick }) {
  const { t } = useLanguage()
  const [challengeFilter, setChallengeFilter] = useState("Newest")

  // Fetch reels for specific challenge
  const {
    currentData: challengeReelsResponse,
    isLoading: isChallengeReelsLoading,
  } = useGetReelsByChallengeQuery(
    {
      challengeId: challengeId || undefined,
      page: 1,
      pageSize: 20,
    },
    { skip: !challengeId }
  )

  const challengeReels = useMemo(() => {
    if (!challengeReelsResponse?.data) return []
    
    // Map data
    const reels = challengeReelsResponse.data.map(mapReelDtoToFrontend)
    
    // Local sorting by createdAt
    reels.sort((a, b) => {
      const timeA = new Date(a.createdAt || 0).getTime()
      const timeB = new Date(b.createdAt || 0).getTime()
      
      if (challengeFilter === "Oldest") {
        return timeA - timeB
      }
      return timeB - timeA // Default to Newest
    })
    
    return reels
  }, [challengeReelsResponse, challengeFilter])



  if (!challengeId || !selectedChallenge) return null

  return (
    <div className="w-full pt-4 border-t">
      {/* Header specific to selected challenge */}
      <div className="flex items-start sm:items-center justify-between mb-6 pb-2 gap-2">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl overflow-hidden bg-gray-100 shrink-0 border border-gray-200">
            {selectedChallenge.bannerUrl ? (
                <img src={selectedChallenge.bannerUrl} alt="" className="w-full h-full object-cover" />
            ) : (
                <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300" />
            )}
          </div>
          <div className="flex flex-col justify-center min-w-0">
            <div className="flex items-start sm:items-center gap-1.5 sm:gap-2">
              <span className="text-[15px] sm:text-[17px] font-bold text-gray-900 break-words line-clamp-2 leading-tight">
                {selectedChallenge.hashtag ? selectedChallenge.hashtag : selectedChallenge.name}
              </span>
              {challengeStatus === "active" && (
                <div className="bg-cath-red-700 text-white text-[9px] sm:text-[11px] font-bold px-1.5 sm:px-2 py-0.5 rounded-full uppercase tracking-wider shrink-0 mt-0.5 sm:mt-0">
                  HOT
                </div>
              )}
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2 mt-1 sm:mt-0.5">
              <span className="text-[12px] sm:text-[14px] font-medium text-gray-500 truncate">{selectedChallenge.hashtag ? selectedChallenge.name : "Thử thách"}</span>
              <span className="text-gray-300 text-[8px] sm:text-[10px] shrink-0">●</span>
              <span className="text-[12px] sm:text-[14px] text-gray-500 shrink-0">{formatCompactCount(challengeReels.length)} {t.catSpeak.reels.entries || "bài dự thi"}</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center relative shrink-0">
          <FilterDropdown
            options={[
              { value: "Newest", label: t.catSpeak.reels.newest || "Mới nhất" },
              { value: "Oldest", label: t.catSpeak.reels.oldest || "Cũ nhất" },
            ]}
            value={challengeFilter}
            onChange={(val) => setChallengeFilter(val)}
            defaultLabel={t.catSpeak.reels.newest || "Mới nhất"}
          />
        </div>
      </div>

      {/* Grid */}
      {isChallengeReelsLoading ? (
        <ReelGridSkeleton />
      ) : challengeReels.length > 0 ? (
        <ReelGrid reels={challengeReels} onReelClick={onReelClick} />
      ) : (
        <div className="w-full text-center py-12 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
          <span className="text-3xl block mb-2">🎈</span>
          <p className="text-sm font-semibold text-gray-500">
            {t.catSpeak.reels.noReelsFound || "Không tìm thấy Thước phim nào."}
          </p>
        </div>
      )}
    </div>
  )
}
