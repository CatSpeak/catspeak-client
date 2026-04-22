import React, { useState } from "react"
import { ChevronDown, ChevronUp } from "lucide-react"
import { useGetMyEventsQuery } from "@/store/api/eventsApi"
import EventDetailModal from "./EventDetailModal/index"
import { useLanguage } from "@/shared/context/LanguageContext"

const VISIBLE_CHIP_COUNT = 3

const MyEvents = () => {
  const { t } = useLanguage()
  const [expanded, setExpanded] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState(null)

  const { data, isLoading } = useGetMyEventsQuery()
  const events = data?.events ?? []

  const visibleEvents = expanded ? events : events.slice(0, VISIBLE_CHIP_COUNT)
  const hasMore = events.length > VISIBLE_CHIP_COUNT

  const handleChipClick = (event) => {
    setSelectedEvent({ ...event, isOwner: true })
  }

  if (isLoading || events.length === 0) return null

  return (
    <>
      <div className="flex flex-col mt-5">
        <h3 className="text-[28px] leading-[1.1] font-bold text-black tracking-tight uppercase">
          {t.calendar?.myEvents}
        </h3>

        <div
          className={`flex flex-col gap-2 mt-3 ${expanded ? "max-h-[180px] overflow-y-auto pr-1" : ""}`}
        >
          {visibleEvents.map((event) => (
            <div
              key={event.id}
              onClick={() => handleChipClick(event)}
              className="flex items-center w-full gap-2 px-3 py-1.5 min-h-10 rounded text-white cursor-pointer transition-colors"
              style={{ backgroundColor: event.color || "#4ECDC4" }}
              onMouseEnter={(e) => {
                e.currentTarget.style.filter = "brightness(0.85)"
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.filter = "none"
              }}
              title={event.title}
            >
              <div
                className="w-3.5 h-3.5 rounded-full shrink-0"
                style={{
                  backgroundColor: "rgba(255,255,255,0.35)",
                }}
              />
              <span className="text-sm font-[600] uppercase tracking-wide truncate flex-1 min-w-0 text-left">
                {event.title || t.calendar?.event}
              </span>
            </div>
          ))}
        </div>

        {hasMore && (
          <button
            onClick={() => setExpanded((prev) => !prev)}
            className="flex items-center gap-1 mt-2 text-xs font-semibold text-gray-500 hover:text-black transition-colors cursor-pointer"
          >
            {expanded ? (
              <>
                <ChevronUp size={14} />
                {t.calendar?.collapse}
              </>
            ) : (
              <>
                <ChevronDown size={14} />
                {t.calendar?.seeMore} (
                {events.length - VISIBLE_CHIP_COUNT})
              </>
            )}
          </button>
        )}
      </div>

      {/* Event detail modal */}
      {selectedEvent && (
        <EventDetailModal
          event={selectedEvent}
          onClose={() => setSelectedEvent(null)}
        />
      )}
    </>
  )
}

export default MyEvents
