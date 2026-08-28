import React, { useMemo } from "react"
import { useNavigate } from "react-router-dom"
import { Clock, Calendar, Users } from "lucide-react"
import CountdownTicker from "../CountdownTicker"
import CourseStatusPill from "../CourseStatusPill"
import OverlapAvatar from "@/shared/components/ui/OverlapAvatar"
import { useLanguage } from "@/shared/context/LanguageContext"
import { useTimezone } from "@/shared/hooks/useTimezone"
import { getLocalizedLanguageName } from "../../data/courseFormOptions"
import { getSafeMediaUrl } from "../../utils/courseUtils"
import { getClassLanguageCode } from "@/shared/utils/navigation"

const UpcomingSessionSection = ({
  classData = {},
  onJoinRoom: propOnJoinRoom,
  cd: propCd,
  upcomingSessionLabel: propUpcomingSessionLabel,
  className = "",
}) => {
  const { t } = useLanguage()
  const { formatDateMonth, formatScheduleTime } = useTimezone()
  const navigate = useNavigate()

  const c = t.courses || {}
  const cd = propCd || c.classDetail || {}
  const ui = c.workspaceUi || {}
  const upcomingSessionLabel =
    propUpcomingSessionLabel ||
    c.courseDetail?.upcomingSession ||
    "Upcoming Session"

  const rawNs = classData?.nextSession
  const nsIsoStart = rawNs?.startTime || rawNs?.rawStartTime || ""
  const nsIsoEnd = rawNs?.endTime || rawNs?.rawEndTime || ""
  const schedObj = Array.isArray(classData?.schedule)
    ? classData.schedule[0]
    : classData?.schedule || {}

  const hasNextSession = Boolean(
    rawNs && (rawNs.date || rawNs.startTime || rawNs.rawStartTime),
  )
  const nextSession = hasNextSession ? rawNs : null

  const sessionStartTime =
    schedObj?.startTime ||
    (typeof nsIsoStart === "string" && !nsIsoStart.includes("T")
      ? nsIsoStart
      : null) ||
    nsIsoStart
  const sessionEndTime =
    schedObj?.endTime ||
    (typeof nsIsoEnd === "string" && !nsIsoEnd.includes("T")
      ? nsIsoEnd
      : null) ||
    nsIsoEnd
  const sessionDate =
    rawNs?.date ||
    (typeof nsIsoStart === "string" && nsIsoStart.includes("T")
      ? nsIsoStart.split("T")[0]
      : classData?.startDate)

  const studentCountValue = Number(
    classData?.studentCount ?? classData?.enrolledStudents,
  )
  const studentCount = Number.isFinite(studentCountValue)
    ? Math.max(0, Math.floor(studentCountValue))
    : null

  const students = useMemo(() => {
    const list = Array.isArray(classData?.students)
      ? classData.students
      : Array.isArray(classData?.members)
        ? classData.members
        : Array.isArray(classData?.enrollments)
          ? classData.enrollments
          : []
    return list.map((s) => ({
      id: s.id ?? s.accountId ?? s.userId,
      name: s.name ?? s.fullName ?? s.studentName ?? "",
      avatarUrl:
        getSafeMediaUrl(s.avatarUrl ?? s.avatar ?? s.avatarImageUrl) ||
        (s.avatarUrl ?? s.avatar ?? s.avatarImageUrl),
    }))
  }, [classData])

  const handleJoinRoom = () => {
    if (propOnJoinRoom) {
      propOnJoinRoom()
      return
    }
    const langCode = getClassLanguageCode(classData?.language) || "en"
    navigate(
      `/${encodeURIComponent(langCode)}/meet/${encodeURIComponent(`class-${classData?.id}`)}`,
    )
  }

  return (
    <div
      className={`bg-white rounded-3xl border border-border p-6 shadow-xs flex flex-col gap-5 ${className}`}
    >
      <h3 className="text-lg font-bold text-gray-950 tracking-tight">
        {upcomingSessionLabel}
      </h3>

      {nextSession ? (
        <>
          <CountdownTicker
            targetDate={
              nextSession?.rawStartTime ||
              (nextSession?.date && nextSession?.startTime
                ? `${nextSession.date}T${nextSession.startTime}`
                : null)
            }
          />

          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap items-center gap-1.5">
              {classData?.language && (
                <span className="bg-[#FEF3C7] text-[#D97706] font-bold text-[10px] px-2.5 py-0.5 rounded-full">
                  {getLocalizedLanguageName(classData.language, t)}
                </span>
              )}
              {classData?.levels?.[0] && (
                <span className="bg-[#FEF3C7] text-[#D97706] font-bold text-[10px] px-2.5 py-0.5 rounded-full">
                  {classData.levels[0]}
                </span>
              )}
              {classData?.status && (
                <CourseStatusPill
                  status={classData.status}
                  className="ml-auto"
                />
              )}
            </div>

            <h4 className="font-bold text-base text-gray-950 leading-snug line-clamp-2">
              {classData?.title || ui.untitledClass || "Untitled class"}
            </h4>

            <div className="flex flex-col gap-2 border-b border-gray-55 pb-4 text-xs font-semibold text-gray-500">
              <div className="flex items-center gap-2">
                <Clock size={14} className="text-gray-400" />
                <span>
                  {sessionStartTime
                    ? sessionEndTime
                      ? `${formatScheduleTime(sessionStartTime)} - ${formatScheduleTime(sessionEndTime)}`
                      : formatScheduleTime(sessionStartTime)
                    : ui.tba || "TBA"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar size={14} className="text-gray-400" />
                <span>{formatDateMonth(sessionDate, ui.tba)}</span>
              </div>
            </div>

            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-1.5 min-w-0">
                {students.length > 0 ? (
                  <OverlapAvatar users={students} maxShow={3} size={24} />
                ) : (
                  <div className="flex items-center gap-1.5">
                    <Users size={16} className="text-gray-400" />
                    <span className="text-[11px] font-bold text-gray-400 font-sans">
                      {studentCount ?? "—"}
                    </span>
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={handleJoinRoom}
                className="h-8 px-4 bg-[#b20a1c] hover:bg-[#990011] text-white text-xs font-bold rounded-full flex items-center justify-center gap-1.5 transition-all shadow-xs active:scale-95 whitespace-nowrap cursor-pointer"
              >
                <span>{cd.joinRoom || "Join room"}</span>
                <span>→</span>
              </button>
            </div>
          </div>
        </>
      ) : (
        <div className="rounded-2xl bg-gray-50 p-5 flex flex-col items-center gap-3 text-center">
          <p className="text-xs font-semibold text-gray-500">
            {cd.noUpcomingSession || "No upcoming sessions"}
          </p>
          <button
            type="button"
            onClick={handleJoinRoom}
            className="h-8 px-4 bg-[#b20a1c] hover:bg-[#990011] text-white text-xs font-bold rounded-full flex items-center justify-center gap-1.5 transition-all shadow-xs active:scale-95 whitespace-nowrap cursor-pointer"
          >
            <span>{cd.joinRoom || "Join room"}</span>
            <span>→</span>
          </button>
        </div>
      )}
    </div>
  )
}

export default UpcomingSessionSection
