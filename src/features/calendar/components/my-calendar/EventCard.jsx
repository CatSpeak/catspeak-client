import { IconButton, PillButton } from '@/shared/components/ui/buttons'
import { ArrowRight, Calendar, Clock, MapPin } from 'lucide-react'
import React from 'react'
import dayjs from 'dayjs'
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/shared/context/LanguageContext'
import { useTimezone } from '@/shared/hooks/useTimezone'
import { getClassLanguageCode, getCommunityLang } from '@/shared/utils/navigation'

const EVENT_STYLES = {
  "teaching-schedule": { background: "#f1fff8", border: "", darkClass: "dark:!bg-emerald-950/30 dark:!border-emerald-800/40" },
  "student-schedule": { background: "#f0f5ff", border: "", darkClass: "dark:!bg-blue-950/30 dark:!border-blue-800/40" },
  "my-event": { background: "#ffeef0", border: "", darkClass: "dark:!bg-red-950/30 dark:!border-red-800/40" },
  "registered-event": { background: "#fffceb", border: "", darkClass: "dark:!bg-amber-950/30 dark:!border-amber-800/40" },
  "other": { background: "#ffffff", border: "#E2E2E2", darkClass: "dark:!bg-[#1A1A1A] dark:!border-[#3F3F3F]" },
};

const EventCard = ({ event, onClick }) => {
  const navigate = useNavigate()
  const { language, t } = useLanguage()
  const { formatTime } = useTimezone()

  if (!event) return;
  const { background, border, darkClass = "" } = EVENT_STYLES[event?.eventType] || EVENT_STYLES["other"];

  const handleNavigate = (event) => {
    switch (event.eventType) {
      case 'teaching-schedule':
        return navigate(`/workspace/courses/class/${event?.classId}`)
      case 'student-schedule':
        return navigate(`/workspace/learning/class/${event?.classId}`)
      case 'my-event':
        return navigate(`/workspace/my-calendar`, { state: { activeTab: 'event' } })
      case 'registered-event':
        return navigate(`/${getCommunityLang(language)}/cat-speak/calendar`)
      case 'other':
        return
    }
  }

  return (
    <div
      onClick={() => onClick && onClick(event)}
      className={`max-w-[290px] w-full h-fit p-4 space-y-2 rounded-xl border relative transition-shadow ${darkClass} ${onClick ? 'cursor-pointer hover:shadow-md' : ''}`}
      style={{ backgroundColor: background, borderColor: border || 'transparent' }}
    >
      {/* Heading */}
      <div className='space-y-1'>
        <p className='font-semibold text-[#1A1A1A] dark:text-white text-base'>{event.title}</p>
        {event.subtitle && <p className='text-[#7B7979] dark:text-[#AAAAAA] text-sm'>{event.subtitle}</p>}
      </div>
      {/* Info + Button */}
      <div className='flex items-center justify-between'>
        <div className='space-y-1 text-sm text-[#1A1A1A] dark:text-neutral-300'>
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
              navigate(`/${encodeURIComponent(getClassLanguageCode(event?.classLanguage) || 'en')}/meet/class-${event?.classId}`);
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