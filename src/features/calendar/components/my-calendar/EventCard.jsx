import { IconButton } from '@/shared/components/ui/buttons'
import { ArrowRight, Calendar, Clock } from 'lucide-react'
import React from 'react'
import dayjs from 'dayjs'
import { useNavigate } from 'react-router-dom';

const EVENT_STYLES = {
  "teaching-schedule": { background: "#f1fff8", border: "" },
  "student-schedule": { background: "#f0f5ff", border: "" },
  "my-event": { background: "#ffeef0", border: "" },
  "registered-event": { background: "#fffceb", border: "" },
  "other": { background: "#ffffff", border: "#E2E2E2" },
};

const EventCard = ({ event }) => {
  const navigate = useNavigate()

  if (!event) return;
  const { background, border } = EVENT_STYLES[event?.eventType] || EVENT_STYLES["other"];

  const handleNavigate = (event) => {
    switch (event.eventType) {
      case 'teaching-schedule':
        return navigate(`/workspace/courses/class/${event?.classId}`)
      case 'student-schedule':
        return navigate(`/workspace/learning/class/${event?.classId}`)
      case 'my-event':
        return navigate(`/workspace/events`)
      case 'registered-event':
        return navigate(`/workspace/events`)
      case 'other':
        return
    }
  }

  return (
    <div
      className="max-w-[290px] w-full h-fit p-4 space-y-2 rounded-xl border"
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
            {event.startTime ? dayjs(event.startTime).format('HH:mm') : ''}
            {event.endTime ? ` - ${dayjs(event.endTime).format('HH:mm')}` : ''}
          </p>
          <p className='flex items-center gap-2'><Calendar size={14} /> {event.location}</p>
        </div>
        <IconButton variant='outline' innerClassName='!w-8 !h-8' onClick={() => handleNavigate(event)}>
          <ArrowRight size={8} />
        </IconButton>
      </div>
    </div>
  )
}

export default EventCard