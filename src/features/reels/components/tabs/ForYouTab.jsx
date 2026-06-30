import React, { useMemo } from "react"
import { Upload, Users } from "lucide-react"
import { useLanguage } from "@/shared/context/LanguageContext"
import ReelGrid from "../grid/ReelGrid"
import ReelGridSkeleton from "../grid/ReelGridSkeleton"
import { useGetReelsFeedQuery } from "@/store/api/reelsApi"
import { mapReelDtoToFrontend } from "../../utils/mappers"

export default function ForYouTab({ onReelClick, isAuthenticated, onUploadClick }) {
  const { t } = useLanguage()
  const { data: feedResponse, isLoading } = useGetReelsFeedQuery({ page: 1, pageSize: 20 })
  
  const feedReels = useMemo(
    () => (feedResponse?.data ? feedResponse.data.map(mapReelDtoToFrontend) : []),
    [feedResponse],
  )

  return (
    <div className="w-full">
      {/* Dynamic Page Banner */}
      <div className="bg-gradient-to-r from-[#FFF1F2] to-[#FFF6ED] border border-[#f3d6a9] rounded-xl p-5 sm:p-6 md:px-8 md:py-6 mb-8 flex flex-col md:flex-row justify-between shadow-sm relative overflow-hidden transition-all duration-300">
        {/* Left Side */}
        <div className="flex flex-col flex-1 z-10 w-full">
          <h2 className="text-xl md:text-2xl font-semibold text-headingColor mb-2 tracking-wide">
            {t.catSpeak.reels.createOwnReels || "Sáng tạo nội dung của riêng bạn"}
          </h2>
          <p className="text-[13px] md:text-[14px] text-gray-700 mb-5 md:mb-8">
            {t.catSpeak.reels.shareKnowledge || "Chia sẻ kiến thức và luyện tập nhập vai cùng cộng đồng Cat Speak."}
          </p>
          <div className="flex flex-wrap items-center gap-2.5 mt-auto">
            <span className="text-[12px] md:text-[13px] font-medium text-textColor bg-white px-3.5 md:px-4 py-1.5 rounded-full shadow-[0_1px_2px_rgba(0,0,0,0.02)] border border-gray-200">
              {t.catSpeak.reels.formatLimit || "Định dạng MP4, MOV"}
            </span>
            <span className="text-[12px] md:text-[13px] font-medium text-textColor bg-white px-3.5 md:px-4 py-1.5 rounded-full shadow-[0_1px_2px_rgba(0,0,0,0.02)] border border-gray-200">
              {t.catSpeak.reels.sizeLimit || "Tối đa 5 phút, 150MB"}
            </span>
          </div>
        </div>
        
        {/* Right Side */}
        <div className="flex flex-col justify-between items-end mt-6 md:mt-0 z-10 shrink-0 min-w-[200px] w-full md:w-auto">
          <div className="flex flex-row justify-between items-center md:flex-col md:items-end mb-4 md:mb-6 w-full md:w-auto">
            <span className="text-[13px] text-lighttextGray mb-0 md:mb-1">{t.catSpeak.reels.monthlyCreator || "Monthly creator"}</span>
            <div className="flex items-center text-[#fbbf24] font-medium text-[15px] space-x-1.5">
              <Users size={16} />
              <span>450</span>
            </div>
          </div>
          <button
            onClick={onUploadClick}
            className="bg-cath-red-700 text-white w-full md:w-auto justify-center px-6 py-2.5 rounded-full font-medium hover:bg-cath-red-600 transition-colors flex items-center space-x-2 shadow-sm"
          >
            <Upload size={16} />
            <span>{t.catSpeak.reels.uploadReel || "Đăng tải Reel"}</span>
          </button>
        </div>
      </div>

      {isLoading ? (
        <ReelGridSkeleton />
      ) : (
        <ReelGrid reels={feedReels} onReelClick={onReelClick} />
      )}
    </div>
  )
}
