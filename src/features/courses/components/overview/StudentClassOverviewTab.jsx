import React from "react";
import { Calendar, Clock } from "lucide-react";
import CountdownTicker from "../CountdownTicker";
import { getSafeMediaUrl } from "../../utils/courseUtils";
import { useTimezone } from "@/shared/hooks/useTimezone";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import { useLanguage } from "@/shared/context/LanguageContext";
import { getLocalizedLanguageName } from "../../data/courseFormOptions";

const StudentClassOverviewTab = ({
  classData,
  isEnrolled,
  getWeeklyScheduleText,
  upcomingSessionLabel,
  joinRoomLabel,
  noUpcomingLabel,
  onJoinRoom,
}) => {
  const { language, t } = useLanguage();
  const { formatDateMonth, formatScheduleTime } = useTimezone();
  const c = t.courses || {};
  const cd = c.classDetail || {};
  const scd = c.studentCourseDetail || {};
  const ui = c.workspaceUi || {};

  const completedValue = classData.progress
    ? classData.progress.completedSessions
    : classData.completedSessions;
  const totalValue = classData.progress
    ? classData.progress.totalSessions
    : classData.totalSessions;
  const completedSessions =
    completedValue != null && Number.isFinite(Number(completedValue))
      ? Math.max(0, Number(completedValue))
      : null;
  const totalSessions =
    Number.isFinite(Number(totalValue)) && Number(totalValue) > 0
      ? Number(totalValue)
      : 0;
  const progressPercent =
    totalSessions > 0 && completedSessions !== null
      ? Math.min(100, Math.round((completedSessions / totalSessions) * 100))
      : null;
  const thumbnailUrl = getSafeMediaUrl(classData.thumbnailUrl);
  const instructor =
    classData.instructor && typeof classData.instructor === "object"
      ? classData.instructor
      : null;
  const instructorName = String(
    instructor?.fullName ??
      instructor?.name ??
      classData.instructorName ??
      classData.teacherName ??
      "",
  ).trim();
  const instructorBio = String(
    instructor?.bio ?? instructor?.description ?? "",
  ).trim();
  const instructorAvatarCandidate = String(
    instructor?.avatarUrl ?? instructor?.avatar ?? "",
  ).trim();
  const instructorAvatar = getSafeMediaUrl(instructorAvatarCandidate) || "";
  const rawNs = classData.nextSession;
  const nsIsoStart = rawNs?.startTime || rawNs?.rawStartTime || "";
  const nsIsoEnd = rawNs?.endTime || rawNs?.rawEndTime || "";
  const schedObj = Array.isArray(classData.schedule)
    ? classData.schedule[0]
    : classData.schedule || {};

  const hasNextSession = Boolean(
    rawNs && (rawNs.date || rawNs.startTime || rawNs.rawStartTime),
  );
  const nextSession = hasNextSession ? rawNs : null;

  const sessionStartTime =
    schedObj?.startTime ||
    (typeof nsIsoStart === "string" && !nsIsoStart.includes("T")
      ? nsIsoStart
      : null) ||
    nsIsoStart;
  const sessionEndTime =
    schedObj?.endTime ||
    (typeof nsIsoEnd === "string" && !nsIsoEnd.includes("T")
      ? nsIsoEnd
      : null) ||
    nsIsoEnd;
  const sessionDate =
    rawNs?.date ||
    (typeof nsIsoStart === "string" && nsIsoStart.includes("T")
      ? nsIsoStart.split("T")[0]
      : classData.startDate);

  const showRightColumn = isEnrolled;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* ─── LEFT COLUMN: Visual Banner, Schedule & Description ─── */}
      <div
        className={`${showRightColumn ? "lg:col-span-2" : "lg:col-span-3"} flex flex-col gap-8`}
      >
        {/* Banner Area */}
        <div
          className="relative rounded-3xl p-8 min-h-[380px] flex flex-col justify-end shadow-sm text-white overflow-hidden"
          style={{
            backgroundImage: `url(${thumbnailUrl || defaultCourseThumbnail})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          {/* Dark overlay for text readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/45 to-black/15 z-0" />

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
              {classData.title || scd.untitledBatch || "Untitled Batch"}
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
                <span className="text-[10px] text-gray-400 font-bold uppercase">
                  {cd.weeklySchedule || "Weekly Schedule"}
                </span>
                <span className="text-gray-800 font-extrabold text-xs">
                  {getWeeklyScheduleText()}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Clock size={18} className="text-gray-400 shrink-0" />
              <div className="flex flex-col gap-0.5">
                <span className="text-[10px] text-gray-400 font-bold uppercase">
                  {cd.schedulePeriod || "Start Date & Duration"}
                </span>
                <span className="text-gray-800 font-extrabold text-xs">
                  {formatDateMonth(classData.startDate, ui.tba)}
                  {totalSessions > 0
                    ? ` • ${(ui.sessionsCount || "{{count}} sessions").replace(
                        "{{count}}",
                        String(totalSessions),
                      )}`
                    : ""}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Teacher / Coach Information */}
        {instructorName && (
          <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-xs flex flex-col sm:flex-row gap-5 items-start sm:items-center">
            {instructorAvatar ? (
              <img
                className="w-14 h-14 rounded-full object-cover border border-gray-100 shrink-0"
                src={instructorAvatar}
                alt=""
              />
            ) : (
              <div className="w-14 h-14 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center font-black text-gray-600">
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

      {/* ─── RIGHT COLUMN: Countdown & Attendance Progress (Only if enrolled) ─── */}
      {showRightColumn && (
        <div className="flex flex-col gap-8">
          {/* Next Live Session countdown */}
          <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-xs flex flex-col gap-5">
            <h3 className="text-lg font-black text-gray-950 tracking-tight">
              {upcomingSessionLabel}
            </h3>

            {nextSession ? (
              <>
                <CountdownTicker
                  targetDate={nextSession?.rawStartTime || (nextSession?.date && nextSession?.startTime ? `${nextSession.date}T${nextSession.startTime}` : null)}
                />

                <div className="flex flex-col gap-4">
                  <div className="flex flex-col gap-2 border-b border-gray-100 pb-4 text-xs font-semibold text-gray-500">
                    <div className="flex items-center gap-2">
                      <Clock size={14} className="text-gray-400" />
                      <span>
                        {scd.timeLabel || "Time"}:{" "}
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
                        {scd.sessionDateLabel || "Session Date"}:{" "}
                        {formatDateMonth(sessionDate, ui.tba)}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={onJoinRoom}
                    className="w-full h-10 bg-[#b20a1c] hover:bg-[#990011] text-white text-xs font-black rounded-full flex items-center justify-center gap-1.5 transition-all shadow-xs active:scale-95 whitespace-nowrap"
                  >
                    <span>{joinRoomLabel}</span>
                    <span>→</span>
                  </button>
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
                    className="w-full h-10 bg-[#b20a1c] hover:bg-[#990011] text-white text-xs font-black rounded-full flex items-center justify-center gap-1.5 transition-all shadow-xs active:scale-95 whitespace-nowrap"
                  >
                    <span>{joinRoomLabel}</span>
                    <span>→</span>
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Attendance progress card */}
          <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-xs flex flex-col items-center text-center gap-4">
            <h3 className="text-sm font-black text-gray-400 uppercase tracking-wider self-start">
              {c.student?.progress || "Study Progress"}
            </h3>

            <div className="w-24 h-24 my-2">
              <CircularProgressbar
                value={progressPercent ?? 0}
                text={progressPercent == null ? "—" : `${progressPercent}%`}
                strokeWidth={10}
                styles={buildStyles({
                  pathColor: "#10B981",
                  textColor: "#1F2937",
                  trailColor: "#F3F4F6",
                  textSize: "20px",
                })}
              />
            </div>

            <div className="flex flex-col gap-1">
              <span className="text-sm font-black text-gray-900">
                {(
                  scd.lessonsCompleted ||
                  "{{completed}} / {{total}} lessons completed"
                )
                  .replace("{{completed}}", String(completedSessions ?? "—"))
                  .replace("{{total}}", String(totalSessions || "—"))}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentClassOverviewTab;
