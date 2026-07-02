import React from "react"
import { Clock, Users } from "lucide-react"
import { useLanguage } from "@/shared/context/LanguageContext"
import { formatCompactCount, formatDaysLeft } from "../../utils/formatters"
import { useGetReelsByChallengeQuery } from "@/store/api/reelsApi"

export default function ChallengeCard({
  challenge,
  isHot = false,
  isSelected = false,
  isPast = false,
  onJoin,
  onParticipate,
}) {
  const { t } = useLanguage()
  const { name, hashtag, description, bannerUrl, status, endDate, endTime } = challenge
  const validEndDate = endDate || endTime

  const { data: reelsResponse } = useGetReelsByChallengeQuery(
    { challengeId: challenge.challengeId, pageSize: 100 },
    { skip: !challenge.challengeId }
  )
  const reelCount = reelsResponse?.data?.length || 0





  const participantsStr = t.catSpeak.reels.participants || "{{count}} người tham gia"
  
  return (
    <div
      onClick={() => onJoin(challenge)}
      className={`group relative flex flex-col w-full h-full rounded-2xl border overflow-hidden transition-all duration-300 cursor-pointer ${
        isSelected
          ? "border-cath-red-700 bg-[#fff5f5] shadow-md"
          : "border-gray-200 bg-white hover:border-cath-red-700 hover:bg-[#fff5f5] hover:shadow-md"
      }`}
    >
      {/* Thumbnail Container */}
      <div className="relative h-24 sm:h-28 md:h-32 w-full overflow-hidden bg-gray-100">
        {bannerUrl ? (
          <img
            src={bannerUrl}
            alt={name || hashtag}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300" />
        )}
        
        {/* HOT Badge */}
        {isHot && (
          <div className="absolute top-3 left-3 z-10 bg-cath-red-700 text-white text-[12px] font-bold px-2 py-1 rounded-md flex items-center gap-1 shadow-sm">
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
              <path d="M12 2C12 2 8 6.5 8 11.5C8 14.5 10.5 17 12 17C13.5 17 16 14.5 16 11.5C16 6.5 12 2 12 2ZM11.5 14C10.671 14 10 13.329 10 12.5C10 11.671 10.671 11 11.5 11C12.329 11 13 11.671 13 12.5C13 13.329 12.329 14 11.5 14Z" />
            </svg>
            HOT
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-2.5 sm:p-3 md:p-4">
        <h3 className="text-[13px] sm:text-[15px] md:text-[17px] font-bold text-gray-800 mb-0.5 line-clamp-1">
          {hashtag ? hashtag : name || "Thử thách mới"}
        </h3>
        <p className="text-[11px] md:text-[13px] text-gray-500 mb-2 sm:mb-3 md:mb-4 line-clamp-1">
          {hashtag ? name : "Thử thách"}
        </p>

        {/* Stats */}
        <div className="flex flex-col gap-1.5 md:gap-2.5 mb-3 md:mb-5">
          <div className="flex items-center gap-1.5 md:gap-2 text-gray-700 text-[11px] md:text-[13px]">
            <Clock className="w-3.5 h-3.5 md:w-4 md:h-4 text-amber-500" />
            <span className="truncate">{isPast ? (t.catSpeak.reels.votingClosed || "Đã đóng cổng bình chọn") : formatDaysLeft(validEndDate, t)}</span>
          </div>
          <div className="flex items-center gap-1.5 md:gap-2 text-gray-700 text-[11px] md:text-[13px]">
            <Users className="w-3.5 h-3.5 md:w-4 md:h-4 text-gray-700" />
            <span className="truncate">{participantsStr.replace("{{count}}", formatCompactCount(reelCount))}</span>
          </div>
        </div>

        {/* Button */}
        {isPast ? (
          <button
            disabled
            className="mt-auto w-full py-2 md:py-2.5 rounded-full text-[12px] md:text-[14px] font-medium transition-all duration-200 bg-gray-500 text-white cursor-not-allowed"
            onClick={(e) => e.stopPropagation()}
          >
            {t.catSpeak.reels.ended || "Đã kết thúc"}
          </button>
        ) : (
          <button
            className="mt-auto w-full py-2 md:py-2.5 rounded-full text-[12px] md:text-[14px] font-medium transition-all duration-200 bg-cath-red-700 text-white hover:bg-cath-red-800 shadow-sm"
            onClick={(e) => {
              e.stopPropagation()
              if (onParticipate) onParticipate(challenge)
            }}
          >
            {t.catSpeak.reels.joinNow || "Tham gia ngay"}
          </button>
        )}
      </div>
    </div>
  )
}
