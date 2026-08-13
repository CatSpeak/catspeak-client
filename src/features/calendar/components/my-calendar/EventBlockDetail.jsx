import React from 'react'
import Modal from '@/shared/components/ui/Modal'
import { Clock, MapPin, Tag, Info, ArrowRight, Share2 } from 'lucide-react'
import dayjs from 'dayjs'
import { IconButton, PillButton } from '@/shared/components/ui/buttons';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/shared/context/LanguageContext'
import { useTimezone } from '@/shared/hooks/useTimezone'
import SharePopover from '../EventDetailModal/SharePopover'

const EventBlockDetail = ({ event, open, onClose }) => {
  const navigate = useNavigate()
  const { t, language } = useLanguage()
  const { formatDate, formatTime } = useTimezone()

  const EVENT_STYLES = {
    "teaching-schedule": { background: "#f1fff8", label: t.calendar?.teachingSchedule || "Lịch dạy", color: "#34ce56" },
    "student-schedule": { background: "#f0f5ff", label: t.calendar?.studentSchedule || "Lịch học", color: "#0e6eec" },
    "my-event": { background: "#ffeef0", label: t.calendar?.myEvent || "Sự kiện của tôi", color: "#f83b4f" },
    "registered-event": { background: "#fffceb", label: t.calendar?.registeredEvent || "Đã đăng ký", color: "#e2b60a" },
    "other": { background: "#ffffff", label: t.calendar?.other || "Khác", color: "#888888" },
  };

  if (!event) return null;

  const style = EVENT_STYLES[event.eventType] || EVENT_STYLES["other"];

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

  const renderImage = (event) => {
    if (['teaching-schedule', 'student-schedule'].includes(event.eventType)) return null;

    return (
      <div>
        {['registered-event', 'my-event'].includes(event.eventType) && event.thumbnailUrl ? (
          <div className="w-full h-44 bg-[#F8F9FA] rounded-2xl flex items-center justify-center overflow-hidden border border-border mt-2 shrink-0">
            <img src={event.thumbnailUrl} alt="thumbnail" className="w-full h-full object-cover" />
          </div>
        ) : (
          <div className="w-full h-44 bg-[#F8F9FA] text-[#7B7979] rounded-2xl flex items-center justify-center overflow-hidden border border-border mt-2 shrink-0">
            No Image
          </div>
        )}
      </div>
    )
  }


  const renderFooter = (event) => {
    const isRegister = ["registered-event", "my-event", "teaching-schedule", "student-schedule"].includes(event.eventType);
    if (!isRegister) return null;

    switch (event.eventType) {
      case 'registered-event': case "my-event": {
        const now = dayjs();
        const start = dayjs(event.startTime);
        const end = event.endTime ? dayjs(event.endTime) : start;

        const isPast = now.isAfter(end);
        const isUpcoming = now.isBefore(start);

        let statusLabel = "";
        if (isPast) {
          statusLabel = t.calendar?.ended || "Đã kết thúc";
        } else if (event.eventType === "my-event") {
          statusLabel = isUpcoming ? (t.calendar?.upcoming || "Sắp diễn ra") : (t.calendar?.ongoing || "Đang diễn ra");
        } else {
          statusLabel = t.calendar?.registered || "Đã đăng ký";
        }

        return (
          <div className="p-4 border-t border-border flex items-center justify-center gap-3 bg-white shrink-0">
            <PillButton bgColor={isPast ? "#d1d5db" : undefined}>
              {statusLabel}
            </PillButton>
            <SharePopover
              eventId={event.id || event._id}
              occurrenceId={event.occurrenceId}
              className="!bg-transparent border border-border !text-[#1A1A1A] !w-11 !h-11 hover:!bg-gray-50"
            />
          </div>
        )
      }
      case "teaching-schedule": case "student-schedule":
        return (
          <div className="p-4 border-t border-border flex items-center justify-center gap-3 bg-white shrink-0">
            <PillButton
              variant='outline'
              onClick={() => navigate(`/${language || 'vi'}/meet/class-${event?.classId}`)}
            >
              {t.calendar?.enterRoom || "Vào phòng"}
            </PillButton>
            <PillButton
              onClick={() => handleNavigate(event)}
            >
              {t.calendar?.viewClass || "Xem lớp học"}
            </PillButton>
          </div>
        )
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={t.calendar?.eventDetail || "Chi tiết sự kiện"}
      className="max-w-md w-full"
      bodyClassName="p-0 flex flex-col flex-1 min-h-0"
    >
      {/* Header section with event specific color background */}
      <div
        className="p-6 border-b border-border shrink-0"
        style={{ backgroundColor: style.background }}
      >
        <div className="flex items-center gap-2 mb-2">
          <span className="w-3 h-3 rounded-full" style={{ backgroundColor: style.color }}></span>
          <span className="text-sm font-medium text-gray-700">{style.label}</span>
        </div>
        <h2 className="text-2xl font-bold text-[#1A1A1A]">{event.title}</h2>
        {event.subtitle && <p className="text-gray-600 mt-1">{event.subtitle}</p>}
      </div>

      {/* Content section */}
      <div className="p-6 space-y-3 overflow-y-auto flex-1 min-h-0">
        {/* Status */}
        {event.status && (
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-gray-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-[#1A1A1A] font-medium">{t.courses?.student?.classStatuses?.[event.status] || event.status}</p>
              <p className="text-sm text-gray-500">{t.calendar?.statusLabel || 'Trạng thái'}</p>
            </div>
          </div>
        )}

        {/* Time */}
        <div className="flex items-start gap-3">
          <Clock className="w-5 h-5 text-gray-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-[#1A1A1A] font-medium">
              {event.startTime ? formatTime(event.startTime) : ''}
              {event.endTime ? ` - ${formatTime(event.endTime)}` : ''}
              {event.startTime ? `, (${formatDate(event.startTime)})` : ''}
            </p>
            <p className="text-sm text-gray-500">{t.calendar?.timeLabel || 'Thời gian'}</p>
          </div>
        </div>

        {/* Location */}
        {event.location && (
          <div className="flex items-start gap-3">
            <MapPin className="w-5 h-5 text-gray-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-[#1A1A1A] font-medium">{event.location}</p>
              <p className="text-sm text-gray-500">{t.calendar?.location || 'Địa điểm'}</p>
            </div>
          </div>
        )}

        {/* Price */}
        {['registered-event', 'my-event'].includes(event.eventType) && (
          <div className="flex items-start gap-3">
            <Tag className="w-5 h-5 text-gray-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-[#1A1A1A] font-medium">{event.ticketPrice ? event.ticketPrice + "K" : (t.calendar?.free || 'Miễn phí')}</p>
              <p className="text-sm text-gray-500">{t.calendar?.ticketPrice || 'Giá vé'}</p>
            </div>
          </div>
        )}

        {/* Thumbnail */}
        {renderImage(event)}
      </div>

      {/* Footer */}
      {renderFooter(event)}
    </Modal>
  )
}

export default EventBlockDetail