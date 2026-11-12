import React, { useMemo } from "react"
import { ChevronLeft, CalendarX } from "lucide-react"
import Tabs from "@/shared/components/ui/navigation/Tabs"
import IconButton from "@/shared/components/ui/buttons/IconButton"
import LoadingSpinner from "@/shared/components/ui/indicators/LoadingSpinner"
import EmptyState from "@/shared/components/ui/indicators/EmptyState"
import EventCard from "../EventCard"
import TimeSectionIcon from "./TimeSectionIcon"
import DayScheduleActionModal from "./DayScheduleActionModal"

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
  currentDate,
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
  const tabs = useMemo(
    () => [
      {
        id: "unregistered",
        label: cal.unregistered || "Chưa đăng ký",
        badge:
          unregistered?.length > 0 ? (
            <span className="w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center bg-[#F4AB1B] text-black">
              {unregistered.length}
            </span>
          ) : null,
      },
      {
        id: "registered",
        label: cal.registered || "Đã đăng ký",
        badge:
          registered?.length > 0 ? (
            <span className="w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center bg-[#F4AB1B] text-black">
              {registered.length}
            </span>
          ) : null,
      },
    ],
    [cal.unregistered, cal.registered, unregistered, registered],
  )

  return (
    <div className="flex flex-col h-full flex-1 bg-white dark:bg-[#1A1A1A] border border-transparent dark:border-[#3F3F3F] rounded-xl shadow-sm">
      {/* Title */}
      <div className="flex items-center gap-2 h-[56px] pl-1 pr-4">
        <IconButton
          variant="ghost"
          onClick={() => onSelectDate && onSelectDate(null)}
          title={cal.backToMonth || "Quay lại tháng"}
          aria-label={cal.backToMonth || "Quay lại tháng"}
        >
          <ChevronLeft />
        </IconButton>

        <h3 className="text-xl font-bold text-black dark:text-white min-w-[140px]">
          {dateLabel}
        </h3>
      </div>

      {/* Tabs */}
      <Tabs
        tabs={tabs}
        activeTab={tab}
        onChange={setTab}
        fullWidth={false}
        className="mb-4"
      />

      {/* Events List */}
      <div className="flex-1 flex flex-col overflow-y-auto px-4 pb-4 space-y-4 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-[#990011] dark:[&::-webkit-scrollbar-thumb]:bg-red-400 [&::-webkit-scrollbar-thumb]:bg-clip-padding [&::-webkit-scrollbar-thumb]:border-2 [&::-webkit-scrollbar-thumb]:border-solid [&::-webkit-scrollbar-thumb]:border-transparent [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar]:w-[6px] pr-1">
        {isLoading ? (
          <LoadingSpinner
            className="flex-1 flex flex-col items-center justify-center py-8"
            text={cal.loadingEvents || "Đang tải sự kiện..."}
          />
        ) : !selectedDate ? (
          <EmptyState
            variant="component"
            icon={CalendarX}
            title={
              cal.selectDayToView || "Chọn một ngày trên lịch để xem sự kiện"
            }
            className="flex-1 my-auto"
          />
        ) : displayEvents.length === 0 ? (
          <EmptyState
            variant="component"
            icon={CalendarX}
            title={
              tab === "registered"
                ? cal.noRegisteredEventsDay ||
                  "Bạn chưa đăng ký sự kiện nào trong ngày này"
                : cal.noEventsDay ||
                  cal.noEvents ||
                  "Không có sự kiện nào trong ngày này"
            }
            className="flex-1 my-auto"
          />
        ) : (
          ["morning", "noon", "afternoon", "evening"].map((section) => {
            const events = grouped[section]
            if (!events.length) return null
            return (
              <div key={section} className="flex flex-col gap-2">
                <div className="flex items-center gap-2 px-1 mb-1">
                  <TimeSectionIcon section={section} />
                  <span className="text-sm font-medium text-black dark:text-white">
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
            )
          })
        )}
      </div>

      <DayScheduleActionModal
        actionStatus={actionStatus}
        onClose={() => setActionStatus(null)}
        cal={cal}
      />
    </div>
  )
}

export default DayScheduleDayView
