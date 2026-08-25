import React from "react"
import { CircularProgressbar, buildStyles } from "react-circular-progressbar"
import "react-circular-progressbar/dist/styles.css"
import { useLanguage } from "@/shared/context/LanguageContext"

const TeachingProgressSection = ({
  classData = {},
  cd: propCd,
  className = "",
}) => {
  const { t } = useLanguage()
  const c = t.courses || {}
  const cd = propCd || c.classDetail || {}

  const completedValue = classData?.progress
    ? classData.progress.completedSessions
    : (classData?.completedSessions ?? classData?.teachingProgress?.completed)

  const totalValue = classData?.progress
    ? classData.progress.totalSessions
    : (classData?.totalSessions ?? classData?.teachingProgress?.total)

  const completed =
    completedValue != null && Number.isFinite(Number(completedValue))
      ? Math.max(0, Number(completedValue))
      : null
  const total =
    Number.isFinite(Number(totalValue)) && Number(totalValue) > 0
      ? Number(totalValue)
      : 0
  const progressPercent =
    total > 0 && completed !== null
      ? Math.min(100, Math.round((completed / total) * 100))
      : null
  const progressText = `${completed ?? "—"} / ${total || "—"}`

  return (
    <div
      className={`bg-white rounded-3xl border border-border p-6 shadow-xs flex flex-col gap-5 ${className}`}
    >
      <h3 className="text-xl font-bold text-gray-950 tracking-tight">
        {cd.teachingProgress || "Teaching Progress"}
      </h3>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-4 px-2">
        <div className="relative w-60 h-60 flex items-center justify-center shrink-0">
          <CircularProgressbar
            value={progressPercent ?? 0}
            strokeWidth={8}
            styles={buildStyles({
              pathColor: "#990011",
              trailColor: "#E5E7EB",
              strokeLinecap: "round",
            })}
          />
          <div className="absolute flex flex-col items-center justify-center text-center">
            <span className="text-4xl font-bold text-gray-950 leading-none">
              {progressPercent == null ? "—" : `${progressPercent}%`}
            </span>
            <span className="text-sm font-bold text-gray-800 mt-2.5">
              {progressText}
            </span>
            <span className="text-[11px] text-gray-400 font-bold mt-1 uppercase tracking-wider">
              {cd.sessionCompleted || "Session completed"}
            </span>
          </div>
        </div>

        <div className="flex flex-col justify-center gap-4 flex-1 max-w-sm w-full">
          <div className="flex items-center gap-2 text-xs font-bold text-gray-600">
            <span className="w-3.5 h-3.5 rounded-full bg-[#990011] shrink-0" />
            <span>{cd.completedSessionsLabel || "Completed sessions"}</span>
          </div>
          <div className="flex items-center gap-2 text-xs font-bold text-gray-600">
            <span className="w-3.5 h-3.5 rounded-full bg-[#9CA3AF] shrink-0" />
            <span>
              {cd.uncompletedSessionsLabel || "Uncompleted sessions"}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TeachingProgressSection
