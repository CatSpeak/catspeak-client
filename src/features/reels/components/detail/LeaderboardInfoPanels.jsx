import React from "react"
import { Heart, Play, MessageCircle, Share2, Info } from "lucide-react"
import { useLanguage } from "@/shared/context/LanguageContext"

export default function LeaderboardInfoPanels() {
  const { t } = useLanguage()

  return (
    <div className="lg:col-span-3 flex flex-col gap-5">
      {/* Cách tính điểm */}
      <div className="bg-[#FFF5F5] rounded-2xl p-5 shadow-sm border border-red-50">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-gray-900 text-[15px]">
            {t?.catSpeak?.reels?.leaderboard?.scoringRules || "Cách tính điểm"}
          </h3>
          <Info size={16} className="text-gray-700" />
        </div>
        <div className="flex flex-col gap-3 text-[14px] text-gray-600 font-medium">
          <div className="flex items-center gap-3">
            <Heart size={18} className="text-cath-red-700 fill-cath-red-700 shrink-0" />
            <span>{t?.catSpeak?.reels?.leaderboard?.ruleLike || "1 tim = 1 điểm"}</span>
          </div>
          <div className="flex items-center gap-3">
            <Play size={18} className="text-gray-500 fill-gray-500 shrink-0" />
            <span>{t?.catSpeak?.reels?.leaderboard?.ruleView || "1 lượt xem = 1 điểm"}</span>
          </div>
          <div className="flex items-center gap-3">
            <MessageCircle size={18} className="text-gray-500 shrink-0" />
            <span>{t?.catSpeak?.reels?.leaderboard?.ruleComment || "1 bình luận = 1 điểm"}</span>
          </div>
          <div className="flex items-center gap-3">
            <Share2 size={18} className="text-gray-500 shrink-0" />
            <span>{t?.catSpeak?.reels?.leaderboard?.ruleShare || "1 lượt chia sẻ = 1 điểm"}</span>
          </div>
        </div>
      </div>

      {/* Giải thưởng */}
      <div className="bg-[#FFF5F5] rounded-2xl p-5 shadow-sm border border-red-50">
        <h3 className="font-bold text-gray-900 text-[15px] mb-4 flex items-center gap-2">
          <span>🎁</span> {t?.catSpeak?.reels?.leaderboard?.prizes || "Giải thưởng"}
        </h3>
        <div className="flex flex-col gap-4 text-[14px]">
          <div className="flex flex-col gap-0.5">
            <div className="font-bold text-gray-900 flex items-center gap-1.5">
              <span className="text-[16px]">🥇</span> Top 1
            </div>
            <span className="text-gray-500 text-[13px] ml-7">
              {t?.catSpeak?.reels?.leaderboard?.specialScholarship || "Học bổng đặc biệt"}
            </span>
          </div>
          <div className="flex flex-col gap-0.5">
            <div className="font-bold text-gray-900 flex items-center gap-1.5">
              <span className="text-[16px]">🥈</span> Top 2
            </div>
            <span className="text-gray-500 text-[13px] ml-7">
              {t?.catSpeak?.reels?.leaderboard?.specialScholarship || "Học bổng đặc biệt"}
            </span>
          </div>
          <div className="flex flex-col gap-0.5">
            <div className="font-bold text-gray-900 flex items-center gap-1.5">
              <span className="text-[16px]">🥉</span> Top 3
            </div>
            <span className="text-gray-500 text-[13px] ml-7">
              {t?.catSpeak?.reels?.leaderboard?.specialScholarship || "Học bổng đặc biệt"}
            </span>
          </div>
          <div className="flex flex-col gap-0.5">
            <div className="font-bold text-gray-900 flex items-center gap-1.5">
              <span className="text-[16px]">🏅</span> Top 4 - 6
            </div>
            <span className="text-gray-500 text-[13px] ml-7">
              {t?.catSpeak?.reels?.leaderboard?.specialScholarship || "Học bổng đặc biệt"}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
