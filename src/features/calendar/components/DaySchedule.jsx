import React, { useState, useEffect } from "react";
import { Clock, MapPin, Globe } from "lucide-react";
import dayjs from "dayjs";
import { useLanguage } from "@/shared/context/LanguageContext";
import { useGetEventsByDateQuery } from "@/store/api/eventsApi";
import { AfternoonIcon, EveningIcon, MorningIcon, NoonIcon } from "../assets";
import EventCard from "./EventCard";
import Modal from "@/shared/components/ui/Modal";
import { CheckCircle2, XCircle } from "lucide-react";

const getTimeOfDay = (timeStr) => {
  if (!timeStr) return "morning";

  const hour = parseInt(timeStr.split(":")[0], 10);

  if (hour < 12) return "morning"; // 00:00 - 11:59
  if (hour < 14) return "noon"; // 12:00 - 13:59
  if (hour < 18) return "afternoon"; // 14:00 - 17:59
  return "evening"; // 18:00 - 23:59
};

const TimeSectionIcon = ({ section }) => {
  let icon = MorningIcon;

  switch (section) {
    case "morning":
      icon = MorningIcon;
      break;
    case "noon":
      icon = NoonIcon;
      break;
    case "afternoon":
      icon = AfternoonIcon;
      break;
    case "evening":
      icon = EveningIcon;
      break;
    default:
      icon = MorningIcon;
  }

  return <img src={icon} alt={section} className="w-4 h-4 object-contain" />;
};

const DaySchedule = ({
  selectedDate,
  currentDate,
  activeFilters,
  selectedEvent,
  onEventSelect,
  onEventsUpdate,
}) => {
  const { t } = useLanguage();
  const cal = t.calendar || {};
  const [tab, setTab] = useState("unregistered"); // "unregistered" | "registered"
  const [actionStatus, setActionStatus] = useState(null);

  const displayDate = currentDate.date(selectedDate ?? dayjs().date());
  const displayDateKey = displayDate.format("YYYY-MM-DD");
  const localStart = displayDate.startOf("day");
  const localEnd = displayDate.endOf("day");
  const utcDateA = localStart.toISOString();
  const utcDateB = localEnd.toISOString();
  const needsTwoQueries = utcDateA.split("T")[0] !== utcDateB.split("T")[0];

  const { data: eventsDataA, isLoading: isLoadingA } = useGetEventsByDateQuery(
    { date: utcDateA },
    { skip: selectedDate == null },
  );
  const { data: eventsDataB, isLoading: isLoadingB } = useGetEventsByDateQuery(
    { date: utcDateB },
    { skip: selectedDate == null || !needsTwoQueries },
  );
  const isLoading = isLoadingA || isLoadingB;

  const selectedDay = dayjs(displayDateKey).startOf("day");
  const seen = new Set();
  const allEvents = [];

  const addEvents = (arr) => {
    if (!arr) return;
    arr.forEach((ev) => {
      const id = ev.occurrenceId || ev.eventId || ev.id;
      if (id == null || seen.has(id)) return;

      const evStart = dayjs(ev.startTime);
      if (!evStart.isValid()) return;

      const evEnd = ev.endTime ? dayjs(ev.endTime) : evStart;
      const evStartDay = evStart.startOf("day");
      const evEndDay = evEnd.isValid() ? evEnd.startOf("day") : evStartDay;

      if (selectedDay.isBefore(evStartDay) || selectedDay.isAfter(evEndDay))
        return;

      // Events that end exactly at midnight should not bleed into the next day.
      if (
        selectedDay.isSame(evEndDay) &&
        selectedDay.isAfter(evStartDay) &&
        evEnd.format("HH:mm:ss") === "00:00:00"
      ) {
        return;
      }

      seen.add(id);
      allEvents.push({
        ...ev,
        id,
        eventId: ev.eventId,
        occurrenceId: ev.occurrenceId,
      });
    });
  };

  if (eventsDataA?.events) addEvents(eventsDataA.events);
  if (eventsDataB?.events && needsTwoQueries) addEvents(eventsDataB.events);

  allEvents.sort((a, b) =>
    dayjs(a.startTime).isBefore(dayjs(b.startTime)) ? -1 : 1,
  );

  const visibleEvents = (() => {
    const seenEventIds = new Set();
    return allEvents.filter((event) => {
      // Use eventId to deduplicate display so overlapping occurrences of the same series show only once
      const eventId = event.eventId || event.recurringEventId || event.id;
      if (seenEventIds.has(eventId)) return false;
      seenEventIds.add(eventId);
      return true;
    });
  })();

  const unregistered = visibleEvents.filter((ev) => !ev.isRegistered);
  const registered = visibleEvents.filter((ev) => ev.isRegistered);

  const filteredEvents = (
    tab === "unregistered" ? unregistered : registered
  ).filter((ev) => {
    if (activeFilters?.eventType === "online" && !ev.isOnline) return false;
    if (activeFilters?.eventType === "offline" && ev.isOnline) return false;

    if (activeFilters?.startTime || activeFilters?.endTime) {
      const evStartHs = ev.startTime
        ? dayjs(ev.startTime).format("HH:mm")
        : null;
      if (!evStartHs) return false; // cannot filter if no time

      if (activeFilters?.startTime && evStartHs < activeFilters.startTime)
        return false;
      if (activeFilters?.endTime && evStartHs > activeFilters.endTime)
        return false;
    }

    if (activeFilters?.priceMin != null || activeFilters?.priceMax != null) {
      // ticketPrice is stored in thousands (e.g. 50 = 50k), filter uses full numbers (e.g. 20000 = 20k)
      const price = Number(ev.ticketPrice ?? 0) * 1000;
      if (activeFilters.priceMin != null && price < activeFilters.priceMin) return false;
      if (activeFilters.priceMax != null && price > activeFilters.priceMax) return false;
    }

    return true;
  });

  const displayEvents = filteredEvents;

  // Group by time of day
  const grouped = (() => {
    const groups = { morning: [], noon: [], afternoon: [], evening: [] };
    displayEvents.forEach((ev) => {
      const startTime = ev.startTime
        ? dayjs(ev.startTime).format("HH:mm")
        : null;
      const section = getTimeOfDay(startTime);
      groups[section].push(ev);
    });
    return groups;
  })();

  const sectionLabels = {
    morning: cal.morning || "Sáng",
    noon: cal.noon || "Trưa",
    afternoon: cal.afternoon || "Trưa",
    evening: cal.evening || "Tối",
  };

  const dateLabel = selectedDate
    ? `${cal.daySchedule || "Lịch trình sự kiện ngày"} ${displayDate.format("D/M")}`
    : cal.selectDayToView || "Chọn ngày để xem";

  // Notify parent of currently visible events
  const displayEventIds = displayEvents.map((e) => e.id).join(",");
  useEffect(() => {
    if (onEventsUpdate) {
      onEventsUpdate(displayEvents);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [displayEventIds, onEventsUpdate]); // Safe to use IDs string to prevent infinite loops

  const handleEventClick = (event) => {
    if (selectedEvent?.id === event.id) {
      onEventSelect && onEventSelect(null);
      return;
    }

    onEventSelect &&
      onEventSelect({
        ...event,
        eventId: event.eventId ?? event.recurringEventId ?? event.id,
        occurrenceId: event.isRecurringGroup
          ? undefined
          : (event.occurrenceId ?? event.id),
        isRecurring:
          event.isRecurring ||
          event.isRecurringGroup ||
          !!event.recurringEventId,
      });
  };

  return (
    <div className="flex flex-col h-full">
      {/* Title */}
      <h3 className="text-lg font-semibold text-black min-w-[140px] mb-4">
        {dateLabel}
      </h3>

      {/* Tabs */}
      <div className="flex w-full border-b border-[#E5E5E5] mb-5">
        <button
          onClick={() => setTab("unregistered")}
          className={`flex-1 flex items-center justify-center gap-2 pb-3 text-[15px] font-medium border-b-2 transition-all ${
            tab === "unregistered"
              ? "border-[#990011] text-[#990011]"
              : "border-transparent text-gray-500 hover:text-black"
          }`}
        >
          {cal.unregistered || "Chưa đăng ký"}
          {unregistered.length > 0 && (
            <span className="w-6 h-6 rounded-full text-xs  flex items-center justify-center bg-[#F4AB1B] text-black">
              {unregistered.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setTab("registered")}
          className={`flex-1 flex items-center justify-center gap-2 pb-3 text-[15px] font-medium border-b-2 transition-all ${
            tab === "registered"
              ? "border-[#990011] text-[#990011]"
              : "border-transparent text-gray-500 hover:text-black"
          }`}
        >
          {cal.registered || "Đã đăng ký"}
          {registered.length > 0 && (
            <span className="w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center bg-[#F4AB1B] text-black">
              {registered.length}
            </span>
          )}
        </button>
      </div>

      {/* Events List */}
      <div className="flex-1 overflow-y-auto space-y-4 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-[#990011] [&::-webkit-scrollbar-thumb]:bg-clip-padding [&::-webkit-scrollbar-thumb]:border-2 [&::-webkit-scrollbar-thumb]:border-solid [&::-webkit-scrollbar-thumb]:border-transparent [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar]:w-[6px] pr-1">
        {isLoading ? (
          <div className="text-sm text-gray-400 py-8 text-center">
            {cal.loadingEvents || "Đang tải sự kiện..."}
          </div>
        ) : !selectedDate ? (
          <div className="text-sm text-gray-400 py-8 text-center">
            {cal.selectDayToView || "Chọn một ngày trên lịch để xem sự kiện"}
          </div>
        ) : displayEvents.length === 0 ? (
          <div className="text-sm text-gray-400 py-8 text-center">
            {cal.noEvents || "Không có sự kiện nào trong ngày này"}
          </div>
        ) : (
          ["morning", "noon", "afternoon", "evening"].map((section) => {
            const events = grouped[section];
            if (!events.length) return null;
            return (
              <div key={section} className="flex flex-col gap-2">
                <div className="flex items-center gap-2 px-1 mb-1">
                  <TimeSectionIcon section={section} />
                  <span className="text-sm font-medium text-black">
                    {sectionLabels[section]}
                  </span>
                </div>
                {events.map((event) => (
                  <EventCard
                    key={event.id}
                    event={event}
                    onClick={handleEventClick}
                    isSelected={selectedEvent?.id === event.id}
                    onActionComplete={(type, status) => setActionStatus({ type, status })}
                  />
                ))}
              </div>
            );
          })
        )}
      </div>

      <Modal
        open={actionStatus !== null}
        onClose={() => setActionStatus(null)}
        showCloseButton={false}
        className="!max-w-[400px]"
      >
        <div className="flex flex-col items-center justify-center p-6 gap-4 text-center">
          {actionStatus?.status === "success" ? (
            <CheckCircle2 size={64} className="text-[#00BB38]" />
          ) : (
            <XCircle size={64} className="text-[#990011]" />
          )}

          <h2 className="text-xl font-bold text-black mt-2">
            {actionStatus?.status === "success"
              ? actionStatus.type === "register"
                ? cal.registerSuccess || "Đăng ký thành công!"
                : actionStatus.type === "cancel"
                ? cal.cancelRegSuccess || "Đã hủy đăng ký!"
                : cal.deleteSuccess || "Đã xóa sự kiện!"
              : actionStatus?.type === "register"
                ? cal.registerError || "Đăng ký thất bại"
                : actionStatus?.type === "cancel"
                ? cal.cancelRegError || "Hủy đăng ký thất bại"
                : cal.deleteError || "Xóa sự kiện thất bại"}
          </h2>
          
          <button
            type="button"
            onClick={() => setActionStatus(null)}
            className="mt-4 px-8 py-2.5 bg-[#990011] text-white rounded-full font-semibold hover:bg-[#7a000e] transition-colors w-full"
          >
            {cal.close || "Đóng"}
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default DaySchedule;
