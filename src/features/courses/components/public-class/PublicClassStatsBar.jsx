import React from "react"
import { Calendar, Star, Award, Clock, BarChart3, User } from "lucide-react"
import { useLanguage } from "@/shared/context/LanguageContext"
import { formatScheduleDays } from "../../utils/scheduleUtils"

const PublicClassStatsBar = ({ classData }) => {
  const { t, language } = useLanguage()
  const pc = t.courses?.publicClass || {}

  const totalSessions = classData?.totalSessions || classData?.sessionsCount || 24
  const sessionsTitle = (pc.sessionsCount || "{{count}} buổi học").replace("{{count}}", totalSessions)

  const defaultScheduleText = pc.flexibleSchedule || "Lịch linh hoạt"
  const scheduleDaysText = formatScheduleDays(
    classData?.schedule?.days,
    language,
    defaultScheduleText
  )

  const remaining = classData?.remainingSlots ?? 0
  const capacity = classData?.capacity ?? 0
  const spotsTitle = (pc.spotsLeft || "{{remaining}}/{{capacity}} chỗ")
    .replace("{{remaining}}", remaining)
    .replace("{{capacity}}", capacity)

  const stats = [
    {
      id: "sessions",
      title: sessionsTitle,
      subtitle: pc.interactiveSub || "Học trực tiếp & tương tác 1:1",
      icon: Clock,
      highlight: true
    },
    {
      id: "level",
      title: classData?.levels?.[0] || pc.allLevels || "Mọi trình độ",
      subtitle: pc.curriculumSub || "Lộ trình đào tạo bài bản",
      icon: BarChart3,
      iconColor: "text-[#b20a1c]"
    },
    {
      id: "schedule",
      title: scheduleDaysText,
      subtitle: pc.scheduleSub || "Thời gian linh hoạt theo tuần",
      icon: Calendar,
      iconColor: "text-blue-600"
    },
    {
      id: "certificate",
      title: spotsTitle,
      subtitle: pc.spotsSub || "Số người được phép đăng ký lớp học",
      icon: User,
      iconColor: "text-emerald-600"
    }
  ]

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-20">
      <div className="bg-white rounded-3xl shadow-lg border border-slate-100 p-6 sm:p-8 grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((item, index) => {
          const Icon = item.icon
          return (
            <div
              key={item.id}
              className={`flex flex-col gap-1.5 ${index > 0 ? "pt-4 sm:pt-0" : ""}`}
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
