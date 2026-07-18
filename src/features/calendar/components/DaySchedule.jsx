import React, { useState, useEffect } from "react";
import dayjs from "dayjs";
import { useLanguage } from "@/shared/context/LanguageContext";
import {
  useGetEventsByDateQuery,
  useGetRegisteredEventsQuery,
  useGetEventByIdQuery,
  useGetEventOccurrenceByIdQuery,
} from "@/store/api/eventsApi";

import DayScheduleMonthView from "./day-schedule/DayScheduleMonthView";
import DayScheduleDayView from "./day-schedule/DayScheduleDayView";
import DayScheduleEventDetail from "./day-schedule/DayScheduleEventDetail";


const getTimeOfDay = (timeStr) => {
  if (!timeStr) return "morning";
  const hour = parseInt(timeStr.split(":")[0], 10);
  if (hour < 12) return "morning";   // 00:00 - 11:59
  if (hour < 14) return "noon";      // 12:00 - 13:59
  if (hour < 18) return "afternoon"; // 14:00 - 17:59
  return "evening";                  // 18:00 - 23:59
};


const DaySchedule = ({
  selectedDate,
  currentDate,
  activeFilters,
  selectedEvent,
  onEventSelect,
  onEventsUpdate,
  eventCountsByDay,
  onSelectDate,
}) => {
  const { t } = useLanguage();
  const cal = t.calendar || {};

  const [tab, setTab] = useState("unregistered");   // day view tab
  const [monthTab, setMonthTab] = useState("upcoming"); // month view tab
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

  const isMonthView = !selectedDate && !selectedEvent;

  // Detail queries for selected event
  const selectedEventId = selectedEvent?.eventId ?? selectedEvent?.id;
  const selectedOccurrenceId = selectedEvent?.occurrenceId;
  const { data: detailData } = useGetEventByIdQuery(selectedEventId, {
    skip: !selectedEventId,
  });
  const { data: occurrenceData } = useGetEventOccurrenceByIdQuery(
    selectedOccurrenceId,
    { skip: !selectedOccurrenceId },
  );
  const fullSelectedEvent = selectedEvent
    ? { ...selectedEvent, ...detailData, ...occurrenceData }
    : null;

  // Registered events for the month (month view only)
  const monthStart = currentDate.startOf("month").toISOString();
  const monthEnd = currentDate.endOf("month").toISOString();
  const { data: registeredMonthData } = useGetRegisteredEventsQuery(
    { startDate: monthStart, endDate: monthEnd },
    { skip: !isMonthView },
  );
  const registeredMonthEvents =
    registeredMonthData?.events ||
    (Array.isArray(registeredMonthData) ? registeredMonthData : []);
  const registeredByDay = registeredMonthEvents.reduce((acc, ev) => {
    const day = dayjs(ev.startTime).date();
    acc[day] = (acc[day] || 0) + 1;
    return acc;
  }, {});
  const daysWithRegistered = Object.keys(registeredByDay)
    .map(Number)
    .sort((a, b) => a - b);

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

      if (
        selectedDay.isSame(evEndDay) &&
        selectedDay.isAfter(evStartDay) &&
        evEnd.format("HH:mm:ss") === "00:00:00"
      ) {
        return;
      }

      seen.add(id);
      allEvents.push({ ...ev, id, eventId: ev.eventId, occurrenceId: ev.occurrenceId });
    });
  };

  if (eventsDataA?.events) addEvents(eventsDataA.events);
  if (eventsDataB?.events && needsTwoQueries) addEvents(eventsDataB.events);

  allEvents.sort((a, b) =>
    dayjs(a.startTime).isBefore(dayjs(b.startTime)) ? -1 : 1,
  );

  // Deduplicate by eventId for display
  const visibleEvents = (() => {
    const seenEventIds = new Set();
    return allEvents.filter((event) => {
      const eventId = event.eventId || event.recurringEventId || event.id;
      if (seenEventIds.has(eventId)) return false;
      seenEventIds.add(eventId);
      return true;
    });
  })();

  const unregistered = visibleEvents.filter((ev) => !ev.isRegistered);
  const registered = visibleEvents.filter((ev) => ev.isRegistered);

  // Apply active filters
  const filteredEvents = (
    tab === "unregistered" ? unregistered : registered
  ).filter((ev) => {
    if (activeFilters?.eventType === "online" && !ev.isOnline) return false;
    if (activeFilters?.eventType === "offline" && ev.isOnline) return false;

    if (activeFilters?.startTime || activeFilters?.endTime) {
      const evStartHs = ev.startTime
        ? dayjs(ev.startTime).format("HH:mm")
        : null;
      if (!evStartHs) return false;
      if (activeFilters?.startTime && evStartHs < activeFilters.startTime)
        return false;
      if (activeFilters?.endTime && evStartHs > activeFilters.endTime)
        return false;
    }

    if (activeFilters?.priceMin != null || activeFilters?.priceMax != null) {
      const price = Number(ev.ticketPrice ?? 0) * 1000;
      if (activeFilters.priceMin != null && price < activeFilters.priceMin)
        return false;
      if (activeFilters.priceMax != null && price > activeFilters.priceMax)
        return false;
    }

    return true;
  });

  const displayEvents = filteredEvents;

  // Group by time of day
  const grouped = (() => {
    const groups = { morning: [], noon: [], afternoon: [], evening: [] };
    displayEvents.forEach((ev) => {
      const startTime = ev.startTime ? dayjs(ev.startTime).format("HH:mm") : null;
      const section = getTimeOfDay(startTime);
      groups[section].push(ev);
    });
    return groups;
  })();

  const sectionLabels = {
    morning: cal.morning || "Sáng",
    noon: cal.noon || "Trưa",
    afternoon: cal.afternoon || "Chiều",
    evening: cal.evening || "Tối",
  };

  const dateLabel = selectedDate
    ? `${cal.daySchedule || "Lịch trình sự kiện ngày"} ${displayDate.format("D/M")}`
    : cal.selectDayToView || "Chọn ngày để xem";

  const displayEventIds = displayEvents.map((e) => e.id).join(",");
  useEffect(() => {
    if (onEventsUpdate) {
      onEventsUpdate(displayEvents);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [displayEventIds, onEventsUpdate]);

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
    <div className="relative flex flex-col h-full lg:h-auto">
      <div className={`flex-col h-full ${selectedEvent ? "flex lg:hidden" : "flex"}`}>
        {isMonthView ? (
          <DayScheduleMonthView
            currentDate={currentDate}
            eventCountsByDay={eventCountsByDay}
            registeredMonthEvents={registeredMonthEvents}
            registeredByDay={registeredByDay}
            daysWithRegistered={daysWithRegistered}
            monthTab={monthTab}
            setMonthTab={setMonthTab}
            onSelectDate={onSelectDate}
            cal={cal}
          />
        ) : (
          <DayScheduleDayView
            dateLabel={dateLabel}
            selectedDate={selectedDate}
            tab={tab}
            setTab={setTab}
            unregistered={unregistered}
            registered={registered}
            displayEvents={displayEvents}
            grouped={grouped}
            sectionLabels={sectionLabels}
            selectedEvent={selectedEvent}
            isLoading={isLoading}
            actionStatus={actionStatus}
            setActionStatus={setActionStatus}
            onSelectDate={onSelectDate}
            onEventClick={handleEventClick}
            cal={cal}
          />
        )}
      </div>

      {selectedEvent && (
        <DayScheduleEventDetail
          selectedEvent={selectedEvent}
          fullEvent={fullSelectedEvent}
          onClose={() => onEventSelect && onEventSelect(null)}
          onActionComplete={(type, status) => setActionStatus({ type, status })}
          cal={cal}
        />
      )}
    </div>
  );
};

export default DaySchedule;
