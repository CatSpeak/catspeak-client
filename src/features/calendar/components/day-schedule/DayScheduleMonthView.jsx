import React from "react";
import { ChevronDown } from "lucide-react";

/**
 * View tổng quan tháng: hiển thị danh sách ngày có sự kiện và ngày có đăng ký.
 *
 * Props:
 *   currentDate          – dayjs object (tháng hiện tại)
 *   eventCountsByDay     – { [day]: count } – số sự kiện theo ngày
 *   registeredMonthEvents – array sự kiện đã đăng ký trong tháng
 *   registeredByDay      – { [day]: count }
 *   daysWithRegistered   – number[] – danh sách ngày có đăng ký
 *   monthTab             – "upcoming" | "registered"
 *   setMonthTab          – setter
 *   onSelectDate         – (day: number) => void
 *   cal                  – bản dịch
 */
const DayScheduleMonthView = ({
  currentDate,
  eventCountsByDay,
  registeredMonthEvents,
  registeredByDay,
  daysWithRegistered,
  monthTab,
  setMonthTab,
  onSelectDate,
  cal = {},
}) => {
  const eventCounts = eventCountsByDay || {};
  const daysWithEvents = Object.keys(eventCounts)
    .map(Number)
    .sort((a, b) => a - b)
    .filter((day) => eventCounts[day] > 0);

  const totalUpcoming = daysWithEvents.reduce(
    (acc, day) => acc + eventCounts[day],
    0,
  );

  return (
    <div className="flex flex-col h-full bg-white p-5 md:p-6 lg:p-6 rounded-3xl shadow-sm">
      <h3 className="text-[22px] font-medium text-black mb-6">
        {cal.monthSchedule || "Lịch trình sự kiện tháng"}{" "}
        {currentDate.format("M")}
      </h3>

      {/* Tabs */}
      <div className="flex w-full border-b border-[#E5E5E5] mb-6">
        <button
          onClick={() => setMonthTab("upcoming")}
          className={`flex-1 flex items-center justify-center gap-2 pb-3 text-[16px] font-medium border-b-2 transition-all ${
            monthTab === "upcoming"
              ? "border-[#990011] text-[#990011]"
              : "border-transparent text-gray-400 hover:text-black"
          }`}
        >
          {cal.upcoming || "Sắp diễn ra"}
          {totalUpcoming > 0 && (
            <span className="w-[22px] h-[22px] rounded-full text-[11px] font-bold flex items-center justify-center bg-[#F4AB1B] text-white">
              {totalUpcoming}
            </span>
          )}
        </button>
        <button
          onClick={() => setMonthTab("registered")}
          className={`flex-1 flex items-center justify-center gap-2 pb-3 text-[16px] font-medium border-b-2 transition-all ${
            monthTab === "registered"
              ? "border-[#990011] text-[#990011]"
              : "border-transparent text-gray-400 hover:text-black"
          }`}
        >
          {cal.registered || "Đã đăng kí"}
          {daysWithRegistered.length > 0 && (
            <span className="w-[22px] h-[22px] rounded-full text-[11px] font-bold flex items-center justify-center bg-[#F4AB1B] text-white">
              {registeredMonthEvents.length}
            </span>
          )}
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto space-y-3 [&::-webkit-scrollbar]:hidden pr-1">
        {monthTab === "upcoming" ? (
          daysWithEvents.length === 0 ? (
            <div className="text-sm text-gray-400 py-8 text-center mt-10">
              {cal.noEvents || "Không có sự kiện nào trong tháng này"}
            </div>
          ) : (
            daysWithEvents.map((day) => (
              <div
                key={day}
                onClick={() => onSelectDate && onSelectDate(day)}
                className="flex items-center justify-between px-5 py-[14px] border border-[#E5E5E5] rounded-[16px] cursor-pointer hover:border-[#990011] transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="text-[15px] font-medium text-black">
                    {cal.day || "Ngày"} {day < 10 ? `0${day}` : day}
                  </span>
                  <span className="w-[22px] h-[22px] rounded-full text-[11px] font-bold flex items-center justify-center bg-[#F4AB1B] text-white">
                    {eventCounts[day] < 10
                      ? `0${eventCounts[day]}`
                      : eventCounts[day]}
                  </span>
                </div>
                <ChevronDown size={20} className="text-black" />
              </div>
            ))
          )
        ) : (
          // Registered tab
          daysWithRegistered.length === 0 ? (
            <div className="text-sm text-gray-400 py-8 text-center mt-10">
              {cal.noRegisteredEvents ||
                "Bạn chưa đăng kí sự kiện nào trong tháng này"}
            </div>
          ) : (
            daysWithRegistered.map((day) => (
              <div
                key={day}
                onClick={() => onSelectDate && onSelectDate(day)}
                className="flex items-center justify-between px-5 py-[14px] border border-[#990011]/30 rounded-[16px] cursor-pointer hover:border-[#990011] transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="text-[15px] font-medium text-black">
                    {cal.day || "Ngày"} {day < 10 ? `0${day}` : day}
                  </span>
                  <span className="w-[22px] h-[22px] rounded-full text-[11px] font-bold flex items-center justify-center bg-[#990011] text-white">
                    {registeredByDay[day] < 10
                      ? `0${registeredByDay[day]}`
                      : registeredByDay[day]}
                  </span>
                </div>
                <ChevronDown size={20} className="text-black" />
              </div>
            ))
          )
        )}
      </div>
    </div>
  );
};

export default DayScheduleMonthView;
