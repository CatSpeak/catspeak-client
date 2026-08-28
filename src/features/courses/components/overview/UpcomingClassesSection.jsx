import React, { useMemo } from "react"
import { useNavigate } from "react-router-dom"
import { Calendar, Clock, Users, ArrowRight } from "lucide-react"
import { useLanguage } from "@/shared/context/LanguageContext"
import { useTimezone } from "@/shared/hooks/useTimezone"
import {
  useGetTeacherScheduleSessionsLeftQuery,
  useGetClassDetailQuery,
} from "@/store/api/coursesApi"
import CourseStatusPill from "../CourseStatusPill"
import OverlapAvatar from "@/shared/components/ui/OverlapAvatar"
import { getLocalizedLanguageName } from "../../data/courseFormOptions"
import { getSafeMediaUrl } from "../../utils/courseUtils"
import { getClassLanguageCode } from "@/shared/utils/navigation"

const UpcomingClassCardItem = ({
  session,
  formatDateMonth,
  formatScheduleTime,
  t,
  cd,
  ui,
}) => {
  const navigate = useNavigate()
  const classId = session?.class?.id || session?.classId

  // Lấy chi tiết lớp học từ endpoint /teacher/classes/{id} để lấy language, levels và members avatars
  const { data: classDetail } = useGetClassDetailQuery(classId, {
    skip: !classId,
  })

  const langCodeRaw =
    classDetail?.language || session?.class?.language || session?.language || ""
  const langName = getLocalizedLanguageName(langCodeRaw, t) || langCodeRaw
  const levels = classDetail?.levels || session?.class?.levels || []
  const levelText = Array.isArray(levels) ? levels[0] : levels || ""

  const status =
    classDetail?.status ||
    session?.class?.status ||
    session?.status ||
    "TEACHING"
  const className =
    classDetail?.name ||
    classDetail?.title ||
    session?.class?.name ||
    session?.name ||
    ui.untitledClass ||
    "Untitled Class"

  const rawStudents = classDetail?.students || classDetail?.members || []

  const students = useMemo(() => {
    if (!Array.isArray(rawStudents)) return []
    return rawStudents.map((s) => ({
      id: s.id ?? s.accountId ?? s.userId,
      name: s.name ?? s.fullName ?? s.studentName ?? "",
      avatarUrl:
        getSafeMediaUrl(s.avatar ?? s.avatarUrl ?? s.avatarImageUrl) ||
        (s.avatar ?? s.avatarUrl ?? s.avatarImageUrl),
    }))
  }, [rawStudents])

  const studentCountValue = Number(
    classDetail?.studentCount ??
      classDetail?.enrolledStudents ??
      session?.class?.studentCount,
  )
  const studentCount = Number.isFinite(studentCountValue)
    ? Math.max(0, Math.floor(studentCountValue))
    : students.length > 0
      ? students.length
      : null

  // Format Giờ học
  const sessionStartTime = session?.startTime
  const sessionEndTime = session?.endTime
  const timeDisplay = sessionStartTime
    ? sessionEndTime
      ? `${formatScheduleTime(sessionStartTime)} - ${formatScheduleTime(sessionEndTime)}`
      : formatScheduleTime(sessionStartTime)
    : ui.tba || "TBA"

  // Format Ngày
  const dateDisplay = sessionStartTime
    ? formatDateMonth(sessionStartTime, ui.tba)
    : ui.tba || "TBA"

  const handleCardClick = () => {
    if (classId) {
      navigate(
        `/workspace/courses/class/${encodeURIComponent(String(classId))}`,
      )
    }
  }

  const handleJoinRoom = () => {
    if (!classId) return
    const langCode = getClassLanguageCode(langCodeRaw) || "en"
    navigate(
      `/${encodeURIComponent(langCode)}/meet/${encodeURIComponent(`class-${classId}`)}`,
    )
  }

  return (
    <div
      onClick={handleCardClick}
      className="bg-[#FCFCFC] rounded-2xl border border-gray-100 p-3.5 sm:p-4 hover:border-gray-200 hover:shadow-xs transition-all flex flex-col gap-3 cursor-pointer group shadow-[0_2px_8px_rgba(0,0,0,0.04)]"
    >
      {/* Top Row: Language, Level, Status Pill */}
      <div className="flex flex-wrap items-center gap-1.5">
        {langName && (
          <span className="bg-[#FEF3C7] text-[#D97706] font-bold text-[10px] px-2.5 py-0.5 rounded-full">
            {langName}
          </span>
        )}
        {levelText && (
          <span className="bg-[#FEF3C7] text-[#D97706] font-bold text-[10px] px-2.5 py-0.5 rounded-full">
            {levelText}
          </span>
        )}
        {status && <CourseStatusPill status={status} className="ml-auto" />}
      </div>

      {/* Class Title */}
      <h4 className="font-bold text-sm sm:text-base text-gray-950 leading-snug group-hover:text-[#990011] transition-colors line-clamp-1">
        {className}
      </h4>

      {/* Bottom Row: Info & Action Button */}
      <div className="flex flex-col justify-between gap-2 pt-1">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-500">
          <Clock size={13} className="text-gray-400" />
          <span>{timeDisplay}</span>
        </div>

        <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-500">
          <Calendar size={13} className="text-gray-400" />
          <span>{dateDisplay}</span>
        </div>

        <div className="flex flex-wrap justify-between items-center pt-1 border-t border-gray-100/80">
          <div className="flex items-center gap-1.5 min-w-0">
            {students.length > 0 ? (
              <OverlapAvatar users={students} maxShow={3} size={24} />
            ) : (
              <div className="flex items-center gap-1.5">
                <Users size={15} className="text-gray-400" />
                <span className="text-[11px] font-bold text-gray-400 font-sans">
                  {studentCount ?? "—"}
                </span>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              handleJoinRoom()
            }}
            className="h-7 sm:h-8 px-3.5 bg-[#b20a1c] hover:bg-[#990011] text-white text-xs font-bold rounded-full flex items-center justify-center gap-1.5 transition-all shadow-xs active:scale-95 whitespace-nowrap cursor-pointer"
          >
            <span>{cd.joinRoom || "Vào phòng"}</span>
            <span>→</span>
          </button>
        </div>
      </div>
    </div>
  )
}

const UpcomingClassesSection = ({ className = "" }) => {
  const { t } = useLanguage()
  const { formatDateMonth, formatScheduleTime } = useTimezone()
  const navigate = useNavigate()

  const c = t.courses || {}
  const cd = c.courseDetail || {}
  const ui = c.workspaceUi || {}

  // Fetch 3 buổi học tiếp theo từ API GET /teacher/schedule/sessions/left
  const { data: scheduleResponse, isLoading } =
    useGetTeacherScheduleSessionsLeftQuery({ pageSize: 3 })

  const upcomingSessions = useMemo(() => {
    if (Array.isArray(scheduleResponse?.data)) {
      return scheduleResponse.data
    }
    return []
  }, [scheduleResponse])

  const totalCount =
    scheduleResponse?.totalSessionsRemaining ?? upcomingSessions.length

  return (
    <div
      className={`bg-white rounded-3xl border border-border shadow-xs p-4 sm:p-5 flex flex-col gap-3.5 h-fit ${className}`}
    >
      {/* ─── Header ─── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-base sm:text-lg font-bold text-gray-950 tracking-tight">
            {c.upcomingClasses || "Lớp học sắp tới"}
          </h3>
          {totalCount > 0 && (
            <span className="bg-[#f59e0b] text-white text-xs font-bold px-2 py-0.5 rounded-full inline-flex items-center justify-center min-w-[20px] h-[20px]">
              {totalCount}
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={() => navigate("/workspace/my-calendar")}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#990011] hover:text-[#7a000e] transition-colors cursor-pointer group"
        >
          <span>{c.viewSchedule || "Xem lịch trình"}</span>
          <ArrowRight
            size={13}
            className="transition-transform group-hover:translate-x-0.5"
          />
        </button>
      </div>

      {/* ─── Cards List ─── */}
      {isLoading && upcomingSessions.length === 0 ? (
        <div className="p-8 flex items-center justify-center min-h-[160px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#990011]"></div>
        </div>
      ) : upcomingSessions.length === 0 ? (
        <div className="p-6 flex flex-col items-center justify-center text-center min-h-[160px] gap-2">
          <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-400">
            <Calendar size={20} />
          </div>
          <span className="font-bold text-sm text-gray-700">
            {cd.noUpcoming || "Chưa có lớp học nào sắp tới"}
          </span>
          <p className="text-xs text-gray-400 max-w-sm">
            {cd.createClassToSchedule ||
              "Các buổi học sắp tới theo lịch của bạn sẽ hiển thị tại đây."}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3 flex-1">
          {upcomingSessions.map((item, index) => (
            <UpcomingClassCardItem
              key={item.class?.id || item.id || index}
              session={item}
              formatDateMonth={formatDateMonth}
              formatScheduleTime={formatScheduleTime}
              t={t}
              cd={cd}
              ui={ui}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default UpcomingClassesSection
