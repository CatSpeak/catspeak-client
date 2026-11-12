import React, { useMemo } from "react"
import { ChevronDown, CalendarX } from "lucide-react"
import Tabs from "@/shared/components/ui/navigation/Tabs"
import LoadingSpinner from "@/shared/components/ui/indicators/LoadingSpinner"
import EmptyState from "@/shared/components/ui/indicators/EmptyState"

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
 *   isLoading            – đang tải
 *   cal                  – bản dịch
 */
const DayScheduleMonthView = ({
  currentDate,
  eventCountsByDay,
  totalUniqueEvents,
  registeredMonthEvents,
  registeredByDay,
  daysWithRegistered,
  monthTab,
  setMonthTab,
  onSelectDate,
  isLoading = false,
  cal = {},
}) => {
  const eventCounts = eventCountsByDay || {}
  const daysWithEvents = Object.keys(eventCounts)
    .map(Number)
    .sort((a, b) => a - b)
    .filter((day) => eventCounts[day] > 0)

  const totalUpcoming = totalUniqueEvents || 0

  const tabs = useMemo(
    () => [
      {
        id: "upcoming",
        label: cal.upcoming || "Sắp diễn ra",
        badge:
          totalUpcoming > 0 ? (
            <span className="w-[22px] h-[22px] rounded-full text-[11px] font-bold flex items-center justify-center bg-[#F4AB1B] text-white">
              {totalUpcoming}
            </span>
          ) : null,
      },
      {
        id: "registered",
        label: cal.registered || "Đã đăng kí",
        badge:
          daysWithRegistered?.length > 0 ? (
            <span className="w-[22px] h-[22px] rounded-full text-[11px] font-bold flex items-center justify-center bg-[#F4AB1B] text-white">
              {registeredMonthEvents?.length || 0}
            </span>
          ) : null,
      },
    ],
    [
      cal.upcoming,
      cal.registered,
      totalUpcoming,
      daysWithRegistered,
      registeredMonthEvents,
    ],
  )

  return (
    <div className="flex flex-col h-full flex-1 bg-white dark:bg-[#1A1A1A] border border-transparent dark:border-[#3F3F3F] rounded-xl">
      {/* Title */}
      <div className="h-[56px] px-4 flex items-center">
        <h3 className="text-xl font-bold text-black dark:text-white">
          {cal.monthSchedule || "Lịch trình sự kiện tháng"}{" "}
          {currentDate.format("M")}
        </h3>
      </div>

      {/* Tabs */}
      <Tabs
        tabs={tabs}
        activeTab={monthTab}
        onChange={setMonthTab}
        fullWidth={false}
        className="mb-4"
      />

      {/* Content */}
      <div className="flex-1 flex flex-col overflow-y-auto px-4 pb-4 space-y-3 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-[#990011] dark:[&::-webkit-scrollbar-thumb]:bg-red-400 [&::-webkit-scrollbar-thumb]:bg-clip-padding [&::-webkit-scrollbar-thumb]:border-2 [&::-webkit-scrollbar-thumb]:border-solid [&::-webkit-scrollbar-thumb]:border-transparent [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar]:w-[6px] pr-1">
        {isLoading ? (
          <LoadingSpinner
            className="flex-1 flex flex-col items-center justify-center py-8"
            text={cal.loadingEvents || "Đang tải sự kiện..."}
          />
        ) : monthTab === "upcoming" ? (
          daysWithEvents.length === 0 ? (
            <EmptyState
              variant="component"
              icon={CalendarX}
              title={
                cal.noEventsMonth ||
                cal.noEvents ||
                "Không có sự kiện nào trong tháng này"
              }
              className="flex-1 my-auto"
            />
          ) : (
            daysWithEvents.map((day) => (
              <div
                key={day}
                onClick={() => onSelectDate && onSelectDate(day)}
                className="flex items-center justify-between px-5 py-[14px] border border-border dark:border-[#3F3F3F] dark:bg-[#202020] rounded-[16px] cursor-pointer hover:border-[#990011] dark:hover:border-red-400 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="text-[15px] font-medium text-black dark:text-white">
                    {cal.day || "Ngày"} {day < 10 ? `0${day}` : day}
                  </span>
                  <span className="w-[22px] h-[22px] rounded-full text-[11px] font-bold flex items-center justify-center bg-[#F4AB1B] text-white">
                    {eventCounts[day] < 10
                      ? `0${eventCounts[day]}`
                      : eventCounts[day]}
                  </span>
                </div>
                <ChevronDown size={20} className="text-black dark:text-white" />
              </div>
            ))
          )
        ) : // Registered tab
        daysWithRegistered.length === 0 ? (
          <EmptyState
            variant="component"
            icon={CalendarX}
            title={
              cal.noRegisteredEventsMonth ||
              cal.noRegisteredEvents ||
              "Bạn chưa đăng kí sự kiện nào trong tháng này"
            }
            className="flex-1 my-auto"
          />
        ) : (
          daysWithRegistered.map((day) => (
            <div
              key={day}
              onClick={() => onSelectDate && onSelectDate(day)}
              className="flex items-center justify-between px-5 py-[14px] border border-[#990011]/30 dark:border-red-500/40 dark:bg-[#202020] rounded-[16px] cursor-pointer hover:border-[#990011] dark:hover:border-red-400 transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="text-[15px] font-medium text-black dark:text-white">
                  {cal.day || "Ngày"} {day < 10 ? `0${day}` : day}
                </span>
                <span className="w-[22px] h-[22px] rounded-full text-[11px] font-bold flex items-center justify-center bg-[#990011] text-white">
                  {registeredByDay[day] < 10
                    ? `0${registeredByDay[day]}`
                    : registeredByDay[day]}
                </span>
              </div>
              <ChevronDown size={20} className="text-black dark:text-white" />
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default DayScheduleMonthView
