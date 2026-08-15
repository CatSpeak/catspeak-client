import React, { useState } from "react"
import {
  Globe,
  GraduationCap,
  Calendar,
  Clock,
  AlignLeft,
  Users,
  Layers,
  Share2,
  Check,
} from "lucide-react"
import { CircularProgressbar, buildStyles } from "react-circular-progressbar"
import "react-circular-progressbar/dist/styles.css"
import CountdownTicker from "../CountdownTicker"
import CourseStatusPill from "../CourseStatusPill"
import RenderHTML from "@/shared/components/ui/RenderHTML"
import { useLanguage } from "@/shared/context/LanguageContext"
import { useTimezone } from "@/shared/hooks/useTimezone"
import { getLocalizedLanguageName } from "../../data/courseFormOptions"
import { defaultCourseThumbnail, getSafeMediaUrl } from "../../utils/courseUtils"
import { copyShareLink } from "@/shared/utils/shareUtils"

const StudentClassOverviewTab = ({
  classData = {},
  isEnrolled = false,
  formatCurrency,
  getWeeklyScheduleText,
  upcomingSessionLabel,
  joinRoomLabel,
  noUpcomingLabel,
  onJoinRoom,
}) => {
  const { t } = useLanguage()
  const { formatDateMonth, formatDate, formatScheduleTime } = useTimezone()
  const c = t.courses || {}
  const cd = c.classDetail || {}
  const scd = c.studentCourseDetail || {}
  const ui = c.workspaceUi || {}

  const [linkCopied, setLinkCopied] = useState(false);
  const handleCopyLink = async () => {
    const classId = classData?.id
    const shareUrl = `${window.location.origin}/explore-courses/class/${classId}`
    const ok = await copyShareLink({
      url: shareUrl,
      successMessage: cd.linkCopied || "Link copied!",
      errorMessage: cd.linkCopyFailed || "Failed to copy link",
    });
    if (ok) {
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    }
  };



  const completedValue = classData.progress
    ? classData.progress.completedSessions
    : (classData.completedSessions ?? classData.teachingProgress?.completed)
  const totalValue = classData.progress
    ? classData.progress.totalSessions
    : (classData.totalSessions ?? classData.teachingProgress?.total)
  const completedSessions =
    completedValue != null && Number.isFinite(Number(completedValue))
      ? Math.max(0, Number(completedValue))
      : null
  const totalSessions =
    Number.isFinite(Number(totalValue)) && Number(totalValue) > 0
      ? Number(totalValue)
      : 0
  const progressPercent =
    totalSessions > 0 && completedSessions !== null
      ? Math.min(100, Math.round((completedSessions / totalSessions) * 100))
      : null
  const progressText = `${completedSessions ?? "—"} / ${totalSessions || "—"}`

  const thumbnailUrl = getSafeMediaUrl(classData.thumbnailUrl)
  const instructor =
    classData.instructor && typeof classData.instructor === "object"
      ? classData.instructor
      : null
  const instructorName = String(
    instructor?.fullName ??
    instructor?.name ??
    classData.instructorName ??
    classData.teacherName ??
    ""
  ).trim()
  const instructorBio = String(
    instructor?.bio ?? instructor?.description ?? ""
  ).trim()
  const instructorAvatarCandidate = String(
    instructor?.avatarUrl ?? instructor?.avatar ?? ""
  ).trim()
  const instructorAvatar = getSafeMediaUrl(instructorAvatarCandidate) || ""

  const rawNs = classData.nextSession
  const nsIsoStart = rawNs?.startTime || rawNs?.rawStartTime || ""
  const nsIsoEnd = rawNs?.endTime || rawNs?.rawEndTime || ""
  const schedObj = Array.isArray(classData.schedule)
    ? classData.schedule[0]
    : classData.schedule || {}

  const hasNextSession = Boolean(
    rawNs && (rawNs.date || rawNs.startTime || rawNs.rawStartTime)
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
      : classData.startDate)

  const studentCountValue = Number(
    classData.studentCount ?? classData.enrolledStudents
  )
  const studentCount = Number.isFinite(studentCountValue)
    ? Math.max(0, Math.floor(studentCountValue))
    : null

  const showRightColumn = isEnrolled

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {/* ─── LEFT COLUMN: Visual Banner, Fee, Info Grid, Instructor & Study Progress ─── */}
      <div
        className={`${showRightColumn ? "lg:col-span-2" : "lg:col-span-3"} flex flex-col gap-4`}
      >
        {/* Visual Banner */}
        <div className="relative rounded-3xl p-8 min-h-[380px] flex flex-col justify-end shadow-sm text-white">
          <div
            className="absolute inset-0 rounded-3xl overflow-hidden z-0 bg-cover bg-center"
            style={{
              backgroundImage: `url(${thumbnailUrl || defaultCourseThumbnail})`,
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/45 to-black/15" />
          </div>

          {/* Share / Copy Link Button */}
          <button
            type="button"
            onClick={handleCopyLink}
            title={cd.shareClass || "Share class"}
            className="absolute top-4 right-4 z-10 h-10 w-10 flex items-center justify-center rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-sm text-white transition-all active:scale-90 cursor-pointer"
          >
            {linkCopied ? <Check size={18} /> : <Share2 size={18} />}
          </button>

          <div className="relative z-10 flex flex-col gap-3">
            {(classData.language || classData.levels?.[0]) && (
              <span className="bg-red-500 text-white font-bold text-[9px] px-2.5 py-0.5 rounded-full w-max uppercase tracking-wider">
                {[
                  getLocalizedLanguageName(classData.language, t),
                  classData.levels?.[0],
                ]
                  .filter(Boolean)
                  .join(" • ")}
              </span>
            )}
            <h2 className="text-2xl sm:text-3xl font-black leading-tight tracking-tight max-w-xl">
              {classData.title || scd.untitledBatch || ui.untitledClass || "Untitled class"}
            </h2>
          </div>
        </div>

        {/* Tuition Fee Card (if available) */}
        {classData.tuitionFee !== undefined && classData.tuitionFee !== null && (
          <div className="bg-white rounded-3xl border border-border p-6 shadow-xs flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 shrink-0 rounded-full bg-[#E8F8F0] text-[#15803D] flex items-center justify-center font-black text-lg">
                $
              </div>
              <span className="text-sm font-extrabold text-gray-500">{cd.classFee || "Class Fee"}</span>
            </div>
            <div className="flex items-center gap-1.5 text-xl font-black text-[#990011]">
              <span>
                {formatCurrency
                  ? `${formatCurrency(classData.tuitionFee)} ${ui.currencyVnd || "VND"}`
                  : `${classData.tuitionFee} VND`}
              </span>
              <span
                className="w-5 h-5 rounded-full border border-gray-300 text-gray-400 text-xs flex items-center justify-center cursor-help shrink-0 font-medium"
                title={cd.classFeeHelp || "Tuition fee charged per student"}
              >
                ?
              </span>
            </div>
          </div>
        )}

        {/* Information Card Grid */}
        <div className="bg-white rounded-3xl border border-border p-6 shadow-xs flex flex-col gap-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* 1. Language - Blue */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 shrink-0 rounded-full bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center">
                <Globe size={18} />
              </div>
              <div className="flex flex-col">
                <span className="text-sm text-gray-400 font-bold">{cd.language || "Language"}</span>
                <span className="text-gray-900 font-extrabold text-sm mt-0.5">
                  {getLocalizedLanguageName(classData.language, t) || "—"}
                </span>
              </div>
            </div>

            {/* 2. Level - Red */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 shrink-0 rounded-full bg-[#FFE4E6] text-[#990011] flex items-center justify-center">
                <GraduationCap size={18} />
              </div>
              <div className="flex flex-col">
                <span className="text-sm text-gray-400 font-bold">{cd.level || "Level"}</span>
                <span className="inline-flex mt-1 items-center justify-center px-3 py-0.5 text-xs font-black text-white bg-[#990011] rounded-full w-fit">
                  {classData.levels?.join(", ") || "—"}
                </span>
              </div>
            </div>

            {/* 3. Total Sessions - Emerald Green */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 shrink-0 rounded-full bg-[#E8F8F0] text-[#059669] flex items-center justify-center">
                <Layers size={18} />
              </div>
              <div className="flex flex-col">
                <span className="text-sm text-gray-400 font-bold">
                  {cd.totalSessions || "Số buổi học"}
                </span>
                <span className="text-gray-900 font-extrabold text-sm mt-0.5">
                  {totalSessions > 0
                    ? `${totalSessions} ${cd.sessionsCountLabel || "buổi"}`
                    : (classData.totalSessions ? `${classData.totalSessions} ${cd.sessionsCountLabel || "buổi"}` : "—")}
                </span>
              </div>
            </div>

            {/* 4. Class Size - Amber/Yellow */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 shrink-0 rounded-full bg-[#FEF3C7] text-[#D97706] flex items-center justify-center">
                <Users size={18} />
              </div>
              <div className="flex flex-col">
                <span className="text-sm text-gray-400 font-bold">{cd.classSize || "Class Size"}</span>
                <span className="text-gray-900 font-extrabold text-sm mt-0.5">
                  {classData.slots ?? "—"} {cd.studentsLabel || "students"}
                </span>
              </div>
            </div>

            {/* 5. Admission Period - Purple */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 shrink-0 rounded-full bg-[#F3E8FF] text-[#7C3AED] flex items-center justify-center">
                <Calendar size={18} />
              </div>
              <div className="flex flex-col">
                <span className="text-sm text-gray-400 font-bold">{cd.enrollmentPeriod || "Admission Period"}</span>
                <span className="text-gray-900 font-extrabold text-sm mt-0.5">
                  {classData.enrollmentStart && classData.enrollmentEnd
                    ? `${formatDate(classData.enrollmentStart)} - ${formatDate(classData.enrollmentEnd)}`
                    : ui.tba || "TBA"}
                </span>
              </div>
            </div>

            {/* 6. Weekly Schedule - Orange */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 shrink-0 rounded-full bg-[#FFEDD5] text-[#EA580C] flex items-center justify-center">
                <Clock size={18} />
              </div>
              <div className="flex flex-col">
                <span className="text-sm text-gray-400 font-bold">
                  {cd.weeklySchedule || "Weekly Schedule"}
                </span>
                <span className="text-gray-900 font-extrabold text-sm mt-0.5">
                  {getWeeklyScheduleText ? getWeeklyScheduleText() : "—"}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-start gap-3 border-t border-border pt-6">
            <div className="w-10 h-10 shrink-0 rounded-full bg-[#F3F4F6] text-[#4B5563] flex items-center justify-center">
              <AlignLeft size={18} />
            </div>
            <div className="flex flex-col gap-1 w-full min-w-0">
              <span className="text-sm text-gray-400 font-bold">{cd.description || "Description"}</span>
              <RenderHTML
                html={classData.description}
                className="text-gray-600 font-medium text-sm leading-relaxed mt-0.5"
                fallback={<span className="text-gray-600 font-medium text-sm leading-relaxed mt-0.5">{cd.noDescription || "No description provided."}</span>}
              />
            </div>
          </div>
        </div>

        {/* Lead Instructor Information */}
        {instructorName && (
          <div className="bg-white rounded-3xl border border-border p-6 shadow-xs flex flex-col sm:flex-row gap-5 items-start sm:items-center">
            {instructorAvatar ? (
              <img
                className="w-14 h-14 rounded-full object-cover border border-border shrink-0"
                src={instructorAvatar}
                alt=""
              />
            ) : (
              <div className="w-14 h-14 rounded-full bg-gray-100 border border-border flex items-center justify-center font-black text-gray-600">
                {instructorName.charAt(0).toLocaleUpperCase()}
              </div>
            )}
            <div className="flex-1 flex flex-col gap-1">
              <span className="text-[10px] text-gray-400 font-black uppercase">
                {cd.leadInstructor || "Lead Instructor"}
              </span>
              <h4 className="font-extrabold text-gray-900 text-sm">
                {instructorName}
              </h4>
              {instructorBio && (
                <p className="text-xs text-gray-500 font-semibold leading-relaxed">
                  {instructorBio}
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ─── RIGHT COLUMN: Upcoming Session & Study Progress (Only if enrolled) ─── */}
      {showRightColumn && (
        <div className="flex flex-col gap-4">
          {/* Upcoming Session */}
          <div className="bg-white rounded-3xl border border-border p-6 shadow-xs flex flex-col gap-5">
            <h3 className="text-lg font-black text-gray-950 tracking-tight">
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
                    {classData.language && (
                      <span className="bg-[#FEF3C7] text-[#D97706] font-bold text-[10px] px-2.5 py-0.5 rounded-full">
                        {getLocalizedLanguageName(classData.language, t)}
                      </span>
                    )}
                    {classData.levels?.[0] && (
                      <span className="bg-[#FEF3C7] text-[#D97706] font-bold text-[10px] px-2.5 py-0.5 rounded-full">
                        {classData.levels[0]}
                      </span>
                    )}
                    {classData.status && (
                      <CourseStatusPill status={classData.status} className="ml-auto" />
                    )}
                  </div>

                  <h4 className="font-extrabold text-base text-gray-950 leading-snug line-clamp-2">
                    {classData.title || ui.untitledClass || "Untitled class"}
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
                      <span>
                        {formatDateMonth(sessionDate, ui.tba)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-1.5">
                      <Users size={16} className="text-gray-400" />
                      <span className="text-[11px] font-bold text-gray-400 font-sans">
                        {studentCount ?? "—"}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={onJoinRoom}
                      className="h-10 px-5 bg-[#b20a1c] hover:bg-[#990011] text-white text-xs font-black rounded-full flex items-center justify-center gap-1.5 transition-all shadow-xs active:scale-95 whitespace-nowrap ml-auto cursor-pointer"
                    >
                      <span>{joinRoomLabel}</span>
                      <span>→</span>
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="rounded-2xl bg-gray-50 p-5 flex flex-col items-center gap-3 text-center">
                <p className="text-xs font-semibold text-gray-500">
                  {noUpcomingLabel || "No upcoming sessions"}
                </p>
                {isEnrolled && (
                  <button
                    type="button"
                    onClick={onJoinRoom}
                    className="w-full h-10 bg-[#b20a1c] hover:bg-[#990011] text-white text-xs font-black rounded-full flex items-center justify-center gap-1.5 transition-all shadow-xs active:scale-95 whitespace-nowrap cursor-pointer"
                  >
                    <span>{joinRoomLabel}</span>
                    <span>→</span>
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Study Progress Card */}
          <div className="bg-white rounded-3xl border border-border p-6 shadow-xs flex flex-col gap-4">
            <h3 className="text-lg font-black text-gray-950 tracking-tight">
              {c.student?.progress || cd.teachingProgress || "Study Progress"}
            </h3>

            <div className="py-2 flex items-center justify-center">
              <div className="relative w-44 h-44 flex items-center justify-center shrink-0">
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
                  <span className="text-3xl font-black text-gray-950 leading-none">
                    {progressPercent == null ? "—" : `${progressPercent}%`}
                  </span>
                  <span className="text-xs font-black text-gray-800 mt-2">
                    {progressText}
                  </span>
                  <span className="text-[10px] text-gray-400 font-bold mt-0.5 uppercase tracking-wider">
                    {cd.sessionCompleted || "Session completed"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default StudentClassOverviewTab
