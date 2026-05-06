import React, { useState } from "react"
import EventDetailModal from "./EventDetailModal/index"
import { useLanguage } from "@/shared/context/LanguageContext"
import { formatLocation } from "../utils/eventFormatters"

const getEventTitle = (title, defaultTitle) => {
  if (!title) return defaultTitle || "Sự kiện"
  return title
}

const EventList = ({
  title,
  data,
  isLoading,
  defaultColor,
  eventFlags = {},
  className = "",
  emptyText = null,
}) => {
  const { t } = useLanguage()
  const [selectedEvent, setSelectedEvent] = useState(null)

  const isOccurrences = Array.isArray(data?.occurrences)
  const events = isOccurrences ? data.occurrences : (data?.events ?? [])

  const handleChipClick = (event) => {
    setSelectedEvent({
      ...event,
      eventId: event.eventId ?? event.id,
      occurrenceId: isOccurrences
        ? (event.occurrenceId ?? event.id)
        : event.occurrenceId,
      ...eventFlags,
    })
  }

  if (isLoading || events.length === 0) return emptyText

  return (
    <>
      <div className={`flex flex-col ${className}`}>
        <h3 className="text-[28px] leading-[1.1] font-bold text-black tracking-tight uppercase">
          {title}
        </h3>

        <div
          className="flex flex-col gap-1 mt-3 mb-1 max-h-[132px] overflow-y-auto pr-2 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-gray-200 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-[#990011]"
        >
          {events.map((event) => (
            <div
              key={event.id}
              onClick={() => handleChipClick(event)}
              className="flex items-center w-full gap-2 px-3 py-1.5 min-h-10 rounded text-white cursor-pointer transition-colors"
              style={{ backgroundColor: event.color || defaultColor }}
              onMouseEnter={(e) => {
                e.currentTarget.style.filter = "brightness(0.85)"
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.filter = "none"
              }}
              title={event.title}
            >
              {/* <div
                className="w-6 h-6 rounded-full shrink-0"
                style={{
                  backgroundColor: "rgba(255,255,255,0.35)",
                }}
              /> */}

              <div className="flex flex-col flex-1 min-w-0 text-left">
                <span className="text-sm font-[600] uppercase tracking-wide truncate">
                  {getEventTitle(event.title, t.calendar?.event || "Sự kiện")}
                </span>
                {(event.location || event.cityName || event.countryName) && (
                  <span className="text-xs opacity-90 truncate font-normal normal-case">
                    {formatLocation(event.location, event.cityName, event.countryName)}
                  </span>
                )}
              </div>

              {/* Optional Participant Count */}
              {event.maxParticipants !== undefined &&
                event.maxParticipants > 0 && (
                  <span className="text-xs font-semibold whitespace-nowrap opacity-90 pl-1">
                    {event.currentParticipants ?? 0}/{event.maxParticipants}
                  </span>
                )}
            </div>
          ))}
        </div>

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

export default EventList
