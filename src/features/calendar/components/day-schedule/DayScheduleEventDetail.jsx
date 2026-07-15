import React from "react";
import { Clock, MapPin, Globe, ChevronLeft, Tag } from "lucide-react";
import dayjs from "dayjs";
import { useNavigate, useParams } from "react-router-dom";
import { formatLocation } from "../../utils/eventFormatters";
import EventDetailFooter from "../EventDetailModal/EventDetailFooter";

const DayScheduleEventDetail = ({
  selectedEvent,
  fullEvent,
  onClose,
  onActionComplete,
  cal = {},
}) => {
  const navigate = useNavigate();
  const { lang } = useParams();
  const ev = fullEvent || selectedEvent;

  const startTime = ev.startTime
    ? dayjs(ev.startTime).format("HH:mm (DD/MM/YYYY)")
    : "";
  const endTime = ev.endTime
    ? dayjs(ev.endTime).format("HH:mm (DD/MM/YYYY)")
    : "";
  const timeStr =
    startTime && endTime ? `${startTime} - ${endTime}` : startTime;

  const location =
    formatLocation(ev.location, ev.cityName, ev.countryName) ||
    ev.address ||
    "";

  const handleEdit = () => {
    const basePath = lang
      ? `/${lang}/cat-speak/calendar`
      : "/cat-speak/calendar";
    navigate(`${basePath}/create`, { state: { editEvent: ev } });
    onClose && onClose();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/60 lg:hidden"
        onClick={onClose}
      />

      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[92vw] max-w-[420px] max-h-[85vh] lg:static lg:transform-none lg:w-full lg:max-w-none lg:max-h-none flex flex-col bg-white rounded-[32px] lg:rounded-2xl lg:shadow-sm overflow-hidden shadow-2xl lg:h-max">
        <div className="flex-1 overflow-y-auto p-6 md:p-8 lg:p-6 [&::-webkit-scrollbar]:hidden flex flex-col">
          {/* Header */}
          <div className="flex items-start gap-4 mb-6 shrink-0">
            <button
              onClick={onClose}
              className="mt-0.5 shrink-0 text-[#990011] hover:bg-gray-100 rounded-full p-1.5 transition-colors"
            >
              <ChevronLeft size={24} />
            </button>
            <h2 className="text-2xl font-bold text-black leading-snug pr-4">
              {ev.title || cal.event || "Tên event ngẫu nhiên"}
            </h2>
          </div>

          {/* Description */}
          <p className="text-[15px] text-gray-800 mb-8 leading-relaxed">
            {ev.description ? (
              ev.description
            ) : (
              <span className="italic text-gray-400">
                {cal.noDescription || "Sự kiện này không có mô tả."}
              </span>
            )}
          </p>

          {/* Meta info */}
          <div className="flex flex-col gap-5 text-[15px] text-black mb-8 px-1">
            {/* Time */}
            <div className="flex items-center gap-3">
              <Clock size={18} className="text-gray-800 shrink-0" />
              <span>{timeStr}</span>
            </div>

            {/* Location */}
            <div className="flex items-center gap-3">
              {selectedEvent.isOnline ? (
                <Globe size={18} className="text-gray-800 shrink-0" />
              ) : (
                <MapPin size={18} className="text-gray-800 shrink-0" />
              )}
              <span className="flex-1">
                {selectedEvent.isOnline ? "Online" : ""}
                {selectedEvent.isOnline && location
                  ? ` - ${location}`
                  : location || ""}
              </span>
            </div>

            {/* Price */}
            <div className="flex items-center justify-between mt-2 pt-2">
              <div className="flex items-center gap-3">
                <Tag size={18} className="text-gray-800 shrink-0" />
                <span>{cal.ticketPrice || "Giá cả"}</span>
              </div>
              {selectedEvent.ticketPrice != null &&
              selectedEvent.ticketPrice > 0 ? (
                <span className="text-[17px] font-bold text-[#990011]">
                  {new Intl.NumberFormat("vi-VN", {
                    maximumFractionDigits: 0,
                  }).format(selectedEvent.ticketPrice)}
                  k
                </span>
              ) : (
                <span className="text-[17px] font-bold text-[#990011]">
                  {cal.free || "Miễn Phí"}
                </span>
              )}
            </div>
          </div>

          {/* Thumbnail */}
          <div className="mt-auto w-full rounded-[24px] overflow-hidden bg-gray-100 flex-shrink-0">
            {selectedEvent.thumbnailUrl ? (
              <img
                src={selectedEvent.thumbnailUrl}
                alt={selectedEvent.title}
                className="w-full h-auto max-h-[300px] object-cover"
              />
            ) : (
              <div className="w-full h-[200px] flex justify-center items-center text-gray-400">
                No Image
              </div>
            )}
          </div>
        </div>

        {/* Footer actions */}
        <div className="shrink-0 bg-white lg:rounded-b-2xl border-t border-[#E5E5E5] lg:border-t-0 z-10 shadow-[0_-4px_10px_rgba(0,0,0,0.02)]">
          <EventDetailFooter
            eventId={ev.eventId || ev.id}
            event={ev}
            onClose={onClose}
            onEdit={handleEdit}
            onActionComplete={onActionComplete}
            hideAdminControls={true}
            isCreatorOverride={ev.isOwner ?? false}
          />
        </div>
      </div>
    </>
  );
};

export default DayScheduleEventDetail;
