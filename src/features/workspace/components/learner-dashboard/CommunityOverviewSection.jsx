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
      color: "#2563EB",
      bg: "bg-blue-50",
      titleVi: "Bạn bè kết nối",
      titleEn: "Friends",
      value: data?.friends?.count || 0,
      subtext: isEn ? data?.friends?.newFriendsDeltaEn : data?.friends?.newFriendsDelta,
      targetUrl: data?.friends?.targetUrl || "/profile",
    },
    {
      id: "createdRooms",
      icon: Video,
      color: "#72000D",
      bg: "bg-[#72000D]/5",
      titleVi: "Room tự tạo",
      titleEn: "Created Rooms",
      value: data?.createdRooms?.count || 0,
      subtext: isEn ? "Custom live rooms" : "Phòng luyện nói cá nhân",
      targetUrl: data?.createdRooms?.targetUrl || "/app/sessions",
    },
    {
      id: "challenges",
      icon: Swords,
      color: "#D97706",
      bg: "bg-amber-50",
      titleVi: "Challenge tham gia",
      titleEn: "Challenges",
      value: data?.challengesJoined?.count || 0,
      subtext: isEn ? "Contests & practice" : "Thử thách phát biểu",
      targetUrl: data?.challengesJoined?.targetUrl || "/games",
    },
    {
      id: "videos",
      icon: Clapperboard,
      color: "#7C3AED",
      bg: "bg-purple-50",
      titleVi: "Video đã đăng",
      titleEn: "Videos Posted",
      value: data?.publishedVideos?.count || 0,
      subtext: isEn ? "Speaking reels" : "Reels luyện phản xạ",
      targetUrl: data?.publishedVideos?.targetUrl || "/reels",
    },
    {
      id: "articles",
      icon: FileText,
      color: "#059669",
      bg: "bg-emerald-50",
      titleVi: "Bài viết chia sẻ",
      titleEn: "Articles Posted",
      value: data?.publishedArticles?.count || 0,
      subtext: isEn ? "Community posts" : "Bài viết kinh nghiệm",
      targetUrl: data?.publishedArticles?.targetUrl || "/profile",
    },
  ]

  return (
    <section
      aria-labelledby="community-overview-heading"
      className="bg-white border border-[#DEE0E5] rounded-xl p-4 sm:p-5 shadow-2xs flex flex-col justify-between"
    >
      <div className="flex items-center justify-between gap-2 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-[#72000D]" />
            <h2 id="community-overview-heading" className="text-base font-bold text-[#14171F]">
              {isEn ? "Community Overview" : "Tổng quan cộng đồng"}
            </h2>
          </div>
          <p className="text-xs text-[#6E788C] mt-0.5">
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
              className="bg-[#FBFBFC] border border-[#DEE0E5] rounded-xl p-3 flex flex-col justify-between hover:border-[#72000D]/30 transition-colors"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div
                    className={`w-7 h-7 rounded-lg ${item.bg} flex items-center justify-center shrink-0`}
                    style={{ color: item.color }}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="text-lg font-bold text-[#14171F] tabular-nums">
                    {item.value}
                  </span>
                </div>
                <h3 className="text-xs font-semibold text-[#14171F] truncate" title={title}>
                  {title}
                </h3>
                {item.subtext && (
                  <p className="text-[10px] text-[#6E788C] mt-0.5 truncate" title={item.subtext}>
                    {item.subtext}
                  </p>
                )}
              </div>

              <button
                type="button"
                onClick={() => navigate(item.targetUrl)}
                className="mt-2.5 pt-2 border-t border-[#DEE0E5]/60 flex items-center justify-between text-[11px] font-semibold text-[#72000D] hover:underline cursor-pointer"
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
