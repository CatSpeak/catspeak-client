import React, { useMemo, useState } from "react"
import { Globe, GraduationCap, Calendar, Clock, AlignLeft, Pencil, Users, Layers, Share2, Check } from "lucide-react"
import { CircularProgressbar, buildStyles } from "react-circular-progressbar"
import "react-circular-progressbar/dist/styles.css"
import CountdownTicker from "../CountdownTicker"
import TeachingTasksSection from "../assignments/TeachingTasksSection"
import { useGetTeacherClassTeachingTasksCombinedQuery } from "@/store/api/coursesApi"
import { mapTeachingTask } from "../../utils/courseTransforms"
import { useLanguage } from "@/shared/context/LanguageContext"
import RenderHTML from "@/shared/components/ui/RenderHTML"
import { copyShareLink } from "@/shared/utils/shareUtils"
import CourseStatusPill from "../CourseStatusPill"
import { getLocalizedLanguageName } from "../../data/courseFormOptions"
import { defaultCourseThumbnail, getSafeMediaUrl } from "../../utils/courseUtils"
import { useTimezone } from "@/shared/hooks/useTimezone"

const ClassOverviewTab = ({
  classData,
  isStudent,
  isEnrolled,
  id,
  navigate,
  showActionsDropdown,
  setShowActionsDropdown,
  onCompleteClass,
  onCancelClassClick,
  isActionPending = false,
  formatCurrency,
  getWeeklyScheduleText,
  upcomingSessionLabel,
  viewAllLabel,
  teachingTasksLabel,
  gradeAssignmentLabel,
  giveFeedbackLabel,
  prepareLessonLabel,
  onJoinRoom,
  onTaskAction,
  onViewTasks,
  cd = {}
}) => {
  const { t } = useLanguage()
  const { formatDateMonth, formatDate, formatScheduleTime } = useTimezone()
  const c = t.courses || {}
  const ui = c.workspaceUi || {}
  const taskText = c.grading || {}

  const completedValue = (classData.progress
    ? classData.progress.completedSessions
    : (classData.completedSessions ?? classData.teachingProgress?.completed))

  const totalValue = (classData.progress
    ? classData.progress.totalSessions
    : (classData.totalSessions ?? classData.teachingProgress?.total))

  const completed = completedValue != null && Number.isFinite(Number(completedValue))
    ? Math.max(0, Number(completedValue))
    : null
  const total = Number.isFinite(Number(totalValue)) && Number(totalValue) > 0
    ? Number(totalValue)
    : 0
  const progressPercent = total > 0 && completed !== null
    ? Math.min(100, Math.round((completed / total) * 100))
    : null
  const progressText = `${completed ?? "—"} / ${total || "—"}`
  const thumbnailUrl = getSafeMediaUrl(classData.thumbnailUrl)
  const rawNs = classData.nextSession
  const nsIsoStart = rawNs?.startTime || rawNs?.rawStartTime || ""
  const nsIsoEnd = rawNs?.endTime || rawNs?.rawEndTime || ""
  const schedObj = Array.isArray(classData.schedule) ? classData.schedule[0] : (classData.schedule || {})

  const hasNextSession = Boolean(rawNs && (rawNs.date || rawNs.startTime || rawNs.rawStartTime))
  const nextSession = hasNextSession ? rawNs : null

  const sessionStartTime = schedObj?.startTime || (typeof nsIsoStart === "string" && !nsIsoStart.includes("T") ? nsIsoStart : null) || nsIsoStart
  const sessionEndTime = schedObj?.endTime || (typeof nsIsoEnd === "string" && !nsIsoEnd.includes("T") ? nsIsoEnd : null) || nsIsoEnd
  const sessionDate = rawNs?.date || (typeof nsIsoStart === "string" && nsIsoStart.includes("T") ? nsIsoStart.split("T")[0] : classData.startDate)
  const studentCountValue = Number(classData.studentCount ?? classData.enrolledStudents)
  const studentCount = Number.isFinite(studentCountValue)
    ? Math.max(0, Math.floor(studentCountValue))
    : null

  const { data: rawTasks = [], isLoading: isLoadingTasks } =
    useGetTeacherClassTeachingTasksCombinedQuery(id, { skip: !id || isStudent })

  const teachingTasks = useMemo(() => {
    return Array.isArray(rawTasks)
      ? rawTasks.map((task) => mapTeachingTask(task, {
        pendingCount: taskText.teachingTaskPendingCount,
        urgent: taskText.teachingTaskUrgent,
        required: taskText.teachingTaskRequired,
        gradeQuiz: taskText.teachingTaskGradeQuiz,
        gradeAssignment: taskText.teachingTaskGradeAssignment,
        unknown: taskText.statusUnknown,
      })).filter(Boolean)
      : []
  }, [
    rawTasks,
    taskText.teachingTaskGradeAssignment,
    taskText.teachingTaskGradeQuiz,
    taskText.teachingTaskPendingCount,
    taskText.teachingTaskRequired,
    taskText.teachingTaskUrgent,
    taskText.statusUnknown,
  ])

  const handleTaskAction = (task) => {
    if (onTaskAction) {
      onTaskAction(task)
      return
    }
    const targetClassId = task.classId || id
    let targetUrl = `/workspace/courses/class/${encodeURIComponent(String(targetClassId))}?tab=grading`
    if (task.assignmentId) {
      targetUrl += `&assignmentId=${encodeURIComponent(String(task.assignmentId))}`
    } else if (task.quizId) {
      targetUrl += `&quizId=${encodeURIComponent(String(task.quizId))}`
    }
    navigate(targetUrl)
  }

  const showRightColumn = !isStudent || isEnrolled
  const normalizedStatus = String(classData.status || "").trim().toUpperCase()
  const isArchivedClass = normalizedStatus === "ARCHIVED"
  const isCompletedClass = normalizedStatus === "COMPLETED"

  const [linkCopied, setLinkCopied] = useState(false)
  const handleCopyLink = async () => {
    const shareUrl = `${window.location.origin}/explore-courses/class/${id}`
    const ok = await copyShareLink({
      url: shareUrl,
      successMessage: cd.linkCopied || "Link copied!",
      errorMessage: cd.linkCopyFailed || "Failed to copy link",
    })
    if (ok) {
      setLinkCopied(true)
      setTimeout(() => setLinkCopied(false), 2000)
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {/* LEFT COLUMN: Visual Banner, Information Details, and Circular Progress */}
      <div className={`${showRightColumn ? "lg:col-span-2" : "lg:col-span-3"} flex flex-col gap-4`}>
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

          <div className="relative z-10 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 w-full">
            <div className="flex flex-col gap-2 max-w-xl">
              <h2 className="text-2xl sm:text-3xl font-black leading-tight tracking-tight">
                {classData.title || ui.untitledClass || "Untitled class"}
              </h2>
            </div>

            {!isStudent && (
              isCompletedClass ? (
                <span
                  role="status"
                  className="h-10 px-5 bg-emerald-100 text-emerald-800 font-extrabold text-sm rounded-full flex items-center justify-center"
                >
                  {cd.classCompleted || "Class completed"}
                </span>
              ) : (
                <div className="relative shrink-0">
                  <button
                    type="button"
                    disabled={isActionPending}
                    aria-expanded={showActionsDropdown}
                    aria-haspopup="menu"
                    onClick={() => setShowActionsDropdown(!showActionsDropdown)}
                    className="h-10 px-5 bg-[#b20a1c] hover:bg-[#990011] text-white font-extrabold text-sm rounded-full flex items-center justify-center gap-2 transition-all shadow-md active:scale-95 active:shadow-sm disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <Pencil size={14} />
                    <span>{cd.customizeClass || "Customize"}</span>
                  </button>

                  {showActionsDropdown && (
                    <div role="menu" className="absolute right-0 mt-2 w-48 bg-white border border-border rounded-2xl shadow-lg z-50 overflow-hidden divide-y divide-gray-50 text-gray-700">
                      {!isArchivedClass ? (
                        <>
                          <button
                            type="button"
                            role="menuitem"
                            onClick={() => {
                              setShowActionsDropdown(false)
                              navigate(`/workspace/courses/edit-class/${encodeURIComponent(String(id))}`)
                            }}
                            className="w-full text-left p-3 hover:bg-gray-55 text-xs font-bold transition-colors"
                          >
                            {cd.editClass || "Edit Class"}
                          </button>
                          <button
                            type="button"
                            role="menuitem"
                            disabled={isActionPending}
                            onClick={onCompleteClass}
                            className="w-full text-left p-3 hover:bg-gray-55 text-xs font-bold transition-colors"
                          >
                            {cd.completeClass || "Complete Class"}
                          </button>
                          <button
                            type="button"
                            role="menuitem"
                            disabled={isActionPending}
                            onClick={onCancelClassClick}
                            className="w-full text-left p-3 hover:bg-gray-55 text-xs font-bold text-[#BA021C] transition-colors"
                          >
                            {cd.cancelClass || "Cancel Class"}
                          </button>
                        </>
                      ) : (
                        <button
                          type="button"
                          role="menuitem"
                          onClick={() => {
                            setShowActionsDropdown(false)
                            navigate(`/workspace/classes/create-class`, { state: { recoverClassId: id } })
                          }}
                          className="w-full text-left p-3 hover:bg-gray-55 text-xs font-bold text-[#b20a1c] transition-colors"
                        >
                          {cd.reopenClass || "Reopen Class (Recover)"}
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )
            )}
          </div>
        </div>

        {/* Opening Fee Card */}
        <div className="bg-white rounded-3xl border border-border p-6 shadow-xs flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 shrink-0 rounded-full bg-[#E8F8F0] text-[#15803D] flex items-center justify-center font-black text-lg">
              $
            </div>
            <span className="text-sm font-extrabold text-gray-500">{cd.classFee || "Class Fee"}</span>
          </div>
          <div className="flex items-center gap-1.5 text-xl font-black text-[#990011]">
            <span>
              {classData.tuitionFee !== undefined && classData.tuitionFee !== null
                ? `${formatCurrency(classData.tuitionFee)} ${ui.currencyVnd || "VND"}`
                : "—"}
            </span>
            <span
              className="w-5 h-5 rounded-full border border-gray-300 text-gray-400 text-xs flex items-center justify-center cursor-help shrink-0 font-medium"
              title={cd.classFeeHelp || "Tuition fee charged per student"}
            >
              ?
            </span>
          </div>
        </div>

        {/* Information Card Grid */}
        <div className="bg-white rounded-3xl border border-border p-6 shadow-xs flex flex-col gap-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 shrink-0 rounded-full bg-[#EFF6FF] text-[#3B82F6] flex items-center justify-center">
                <Globe size={18} />
              </div>
              <div className="flex flex-col">
                <span className="text-sm text-gray-400 font-bold">{cd.language || "Language"}</span>
                <span className="text-gray-900 font-extrabold text-sm mt-0.5">
                  {getLocalizedLanguageName(classData.language, t) || "—"}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 shrink-0 rounded-full bg-[#FEF3C7] text-[#D97706] flex items-center justify-center">
                <GraduationCap size={18} />
              </div>
              <div className="flex flex-col">
                <span className="text-sm text-gray-400 font-bold">{cd.level || "Level"}</span>
                <span className="inline-flex mt-1 items-center justify-center px-3 py-0.5 text-xs font-black text-white bg-[#EAB308] rounded-full w-fit">
                  {classData.levels?.join(", ") || "—"}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 shrink-0 rounded-full bg-[#E8F8F0] text-[#15803D] flex items-center justify-center">
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

            {/* <div className="flex items-center gap-3">
              <div className="w-10 h-10 shrink-0 rounded-full bg-[#FFE4E6] text-[#E11D48] flex items-center justify-center">
                <Calendar size={18} />
              </div>
              <div className="flex flex-col">
                <span className="text-sm text-gray-400 font-bold">{cd.schedulePeriod || "Period"}</span>
                <span className="text-gray-900 font-extrabold text-sm mt-0.5">
                  {classData.startDate && classData.endDate
                    ? `${formatDate(classData.startDate)} - ${formatDate(classData.endDate)}`
                    : ui.tba || "TBA"}
                </span>
              </div>
            </div> */}

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 shrink-0 rounded-full bg-[#EFF6FF] text-[#3B82F6] flex items-center justify-center">
                <Users size={18} />
              </div>
              <div className="flex flex-col">
                <span className="text-sm text-gray-400 font-bold">{cd.classSize || "Class Size"}</span>
                <span className="text-gray-900 font-extrabold text-sm mt-0.5">
                  {classData.slots ?? "—"} {cd.studentsLabel || "students"}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 shrink-0 rounded-full bg-[#FEF3C7] text-[#D97706] flex items-center justify-center">
                <Clock size={18} />
              </div>
              <div className="flex flex-col">
                <span className="text-sm text-gray-400 font-bold">
                  {cd.weeklySchedule || "Weekly Schedule"}
                </span>
                <span className="text-gray-900 font-extrabold text-sm mt-0.5">{getWeeklyScheduleText()}</span>
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

        {/* Teaching Progress Circular Chart */}
        <div className="bg-white rounded-3xl border border-border p-6 shadow-xs flex flex-col gap-5">
          <h3 className="text-xl font-black text-gray-950 tracking-tight">
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
                  strokeLinecap: "round"
                })}
              />
              <div className="absolute flex flex-col items-center justify-center text-center">
                <span className="text-4xl font-black text-gray-950 leading-none">
                  {progressPercent == null ? "—" : `${progressPercent}%`}
                </span>
                <span className="text-sm font-black text-gray-800 mt-2.5">{progressText}</span>
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
                <span>{cd.uncompletedSessionsLabel || "Uncompleted sessions"}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: Upcoming session and Teaching tasks */}
      {showRightColumn && (
        <div className="flex flex-col gap-4">
          {/* Upcoming Session */}
          <div className="bg-white rounded-3xl border border-border p-6 shadow-xs flex flex-col gap-5">
            <h3 className="text-lg font-black text-gray-950 tracking-tight">
              {upcomingSessionLabel}
            </h3>

            {nextSession ? (
              <>
                <CountdownTicker targetDate={nextSession?.rawStartTime || (nextSession?.date && nextSession?.startTime ? `${nextSession.date}T${nextSession.startTime}` : null)} />

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
                      className="h-8 px-4 bg-[#b20a1c] hover:bg-[#990011] text-white text-xs font-black rounded-full flex items-center justify-center gap-1.5 transition-all shadow-xs active:scale-95 whitespace-nowrap"
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
                  onClick={onJoinRoom}
                  className="h-8 px-4 bg-[#b20a1c] hover:bg-[#990011] text-white text-xs font-black rounded-full flex items-center justify-center gap-1.5 transition-all shadow-xs active:scale-95 whitespace-nowrap"
                >
                  <span>{cd.joinRoom || "Join room"}</span>
                  <span>→</span>
                </button>
              </div>
            )}
          </div>

          {/* Teaching Tasks */}
          {!isStudent && (
            <TeachingTasksSection
              teachingTasksLabel={teachingTasksLabel}
              viewAllLabel={viewAllLabel}
              gradeAssignmentLabel={gradeAssignmentLabel}
              giveFeedbackLabel={giveFeedbackLabel}
              prepareLessonLabel={prepareLessonLabel}
              tasks={teachingTasks}
              isLoading={isLoadingTasks}
              onViewAll={onViewTasks}
              onTaskAction={handleTaskAction}
            />
          )}
        </div>
      )}
    </div>
  )
}

export default ClassOverviewTab