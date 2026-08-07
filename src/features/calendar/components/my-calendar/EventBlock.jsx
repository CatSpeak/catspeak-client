import React from 'react'
import { Clock, Calendar } from 'lucide-react'
import dayjs from 'dayjs'
import { useNavigate } from 'react-router-dom'
import { useLanguage } from '@/shared/context/LanguageContext'

const EVENT_STYLES = {
  "teaching-schedule": { background: "#f1fff8", border: "" },
  "student-schedule": { background: "#f0f5ff", border: "" },
  "my-event": { background: "#ffeef0", border: "" },
  "registered-event": { background: "#fffceb", border: "" },
  "other": { background: "#ffffff", border: "#E2E2E2" },
};

const EventBlock = ({ event, top, height, width = '96%', left = '2%', onClick }) => {
  const navigate = useNavigate()
  const { language } = useLanguage()
  const { background, border } = EVENT_STYLES[event?.eventType] || EVENT_STYLES["other"];

  return (
    <div
      onClick={onClick}
      className="absolute rounded-xl p-3 flex flex-col gap-2 min-h-fit z-10 border cursor-pointer hover:opacity-90 transition-opacity"
      style={{
        top: `${top}px`,
        height: `${height}px`,
        width,
        left,
        backgroundColor: background,
        borderColor: border || 'transparent',
      }}
    >
      <div className="flex flex-col gap-0.5">
        <p className="text-sm font-semibold text-[#1A1A1A] truncate">{event.title}</p>
        {event.subtitle && <p className="text-xs font-medium text-[#7B7979] truncate">{event.subtitle}</p>}
      </div>
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center gap-1.5 text-xs text-[#1A1A1A]">
          <Clock className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">
            {event.startTime ? dayjs(event.startTime).format('HH:mm') : ''}
            {event.endTime ? ` - ${dayjs(event.endTime).format('HH:mm')}` : ''}
          </span>
        </div>
        {event.location && (
          <div className="flex items-center gap-1.5 text-xs text-[#1A1A1A]">
            <Calendar className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">{event.location}</span>
          </div>
        )}
      </div>

      {(event.eventType === 'teaching-schedule' || event.eventType === 'student-schedule') &&
        dayjs().isAfter(dayjs(event.startTime)) && dayjs().isBefore(dayjs(event.endTime)) && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/${language || 'vi'}/meet/class-${event?.classId}`);
          }}
          className="absolute bottom-[-14px] left-1/2 -translate-x-1/2 w-[90%] py-1 bg-white border border-[#990011] text-[#990011] rounded-md text-xs font-bold hover:bg-red-50 z-20 shadow-sm"
        >
          Vào phòng
        </button>
      )}
    </div>
  )
}

export default EventBlock