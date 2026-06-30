import React, { useMemo } from "react"
import { Clock, Heart, Play, MessageCircle, Share2, Info } from "lucide-react"
import { useLanguage } from "@/shared/context/LanguageContext"
import { useGetChallengeLeaderboardQuery } from "@/store/api/reelsApi"
import LeaderboardInfoPanels from "./LeaderboardInfoPanels"
import Modal from "@/shared/components/ui/Modal"
import { useAuth } from "@/features/auth"

const formatCount = (c) => {
  const num = Math.ceil(Number(c) || 0)
  return num >= 1000 ? `${(num / 1000).toFixed(1)}K` : String(num)
}

const RankRow = ({ rank, username, handle, score, coverUrl, onClick }) => {
  const getRankBadge = (r) => {
    if (r <= 3) {
      return <div className="w-7 h-7 rounded-full bg-[#F59E0B] text-gray-900 flex items-center justify-center font-bold text-sm">{r}</div>
    }
    return <div className="w-7 h-7 flex items-center justify-center font-bold text-[15px] text-[#F59E0B]">{r}</div>
  }

  return (
    <div 
      className="flex items-center justify-between p-3 sm:p-4 hover:bg-gray-50 transition-colors bg-white cursor-pointer"
      onClick={onClick}
    >
      <div className="flex items-center gap-3 sm:gap-4 min-w-0">
        <div className="w-8 flex justify-center shrink-0">
          {getRankBadge(rank)}
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

export default function ChallengeLeaderboardView({ 
  challengeId, 
  selectedChallenge, 
  challengeStatus,
  onReelClick
}) {
  const { t } = useLanguage()
  const { user } = useAuth()
  
  const {
    currentData: leaderboardResponse,
    isLoading,
  } = useGetChallengeLeaderboardQuery(
    { challengeId, take: 50 },
    { skip: !challengeId }
  )

  const [currentPage, setCurrentPage] = React.useState(1)
  const [isInfoModalOpen, setIsInfoModalOpen] = React.useState(false)
  const itemsPerPage = 10

  const leaderboardEntries = useMemo(() => {
    if (!leaderboardResponse) return []
    if (Array.isArray(leaderboardResponse)) return leaderboardResponse
    if (Array.isArray(leaderboardResponse.data)) return leaderboardResponse.data
    if (Array.isArray(leaderboardResponse.data?.entries)) return leaderboardResponse.data.entries
    if (Array.isArray(leaderboardResponse.entries)) return leaderboardResponse.entries
  }, [leaderboardResponse])

  const totalPages = Math.ceil(leaderboardEntries.length / itemsPerPage)
  const currentEntries = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage
    return leaderboardEntries.slice(start, start + itemsPerPage)
  }, [leaderboardEntries, currentPage])

  const currentUserEntry = useMemo(() => {
    if (!user?.accountId || !leaderboardEntries.length) return null
    const index = leaderboardEntries.findIndex(
      entry => String(entry.reel?.accountId) === String(user.accountId) || String(entry.userId) === String(user.accountId)
    )
    if (index === -1) return null
    return {
      ...leaderboardEntries[index],
      calculatedRank: leaderboardEntries[index].rank || index + 1
    }
  }, [user, leaderboardEntries])

  const isCurrentUserVisible = useMemo(() => {
    if (!currentUserEntry || !currentEntries.length) return false
    return currentEntries.some(entry => entry.id === currentUserEntry.id || entry.reelId === currentUserEntry.reelId)
  }, [currentUserEntry, currentEntries])

  // Reset page when challenge changes
  React.useEffect(() => {
    setCurrentPage(1)
  }, [challengeId])

  if (!challengeId || !selectedChallenge) return null

  // Tính toán thời gian thực tế
  const calculateTimeRemaining = (dateStr) => {
    if (!dateStr) return t?.catSpeak?.reels?.noLimit || "Không giới hạn"
    const end = new Date(dateStr)
    const now = new Date()
    const diff = end - now
    
    if (diff <= 0) return t?.catSpeak?.reels?.ended || "Đã kết thúc"
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    
    if (days > 0) {
      const daysText = t?.catSpeak?.reels?.leaderboard?.daysLeft?.replace("{days}", days).replace("{hours}", hours > 0 ? hours : "") 
      return daysText || `Còn ${days} ngày ${hours > 0 ? `${hours} giờ` : ""}`
    }
    if (hours > 0) {
      const hoursText = t?.catSpeak?.reels?.leaderboard?.hoursLeft?.replace("{hours}", hours)
      return hoursText || `Còn ${hours} giờ`
    }
    return t?.catSpeak?.reels?.leaderboard?.endingSoon || "Sắp kết thúc"
  }

  const timeRemaining = calculateTimeRemaining(selectedChallenge.endDate || selectedChallenge.endTime)

  return (
    <>
      <div className="w-full lg:max-w-[85%] bg-white lg:rounded-2xl border-y lg:border border-gray-200 lg:shadow-sm py-4 sm:p-6 lg:mt-4 overflow-hidden">
        {/* Header */}
        <div className="flex items-start sm:items-center justify-between mb-4 sm:mb-6 pb-4 px-4 sm:px-6 sm:-mx-6 gap-2 border-b border-gray-200">
          <div className="flex items-center gap-3 min-w-0">
            <div className="text-3xl shrink-0">🏆</div>
            <div className="flex flex-col min-w-0">
              <h2 className="text-[17px] sm:text-[20px] font-bold text-gray-900 truncate">
                {t?.catSpeak?.reels?.leaderboard?.title || "Bảng xếp hạng"}
              </h2>
              <span className="text-[13px] sm:text-[14px] text-gray-500 font-medium truncate">
                {selectedChallenge.hashtag || selectedChallenge.name}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {challengeStatus === "active" && (
              <div className="flex items-center gap-1.5 text-cath-red-700 font-medium text-[13px] sm:text-[14px]">
                <Clock size={16} />
                <span>{timeRemaining}</span>
              </div>
            )}
            <button 
              className="lg:hidden p-1.5 rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
              onClick={() => setIsInfoModalOpen(true)}
            >
              <Info size={18} className="text-gray-900" />
            </button>
          </div>
        </div>

        {/* Main Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 relative">
        {/* Left Side: Ranking List */}
        <div className="lg:col-span-9 flex flex-col w-full relative">
          {isLoading ? (
            <div className="p-4 space-y-4 animate-pulse">
              {[1, 2, 3, 4, 5].map((n) => (
                <div key={n} className="h-16 bg-gray-100 rounded-xl w-full" />
              ))}
            </div>
          ) : leaderboardEntries.length > 0 ? (
            <>
              <div className="flex flex-col divide-y divide-gray-100">
                {currentEntries.map((entry, idx) => {
                  // Keep original rank instead of calculating by current page index if possible,
                  // but assuming idx corresponds to sliced array, we must offset by page.
                  const actualRank = entry.rank || ((currentPage - 1) * itemsPerPage + idx + 1)
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

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-4 pt-4 px-4 sm:px-0 border-t border-gray-100">
                  <button 
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1.5 text-[13px] font-medium border border-gray-200 rounded-lg disabled:opacity-50 hover:bg-gray-50 transition-colors"
                  >
                    {t?.catSpeak?.reels?.leaderboard?.prev || "Trước"}
                  </button>
                  <span className="text-[13px] text-gray-500 font-medium">
                    {t?.catSpeak?.reels?.leaderboard?.page || "Trang"} {currentPage} / {totalPages}
                  </span>
                  <button 
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1.5 text-[13px] font-medium border border-gray-200 rounded-lg disabled:opacity-50 hover:bg-gray-50 transition-colors"
                  >
                    {t?.catSpeak?.reels?.leaderboard?.next || "Sau"}
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="py-16 flex flex-col items-center justify-center text-gray-500">
              <span className="text-4xl mb-3">👻</span>
              <p className="font-medium text-[15px]">{t?.catSpeak?.reels?.leaderboard?.noData || "Chưa có dữ liệu xếp hạng"}</p>
            </div>
          )}

          {/* Sticky Bottom Bar for Current User */}
          {challengeStatus === "active" && currentUserEntry && !isCurrentUserVisible && (
            <div className="mt-2 flex flex-col">
               <div className="py-2 px-4 text-gray-400 font-bold text-lg">...</div>
               <div className="bg-[#FFF5F5] border border-red-200 rounded-xl p-3 sm:p-4 flex items-center justify-between mt-1">
                 <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                 <div className="w-8 flex justify-center shrink-0 font-bold text-cath-red-700 text-[15px]">{currentUserEntry.calculatedRank}</div>
                 <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden shrink-0 border border-gray-300">
                    <img src={currentUserEntry.reel?.coverUrl || currentUserEntry.reel?.thumbnailUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUserEntry.reel?.username || "user"}`} alt="" className="w-full h-full object-cover" />
                 </div>
                 <div className="flex flex-col min-w-0">
                   <span className="font-semibold text-gray-900 text-[14px] truncate">{currentUserEntry.reel?.nickname || currentUserEntry.reel?.username || "User name"}</span>
                   <span className="text-gray-500 text-[12px] truncate">@{currentUserEntry.reel?.username || "username"}</span>
                 </div>
               </div>
               
               <div className="flex items-center gap-4 sm:gap-6 shrink-0 pl-2">
                 <div className="flex flex-col items-end">
                   <span className="text-[11px] text-cath-red-700 font-medium">{t?.catSpeak?.reels?.leaderboard?.yourRank || "Hạng của bạn"}</span>
                   <span className="font-bold text-[14px] flex items-center gap-1.5">
                     {formatCount(currentUserEntry.score || 0)} <Heart size={14} className="text-cath-red-700 fill-cath-red-700" />
                   </span>
                 </div>
                 <div 
                   className="w-16 h-10 rounded-lg overflow-hidden relative shrink-0 shadow-sm border border-gray-200 bg-gray-100 cursor-pointer"
                   onClick={() => onReelClick && onReelClick(currentUserEntry.reel || currentUserEntry)}
                 >
                   {(currentUserEntry.reel?.coverUrl || currentUserEntry.reel?.thumbnailUrl) && (
                     <img src={currentUserEntry.reel.coverUrl || currentUserEntry.reel.thumbnailUrl} alt="" className="w-full h-full object-cover" />
                   )}
                   <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                     <Play size={16} className="text-white fill-white" />
                   </div>
                 </div>
               </div>
             </div>
            </div>
          )}
        </div>

        {/* Right Side: Info Panels */}
        <div className="hidden lg:block lg:col-span-3">
          <LeaderboardInfoPanels />
        </div>
      </div>
    </div>

    {/* Mobile Info Modal */}
    <Modal
      open={isInfoModalOpen}
      onClose={() => setIsInfoModalOpen(false)}
      title={t?.catSpeak?.reels?.leaderboard?.infoTitle || "Thông tin xếp hạng"}
      className="md:max-w-md w-full"
      bodyClassName="p-4"
    >
      <LeaderboardInfoPanels />
    </Modal>
  </>
  )
}
