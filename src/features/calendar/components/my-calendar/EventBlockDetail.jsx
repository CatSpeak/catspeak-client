import React from 'react'
import Modal from '@/shared/components/ui/Modal'
import { Clock, MapPin, Calendar, Users, AlignLeft, ArrowRight } from 'lucide-react'
import dayjs from 'dayjs'
import { IconButton } from '@/shared/components/ui/buttons';

const EVENT_STYLES = {
  "teaching-schedule": { background: "#f1fff8", label: "Lịch dạy", color: "#34ce56" },
  "class-schedule": { background: "#f0f5ff", label: "Lịch học", color: "#0e6eec" },
  "my-event": { background: "#ffeef0", label: "Sự kiện của tôi", color: "#f83b4f" },
  "registered-event": { background: "#fffceb", label: "Đã đăng ký", color: "#e2b60a" },
  "other": { background: "#ffffff", label: "Khác", color: "#888888" },
};

const EventBlockDetail = ({ event, open, onClose }) => {
  if (!event) return null;

  const style = EVENT_STYLES[event.eventType] || EVENT_STYLES["other"];

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Chi tiết sự kiện"
      className="max-w-md w-full"
      bodyClassName="p-0"
    >
      <div className="flex flex-col">
        {/* Header section with event specific color background */}
        <div
          className="p-6 border-b border-[#E5E5E5]"
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
        <div className="p-6 space-y-4">
          <div className="flex items-start gap-3">
            <Clock className="w-5 h-5 text-gray-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-[#1A1A1A] font-medium">
                {event.startTime ? dayjs(event.startTime).format('HH:mm') : ''}
                {event.endTime ? ` - ${dayjs(event.endTime).format('HH:mm')}` : ''}
                {`, (${dayjs(event.startTime).format('DD/MM/YYYY')})`}
              </p>
              <p className="text-sm text-gray-500">Thời gian</p>
            </div>
          </div>

          <div className='flex justify-between items-center w-full'>
            {event.location && (
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-gray-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-[#1A1A1A] font-medium">{event.location}</p>
                  <p className="text-sm text-gray-500">Địa điểm</p>
                </div>
              </div>
            )}
            <IconButton variant='outline' innerClassName='!w-8 !h-8'>
              <ArrowRight size={8} />
            </IconButton>
          </div>
        </div>
      </div>
    </Modal>
  )
}

export default EventBlockDetail