import React from "react"
import { Calendar, Star, Award, Clock, BarChart3, User } from "lucide-react"
import { useLanguage } from "@/shared/context/LanguageContext"
import { useTimezone } from "@/shared/hooks/useTimezone"

const PublicClassStatsBar = ({ classData }) => {
  const { t } = useLanguage()
  const { formatScheduleDays, formatScheduleTime } = useTimezone()
  const pc = t.courses?.publicClass || {}

  const totalSessions = classData?.totalSessions || classData?.sessionsCount
  const sessionsTitle = (pc.sessionsCount || "{{count}} buổi học").replace(
    "{{count}}",
    totalSessions,
  )

  const defaultScheduleText = pc.flexibleSchedule || "Lịch linh hoạt"
  const rawSchedule = classData?.schedule
  const scheduleDays = Array.isArray(rawSchedule)
    ? rawSchedule.map((s) => s.dayOfWeek).filter(Boolean)
    : rawSchedule?.days || []
  const firstSchedule =
    Array.isArray(rawSchedule) && rawSchedule.length > 0
      ? rawSchedule[0]
      : rawSchedule

  const hasDays = Array.isArray(scheduleDays) && scheduleDays.length > 0
  const scheduleDaysText = hasDays
    ? formatScheduleDays(scheduleDays, "", " - ", firstSchedule?.startTime)
    : ""

  const modifiedSessionsCount = Array.isArray(classData?.modifiedSessions)
    ? classData.modifiedSessions.length
    : 0

  const startTime = firstSchedule?.startTime || classData?.startTime
  const endTime = firstSchedule?.endTime || classData?.endTime
  const timeFormatted =
    startTime && endTime
      ? `${formatScheduleTime(startTime)} → ${formatScheduleTime(endTime)}`
      : startTime
        ? formatScheduleTime(startTime)
        : null

  const scheduleParts = []
  if (scheduleDaysText) {
    scheduleParts.push(scheduleDaysText)
  }
  if (modifiedSessionsCount > 0) {
    const modText = (
      pc.andModifiedSessions || "và {{count}} buổi ngoại lệ"
    ).replace("{{count}}", modifiedSessionsCount)
    scheduleParts.push(modText)
  }
  if (timeFormatted) {
    scheduleParts.push(timeFormatted)
  }

  const scheduleTitle =
    scheduleParts.length > 0 ? scheduleParts.join("\n") : defaultScheduleText

  const remaining = classData?.remainingSlots ?? 0
  const capacity = classData?.capacity ?? 0
  const spotsTitle = (pc.spotsLeft || "{{remaining}}/{{capacity}} chỗ")
    .replace("{{remaining}}", remaining)
    .replace("{{capacity}}", capacity)

  const stats = [
    {
      id: "certificate",
      title: spotsTitle,
      subtitle: pc.spotsSub || "Số người đã đăng ký",
      icon: User,
    },
    {
      id: "level",
      title: classData?.levels?.[0] || pc.allLevels || "Mọi trình độ",
      subtitle: pc.curriculumSub || "Trình độ",
      icon: BarChart3,
    },
    {
      id: "schedule",
      title: scheduleTitle,
      subtitle: pc.scheduleSub || "Thời gian linh hoạt",
      icon: Calendar,
    },
    {
      id: "sessions",
      title: sessionsTitle,
      subtitle: pc.interactiveSub || "Trực tuyến",
      icon: Clock,
      highlight: true,
    },
  ]

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 relative z-20">
      <div className="bg-white rounded-3xl shadow-lg border border-slate-100 p-4 sm:p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_1.35fr_1fr] gap-4 sm:gap-6">
        {stats.map((item) => {
          const Icon = item.icon
          return (
            <div key={item.id} className="flex items-start gap-3">
              <div className="shrink-0 mt-0.5">
                <Icon
                  size={25}
                  className={item.iconColor || "text-[#b20a1c]"}
                />
              </div>
              <div className="flex flex-col gap-0.5 min-w-0">
                <span className="text-sm sm:text-base font-bold text-slate-900 leading-snug whitespace-pre-line">
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
