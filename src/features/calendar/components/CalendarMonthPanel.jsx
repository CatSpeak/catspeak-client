import dayjs from "dayjs";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  LayoutGrid,
} from "lucide-react";
import MapView from "./Mapview";
// import "@/shared/utils/testGeoapify";

const DAY_LABELS = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];

const CalendarMonthPanel = ({
  currentDate,
  selectedDate,
  eventCountsByDay,
  localizedMonth,
  todayLegend,
  selectedDayLegend,
  onPrevMonth,
  onNextMonth,
  onSelectDate,
  viewType = "month",
  onChangeView,
  dayEvents = [],
  selectedEvent = null,
}) => {
  const startDay = (currentDate.startOf("month").day() + 6) % 7;
  const prevDays = currentDate.subtract(1, "month").daysInMonth();
  const daysInMonth = currentDate.daysInMonth();

  const calendarDates = Array.from({ length: 42 }, (_, i) => {
    const dayValue = i - startDay + 1;
    if (dayValue < 1) {
      return { day: prevDays + dayValue, isCurrentMonth: false };
    }
    if (dayValue > daysInMonth) {
      return { day: dayValue - daysInMonth, isCurrentMonth: false };
    }
    return { day: dayValue, isCurrentMonth: true };
  });

  const getWeekDates = () => {
    const validSelectedDate = Math.min(selectedDate, daysInMonth);
    const targetDate = currentDate.date(validSelectedDate);
    const dayOfWeek = targetDate.day();
    const diff = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // distance from Monday
    const startOfWeek = targetDate.subtract(diff, "day");

    return Array.from({ length: 7 }, (_, i) => {
      const d = startOfWeek.add(i, "day");
      return {
        day: d.date(),
        isCurrentMonth: d.month() === currentDate.month(),
      };
    });
  };

  const datesToRender = viewType === "month" ? calendarDates : getWeekDates();

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between   ">
        <div className="flex items-center gap-2">
          <button
            onClick={onPrevMonth}
            className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors"
          >
            <ChevronLeft size={16} className="text-[#990011]" />
          </button>
          <span className="text-lg font-semibold text-black min-w-[140px] text-center">
            {localizedMonth}
          </span>
          <button
            onClick={onNextMonth}
            className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors"
          >
            <ChevronRight size={16} className="text-[#990011]" />
          </button>
        </div>
        <div className="flex items-center gap-1 bg-gray-100 rounded-full p-1">
          <button
            onClick={() => onChangeView && onChangeView("week")}
            className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
              viewType === "week"
                ? "bg-[#990011] text-white"
                : "hover:bg-white text-gray-400"
            }`}
          >
            <LayoutGrid size={16} />
          </button>
          <button
            onClick={() => onChangeView && onChangeView("month")}
            className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
              viewType === "month"
                ? "bg-[#990011] text-white"
                : "hover:bg-white text-gray-400"
            }`}
          >
            <CalendarIcon size={16} />
          </button>
        </div>
      </div>
      <div className="flex items-center justify-between border-b border-black pb-2 mb-4"></div>
      <div className="grid grid-cols-7 gap-1 text-center">
        {DAY_LABELS.map((label) => (
          <div key={label} className="text-md  uppercase tracking-wider py-1">
            {label}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7">
        {datesToRender.map((dateObj, idx) => {
          const { day, isCurrentMonth } = dateObj;

          if (!isCurrentMonth) {
            return (
              <div
                key={`empty-${idx}`}
                className="h-16 flex items-center justify-center"
              >
                <span className="text-md text-gray-300">{day}</span>
              </div>
            );
          }

          const isToday =
            day === dayjs().date() && currentDate.isSame(dayjs(), "month");
          const isSelected = day === selectedDate;
          const eventCount = eventCountsByDay?.[day] ?? 0;

          return (
            <div
              key={`day-${idx}`}
              className="h-16 flex items-center justify-center relative"
            >
              <button
                onClick={() => onSelectDate(day)}
                className={`
                  w-14 h-14
                  flex items-center justify-center
                  rounded-full
                  text-md font-medium
                  transition-all
                  ${
                    isSelected
                      ? "bg-[#990011] text-white shadow-md"
                      : isToday
                        ? "text-[#990011] font-bold hover:bg-gray-100"
                        : "text-gray-700 hover:border hover:border-[#990011] hover:text-[#990011]"
                  }
                `}
              >
                {day}
              </button>
              {eventCount > 0 && !isSelected && (
                <span className="absolute bottom-1 left-1/2 -translate-x-1/2 flex gap-0.5">
                  {Array.from({ length: Math.min(eventCount, 3) }).map(
                    (_, i) => (
                      <span
                        key={i}
                        className={`w-1 h-1 rounded-full ${
                          isToday ? "bg-[#990011]" : "bg-[#990011]/60"
                        }`}
                      />
                    ),
                  )}
                </span>
              )}
            </div>
          );
        })}
      </div>

      <div className="flex items-center justify-between gap-5 px-1 mt-1">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full border border-[#990011] flex items-center justify-center">
            <span className="text-[10px] text-[#990011] font-semibold">01</span>
          </div>
          <span className="text-sm text-gray-500">{todayLegend}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-[#990011] flex items-center justify-center">
            <span className="text-[10px] text-white font-semibold">01</span>
          </div>
          <span className="text-sm text-gray-500">{selectedDayLegend}</span>
        </div>
      </div>

      <div className="relative z-0">
        <MapView dayEvents={dayEvents} selectedEvent={selectedEvent} />
      </div>
    </div>
  );
};

export default CalendarMonthPanel;
