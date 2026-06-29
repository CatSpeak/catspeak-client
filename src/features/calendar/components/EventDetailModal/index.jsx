import React, { useState, useEffect } from "react"
import { X, ChevronLeft } from "lucide-react"
import LoadingSpinner from "@/shared/components/ui/indicators/LoadingSpinner"
import Modal from "@/shared/components/ui/Modal"
import {
  useGetEventByIdQuery,
  useGetEventOccurrenceByIdQuery,
  useGetSharedEventQuery,
} from "@/store/api/eventsApi"
import EventDetailHeader from "./EventDetailHeader"
import EventDetailBody from "./EventDetailBody"
import EventDetailFooter from "./EventDetailFooter"
import CreateEventModal from "../CreateEventModal"
import { useLanguage } from "@/shared/context/LanguageContext"

const EventDetailModal = ({ event, onClose }) => {
  const { t } = useLanguage()
  const cal = t.calendar || {}
  const [editMode, setEditMode] = useState("none") // "none" | "choice" | "series" | "occurrence"
  const [overrideEvent, setOverrideEvent] = useState(null)

  // Reset override if the base event changes
  useEffect(() => {
    setOverrideEvent(null)
  }, [event])

  const currentEvent = overrideEvent || event

  const eventId = currentEvent?.eventId ?? currentEvent?.id
  const occurrenceId = currentEvent?.occurrenceId
  const token = currentEvent?.token

  const {
    data: sharedData,
    isLoading: isLoadingShared,
    isFetching: isFetchingShared,
  } = useGetSharedEventQuery(token, {
    skip: !token,
  })

  const {
    data: occurrenceDetail,
    isLoading: isLoadingOccurrence,
    isFetching: isFetchingOccurrence,
  } = useGetEventOccurrenceByIdQuery(occurrenceId, {
    skip: !occurrenceId,
  })

  // Prevent 404 GET errors if eventId is accidentally an occurrenceId (e.g. from an old shared link)
  let actualEventId = eventId
  if (occurrenceDetail?.eventId) {
    actualEventId = occurrenceDetail.eventId
  } else if (occurrenceId && eventId === occurrenceId) {
    // Wait for occurrenceDetail to give us the real eventId
    actualEventId = null
  }

  const {
    data: detail,
    isLoading: isLoadingEvent,
    isFetching: isFetchingEvent,
  } = useGetEventByIdQuery(actualEventId, {
    skip: !actualEventId,
  })

  const isLoading =
    isLoadingEvent ||
    isLoadingOccurrence ||
    isLoadingShared ||
    isFetchingEvent ||
    isFetchingOccurrence ||
    isFetchingShared

  if (!event) return null

  let ev
  if (occurrenceId) {
    ev = {
      ...currentEvent,
      ...detail,
      ...occurrenceDetail,
      // Retain the recurrence context from the parent so users know this is part of a series
      isRecurring:
        occurrenceDetail?.isRecurring ||
        detail?.isRecurring ||
        event?.isRecurring,
      recurrenceRule:
        occurrenceDetail?.recurrenceRule ||
        detail?.recurrenceRule ||
        event?.recurrenceRule,
      timezone:
        occurrenceDetail?.timezone || detail?.timezone || event?.timezone,
      isRecurringGroup: false,
      subOccurrences: undefined,
    }
  } else {
    ev = {
      ...currentEvent,
      ...detail,
    }
  }
  
  if (sharedData?.shareLink) {
    ev.shareLink = sharedData.shareLink
  }
  const headerColor = ev.color || "#B91264"

  if (editMode === "series" || editMode === "occurrence") {
    return (
      <CreateEventModal editEvent={ev} onClose={() => setEditMode("none")} />
    )
  }

  return (
    <Modal
      key={eventId}
      open={!!event}
      onClose={onClose}
      showCloseButton={false}
      className="flex flex-col p-0 !max-w-[700px] w-full bg-[#F2F2F2] rounded-none min-[426px]:rounded-[24px] overflow-visible max-[425px]:h-full"
      bodyClassName="flex-1 flex flex-col min-h-0"
    >
      <div className="relative flex flex-col w-full bg-white rounded-none min-[426px]:rounded-[24px] flex-1 min-h-0 min-[426px]:max-h-[90vh]">
        {/* Floating close button */}
        <button
          onClick={onClose}
          className="hidden min-[426px]:block absolute -top-5 -right-5 bg-[#B81919] text-white p-2 rounded-full shadow-[0_4px_10px_rgba(0,0,0,0.3)] z-50 hover:bg-red-800 transition-colors border-[4px] border-white"
        >
          <X size={26} strokeWidth={4} />
        </button>

        {isLoading ? (
          <LoadingSpinner
            className="flex-1 flex flex-col items-center justify-center p-10 min-h-[300px]"
            text={cal.loadingDetails || "Loading details..."}
          />
        ) : (
          <>
            <div
              className={`flex-1 overflow-y-auto ${!occurrenceId && ev?.isRecurringGroup ? "min-[426px]:rounded-b-[24px]" : ""}`}
            >
              <EventDetailHeader
                ev={ev}
                headerColor={headerColor}
                onClose={onClose}
                onBack={
                  overrideEvent ? () => setOverrideEvent(null) : undefined
                }
              />

              <EventDetailBody
                ev={ev}
                event={currentEvent}
                headerColor={headerColor}
                isLoading={isLoading}
                onSelectOccurrence={(sub) => {
                  setOverrideEvent({
                    eventId: actualEventId || eventId,
                    occurrenceId: sub.id,
                    ...sub,
                  })
                }}
              />
            </div>

            {!(!occurrenceId && ev?.isRecurringGroup) && (
              <div className="shrink-0 bg-white min-[426px]:rounded-b-[24px]">
                <EventDetailFooter
                  eventId={actualEventId || eventId}
                  event={ev}
                  onClose={onClose}
                  onEdit={() => {
                    if (ev?.isRecurring && ev?.occurrenceId) {
                      setEditMode("occurrence")
                    } else {
                      setEditMode("series")
                    }
                  }}
                />
              </div>
            )}
          </>
        )}
      </div>
    </Modal>
  )
}

export default EventDetailModal
