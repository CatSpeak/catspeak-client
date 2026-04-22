import React, { useState } from "react"
import { useSearchParams } from "react-router-dom"
import dayjs from "dayjs"
import CalendarHeadline from "../components/CalendarHeadline"
import CalendarToolBar from "../components/CalendarToolBar"
import Calendar from "../components/Calendar"
import EventDetailModal from "../components/EventDetailModal/index"

const CalendarPage = () => {
  const [currentDate, setCurrentDate] = useState(dayjs())
  const [searchParams, setSearchParams] = useSearchParams()
  const eventIdFromUrl = searchParams.get("eventId")
  const occurrenceIdFromUrl = searchParams.get("occurrenceId")

  const handleNextMonth = () => setCurrentDate((prev) => prev.add(1, "month"))
  const handlePrevMonth = () =>
    setCurrentDate((prev) => prev.subtract(1, "month"))

  return (
    <div className="w-full">
      <div className="flex flex-col lg:flex-row gap-5 w-full min-h-[480px]">
        <div className="flex items-center shrink-0 w-full lg:w-auto">
          <CalendarHeadline
            currentDate={currentDate}
            onNextMonth={handleNextMonth}
            onPrevMonth={handlePrevMonth}
          />
        </div>
        <div className="flex flex-col justify-center w-full flex-1 min-w-0">
          <div className="flex flex-col">
            <CalendarToolBar />
            <Calendar currentDate={currentDate} />
          </div>
        </div>
      </div>

      {eventIdFromUrl && (
        <EventDetailModal
          event={{ 
            eventId: eventIdFromUrl, 
            occurrenceId: occurrenceIdFromUrl || undefined 
          }}
          onClose={() => {
            const newParams = new URLSearchParams(searchParams)
            newParams.delete("eventId")
            newParams.delete("occurrenceId")
            setSearchParams(newParams, { replace: true })
          }}
        />
      )}
    </div>
  )
}

export default CalendarPage
