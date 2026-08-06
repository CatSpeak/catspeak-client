import React from "react"
import { Calendar, Star, Award, Clock, BarChart3 } from "lucide-react"
import { useLanguage } from "@/shared/context/LanguageContext"
import { formatScheduleDays } from "../../utils/scheduleUtils"

const PublicClassStatsBar = ({ classData }) => {
  const { language } = useLanguage()

  const totalSessions = classData?.totalSessions || classData?.sessionsCount || 24
  const scheduleDaysText = formatScheduleDays(
    classData?.schedule?.days,
    language,
    "Lịch linh hoạt"
  )

  const stats = [
    {
      id: "sessions",
      title: `${totalSessions} buổi học`,
      subtitle: "Học trực tiếp & tương tác 1:1",
      icon: Clock,
      highlight: true
    },
    {
      id: "rating",
      title: "4.9 ★",
      subtitle: "Từ 185+ đánh giá học viên",
      icon: Star,
      iconColor: "text-amber-500"
    },
    {
      id: "level",
      title: classData?.levels[0] || "Mọi trình độ",
      subtitle: "Lộ trình đào tạo bài bản",
      icon: BarChart3,
      iconColor: "text-[#b20a1c]"
    },
    {
      id: "schedule",
      title: scheduleDaysText,
      subtitle: "Thời gian linh hoạt theo tuần",
      icon: Calendar,
      iconColor: "text-blue-600"
    },
    {
      id: "certificate",
      title: "Chứng nhận",
      subtitle: "Cấp sau khi hoàn thành khóa",
      icon: Award,
      iconColor: "text-emerald-600"
    }
  ]

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-20">
      <div className="bg-white rounded-3xl shadow-lg border border-slate-100 p-6 sm:p-8 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 divide-y sm:divide-y-0 sm:divide-x divide-slate-100">
        {stats.map((item, index) => {
          const Icon = item.icon
          return (
            <div
              key={item.id}
              className={`flex flex-col gap-1.5 ${index > 0 ? "pt-4 sm:pt-0 sm:pl-6" : ""}`}
            >
              <div className="flex items-center gap-2">
                <Icon size={18} className={item.iconColor || "text-[#b20a1c]"} />
                <span className="text-base sm:text-lg font-black text-slate-900 leading-none">
                  {item.title}
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                {item.subtitle}
              </p>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default PublicClassStatsBar
