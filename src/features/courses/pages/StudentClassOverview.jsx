import React from 'react'
import { CalendarDays, MessageSquare, LogIn, ArrowRightFromLine } from 'lucide-react'
import Avatar from '@/shared/components/ui/Avatar'
import FluentCard from '@/shared/components/ui/FluentCard'
import { PillButton } from '@/shared/components/ui/buttons'
import { useTimezone } from "@/shared/hooks/useTimezone"
import { useLanguage } from "@/shared/context/LanguageContext"
import CountdownTicker from '../components/CountdownTicker'
import { useNavigate } from 'react-router-dom'
import PageTitle from '@/shared/components/ui/PageTitle'

const CountdownCard = ({ rawNs }) => {
  return (
    <CountdownTicker targetDate={rawNs.rawStartTime} />
  )
}

const StudentClassOverview = ({ classData = {}, onJoinRoom, onChat }) => {
  const { formatDate, formatScheduleTime, formatWeeklySchedule } = useTimezone();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const ui = t.courses?.workspaceUi || {};
  const c = t.courses || {};

  const title = classData.title || ui.untitledClass || "Khóa học chưa có tên";
  const instructorName = classData.teacher?.name || classData.instructorName || t.profile?.sidebar?.instructor || "Giảng viên";
  const avatarUrl = classData.teacher?.avatarImageUrl || classData.teacher?.avatarUrl || classData.instructorAvatar || "";
  const teacherAccountId = classData?.teacherId || classData?.teacher?.accountId || classData?.instructorId;

  const hasNextSession = Boolean(classData.nextSession);
  const rawNs = classData.nextSession || {};
  const sessionStartTime = rawNs.startTime || rawNs.rawStartTime;
  const sessionEndTime = rawNs.endTime || rawNs.rawEndTime;
  const sessionDate = rawNs.date;

  const nextSessionTime = sessionStartTime
    ? sessionEndTime
      ? `${formatScheduleTime(rawNs.rawStartTime)} - ${formatScheduleTime(rawNs.rawEndTime)}`
      : formatScheduleTime(rawNs.rawStartTime)
    : ui.tba || "TBA";

  const nextSessionDate = sessionDate ? formatDate(sessionDate) : (ui.tba || "TBA");
  const weeklyScheduleStr = formatWeeklySchedule(classData || {}, ui.tba);

  const nextSessionDisplay = hasNextSession
    ? (sessionStartTime && sessionDate
      ? `${nextSessionDate} (${formatScheduleTime(rawNs.rawStartTime)})`
      : `${nextSessionDate} (${nextSessionTime})`)
    : (t.courses?.student?.noUpcomingSessions || "Không có buổi học sắp tới");

  return (
    <FluentCard className="w-full !bg-transparent !p-0 border-none flex flex-col gap-6">
      {/* ─── Top Section: Title, Schedule Badge & Instructor Profile ─── */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        {/* Left Column: Title & Schedule Badge */}
        <div className="flex flex-col gap-3 min-w-0">
          <PageTitle className='line-clamp-2'> {title}</PageTitle>

          {/* Weekly Schedule Pill Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cath-red-900/10 text-[#700000] text-xs sm:text-sm font-medium w-max max-w-full">
            <CalendarDays size={16} className="text-[#700000] shrink-0" />
            <span className="truncate">{weeklyScheduleStr}</span>
          </div>
        </div>

        {/* Right Column: Instructor Profile */}
        <div
          onClick={() => teacherAccountId && navigate(`/profile/${teacherAccountId}`)}
          className="flex items-center justify-end gap-3 cursor-pointer shrink-0 self-start sm:self-auto hover:opacity-90 transition-opacity flex-row-reverse md:flex-row"
        >
          <div className="flex flex-col text-left sm:text-right">
            <span className="text-base font-bold">
              {instructorName}
            </span>
            <span className="text-sm text-secondary">
              {t.profile?.instructor?.title || "Giảng viên"}
            </span>
          </div>
          <Avatar
            src={avatarUrl}
            name={instructorName}
            size={40}
            className="ring-2 ring-white shadow-2xs"
          />
        </div>
      </div>

      {/* ─── Bottom Section: Pink Spotlight Box ("Buổi học tiếp theo") ─── */}
      <FluentCard
        className="bg-white flex flex-col md:flex-row lg:items-center justify-between gap-6"
      >
        {/* Left Side: Session Info & Action Buttons */}
        <div className="flex flex-col gap-4 min-w-0">
          <div className="flex flex-col gap-1">
            <span className="text-sm font-semibold text-gray-600">
              {t.courses?.courseDetail?.upcomingSession || "Buổi học tiếp theo"}
            </span>
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 ">
              {nextSessionDisplay}
            </h2>
          </div>

          <div className='block md:hidden md:w-1/3 w-full bg-white rounded-xl p-4'>
            <CountdownCard rawNs={rawNs} />
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3 mt-1">
            <PillButton
              startIcon={<ArrowRightFromLine />}
              onClick={onJoinRoom}
            >
              {t.courses?.joinRoom || "Vào phòng"}
            </PillButton>

            <PillButton
              startIcon={<MessageSquare />}
              onClick={onChat}
              variant="secondary"
            >
              {c.student?.chat || "Trò chuyện"}
            </PillButton>
          </div>
        </div>

        <div className='md:block hidden md:w-1/3 w-full bg-white rounded-xl p-4'>
          <CountdownCard rawNs={rawNs} />
        </div>
      </FluentCard>
    </FluentCard>
  )
}

export default StudentClassOverview