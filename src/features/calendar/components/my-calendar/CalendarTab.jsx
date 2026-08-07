import React, { useState } from 'react'
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

const LEGEND = [
  { type: 'teaching-schedule', label: 'Lịch dạy', color: '#34ce56' },
  { type: 'student-schedule', label: 'Lịch học', color: '#0e6eec' },
  { type: 'my-event', label: 'Sự kiện của tôi', color: '#f83b4f' },
  { type: 'registered-event', label: 'Đã đăng ký', color: '#e2b60a' },
  { type: 'other', label: 'Khác', color: '#888888' },
]

const CalendarTab = ({
  currentDate,
  selectedDate,
  events = [],
  viewType = 'month',
  onChangeView,
  onPrev,
  onNext,
  onSelectDate,
  activeFilters = [],
  onApplyFilter,
}) => {
  const [filterOpen, setFilterOpen] = useState(false)
  const [filterOpenCount, setFilterOpenCount] = useState(0)

  const handleApplyFilter = (selectedTypes) => {
    if (onApplyFilter) onApplyFilter(selectedTypes)
    setFilterOpen(false)
  }

  const monthNum = currentDate.format('M')
  const yearNum = currentDate.format('YYYY')
  const localizedMonth = `Tháng ${monthNum} ${yearNum}`

  return (
    <div className="bg-white p-6 md:p-8 rounded-xl shadow-sm flex flex-col gap-6 h-full min-h-0">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-[#E5E5E5]">
        <div className="flex items-center gap-2">
          <IconButton
            onClick={onPrev}
            variant="ghost"
            innerClassName="!text-[#990011]"
          >
            <ChevronLeft />
          </IconButton>
          <span className="text-xl font-semibold text-[#1A1A1A] min-w-[150px] text-center">
            {localizedMonth}
          </span>
          <IconButton
            onClick={onNext}
            variant="ghost"
            innerClassName="!text-[#990011]"
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
              onClick={() => { setFilterOpenCount(c => c + 1); setFilterOpen(true) }}
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
          />
        )}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center justify-center gap-6 pt-6 border-t border-[#E5E5E5]">
        {LEGEND.map((item) => (
          <div key={item.type} className="flex items-center gap-2">
            <span className="w-5 h-5 rounded-full" style={{ backgroundColor: item.color }} />
            <span className="text-sm text-gray-500">{item.label}</span>
          </div>
        ))}
      </div>

      <EventFilter
        key={filterOpenCount}
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
        onApply={handleApplyFilter}
        activeFilters={activeFilters}
      />
    </div>
  )
}

export default CalendarTab