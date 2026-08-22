import React from "react"
import { Calendar, Star, Award, Clock, BarChart3, User } from "lucide-react"
import { useLanguage } from "@/shared/context/LanguageContext"
import { useTimezone } from "@/shared/hooks/useTimezone"

const PublicClassStatsBar = ({ classData }) => {
  const { t } = useLanguage()
  const { formatScheduleDays } = useTimezone()
  const pc = t.courses?.publicClass || {}

  const totalSessions = classData?.totalSessions || classData?.sessionsCount
  const sessionsTitle = (pc.sessionsCount || "{{count}} buổi học").replace(
    "{{count}}",
    totalSessions,
  )

  const defaultScheduleText = pc.flexibleSchedule || "Lịch linh hoạt"
  const scheduleDaysText = formatScheduleDays(
    classData?.schedule?.days,
    defaultScheduleText,
    " - ",
    classData?.schedule?.startTime,
  )

  const remaining = classData?.remainingSlots ?? 0
  const capacity = classData?.capacity ?? 0
  const spotsTitle = (pc.spotsLeft || "{{remaining}}/{{capacity}} chỗ")
    .replace("{{remaining}}", remaining)
    .replace("{{capacity}}", capacity)

  const stats = [
    {
      id: "certificate",
      title: spotsTitle,
      subtitle: pc.spotsSub || "Số người trong 1 lớp.",
      icon: User,
    },
    {
      id: "level",
      title: classData?.levels?.[0] || pc.allLevels || "Mọi trình độ",
      subtitle: pc.curriculumSub || "Trình độ.",
      icon: BarChart3,
    },
    {
      id: "schedule",
      title: scheduleDaysText,
      subtitle: pc.scheduleSub || "Thời gian linh hoạt",
      icon: Calendar,
    },
    {
      id: "sessions",
      title: sessionsTitle,
      subtitle: pc.interactiveSub || "Trực tuyến & tương tác 1:1",
      icon: Clock,
      highlight: true,
    },
  ]

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-20">
      <div className="bg-white rounded-3xl shadow-lg border border-slate-100 p-6 sm:p-8 grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((item) => {
          const Icon = item.icon
          return (
            <div key={item.id} className="flex items-start gap-3">
              <div className="shrink-0 mt-0.5">
                <Icon
                  size={20}
                  className={item.iconColor || "text-[#b20a1c]"}
                />
              </div>
              <div className="flex flex-col gap-0.5 min-w-0">
                <span className="text-sm sm:text-base font-bold text-slate-900 leading-snug">
                  {item.title}
                </span>
                <p className="text-xs text-slate-500 font-medium leading-normal">
                  {item.subtitle}
                </p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default PublicClassStatsBar
