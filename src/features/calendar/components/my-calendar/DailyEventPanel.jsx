import React, { useState } from 'react'
import { SlidersHorizontal } from 'lucide-react'
import { IconButton } from '@/shared/components/ui/buttons'
import EventCard from './EventCard'
import EventCardDetail from './EventCardDetail'
import EventFilter from './EventFilter'
import { useLanguage } from '@/shared/context/LanguageContext'
import useFilterModal from '@/features/calendar/hooks/useFilterModal'

const DailyEventPanel = ({ date = '20/01', events = [], activeFilters = [], onApplyFilter, onShareEvent, classesOptions }) => {
  const { t } = useLanguage()
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [prevDate, setPrevDate] = useState(date)
  const { filterOpen, filterOpenCount, openFilter, closeFilter, handleApplyFilter } = useFilterModal(onApplyFilter)

  // Reset selected event when date changes
  if (date !== prevDate) {
    setPrevDate(date)
    setSelectedEvent(null)
  }

  if (selectedEvent) {
    return (
      <div className="flex flex-col min-h-0 w-full border bg-white rounded-xl h-full flex-1">
        <EventCardDetail event={selectedEvent} onBack={() => setSelectedEvent(null)} onShareEvent={onShareEvent} />
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
          onClick={openFilter}
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

export default DailyEventPanel