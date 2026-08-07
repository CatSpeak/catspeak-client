import React from 'react'
import { ChevronLeft, Clock, MapPin, Tag, Share2, Info } from 'lucide-react'
import dayjs from 'dayjs'
import { IconButton, PillButton } from '@/shared/components/ui/buttons'
import { useNavigate } from 'react-router-dom'
import { useLanguage } from '@/shared/context/LanguageContext'

const EventCardDetail = ({ event, onBack }) => {
  const navigate = useNavigate()
  const { t, language } = useLanguage()

  if (!event) return null;

  const renderImage = (event) => {
    if (['teaching-schedule', 'student-schedule'].includes(event.eventType)) return null;

    return (
      <div>
        {['registered-event', 'my-event'].includes(event.eventType) && event.thumbnailUrl ? (
          <div className="w-full h-48 bg-[#F8F9FA] rounded-2xl flex items-center justify-center overflow-hidden border border-gray-100 mt-2 shrink-0">
            <img src={event.thumbnailUrl} alt="thumbnail" className="w-full h-full object-cover" />
          </div>
        ) : (
          <div className="w-full h-48 bg-[#F8F9FA] text-[#7B7979] rounded-2xl flex items-center justify-center overflow-hidden border border-gray-100 mt-2 shrink-0">
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
          statusLabel = "Đã kết thúc";
        } else if (event.eventType === "my-event") {
          statusLabel = isUpcoming ? "Sắp diễn ra" : "Đang diễn ra";
        } else {
          statusLabel = "Đã đăng ký";
        }

        return (
          <div className="p-4 border-t border-gray-100 flex items-center justify-center gap-3 bg-white shrink-0">
            <PillButton bgColor={isPast ? "#d1d5db" : undefined}>
              {statusLabel}
            </PillButton>
            <IconButton variant="outline" innerClassName="!w-11 !h-11 rounded-full border-gray-200 text-[#1A1A1A]">
              <Share2 size={18} />
            </IconButton>
          </div>
        )
      }
      case "teaching-schedule": case "student-schedule":
        return (
          <div className="p-4 border-t border-gray-100 flex items-center justify-center gap-3 bg-white shrink-0">
            <PillButton
              variant='outline'
              onClick={() => navigate(`/${language || 'vi'}/meet/class-${event?.classId}`)}
            >
              {"Vào phòng"}
            </PillButton>
            <PillButton
              onClick={() => navigate(`//workspace/courses/class/${event?.classId}`)}
            >
              {"Xem lớp học"}
            </PillButton>
          </div>
        )
    }

  }

  return (
    <div className="w-full bg-white rounded-2xl border border-gray-100 flex flex-col relative shadow-sm h-full max-h-[600px] overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b border-gray-100 bg-white z-10 shrink-0">
        <IconButton variant="ghost" onClick={onBack} innerClassName="!text-[#990011] !w-8 !h-8 shrink-0">
          <ChevronLeft size={20} />
        </IconButton>
        <h3 className="font-bold text-[15px] text-[#1A1A1A] line-clamp-1">{event.title || 'Không có tiêu đề'}</h3>
      </div>

      {/* Scrollable Body */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-5 relative">
        {/* Subtitle */}
        {event.subtitle && (
          <p className="text-[15px] text-[#7B7979] font-medium pr-12">{event.subtitle}</p>
        )}

        {event.status && (
          <div className="flex items-start gap-3 text-[#7B7979] text-[15px]">
            <Info size={18} className="shrink-0 mt-0.5" />
            <span className="leading-tight">{t.courses?.student?.classStatuses?.[event.status] || event.status}</span>
          </div>
        )}

        {/* Details List */}
        <div className="flex flex-col gap-4 mt-2">
          {/* Time */}
          <div className="flex items-start gap-3 text-[#7B7979] text-[15px]">
            <Clock size={18} className="shrink-0 mt-0.5" />
            <span className="leading-tight">
              {event.startTime ? dayjs(event.startTime).format('HH:mm (DD/MM/YYYY)') : ''}
              {event.endTime ? ` - ${dayjs(event.endTime).format('HH:mm (DD/MM/YYYY)')}` : ''}
            </span>
          </div>

          {/* Location */}
          {event.location && (
            <div className="flex items-start gap-3 text-[#7B7979] text-[15px]">
              <MapPin size={18} className="shrink-0 mt-0.5" />
              <span className="leading-tight">{event.location || 'Chưa cập nhật'}</span>
            </div>
          )}

          {/* Price */}
          {event.ticketPrice && (
            <div className="flex items-center justify-between text-[15px] w-full">
              <div className="flex items-center gap-3 text-[#7B7979]">
                <Tag size={18} className="shrink-0" />
                <span>Giá vé</span>
              </div>
              <span className="font-bold text-[#990011]">{event.ticketPrice + "K" || 'Miễn phí'}</span>
            </div>
          )}
        </div>

        {/* Image */}
        {renderImage(event)}
      </div>

      {/* Footer */}
      {renderFooter(event)}
    </div>
  )
}

export default EventCardDetail