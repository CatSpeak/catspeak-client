import dayjs from "dayjs";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  LayoutGrid,
} from "lucide-react";
// import "@/shared/utils/testGeoapify";

const DAY_LABELS = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];

import { useLanguage } from "@/shared/context/LanguageContext";

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
}) => {
  const { t } = useLanguage();
  
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
    <div className="flex flex-col gap-4 bg-white dark:bg-[#1A1A1A] border border-transparent dark:border-[#3F3F3F] p-5 md:p-6 rounded-3xl shadow-sm">
      <div className="flex items-center justify-between   ">
        <div className="flex items-center gap-2">
          <button
            onClick={onPrevMonth}
            className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-gray-100 dark:hover:bg-[#272727] transition-colors"
          >
            <ChevronLeft size={16} className="text-[#990011] dark:text-red-400" />
          </button>
          <span className="text-lg font-semibold text-black dark:text-white min-w-[140px] text-center">
            {localizedMonth}
          </span>
          <button
            onClick={onNextMonth}
            className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-gray-100 dark:hover:bg-[#272727] transition-colors"
          >
            <ChevronRight size={16} className="text-[#990011] dark:text-red-400" />
          </button>
        </div>
        <div className="flex items-center gap-1 bg-gray-100 dark:bg-[#272727] rounded-full p-1">
          <button
            onClick={() => onChangeView && onChangeView("week")}
            className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
              viewType === "week"
                ? "bg-[#990011] text-white"
                : "hover:bg-white dark:hover:bg-[#3D3D3D] text-gray-400 dark:text-neutral-400"
            }`}
          >
            <LayoutGrid size={16} />
          </button>
          <button
            onClick={() => onChangeView && onChangeView("month")}
            className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
              viewType === "month"
                ? "bg-[#990011] text-white"
                : "hover:bg-white dark:hover:bg-[#3D3D3D] text-gray-400 dark:text-neutral-400"
            }`}
          >
            <CalendarIcon size={16} />
          </button>
        </div>
      </div>
      <div className="flex items-center justify-between border-b border-black dark:border-[#3F3F3F] pb-2 mb-4"></div>
      <div className="grid grid-cols-7 gap-1 text-center">
        {DAY_LABELS.map((label) => (
          <div key={label} className="text-md uppercase tracking-wider py-1 text-gray-700 dark:text-neutral-300">
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
                <span className="text-md text-gray-300 dark:text-neutral-600">{day}</span>
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
                  w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14
                  flex items-center justify-center
                  rounded-full
                  text-md font-medium
                  transition-all
                  ${
                    isSelected
                      ? "bg-[#990011] text-white shadow-md"
                      : isToday
                        ? "border border-[#990011] dark:border-red-400 text-[#990011] dark:text-red-400 font-bold hover:bg-[#990011] hover:text-white hover:border-[#990011]"
                        : "text-gray-700 dark:text-neutral-200 hover:border hover:border-[#990011] dark:hover:border-red-400 hover:text-[#990011] dark:hover:text-red-400"
                  }
                `}
              >
                {day}
              </button>
              {eventCount > 0 && (
                <span
                  className={`absolute bottom-1 left-1/2 -translate-x-1/2 w-4 h-[2px] ${
                    isSelected ? "bg-white" : "bg-[#990011] dark:bg-red-400"
                  }`}
                ></span>
              )}
            </div>
          );
        })}
      </div>

      <div className="flex items-center justify-between px-1 mt-1">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full border border-[#990011] dark:border-red-400 flex items-center justify-center">
            <span className="text-[10px] text-[#990011] dark:text-red-400 font-semibold">01</span>
          </div>
          <span className="text-[12px] text-gray-500 dark:text-neutral-400">{todayLegend}</span>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 flex items-center justify-center relative">
            <span className="text-[10px] text-gray-700 dark:text-neutral-300 font-semibold">01</span>
            <span className="absolute bottom-[2px] w-4 h-[2px] bg-[#990011] dark:bg-red-400"></span>
          </div>
          <span className="text-[12px] text-gray-500 dark:text-neutral-400">{t.calendar?.eventDayLegend || "Ngày sự kiện"}</span>
        </div>

        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-[#990011] flex items-center justify-center">
            <span className="text-[10px] text-white font-semibold">01</span>
          </div>
          <span className="text-[12px] text-gray-500 dark:text-neutral-400">{selectedDayLegend}</span>
        </div>
      </div>

    </div>
  );
};

export default CalendarMonthPanel;
