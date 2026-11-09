import React from "react"
import { useNavigate } from "react-router-dom"
import { Users, Video, Swords, Clapperboard, FileText, ChevronRight } from "lucide-react"
import { useLanguage } from "@/shared/context/LanguageContext"

const CommunityOverviewSection = ({ data }) => {
  const navigate = useNavigate()
  const { language } = useLanguage()
  const isEn = language === "en"

  const items = [
    {
      id: "friends",
      icon: Users,
      textColor: "text-blue-600 dark:text-blue-400",
      bg: "bg-blue-50 dark:bg-blue-950/40",
      titleVi: "Bạn bè kết nối",
      titleEn: "Friends",
      value: data?.friends?.count || 0,
      subtext: isEn ? data?.friends?.newFriendsDeltaEn : data?.friends?.newFriendsDelta,
      targetUrl: data?.friends?.targetUrl || "/workspace/profile?tab=friends",
    },
    {
      id: "createdRooms",
      icon: Video,
      textColor: "text-[#72000D] dark:text-red-400",
      bg: "bg-[#72000D]/10 dark:bg-red-950/40",
      titleVi: "Room tự tạo",
      titleEn: "Created Rooms",
      value: data?.createdRooms?.count || 0,
      subtext: isEn ? "Custom live rooms" : "Phòng luyện nói cá nhân",
      targetUrl: data?.createdRooms?.targetUrl || "/app/sessions",
    },
    {
      id: "challenges",
      icon: Swords,
      textColor: "text-amber-600 dark:text-amber-400",
      bg: "bg-amber-50 dark:bg-amber-950/40",
      titleVi: "Challenge tham gia",
      titleEn: "Challenges",
      value: data?.challengesJoined?.count || 0,
      subtext: isEn ? "Contests & practice" : "Thử thách phát biểu",
      targetUrl: data?.challengesJoined?.targetUrl || "/games",
    },
    {
      id: "videos",
      icon: Clapperboard,
      textColor: "text-purple-600 dark:text-purple-400",
      bg: "bg-purple-50 dark:bg-purple-950/40",
      titleVi: "Video đã đăng",
      titleEn: "Videos Posted",
      value: data?.publishedVideos?.count || 0,
      subtext: isEn ? "Speaking reels" : "Reels luyện phản xạ",
      targetUrl: data?.publishedVideos?.targetUrl || "/reels",
    },
    {
      id: "articles",
      icon: FileText,
      textColor: "text-emerald-600 dark:text-emerald-400",
      bg: "bg-emerald-50 dark:bg-emerald-950/40",
      titleVi: "Bài viết chia sẻ",
      titleEn: "Articles Posted",
      value: data?.publishedArticles?.count || 0,
      subtext: isEn ? "Community posts" : "Bài viết kinh nghiệm",
      targetUrl: data?.publishedArticles?.targetUrl || "/workspace/profile",
    },
  ]

  return (
    <section
      aria-labelledby="community-overview-heading"
      className="bg-white dark:bg-[#1A1A1A] border border-[#DEE0E5] dark:border-[#3F3F3F] rounded-xl p-4 sm:p-5 shadow-2xs flex flex-col justify-between"
    >
      <div className="flex items-center justify-between gap-2 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-[#72000D] dark:text-red-400" />
            <h2 id="community-overview-heading" className="text-base font-bold text-[#14171F] dark:text-white">
              {isEn ? "Community Overview" : "Tổng quan cộng đồng"}
            </h2>
          </div>
          <p className="text-xs text-[#6E788C] dark:text-neutral-400 mt-0.5">
            {isEn
              ? "Social engagement, peers, and shared public content"
              : "Kết nối bạn học, thử thách phát biểu và nội dung đã chia sẻ"}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-3">
        {items.map((item) => {
          const Icon = item.icon
          const title = isEn ? item.titleEn : item.titleVi

          return (
            <div
              key={item.id}
              className="bg-[#FBFBFC] dark:bg-[#202020] border border-[#DEE0E5] dark:border-[#333333] rounded-xl p-3 flex flex-col justify-between hover:border-[#72000D]/30 dark:hover:border-red-400/30 transition-colors"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div
                    className={`w-7 h-7 rounded-lg ${item.bg} ${item.textColor} flex items-center justify-center shrink-0`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="text-lg font-bold text-[#14171F] dark:text-white tabular-nums">
                    {item.value}
                  </span>
                </div>
                <h3 className="text-xs font-semibold text-[#14171F] dark:text-white truncate" title={title}>
                  {title}
                </h3>
                {item.subtext && (
                  <p className="text-[10px] text-[#6E788C] dark:text-neutral-400 mt-0.5 truncate" title={item.subtext}>
                    {item.subtext}
                  </p>
                )}
              </div>

              <button
                type="button"
                onClick={() => navigate(item.targetUrl)}
                className="mt-2.5 pt-2 border-t border-[#DEE0E5]/60 dark:border-[#2E2E2E] flex items-center justify-between text-[11px] font-semibold text-[#72000D] dark:text-red-400 hover:underline cursor-pointer"
              >
                <span>{isEn ? "View details" : "Xem chi tiết"}</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>
          )
        })}
      </div>
    </section>
  )
}

export default CommunityOverviewSection
