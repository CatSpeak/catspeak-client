import React, { } from 'react'
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
  Table2
} from 'lucide-react'
import { IconButton } from '@/shared/components/ui/buttons'
import CalendarMonthView from './CalendarMonthView'
import CalendarWeekView from './CalendarWeekView'
import EventFilter from './EventFilter'
import DatePicker from '@/shared/components/ui/inputs/DatePicker'

import { useLanguage } from '@/shared/context/LanguageContext'
import { useRoleOverride } from "@/features/courses/components/RoleSwitcher"
import { getEventTypeOptions } from '@/features/calendar/data/calendarConstants'
import useFilterModal from '@/features/calendar/hooks/useFilterModal'

const CalendarTab = ({
  currentDate,
  selectedDate,
  events = [],
  viewType = 'month',
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
  const { filterOpen, filterOpenCount, openFilter, closeFilter, handleApplyFilter } = useFilterModal(onApplyFilter)

  const monthNum = currentDate.format('M')
  const yearNum = currentDate.format('YYYY')
  let localizedMonth = `Tháng ${monthNum} ${yearNum}`
  if (language === 'en') {
    localizedMonth = `${currentDate.locale('en').format('MMMM')} ${yearNum}`
  } else if (language === 'zh') {
    localizedMonth = `${yearNum}年 ${monthNum}月`
  }

  const LEGEND = getEventTypeOptions(t, isTeacher)

  return (
    <div className="bg-white p-4 md:p-6 lg:p-8 rounded-xl shadow-sm flex flex-col gap-6 h-full min-h-0">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-border">
        <div className="flex items-center gap-2">
          <IconButton
            onClick={onPrev}
            variant="ghost"
            innerClassName="!text-[#990011] !w-8 !h-8"
            className='!w-10 !h-10'
          >
            <ChevronLeft />
          </IconButton>
          <div className='flex'>
            <span className="text-base md:text-xl font-semibold text-[#1A1A1A] min-w-[80px] max-w-[80px] md:min-w-[150px] text-center flex items-center justify-center gap-2">
              {localizedMonth}
            </span>
            <div className="relative flex items-center justify-center w-6 h-6">
              <CalendarIcon className='mt-6 md:mt-0' />
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
          <IconButton
            onClick={onNext}
            variant="ghost"
            innerClassName="!text-[#990011] !w-8 !h-8"
            className='!w-10 !h-10'
          >
            <ChevronRight />
          </IconButton>
        </div>
        <div className='flex items-center gap-2'>
          <div className="flex items-center gap-1 bg-[#f5f5f5] rounded-full py-1 px-2">
            <IconButton
              onClick={() => onChangeView('week')}
              variant={viewType === 'week' ? 'primary' : 'transparent'}
              className="!w-10 !h-10"
              innerClassName={`!w-8 !h-8 ${viewType === 'week' ? '' : '!text-gray-400 hover:!bg-white'}`}
            >
              <Table2 />
            </IconButton>
            <IconButton
              onClick={() => onChangeView('month')}
              variant={viewType === 'month' ? 'primary' : 'transparent'}
              className="!w-10 !h-10"
              innerClassName={`!w-8 !h-8 ${viewType === 'month' ? '' : '!text-gray-400 hover:!bg-white'}`}
            >
              <CalendarIcon />
            </IconButton>
          </div>

          {viewType === "week" && (
            <IconButton
              variant="outline"
              className='!w-10 !h-10'
              innerClassName="!w-8 !h-8"
              onClick={openFilter}
              title="Bộ lọc"
            >
              <SlidersHorizontal />
            </IconButton>
          )}
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-hidden flex flex-col">
        {viewType === 'month' ? (
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
      <div className="flex flex-wrap items-center justify-center gap-6 pt-6 border-t border-border">
        {LEGEND.map((item) => (
          <div key={item.key} className="flex items-center gap-2">
            <span className="w-5 h-5 rounded-full" style={{ backgroundColor: item.color }} />
            <span className="text-sm text-gray-500">{item.label}</span>
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