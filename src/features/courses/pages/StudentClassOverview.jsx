import React from 'react'
import { Clock, Calendar, CalendarDays, Video, MessageSquare, MonitorPlay } from 'lucide-react'
import Avatar from '@/shared/components/ui/Avatar'
import FluentCard from '@/shared/components/ui/FluentCard'
import { PillButton } from '@/shared/components/ui/buttons'
import { useTimezone } from "@/shared/hooks/useTimezone"
import { useLanguage } from "@/shared/context/LanguageContext"
import CountdownTicker from '../components/CountdownTicker'
import { useNavigate } from 'react-router-dom'

const StudentClassOverview = ({ classData = {}, onJoinRoom, onChat }) => {
  const { formatDate, formatScheduleTime, formatWeeklySchedule } = useTimezone();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const ui = t.courses?.workspaceUi || {};
  const c = t.courses || {}
  console.log(classData);


  const title = classData.title || ui.untitledClass || "Khóa học chưa có tên";
  const instructorName = classData.teacher?.name || t.profile?.sidebar?.instructor || "Giảng viên";
  const avatarUrl = classData.teacher?.avatarImageUrl || "";

  const hasNextSession = Boolean(classData.nextSession);
  const rawNs = classData.nextSession || {};
  const sessionStartTime = rawNs.startTime;
  const sessionEndTime = rawNs.endTime;
  const sessionDate = rawNs.date;

  const nextSessionTime = sessionStartTime
    ? sessionEndTime
      ? `${formatScheduleTime(rawNs.rawStartTime)} - ${formatScheduleTime(rawNs.rawEndTime)}`
      : formatScheduleTime(rawNs.rawStartTime)
    : ui.tba || "TBA";

  const nextSessionDate = sessionDate ? formatDate(sessionDate) : (ui.tba || "TBA");

  const weeklyScheduleStr = formatWeeklySchedule(classData || {}, ui.tba);

  return (
    <FluentCard className='w-full'>
      <div className='flex justify-between items-start flex-col md:flex-row'>
        <div className='flex flex-col space-y-3 flex-1 min-w-0'>
          <h1 className="text-[28px] font-semibold text-[#1A1A1A] line-clamp-2">{title}</h1>

          <div
            className="flex items-center gap-3 md:hidden w-full"
            onClick={() => navigate(`/profile/${classData?.teacherId || classData?.teacher?.accountId}`)}
          >
            <Avatar
              src={avatarUrl}
              name={instructorName}
              size={48}
            />
            <div className="flex flex-col text-sm text-left text-[#7B7979]">
              <span className="text-[14px] font-medium leading-tight">{t.profile?.instructor?.title || "Giảng viên"}</span>
              <span className="text-[16px] font-semibold leading-tight mt-0.5">{instructorName}</span>
            </div>
          </div>

          <div className="flex flex-col gap-2 text-[#1A1A1A] text-base">

            {/* Lịch học hàng tuần */}
            <div className="flex items-center gap-1 font-medium text-[#1A1A1A]">
              <CalendarDays size={16} />
              <span>{weeklyScheduleStr}</span>
            </div>

            <div className="flex items-center gap-2">
              <MonitorPlay size={16} />
              <span className="font-bold text-[#1A1A1A]">{t.courses?.courseDetail?.upcomingSession || "Buổi học tiếp theo"}</span>
            </div>
            <div className='max-w-xs'>
              <CountdownTicker targetDate={rawNs.rawStartTime} />
            </div>
            {/* Buổi học sắp tới */}
            {hasNextSession ? (
              <div className="flex items-center gap-1">
                <Clock size={16} />
                <span>{nextSessionTime}, {nextSessionDate}</span>
              </div>
            ) : (
              <div className="flex items-center gap-1 text-[#7B7979]">
                <Clock size={16} />
                <span>{t.courses?.student?.noUpcomingSessions || "Không có buổi học sắp tới"}</span>
              </div>
            )}
          </div>
        </div>

        <div
          className="hidden md:flex items-center justify-end gap-3 min-w-[280px] cursor-pointer"
          onClick={() => navigate(`/profile/${classData?.teacherId || classData?.teacher?.accountId}`)}
        >
          <Avatar
            src={avatarUrl}
            name={instructorName}
            size={48}
          />
          <div className="flex flex-col text-sm text-right text-[#7B7979]">
            <span className="text-[14px] font-medium leading-tight">{t.profile?.instructor?.title || "Giảng viên"}</span>
            <span className="text-[16px] font-semibold leading-tight mt-0.5">{instructorName}</span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-3 mt-3">
        <PillButton
          startIcon={<Video size={14} />}
          onClick={onJoinRoom}
        >
          {t.courses?.joinRoom || "Vào phòng học"}
        </PillButton>

        <PillButton
          startIcon={<MessageSquare size={14} />}
          variant='outline'
          onClick={onChat}
        >
          {c.student?.chat || "Trò chuyện"}
        </PillButton>
      </div>
    </FluentCard>
  )
}

export default StudentClassOverview