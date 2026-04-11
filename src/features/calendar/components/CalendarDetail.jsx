import React, { useRef, useEffect, useState, useMemo } from "react"
import { useSelector } from "react-redux"
import { selectCurrentUser } from "@/store/slices/authSlice"
import { useLanguage } from "@/shared/context/LanguageContext"
import { useGetEventsByDateQuery } from "@/store/api/eventsApi"
import { processOverlappingEvents } from "../utils/EventUtils"
import TimelineGrid from "./TimelineGrid"
import EventBlock from "./EventBlock"
import EventDetailModal from "./EventDetailModal/index"
import dayjs from "dayjs"

const HOUR_HEIGHT = 100 // pixels per hour
const COL_WIDTH = 180 // minimum px width per overlapping event column

const DEFAULT_COLOR = "#B91264"

const CalendarDetail = ({ selectedDate, currentDate, onClose }) => {
  const { t } = useLanguage()
  const scrollRef = useRef(null)
  const [selectedEvent, setSelectedEvent] = useState(null)
  const currentUser = useSelector(selectCurrentUser)

  useEffect(() => {
    // Scroll to 8 AM by default when opened
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 8 * HOUR_HEIGHT - 20
    }
  }, [selectedDate])

  if (selectedDate === null) return null

  const displayDate = currentDate.date(selectedDate)
  const formattedDate = displayDate.format("MMMM D, YYYY")
  const ddMmYyyy = displayDate.format("DD/MM/YYYY")

  // Fetch events for the selected date from the API
  const { data: eventsByDateData, isLoading } = useGetEventsByDateQuery(
    {
      date: displayDate.toISOString(),
      ...(currentUser?.id ? { userId: currentUser.id } : {}),
    },
    { skip: selectedDate === null },
  )

  // Map API events to the shape EventBlock expects
  const mappedEvents = useMemo(() => {
    if (!eventsByDateData?.events) return []

    return eventsByDateData.events.map((ev) => ({
      id: ev.occurrenceId ?? ev.eventId,
      eventId: ev.eventId,
      occurrenceId: ev.occurrenceId,
      title: ev.title,
      startTime: dayjs(ev.startTime).format("HH:mm"),
      endTime: dayjs(ev.endTime).format("HH:mm"),
      originalStartTime: ev.startTime, // preserve full ISO for API calls
      originalEndTime: ev.endTime, // preserve full ISO for API calls
      color: ev.color || DEFAULT_COLOR,
      isRegistered: ev.isRegistered,
      currentParticipants: ev.currentParticipants,
      maxParticipants: ev.maxParticipants,
      location: ev.location || "",
    }))
  }, [eventsByDateData])

  const positionedEvents = processOverlappingEvents(mappedEvents)

  // Compute canvas width: at least 1 column, grow with max parallel cols
  const maxCols = positionedEvents.reduce(
    (m, e) => Math.max(m, e.groupCols ?? 1),
    1,
  )
  const eventsCanvasWidth = maxCols * COL_WIDTH

  return (
    <div className="col-span-7 w-full h-full min-h-[400px] sm:min-h-[500px]">
      <div className="bg-white/80 backdrop-blur-md rounded-2xl border border-[#E5E5E5] shadow-sm p-3 w-full flex flex-col h-[500px] sm:h-[700px] transition-all">
        {/* Calendar Day View Scroll Container */}
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto overflow-x-auto pr-2 bg-gray-50/30 rounded-xl relative [&::-webkit-scrollbar]:w-[6px] [&::-webkit-scrollbar]:h-[6px] [&::-webkit-scrollbar-track]:bg-gray-200 [&::-webkit-scrollbar-thumb]:bg-[#990011] [&::-webkit-scrollbar-thumb]:rounded-[3px]"
        >
          <div
            className="relative mt-5"
            style={{
              height: `${24 * HOUR_HEIGHT}px`,
              minWidth: `${eventsCanvasWidth + 64}px`,
            }}
          >
            {/* Timeline Background Grid */}
            <TimelineGrid hourHeight={HOUR_HEIGHT} />

            {/* Events Rendering */}
            <div
              className="absolute top-0 bottom-0 left-16"
              style={{ width: `${eventsCanvasWidth}px` }}
            >
              {isLoading ? (
                <div className="flex items-center justify-center h-full text-gray-400 text-sm">
                  {t.calendar?.loadingEvents || "Loading events…"}
                </div>
              ) : positionedEvents.length === 0 ? (
                <div className="flex items-center justify-center h-full text-gray-300 text-sm select-none">
                  {t.calendar?.noEvents || "No events for this day"}
                </div>
              ) : (
                positionedEvents.map((event) => (
                  <EventBlock
                    key={event.id}
                    event={event}
                    hourHeight={HOUR_HEIGHT}
                    ddMmYyyy={ddMmYyyy}
                    colWidth={COL_WIDTH}
                    onClick={() => setSelectedEvent(event)}
                  />
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      <EventDetailModal
        event={selectedEvent}
        onClose={() => setSelectedEvent(null)}
        ddMmYyyy={ddMmYyyy}
      />
    </div>
  )
}

export default CalendarDetail
