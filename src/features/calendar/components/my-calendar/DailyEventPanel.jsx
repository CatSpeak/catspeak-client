import React, { useState } from 'react'
import { SlidersHorizontal } from 'lucide-react'
import { IconButton } from '@/shared/components/ui/buttons'
import EventCard from './EventCard'
import EventFilter from './EventFilter'

const DailyEventPanel = ({ date = '20/01', events = [], activeFilters = [], onApplyFilter }) => {
  const [filterOpen, setFilterOpen] = useState(false)
  const [filterOpenCount, setFilterOpenCount] = useState(0)

  const handleApplyFilter = (selectedTypes) => {
    if (onApplyFilter) onApplyFilter(selectedTypes)
    setFilterOpen(false)
  }

  return (
    <div className="flex flex-col min-h-0 space-y-4 w-full border p-6 bg-white rounded-xl h-full flex-1">
      {/* Panel Header */}
      <div className="flex items-center justify-between">
        <p className="text-lg font-semibold text-[#1A1A1A]">
          Lịch trình sự kiện ngày {date}
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
            <EventCard key={event.id} event={event} />
          ))
        ) : (
          <p className="text-center text-[#7B7979] py-8">
            Không có sự kiện nào
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