import { useLanguage } from "@/shared/context/LanguageContext";
import dayjs from "dayjs";
import { formatLocation } from "../utils/eventFormatters";
import {
  Clock,
  Globe,
  MapPin,
  ChevronDown,
  ChevronUp,
  Tag,
} from "lucide-react";
import FluentAnimation from "@/shared/components/ui/animations/FluentAnimation";
import EventCardDetails from "./EventCardDetails";

const DEFAULT_COLOR = "#990011";

const EventCard = ({ event, onClick, isSelected, onActionComplete }) => {
  const { t } = useLanguage();

  const startTime = event.startTime
    ? dayjs(event.startTime).format("HH:mm (DD/MM/YYYY)")
    : "";
  const endTime = event.endTime ? dayjs(event.endTime).format("HH:mm (DD/MM/YYYY)") : "";
  const timeStr =
    startTime && endTime ? `${startTime} - ${endTime}` : startTime;

  const location =
    formatLocation(event.location, event.cityName, event.countryName) ||
    event.address ||
    "";

  return (
    <div
      className={`flex flex-col rounded-2xl transition-all border ${
        isSelected
          ? "border-[#990011] bg-white shadow-md shadow-[#990011]/10"
          : "border-transparent bg-[#F5F5F5] hover:border-[#990011]/40"
      }`}
    >
      {/* Shortened card top portion */}
      <div
        onClick={() => onClick(event)}
        className="flex items-center gap-4 px-4 py-3.5 cursor-pointer w-full"
      >
        {/* Avatar / Image */}
        <div
          className="w-12 h-12 md:w-14 md:h-14 rounded-full shrink-0 flex items-center justify-center overflow-hidden"
          style={{ backgroundColor: event.color || DEFAULT_COLOR }}
        >
          {event.thumbnailUrl ? (
            <img
              src={event.thumbnailUrl}
              alt={event.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-white text-sm font-bold uppercase">
              {(event.title || "E")[0]}
            </span>
          )}
        </div>

        {/* Info */}
        <div className="flex flex-col flex-1 min-w-0 gap-2">
          <span className="text-[15px] font-semibold text-black truncate leading-tight">
            {event.title || t.calendar?.event || "Sự kiện"}
          </span>
          {timeStr && (
            <div className="flex items-center gap-2 text-sm text-black/75">
              <Clock size={14} className="shrink-0 text-black/75" />
              <span className="leading-none">{timeStr}</span>
            </div>
          )}
          {(location || event.isOnline) && (
            <div className="flex items-center gap-2 text-sm text-black/75">
              {event.isOnline ? (
                <Globe size={14} className="shrink-0 text-black/75" />
              ) : (
                <MapPin size={14} className="shrink-0 text-black/75" />
              )}
              <span className="truncate leading-none flex-1">
                {event.isOnline ? "Online" : ""}
                {event.isOnline && location ? ` - ${location}` : location || ""}
              </span>
            </div>
          )}
        </div>

        {/* Price + Chevron */}
        <div className="shrink-0 flex flex-col items-end gap-1 min-w-[60px]">
          {/* Price display */}
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <Tag size={12} className="shrink-0" />
            <span>{t.calendar?.ticketPrice || "Giá cả"}</span>
          </div>
          {event.ticketPrice != null && event.ticketPrice > 0 ? (
            <span className="text-sm font-bold text-[#990011]">
              {new Intl.NumberFormat("vi-VN", {
                maximumFractionDigits: 0,
              }).format(event.ticketPrice)}k
            </span>
          ) : (
            <span className="text-sm font-bold text-[#990011]">
              {t.calendar?.free || "Miễn Phí"}
            </span>
          )}
        </div>

        <div className="shrink-0 self-center">
          {isSelected ? (
            <ChevronUp size={20} className="text-[#990011]" />
          ) : (
            <ChevronDown size={20} className="text-gray-400" />
          )}
        </div>
      </div>

      {/* Expanded Details section */}
      {isSelected && (
        <FluentAnimation direction="up" distance={10} duration={0.3}>
          <EventCardDetails event={event} onClose={() => onClick(event)} onActionComplete={onActionComplete} />
        </FluentAnimation>
      )}
    </div>
  );
};

export default EventCard;
