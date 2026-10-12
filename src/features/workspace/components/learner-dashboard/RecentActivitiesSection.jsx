import React from "react"
import { useNavigate } from "react-router-dom"
import { History, Video, CheckCircle2, Clapperboard, ArrowRight, Activity } from "lucide-react"
import { useLanguage } from "@/shared/context/LanguageContext"
import { ACTIVITY_TYPES } from "../../constants/learnerDashboardConstants"

const getActivityIcon = (type) => {
  switch (type) {
    case ACTIVITY_TYPES.ROOM_SESSION:
      return { icon: Video, color: "text-blue-600", bg: "bg-blue-50" }
    case ACTIVITY_TYPES.LESSON_COMPLETE:
      return { icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50" }
    case ACTIVITY_TYPES.VIDEO_POST:
      return { icon: Clapperboard, color: "text-purple-600", bg: "bg-purple-50" }
    default:
      return { icon: Activity, color: "text-[#72000D]", bg: "bg-[#72000D]/5" }
  }
}

const RecentActivitiesSection = ({ activities = [] }) => {
  const navigate = useNavigate()
  const { language } = useLanguage()
  const isEn = language === "en"

  // Max 3 items as specified in BR-DASH-62
  const displayList = activities.slice(0, 3)

  return (
    <section
      aria-labelledby="recent-activities-heading"
      className="bg-white border border-[#DEE0E5] rounded-xl p-4 sm:p-5 shadow-2xs flex flex-col justify-between"
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-2 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-[#72000D]" />
            <h2 id="recent-activities-heading" className="text-base font-bold text-[#14171F]">
              {isEn ? "Recent Activities" : "Hoạt động gần đây"}
            </h2>
          </div>
          <p className="text-xs text-[#6E788C] mt-0.5">
            {isEn ? "Timeline of your latest learning events" : "Nhật ký các hoạt động học tập, luyện nói và tương tác mới nhất"}
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate("/profile?tab=activity")}
          className="inline-flex items-center gap-1 text-xs font-semibold text-[#B80514] hover:underline cursor-pointer"
        >
          <span>{isEn ? "View All" : "Xem tất cả"}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Timeline List */}
      {displayList && displayList.length > 0 ? (
        <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-200">
          {displayList.map((item) => {
            const config = getActivityIcon(item.type)
            const Icon = config.icon
            const title = isEn ? item.titleEn : item.titleVi
            const timeAgo = (isEn ? item.timeAgoEn : item.timeAgoVi) || (
              item.occurredAt
                ? new Intl.DateTimeFormat(isEn ? "en" : "vi", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  }).format(new Date(item.occurredAt))
                : ""
            )
            const snippet = isEn ? item.metricSnippetEn : item.metricSnippet

            return (
              <button
                key={item.id}
                type="button"
                disabled={!item.targetUrl}
                onClick={() => item.targetUrl && navigate(item.targetUrl)}
                className="relative flex items-start gap-3 text-xs text-left w-full disabled:cursor-default enabled:cursor-pointer enabled:hover:bg-gray-50 rounded-md transition-colors"
              >
                {/* Timeline node */}
                <div
                  className={`absolute -left-6 top-0.5 w-5 h-5 rounded-full ${config.bg} ${config.color} border-2 border-white flex items-center justify-center shrink-0 shadow-2xs`}
                >
                  <Icon className="w-3 h-3" />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <p className="font-semibold text-[#14171F] truncate" title={title}>
                      {title}
                    </p>
                    <span className="text-[11px] text-[#6E788C] shrink-0">{timeAgo}</span>
                  </div>
                  {snippet && (
                    <p className="text-[11px] text-[#6E788C] mt-0.5">{snippet}</p>
                  )}
                </div>
              </button>
            )
          })}
        </div>
      ) : (
        <div className="py-6 text-center text-gray-400 text-xs">
          <History className="w-6 h-6 text-gray-300 mx-auto mb-1.5" />
          <p>{isEn ? "No recent activities." : "Không có hoạt động gần đây."}</p>
        </div>
      )}
    </section>
  )
}

export default RecentActivitiesSection
