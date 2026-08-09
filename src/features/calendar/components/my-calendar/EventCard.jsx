import { IconButton, PillButton } from '@/shared/components/ui/buttons'
import { ArrowRight, Calendar, Clock, MapPin } from 'lucide-react'
import React from 'react'
import dayjs from 'dayjs'
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/shared/context/LanguageContext'
import { useTimezone } from '@/shared/hooks/useTimezone'

const EVENT_STYLES = {
  "teaching-schedule": { background: "#f1fff8", border: "" },
  "student-schedule": { background: "#f0f5ff", border: "" },
  "my-event": { background: "#ffeef0", border: "" },
  "registered-event": { background: "#fffceb", border: "" },
  "other": { background: "#ffffff", border: "#E2E2E2" },
};

const EventCard = ({ event, onClick }) => {
  const navigate = useNavigate()
  const { language, t } = useLanguage()
  const { formatTime } = useTimezone()

  if (!event) return;
  const { background, border } = EVENT_STYLES[event?.eventType] || EVENT_STYLES["other"];

  const handleNavigate = (event) => {
    switch (event.eventType) {
      case 'teaching-schedule':
        return navigate(`/workspace/courses/class/${event?.classId}`)
      case 'student-schedule':
        return navigate(`/workspace/learning/class/${event?.classId}`)
      case 'my-event':
        return navigate(`/workspace/my-calendar`, { state: { activeTab: 'event' } })
      case 'registered-event':
        return navigate(`/${language || 'vi'}/cat-speak/calendar`)
      case 'other':
        return
    }
  }

  return (
    <div
      onClick={() => onClick && onClick(event)}
      className={`max-w-[290px] w-full h-fit p-4 space-y-2 rounded-xl border relative transition-shadow ${onClick ? 'cursor-pointer hover:shadow-md' : ''}`}
      style={{ backgroundColor: background, borderColor: border || 'transparent' }}
    >
      {/* Heading */}
      <div className='space-y-1'>
        <p className='font-semibold text-[#1A1A1A] text-base'>{event.title}</p>
        {event.subtitle && <p className='text-[#7B7979] text-sm'>{event.subtitle}</p>}
      </div>
      {/* Info + Button */}
      <div className='flex items-center justify-between'>
        <div className='space-y-1 text-sm text-[#1A1A1A]'>
          <p className='flex items-center gap-2'>
            <Clock size={14} />
            {event.startTime ? formatTime(event.startTime) : ''}
            {event.endTime ? ` - ${formatTime(event.endTime)}` : ''}
          </p>
          <p className='flex items-center gap-2'><MapPin size={14} /> {event.location}</p>
        </div>
        {(event.eventType === 'teaching-schedule' || event.eventType === 'student-schedule') &&
          dayjs().isAfter(dayjs(event.startTime)) && dayjs().isBefore(dayjs(event.endTime)) ? (
          <PillButton
            variant='outline'
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/${language || 'vi'}/meet/class-${event?.classId}`);
            }}
            className='!h-8'
            roundedClass='h-8 rounded-full'
          >
            {t.calendar?.enterRoom || 'Vào phòng'}
          </PillButton>
        ) : (
          <IconButton variant='outline' innerClassName='!w-8 !h-8' onClick={(e) => {
            e.stopPropagation();
            handleNavigate(event)
          }}>
            <ArrowRight size={8} />
          </IconButton>
        )}
      </div>
    </div>
  )
}

export default EventCard