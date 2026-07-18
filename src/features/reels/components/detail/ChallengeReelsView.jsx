import React, { useState, useMemo, useEffect } from "react"
import { ChevronDown, Loader2 } from "lucide-react"
import { useLanguage } from "@/shared/context/LanguageContext"
import Dropdown from "@/shared/components/ui/Dropdown"
import ReelGrid from "../grid/ReelGrid"
import ReelGridSkeleton from "../grid/ReelGridSkeleton"
import { useGetReelsByChallengeQuery } from "@/store/api/reelsApi"
import { mapReelDtoToFrontend } from "../../utils/mappers"
import { formatCompactCount } from "../../utils/formatters"

export default function ChallengeReelsView({ challengeId, selectedChallenge, challengeStatus, onReelClick }) {
  const { t } = useLanguage()
  const [challengeFilter, setChallengeFilter] = useState("Newest")
  const [page, setPage] = useState(1)

  useEffect(() => {
    setPage(1)
  }, [challengeId])

  // Fetch reels for specific challenge
  const {
    currentData: challengeReelsResponse,
    isLoading: isChallengeReelsLoading,
    isFetching
  } = useGetReelsByChallengeQuery(
    {
      challengeId: challengeId || undefined,
      page,
      pageSize: 20,
    },
    { skip: !challengeId }
  )

  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + document.documentElement.scrollTop >=
        document.documentElement.offsetHeight - 300
      ) {
        if (!isFetching && challengeReelsResponse?.lastPageCount === 20) {
          setPage((p) => p + 1)
        }
      }
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [isFetching, challengeReelsResponse?.lastPageCount])

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
            <img 
              src={selectedChallenge.bannerUrl || "https://res.cloudinary.com/di8uvvqf2/image/upload/v1780664239/catspeak/uploads/jt8dilomjdizdwkut1qv.png"} 
              alt="" 
              className="w-full h-full object-cover" 
              onError={(e) => {
                e.currentTarget.src = "https://res.cloudinary.com/di8uvvqf2/image/upload/v1780664239/catspeak/uploads/jt8dilomjdizdwkut1qv.png"
              }}
            />
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
          <Dropdown
            options={[
              { value: "Newest", label: t.catSpeak.reels.newest || "Mới nhất" },
              { value: "Oldest", label: t.catSpeak.reels.oldest || "Cũ nhất" },
            ]}
            value={challengeFilter}
            onChange={(val) => setChallengeFilter(val)}
            placeholder={t.catSpeak.reels.newest || "Mới nhất"}
            dropdownClassName="w-32 sm:w-40"
          />
        </div>
      </div>

      <div className="w-full">
        {isChallengeReelsLoading && page === 1 ? (
          <ReelGridSkeleton />
        ) : challengeReels.length > 0 ? (
          <>
            <ReelGrid reels={challengeReels} onReelClick={onReelClick} />
            {isFetching && page > 1 && (
              <div className="flex justify-center my-6">
                <Loader2 className="w-8 h-8 animate-spin text-cath-red-700" />
              </div>
            )}
          </>
        ) : (
          <div className="w-full text-center py-12 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
            <span className="text-3xl block mb-2">🎈</span>
            <p className="text-sm font-semibold text-gray-500">
              {t.catSpeak.reels.noReelsFound || "Không tìm thấy Thước phim nào."}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
