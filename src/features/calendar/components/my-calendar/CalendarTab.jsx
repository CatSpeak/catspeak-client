import React from "react"
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
  Table2,
} from "lucide-react"
import { IconButton } from "@/shared/components/ui/buttons"
import CalendarMonthView from "./CalendarMonthView"
import CalendarWeekView from "./CalendarWeekView"
import EventFilter from "./EventFilter"
import DatePicker from "@/shared/components/ui/inputs/DatePicker"

import { useLanguage } from "@/shared/context/LanguageContext"
import { useRoleOverride } from "@/features/courses/components/RoleSwitcher"
import { getEventTypeOptions } from "@/features/calendar/data/calendarConstants"
import useFilterModal from "@/features/calendar/hooks/useFilterModal"

const CalendarTab = ({
  currentDate,
  selectedDate,
  events = [],
  viewType = "month",
  onChangeView,
  onPrev,
  onNext,
  onChangeMonth,
  onSelectDate,
  activeFilters = [],
  onApplyFilter,
  classesOptions,
}) => {
  const { t, language } = useLanguage()
  const { isTeacher } = useRoleOverride()
  const {
    filterOpen,
    filterOpenCount,
    openFilter,
    closeFilter,
    handleApplyFilter,
  } = useFilterModal(onApplyFilter)

  const monthNum = currentDate.format("M")
  const yearNum = currentDate.format("YYYY")
  let localizedMonth = `Tháng ${monthNum} ${yearNum}`
  if (language === "en") {
    localizedMonth = `${currentDate.locale("en").format("MMMM")} ${yearNum}`
  } else if (language === "zh") {
    localizedMonth = `${yearNum}年 ${monthNum}月`
  }

  const LEGEND = getEventTypeOptions(t, isTeacher)

  return (
    <div className="bg-white dark:bg-[#1A1A1A] border border-transparent dark:border-[#3F3F3F] rounded-xl shadow-sm flex flex-col h-full min-h-0">
      {/* Header */}
      <div className="flex items-center justify-between h-[56px] px-1 border-b border-border dark:border-[#3F3F3F]">
        <div className="flex items-center gap-2">
          <IconButton onClick={onPrev} variant="ghost">
            <ChevronLeft />
          </IconButton>

          <div className="flex">
            <span className="text-base text-[#1A1A1A] dark:text-white min-w-[80px] md:min-w-[150px] text-center flex items-center justify-center gap-2">
              <span className="hidden md:inline">{localizedMonth}</span>
              <span className="md:hidden">
                {monthNum.padStart(2, "0")}/{yearNum}
              </span>
            </span>

            <div className="relative flex items-center justify-center w-6 h-6">
              <CalendarIcon />

              <div className="absolute top-0 left-0 w-6 h-6 opacity-0 overflow-hidden cursor-pointer">
                <DatePicker
                  value={currentDate.toDate()}
                  onChange={(date) => {
                    if (date && onChangeMonth) {
                      onChangeMonth(date)
                    }
                  }}
                  className="w-6 h-6"
                />
              </div>
            </div>
          </div>

          <IconButton onClick={onNext} variant="ghost">
            <ChevronRight />
          </IconButton>
        </div>

        <div className="flex items-center gap-2">
          {viewType === "week" && (
            <IconButton variant="secondary" onClick={openFilter} title="Bộ lọc">
              <SlidersHorizontal />
            </IconButton>
          )}

          <div className="flex items-center gap-2 bg-[#f5f5f5] dark:bg-[#272727] rounded-full">
            <IconButton
              onClick={() => onChangeView("week")}
              variant={viewType === "week" ? "primary" : "transparent"}
            >
              <Table2 />
            </IconButton>

            <IconButton
              onClick={() => onChangeView("month")}
              variant={viewType === "month" ? "primary" : "transparent"}
            >
              <CalendarIcon />
            </IconButton>
          </div>
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-hidden flex flex-col">
        {viewType === "month" ? (
          <CalendarMonthView
            currentDate={currentDate}
            selectedDate={selectedDate}
            events={events}
            onSelectDate={onSelectDate}
          />
        ) : (
          <CalendarWeekView
            currentDate={currentDate}
            selectedDate={selectedDate}
            events={events}
            onSelectDate={onSelectDate}
            onPrev={onPrev}
            onNext={onNext}
          />
        )}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center justify-center gap-4 p-4 border-t border-border dark:border-[#3F3F3F]">
        {LEGEND.map((item) => (
          <div key={item.key} className="flex items-center gap-2">
            <span
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: item.color }}
            />
            <span className="text-sm text-gray-500 dark:text-neutral-400">
              {item.label}
            </span>
          </div>
        ))}
      </div>

      <EventFilter
        key={filterOpenCount}
        open={filterOpen}
        onClose={closeFilter}
        onApply={handleApplyFilter}
        activeFilters={activeFilters}
        classesOptions={classesOptions}
      />
    </div>
  )
}

export default CalendarTab
