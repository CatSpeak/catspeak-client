import React, { useState } from 'react'
import { SlidersHorizontal } from 'lucide-react'
import { IconButton } from '@/shared/components/ui/buttons'
import EventCard from './EventCard'
import EventCardDetail from './EventCardDetail'
import EventFilter from './EventFilter'
import { useLanguage } from '@/shared/context/LanguageContext'

const DailyEventPanel = ({ date = '20/01', events = [], activeFilters = [], onApplyFilter }) => {
  const { t } = useLanguage()
  const [filterOpen, setFilterOpen] = useState(false)
  const [filterOpenCount, setFilterOpenCount] = useState(0)
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [prevDate, setPrevDate] = useState(date)

  // Reset selected event when date changes
  if (date !== prevDate) {
    setPrevDate(date)
    setSelectedEvent(null)
  }

  const handleApplyFilter = (selectedTypes) => {
    if (onApplyFilter) onApplyFilter(selectedTypes)
    setFilterOpen(false)
  }

  if (selectedEvent) {
    return (
      <div className="flex flex-col min-h-0 w-full border bg-white rounded-xl h-full flex-1">
        <EventCardDetail event={selectedEvent} onBack={() => setSelectedEvent(null)} />
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-0 space-y-4 w-full border p-6 bg-white rounded-xl h-full flex-1">
      {/* Panel Header */}
      <div className="flex items-center justify-between">
        <p className="text-lg font-semibold text-[#1A1A1A]">
          {t.calendar?.daySchedule || 'Lịch trình sự kiện ngày'} {date}
        </p>
        <IconButton
          variant="outline"
          className='!w-10 !h-10'
          innerClassName="!w-8 !h-8"
          onClick={() => { setFilterOpenCount(c => c + 1); setFilterOpen(true) }}
          title="Bộ lọc"
        >
          <SlidersHorizontal />
        </IconButton>
      </div>

      {/* Event List */}
      <div className="space-y-3 overflow-y-auto flex-1 min-h-0 scrollbar-app pr-1">
        {events.length > 0 ? (
          events.map((event) => (
            <EventCard key={event.id} event={event} onClick={setSelectedEvent} />
          ))
        ) : (
          <p className="text-center text-[#7B7979] py-8">
            {t.calendar?.noEvents || 'Không có sự kiện nào'}
          </p>
        )}
      </div>

      {/* Filter Modal */}
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

export default DailyEventPanel