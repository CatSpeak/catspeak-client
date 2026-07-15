import React from "react"
import { Globe, GraduationCap, Calendar, Clock, AlignLeft, Pencil, Users } from "lucide-react"
import { CircularProgressbar, buildStyles } from "react-circular-progressbar"
import "react-circular-progressbar/dist/styles.css"
import CountdownTicker from "../CountdownTicker"
import TeachingTasksSection from "../TeachingTasksSection"
import { formatDateRange, formatDateDayMonth } from "../../utils/courseUtils"

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
  const completed = (classData.progress
    ? classData.progress.completedSessions
    : (classData.completedSessions ?? classData.teachingProgress?.completed)) ?? 0

  const total = (classData.progress
    ? classData.progress.totalSessions
    : (classData.totalSessions ?? classData.teachingProgress?.total)) || 24

  const progressPercent = Math.round((completed / total) * 100)
  const progressText = `${completed} / ${total}`

  const showRightColumn = !isStudent || isEnrolled

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* LEFT COLUMN: Visual Banner, Information Details, and Circular Progress */}
      <div className={`${showRightColumn ? "lg:col-span-2" : "lg:col-span-3"} flex flex-col gap-8`}>
        {/* Visual Banner */}
        <div className="relative rounded-3xl p-8 min-h-[380px] flex flex-col justify-end shadow-sm text-white">
          <div
            className="absolute inset-0 rounded-3xl overflow-hidden z-0 bg-cover bg-center"
            style={{
              backgroundImage: `url('${classData.thumbnailUrl || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=1200&auto=format&fit=crop"}')`
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/45 to-black/15" />
          </div>

          <div className="relative z-10 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 w-full">
            <h2 className="text-2xl sm:text-3xl font-black leading-tight tracking-tight max-w-xl">
              {classData.title || "English for newbie 1-0-2"}
            </h2>

            {!isStudent && (
              <div className="relative shrink-0">
                <button
                  onClick={() => setShowActionsDropdown(!showActionsDropdown)}
                  className="h-10 px-5 bg-[#b20a1c] hover:bg-[#990011] text-white font-extrabold text-sm rounded-full flex items-center justify-center gap-2 transition-all shadow-md active:scale-95 active:shadow-sm"
                >
                  <Pencil size={14} />
                  <span>{cd.customizeClass || "Customize"}</span>
                </button>

                {showActionsDropdown && (
                  <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-150 rounded-2xl shadow-lg z-50 overflow-hidden divide-y divide-gray-50 text-gray-700">
                    {classData.status !== "ARCHIVED" ? (
                      <>
                        <button
                          onClick={() => {
                            setShowActionsDropdown(false)
                            navigate(`/workspace/courses/edit-class/${id}`)
                          }}
                          className="w-full text-left p-3 hover:bg-gray-55 text-xs font-bold transition-colors"
                        >
                          {cd.editClass || "Edit Class"}
                        </button>
                        <button
                          onClick={onCompleteClass}
                          className="w-full text-left p-3 hover:bg-gray-55 text-xs font-bold transition-colors"
                        >
                          {cd.completeClass || "Complete Class"}
                        </button>
                        <button
                          onClick={onCancelClassClick}
                          className="w-full text-left p-3 hover:bg-gray-55 text-xs font-bold text-[#BA021C] transition-colors"
                        >
                          {cd.cancelClass || "Cancel Class"}
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => {
                          setShowActionsDropdown(false)
                          navigate(`/workspace/courses/create-class`, { state: { recoverClassId: id } })
                        }}
                        className="w-full text-left p-3 hover:bg-gray-55 text-xs font-bold text-[#b20a1c] transition-colors"
                      >
                        {cd.reopenClass || "Reopen Class (Recover)"}
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Opening Fee Card */}
        <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-xs flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 shrink-0 rounded-full bg-[#E8F8F0] text-[#15803D] flex items-center justify-center font-black text-lg">
              $
            </div>
            <span className="text-sm font-extrabold text-gray-500">{cd.classFee || "Class Fee"}</span>
          </div>
          <div className="flex items-center gap-1.5 text-xl font-black text-[#990011]">
            <span>{classData.tuitionFee ? `${formatCurrency(classData.tuitionFee)} VNĐ` : "350.000 VNĐ"}</span>
            <span className="w-5 h-5 rounded-full border border-gray-300 text-gray-400 text-xs flex items-center justify-center cursor-help shrink-0 font-medium" title="Phí mở lớp học">?</span>
          </div>
        </div>

        {/* Information Card Grid */}
        <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-xs flex flex-col gap-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 shrink-0 rounded-full bg-[#EFF6FF] text-[#3B82F6] flex items-center justify-center">
                <Globe size={18} />
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-gray-400 font-bold">{cd.language || "Language"}</span>
                <span className="text-gray-900 font-extrabold text-sm mt-0.5">{classData.language || "English"}</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 shrink-0 rounded-full bg-[#FEF3C7] text-[#D97706] flex items-center justify-center">
                <GraduationCap size={18} />
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-gray-400 font-bold">{cd.level || "Level"}</span>
                <span className="inline-flex mt-1 items-center justify-center px-3 py-0.5 text-xs font-black text-white bg-[#EAB308] rounded-full w-fit">
                  {classData.levels?.join(", ") || "B2"}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 shrink-0 rounded-full bg-[#E8F8F0] text-[#15803D] flex items-center justify-center">
                <Calendar size={18} />
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-gray-400 font-bold">{cd.enrollmentPeriod || "Admission Period"}</span>
                <span className="text-gray-900 font-extrabold text-sm mt-0.5">
                  {classData.enrollmentStart && classData.enrollmentEnd
                    ? formatDateRange(classData.enrollmentStart, classData.enrollmentEnd)
                    : "Oct 24, 2026 - Jan 30, 2027"}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 shrink-0 rounded-full bg-[#FFE4E6] text-[#E11D48] flex items-center justify-center">
                <Calendar size={18} />
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-gray-400 font-bold">{cd.schedulePeriod || "Period"}</span>
                <span className="text-gray-900 font-extrabold text-sm mt-0.5">
                  {classData.startDate && classData.endDate
                    ? formatDateRange(classData.startDate, classData.endDate)
                    : "Nov 1, 2026 - Jan 30, 2027"}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 shrink-0 rounded-full bg-[#EFF6FF] text-[#3B82F6] flex items-center justify-center">
                <Users size={18} />
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-gray-400 font-bold">{cd.classSize || "Class Size"}</span>
                <span className="text-gray-900 font-extrabold text-sm mt-0.5">{classData.slots || 0} {cd.studentsLabel || "students"}</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 shrink-0 rounded-full bg-[#FEF3C7] text-[#D97706] flex items-center justify-center">
                <Clock size={18} />
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-gray-400 font-bold">
                  {cd.weeklySchedule || "Weekly Schedule"}
                </span>
                <span className="text-gray-900 font-extrabold text-sm mt-0.5">{getWeeklyScheduleText()}</span>
              </div>
            </div>
          </div>

          <div className="flex items-start gap-3 border-t border-gray-100 pt-6">
            <div className="w-10 h-10 shrink-0 rounded-full bg-[#F3F4F6] text-[#4B5563] flex items-center justify-center">
              <AlignLeft size={18} />
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-xs text-gray-400 font-bold">{cd.description || "Description"}</span>
              <p className="text-gray-600 font-medium text-xs leading-relaxed mt-0.5">
                {classData.description || "No description provided."}
              </p>
            </div>
          </div>
        </div>

        {/* Teaching Progress Circular Chart */}
        <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-xs flex flex-col gap-5">
          <h3 className="text-xl font-black text-gray-950 tracking-tight">
            {cd.teachingProgress || "Teaching Progress"}
          </h3>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-8 py-4 px-2">
            <div className="relative w-60 h-60 flex items-center justify-center shrink-0">
              <CircularProgressbar
                value={progressPercent}
                strokeWidth={8}
                styles={buildStyles({
                  pathColor: "#990011",
                  trailColor: "#E5E7EB",
                  strokeLinecap: "round"
                })}
              />
              <div className="absolute flex flex-col items-center justify-center text-center">
                <span className="text-4xl font-black text-gray-950 leading-none">{progressPercent}%</span>
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
        <div className="flex flex-col gap-8">
          {/* Upcoming Session */}
          <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-xs flex flex-col gap-5">
            <h3 className="text-lg font-black text-gray-950 tracking-tight">
              {upcomingSessionLabel}
            </h3>

            <CountdownTicker targetDate={classData.nextSession ? `${classData.nextSession.date}T${classData.nextSession.startTime}` : classData.startDate} />

            <div className="flex flex-col gap-4">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="bg-[#FEF3C7] text-[#D97706] font-bold text-[10px] px-2.5 py-0.5 rounded-full">
                  {classData.language || "English"}
                </span>
                <span className="bg-[#FEF3C7] text-[#D97706] font-bold text-[10px] px-2.5 py-0.5 rounded-full">
                  {classData.levels?.[0] || "B2"}
                </span>
                <span className="ml-auto bg-[#E8F8F0] text-[#15803D] font-bold text-[10px] px-2.5 py-0.5 rounded-full">
                  Teaching
                </span>
              </div>

              <h4 className="font-extrabold text-base text-gray-950 leading-snug line-clamp-2">
                {classData.title || "Lớp tiếng anh luyện nói"}
              </h4>

              <div className="flex flex-col gap-2 border-b border-gray-55 pb-4 text-xs font-semibold text-gray-500">
                <div className="flex items-center gap-2">
                  <Clock size={14} className="text-gray-400" />
                  <span>{classData.schedule?.startTime || "11:45 AM"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar size={14} className="text-gray-400" />
                  <span>{classData.startDate ? formatDateDayMonth(classData.startDate) : "31st Jul"}</span>
                </div>
              </div>

              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-1.5">
                  <div className="flex -space-x-2 overflow-hidden shrink-0">
                    <img
                      className="inline-block h-6 w-6 rounded-full ring-2 ring-white object-cover"
                      src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=80&h=80"
                      alt="Student"
                    />
                    <img
                      className="inline-block h-6 w-6 rounded-full ring-2 ring-white object-cover"
                      src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=80&h=80"
                      alt="Student"
                    />
                    <img
                      className="inline-block h-6 w-6 rounded-full ring-2 ring-white object-cover"
                      src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=80&h=80"
                      alt="Student"
                    />
                  </div>
                  <span className="text-[11px] font-bold text-gray-400 font-sans">{classData.studentCount || 10}</span>
                </div>

                <button
                  onClick={onJoinRoom}
                  className="h-8 px-4 bg-[#b20a1c] hover:bg-[#990011] text-white text-xs font-black rounded-full flex items-center justify-center gap-1.5 transition-all shadow-xs active:scale-95 whitespace-nowrap"
                >
                  <span>{cd.joinRoom || "Join room"}</span>
                  <span>→</span>
                </button>
              </div>
            </div>
          </div>

          {/* Teaching Tasks */}
          {!isStudent && (
            <TeachingTasksSection
              teachingTasksLabel={teachingTasksLabel}
              viewAllLabel={viewAllLabel}
              gradeAssignmentLabel={gradeAssignmentLabel}
              giveFeedbackLabel={giveFeedbackLabel}
              prepareLessonLabel={prepareLessonLabel}
              onViewAll={onViewTasks}
              onTaskAction={onTaskAction}
              actionIcon="plus"
            />
          )}
        </div>
      )}
    </div>
  )
}

export default ClassOverviewTab
