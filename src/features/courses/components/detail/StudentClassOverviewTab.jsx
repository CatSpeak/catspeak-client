import React from "react"
import { Calendar, Clock, BookOpen, MessageSquare, Award } from "lucide-react"
import CountdownTicker from "../CountdownTicker"
import { formatDateDayMonth } from "../../utils/courseUtils"
import { CircularProgressbar, buildStyles } from "react-circular-progressbar"
import "react-circular-progressbar/dist/styles.css"
import { useLanguage } from "@/shared/context/LanguageContext"

const StudentClassOverviewTab = ({
  classData,
  isEnrolled,
  getWeeklyScheduleText,
  upcomingSessionLabel,
  joinRoomLabel,
  onJoinRoom
}) => {
  const { t } = useLanguage()
  const c = t.courses || {}
  const cd = c.classDetail || {}

  const completedSessions = (classData.progress
    ? classData.progress.completedSessions
    : classData.completedSessions) ?? 0

  const totalSessions = (classData.progress
    ? classData.progress.totalSessions
    : classData.totalSessions) || 24

  const progressPercent = Math.round((completedSessions / totalSessions) * 100)

  const isEnrolledAndActive = isEnrolled && classData.status !== "COMPLETED"
  const showRightColumn = isEnrolled

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      
      {/* ─── LEFT COLUMN: Visual Banner, Schedule & Description ─── */}
      <div className={`${isEnrolledAndActive ? "lg:col-span-2" : "lg:col-span-3"} flex flex-col gap-8`}>
        
        {/* Banner Area */}
        <div
          className="relative rounded-3xl p-8 min-h-[380px] flex flex-col justify-end shadow-sm text-white overflow-hidden"
          style={{
            backgroundImage: `url('${classData.thumbnailUrl || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=1200&auto=format&fit=crop"}')`,
            backgroundSize: "cover",
            backgroundPosition: "center"
          }}
        >
          {/* Dark overlay for text readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/45 to-black/15 z-0" />

          <div className="relative z-10 flex flex-col gap-3">
            <span className="bg-red-500 text-white font-bold text-[9px] px-2.5 py-0.5 rounded-full w-max uppercase tracking-wider">
              {classData.language || "English"} • {classData.levels?.[0] || "B2"}
            </span>
            <h2 className="text-2xl sm:text-3xl font-black leading-tight tracking-tight max-w-xl">
              {classData.title || "Untitled Batch"}
            </h2>
          </div>
        </div>

        {/* Schedule & Information Details */}
        <div className="bg-white rounded-3xl border border-gray-100 p-6 md:p-8 shadow-xs flex flex-col gap-6">
          <h3 className="text-lg font-black text-gray-950 tracking-tight">
            {cd.classInformation || "Class Information"}
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-sm font-semibold text-gray-600">
            <div className="flex items-center gap-3">
              <Calendar size={18} className="text-gray-400 shrink-0" />
              <div className="flex flex-col gap-0.5">
                <span className="text-[10px] text-gray-400 font-bold uppercase">Weekly Schedule</span>
                <span className="text-gray-800 font-extrabold text-xs">{getWeeklyScheduleText()}</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Clock size={18} className="text-gray-400 shrink-0" />
              <div className="flex flex-col gap-0.5">
                <span className="text-[10px] text-gray-400 font-bold uppercase">Start Date & Duration</span>
                <span className="text-gray-800 font-extrabold text-xs">
                  {classData.startDate ? formatDateDayMonth(classData.startDate) : "TBA"} • {totalSessions} Sessions
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Teacher / Coach Information */}
        <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-xs flex flex-col sm:flex-row gap-5 items-start sm:items-center">
          <img
            className="w-14 h-14 rounded-full object-cover border border-gray-100 shrink-0"
            src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=120&h=120"
            alt="Lead Coach"
          />
          <div className="flex-1 flex flex-col gap-1">
            <span className="text-[10px] text-gray-400 font-black uppercase">Your Lead Instructor</span>
            <h4 className="font-extrabold text-gray-900 text-sm">Prof. Sarah Jenkins</h4>
            <p className="text-xs text-gray-500 font-semibold leading-relaxed">
              Certified Language Coach specializing in IELTS guidance and speech pathology.
            </p>
          </div>
          <button className="h-8 px-4 border border-gray-200 hover:bg-gray-50 text-gray-700 text-xs font-black rounded-full shrink-0 flex items-center gap-1.5 transition-all">
            <MessageSquare size={13} />
            <span>Message Coach</span>
          </button>
        </div>
      </div>

      {/* ─── RIGHT COLUMN: Countdown & Attendance Progress (Only if enrolled) ─── */}
      {showRightColumn && (
        <div className="flex flex-col gap-8">
          
          {/* Next Live Session countdown */}
          <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-xs flex flex-col gap-5">
            <h3 className="text-lg font-black text-gray-950 tracking-tight">
              {upcomingSessionLabel}
            </h3>

            <CountdownTicker targetDate={classData.nextSession ? `${classData.nextSession.date}T${classData.nextSession.startTime}` : classData.startDate} />

            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-2 border-b border-gray-100 pb-4 text-xs font-semibold text-gray-500">
                <div className="flex items-center gap-2">
                  <Clock size={14} className="text-gray-400" />
                  <span>Time: {classData.schedule?.startTime || "11:45 AM"} - {classData.schedule?.endTime || "1:15 PM"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar size={14} className="text-gray-400" />
                  <span>Session Date: {classData.startDate ? formatDateDayMonth(classData.startDate) : "31st Jul"}</span>
                </div>
              </div>

              <button
                onClick={onJoinRoom}
                className="w-full h-10 bg-[#b20a1c] hover:bg-[#990011] text-white text-xs font-black rounded-full flex items-center justify-center gap-1.5 transition-all shadow-xs active:scale-95 whitespace-nowrap"
              >
                <span>{joinRoomLabel}</span>
                <span>→</span>
              </button>
            </div>
          </div>

          {/* Attendance progress card */}
          <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-xs flex flex-col items-center text-center gap-4">
            <h3 className="text-sm font-black text-gray-400 uppercase tracking-wider self-start">
              {c.student?.progress || "Study Progress"}
            </h3>

            <div className="w-24 h-24 my-2">
              <CircularProgressbar
                value={progressPercent}
                text={`${progressPercent}%`}
                strokeWidth={10}
                styles={buildStyles({
                  pathColor: "#10B981",
                  textColor: "#1F2937",
                  trailColor: "#F3F4F6",
                  textSize: "20px"
                })}
              />
            </div>

            <div className="flex flex-col gap-1">
              <span className="text-sm font-black text-gray-900">{completedSessions} / {totalSessions} Lessons Completed</span>
              <p className="text-[11px] text-gray-400 font-bold max-w-[200px] leading-relaxed">
                Great job! Maintain consistent attendance to earn your Certificate of Completion.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default StudentClassOverviewTab
