import React, { useRef, useEffect, useState, useMemo } from "react"
import { useSelector } from "react-redux"
import { selectCurrentUser } from "@/store/slices/authSlice"
import { useLanguage } from "@/shared/context/LanguageContext"
import { useGetEventsByDateQuery } from "@/store/api/eventsApi"
import { processOverlappingEvents, parseTime } from "../utils/EventUtils"
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
  const hasScrolledToEvent = useRef(false)
  const [selectedEvent, setSelectedEvent] = useState(null)
  const currentUser = useSelector(selectCurrentUser)

  useEffect(() => {
    // Reset scroll state when selecting a new date
    hasScrolledToEvent.current = false
  }, [selectedDate])

  const displayDate = currentDate.date(selectedDate || 1)
  const formattedDate = displayDate.format("MMMM D, YYYY")
  const ddMmYyyy = displayDate.format("DD/MM/YYYY")

  const localStart = displayDate.startOf("day")
  const localEnd = displayDate.endOf("day")

  const utcDateA = localStart.toISOString()
  const utcDateB = localEnd.toISOString()
  const needsTwoQueries = utcDateA.split("T")[0] !== utcDateB.split("T")[0]

  const { data: eventsDataA, isLoading: isLoadingA } = useGetEventsByDateQuery(
    {
      date: utcDateA,
      ...(currentUser?.accountId ? { userId: currentUser.accountId } : {}),
    },
    { skip: selectedDate === null },
  )

  const { data: eventsDataB, isLoading: isLoadingB } = useGetEventsByDateQuery(
    {
      date: utcDateB,
      ...(currentUser?.accountId ? { userId: currentUser.accountId } : {}),
    },
    { skip: selectedDate === null || !needsTwoQueries },
  )

  const isLoading = isLoadingA || isLoadingB

  // Map API events to the shape EventBlock expects and filter by local date
  const mappedEvents = useMemo(() => {
    const allEvents = []
    const seenIds = new Set()

    const addEvents = (eventsArr) => {
      if (!eventsArr) return
      eventsArr.forEach((ev) => {
        const id = ev.occurrenceId || ev.eventId
        if (!seenIds.has(id)) {
          // Keep only events where local start time is on the selected date
          if (dayjs(ev.startTime).isSame(displayDate, "day")) {
            seenIds.add(id)
            allEvents.push({
              ...ev,
              id,
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
            })
          }
        }
      })
    }

    if (eventsDataA?.events) addEvents(eventsDataA.events)
    if (eventsDataB?.events && needsTwoQueries) addEvents(eventsDataB.events)

    return allEvents
  }, [eventsDataA, eventsDataB, needsTwoQueries, displayDate])

  if (selectedDate === null) return null

  const positionedEvents = processOverlappingEvents(mappedEvents)

  // Handle automatic scrolling to the most recent event once loaded
  useEffect(() => {
    if (!scrollRef.current || isLoading || hasScrolledToEvent.current) return

    let targetTime = 8 // Default to 8 AM
    if (positionedEvents.length > 0) {
      const isToday = displayDate.isSame(dayjs(), "day")
      if (isToday) {
        const currentHour = dayjs().hour() + dayjs().minute() / 60
        // Find the first event that hasn't ended yet, or started within the last hour
        const upcoming = positionedEvents.find(
          (e) =>
            parseTime(e.endTime) >= currentHour ||
            parseTime(e.startTime) >= currentHour - 1
        )
        if (upcoming) {
          targetTime = parseTime(upcoming.startTime)
        } else {
          // All events are in the past today, scroll to the last one
          targetTime = parseTime(
            positionedEvents[positionedEvents.length - 1].startTime
          )
        }
      } else {
        // For other days, scroll to the first event
        targetTime = parseTime(positionedEvents[0].startTime)
      }
    }

    scrollRef.current.scrollTo({
      top: Math.max(0, targetTime * HOUR_HEIGHT - 20),
      behavior: "smooth",
    })
    hasScrolledToEvent.current = true
  }, [positionedEvents, isLoading, displayDate])

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
