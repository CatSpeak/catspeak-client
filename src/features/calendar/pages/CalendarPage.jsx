import React, { useState, useMemo } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import dayjs from "dayjs";
import { useLanguage } from "@/shared/context/LanguageContext";
import { useGetEventCountsQuery } from "@/store/api/eventsApi";
import Breadcrumb from "@/shared/components/ui/navigation/Breadcrumb";
import FilterModal from "../components/FilterModal";
import DaySchedule from "../components/DaySchedule";
import CalendarPageHeader from "../components/CalendarPageHeader";
import CalendarFilterChips from "../components/CalendarFilterChips";
import CalendarMonthPanel from "../components/CalendarMonthPanel.jsx";
import EventDetailModal from "../components/EventDetailModal/index";
import MapView from "../components/Mapview";
import { HeaderImage } from "../assets";

const CalendarPage = () => {
  const { lang } = useParams();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const cal = t.calendar || {};

  const [searchParams, setSearchParams] = useSearchParams();
  const eventIdFromUrl = searchParams.get("eventId");
  const occurrenceIdFromUrl = searchParams.get("occurrenceId");
  const tokenFromUrl = searchParams.get("token");

  const [currentDate, setCurrentDate] = useState(dayjs());
  const [selectedDate, setSelectedDate] = useState(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [activeFilters, setActiveFilters] = useState({});
  const [viewType, setViewType] = useState("month");
  
  const [dayEvents, setDayEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);

  const basePath = lang ? `/${lang}/cat-speak/calendar` : "/cat-speak/calendar";

  const breadcrumbItems = [
    { label: t.navigation?.home || "Trang chủ", onClick: () => navigate("/") },
    { label: "Cat Speak", onClick: () => navigate(basePath) },
    { label: cal.schedule || "Thời gian biểu" },
  ];

  const handleNextMonth = () => {
    if (viewType === "week") {
      const nextWeek = currentDate
        .date(Math.min(selectedDate, currentDate.daysInMonth()))
        .add(1, "week");
      setCurrentDate(nextWeek);
      setSelectedDate(nextWeek.date());
    } else {
      setCurrentDate((d) => d.add(1, "month"));
    }
  };

  const handlePrevMonth = () => {
    if (viewType === "week") {
      const prevWeek = currentDate
        .date(Math.min(selectedDate, currentDate.daysInMonth()))
        .subtract(1, "week");
      setCurrentDate(prevWeek);
      setSelectedDate(prevWeek.date());
    } else {
      setCurrentDate((d) => d.subtract(1, "month"));
    }
  };

  // Fetch event counts for current month
  const { data: eventCountsData } = useGetEventCountsQuery({
    startDate: currentDate.startOf("month").toISOString(),
    endDate: currentDate.endOf("month").toISOString(),
  });

  const eventCountsByDay = useMemo(() => {
    if (!eventCountsData?.counts) return {};
    return eventCountsData.counts.reduce((acc, item) => {
      // Parse as local date string (YYYY-MM-DD) to avoid UTC offset shifting the day
      const day = dayjs(item.date.slice(0, 10)).date();
      acc[day] = (acc[day] ?? 0) + item.totalEvents;
      return acc;
    }, {});
  }, [eventCountsData]);

  // Active filter chips
  const filterChips = [];

  if (activeFilters.eventType) {
    filterChips.push({
      key: "eventType",
      label: activeFilters.eventType === "online" ? "Online" : "Offline",
    });
  }

  if (activeFilters.startTime || activeFilters.endTime) {
    let label = "";

    if (activeFilters.startTime && activeFilters.endTime) {
      label = `${activeFilters.startTime} - ${activeFilters.endTime}`;
    } else if (activeFilters.startTime) {
      label = `${cal.from} ${activeFilters.startTime}`;
    } else {
      label = `${cal.to} ${activeFilters.endTime}`;
    }

    filterChips.push({
      key: "timeRange",
      label,
    });
  }

  if (activeFilters.priceMin != null || activeFilters.priceMax != null) {
    const min = activeFilters.priceMin ?? 0;
    const max = activeFilters.priceMax ?? 1000000;
    const fmt = (v) => v >= 1000 ? `${Math.round(v / 1000)}k` : String(v);
    filterChips.push({
      key: "priceRange",
      label: `${cal.filterPrice || "Giá"}: ${fmt(min)} - ${fmt(max)}`,
    });
  }

  const removeFilter = (key) => {
    setActiveFilters((prev) => {
      const next = { ...prev };

      if (key === "timeRange") {
        delete next.startTime;
        delete next.endTime;
      } else if (key === "priceRange") {
        delete next.priceMin;
        delete next.priceMax;
      } else {
        delete next[key];
      }

      return next;
    });
  };

  const monthNum = currentDate.format("M");
  const yearNum = currentDate.format("YYYY");
  const localizedMonth = `${cal.month || "THÁNG"} ${monthNum} ${yearNum}`;

  return (
    <div className="w-full flex flex-col gap-4 overflow-hidden bg-[#F3F3F3] min-h-screen">
      <div className="px-6 pt-4">
        <Breadcrumb items={breadcrumbItems} />
      </div>
      <div className="relative w-full overflow-hidden aspect-[16/5] bg-white">
        <img
          src={HeaderImage}
          alt="Calendar Banner"
          className="w-full h-full object-cover object-center"
        />
      </div>

      <div className="px-6 pt-5 pb-8">
        <CalendarPageHeader
          title={cal.schedule || "Thời gian biểu"}
          onOpenFilters={() => setIsFilterOpen(true)}
        />

        {/* Active filter chips */}
        <CalendarFilterChips chips={filterChips} onRemove={removeFilter} />

        {/* Calendar + Schedule grid */}
        <div className="flex flex-col lg:grid lg:grid-cols-2 gap-6 mt-10 lg:items-start">
          {/* LEFT: Calendar & Map */}
          <div className="contents lg:flex lg:flex-col lg:gap-6">
            <div className="order-1 lg:order-none">
              <CalendarMonthPanel
                currentDate={currentDate}
                selectedDate={selectedDate}
                eventCountsByDay={eventCountsByDay}
                localizedMonth={localizedMonth}
                todayLegend={cal.todayLegend || "Ngày hôm nay"}
                selectedDayLegend={cal.selectedDayLegend || "Ngày được chọn"}
                onPrevMonth={handlePrevMonth}
                onNextMonth={handleNextMonth}
                onSelectDate={(d) => {
                  setSelectedDate(d);
                  setSelectedEvent(null);
                }}
                viewType={viewType}
                onChangeView={setViewType}
              />
            </div>
            {/* Desktop only Map, or both, but Image shows it below the calendar */}
            <div className="order-3 lg:order-none relative z-0 rounded-3xl overflow-hidden bg-white p-3 shadow-sm w-full h-full">
              <MapView dayEvents={dayEvents} selectedEvent={selectedEvent} />
            </div>
          </div>

          {/* RIGHT: Day Schedule */}
          <div className="order-2 lg:order-none flex flex-col min-h-[500px]">
            <DaySchedule
              selectedDate={selectedDate}
              currentDate={currentDate}
              activeFilters={activeFilters}
              selectedEvent={selectedEvent}
              onEventSelect={setSelectedEvent}
              onEventsUpdate={setDayEvents}
              eventCountsByDay={eventCountsByDay}
              onSelectDate={(d) => {
                setSelectedDate(d);
                setSelectedEvent(null);
              }}
            />
          </div>
        </div>
      </div>

      {/* Filter Modal */}
      <FilterModal
        open={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        onApply={(filters) => setActiveFilters(filters)}
        initialFilters={activeFilters}
      />

      {/* Event Detail Modal (from URL params) */}
      {(eventIdFromUrl || occurrenceIdFromUrl) && (
        <EventDetailModal
          event={{
            eventId: eventIdFromUrl || undefined,
            occurrenceId: occurrenceIdFromUrl || undefined,
            token: tokenFromUrl || undefined,
          }}
          onClose={() => {
            const newParams = new URLSearchParams(searchParams);
            newParams.delete("eventId");
            newParams.delete("occurrenceId");
            newParams.delete("token");
            setSearchParams(newParams, { replace: true });
          }}
        />
      )}
    </div>
  );
};

export default CalendarPage;
