import React from "react";
import EventCard from "../EventCard";
import TimeSectionIcon from "./TimeSectionIcon";
import DayScheduleActionModal from "./DayScheduleActionModal";

/**
 * View ngày: hiển thị danh sách sự kiện theo buổi trong ngày.
 *
 * Props:
 *   dateLabel      – chuỗi tiêu đề ngày
 *   selectedDate   – ngày được chọn (number | null)
 *   tab            – "unregistered" | "registered"
 *   setTab         – setter
 *   unregistered   – sự kiện chưa đăng ký
 *   registered     – sự kiện đã đăng ký
 *   displayEvents  – sự kiện hiển thị sau khi lọc
 *   grouped        – { morning, noon, afternoon, evening }
 *   sectionLabels  – { morning, noon, afternoon, evening }
 *   selectedEvent  – sự kiện đang được chọn
 *   isLoading      – đang tải
 *   actionStatus   – { type, status } | null
 *   setActionStatus – setter
 *   onSelectDate   – (day: number | null) => void
 *   onEventClick   – (event) => void
 *   cal            – bản dịch
 */
const DayScheduleDayView = ({
  dateLabel,
  selectedDate,
  tab,
  setTab,
  unregistered,
  registered,
  displayEvents,
  grouped,
  sectionLabels,
  selectedEvent,
  isLoading,
  actionStatus,
  setActionStatus,
  onSelectDate,
  onEventClick,
  cal = {},
}) => {
  return (
    <div className="flex flex-col h-full bg-white p-5 md:p-6 lg:p-6 rounded-3xl shadow-sm">
      {/* Title */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-black min-w-[140px]">
          {dateLabel}
        </h3>
        <button
          onClick={() => onSelectDate && onSelectDate(null)}
          className="text-[13px] font-medium text-[#990011] hover:underline"
        >
          {cal.backToMonth || "Quay lại tháng"}
        </button>
      </div>

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
            <span className="w-6 h-6 rounded-full text-xs flex items-center justify-center bg-[#F4AB1B] text-black">
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
                    onClick={onEventClick}
                    isSelected={selectedEvent?.id === event.id}
                    onActionComplete={(type, status) =>
                      setActionStatus({ type, status })
                    }
                  />
                ))}
              </div>
            );
          })
        )}
      </div>

      <DayScheduleActionModal
        actionStatus={actionStatus}
        onClose={() => setActionStatus(null)}
        cal={cal}
      />
    </div>
  );
};

export default DayScheduleDayView;
