import React, { useState } from "react"
import { X } from "lucide-react"
import LoadingSpinner from "@/shared/components/ui/indicators/LoadingSpinner"
import Modal from "@/shared/components/ui/Modal"
import {
  useGetEventByIdQuery,
  useGetEventOccurrenceByIdQuery,
} from "@/store/api/eventsApi"
import EventDetailHeader from "./EventDetailHeader"
import EventDetailBody from "./EventDetailBody"
import EventDetailFooter from "./EventDetailFooter"
import CreateEventModal from "../CreateEventModal"
import OverrideOccurrenceModal from "../OverrideOccurrenceModal"
import EditChoiceModal from "./EditChoiceModal"
import { useLanguage } from "@/shared/context/LanguageContext"

const EventDetailModal = ({ event, onClose }) => {
  const { t } = useLanguage()
  const cal = t.calendar || {}
  const [editMode, setEditMode] = useState("none") // "none" | "choice" | "series" | "occurrence"

  const eventId = event?.eventId ?? event?.id
  const occurrenceId = event?.occurrenceId

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
    isFetchingEvent ||
    isFetchingOccurrence

  if (!event) return null

  // Merge: prefer fully-loaded detail, fall back to the summary object, then override with occurrence specifics
  const ev = detail
    ? {
        ...event,
        ...detail,
        ...occurrenceDetail,
        location:
          occurrenceDetail?.location ||
          detail?.location ||
          event?.location ||
          "",
        participants:
          occurrenceDetail?.participants ??
          detail?.participants ??
          event?.participants,
        currentParticipants:
          occurrenceDetail?.participants?.length ??
          occurrenceDetail?.currentParticipants ??
          detail?.participants?.length ??
          detail?.currentParticipants ??
          event?.currentParticipants,
        maxParticipants:
          occurrenceDetail?.maxParticipants ??
          detail?.maxParticipants ??
          event?.maxParticipants,
        isRegistered:
          occurrenceDetail?.isRegistered ??
          detail?.isRegistered ??
          event?.isRegistered,
        registrationId:
          occurrenceDetail?.registrationId !== undefined
            ? occurrenceDetail.registrationId
            : detail?.registrationId !== undefined
            ? detail.registrationId
            : event?.registrationId,
      }
    : {
        ...event,
        ...occurrenceDetail,
        location: occurrenceDetail?.location || event?.location || "",
        participants: occurrenceDetail?.participants ?? event?.participants,
        currentParticipants:
          occurrenceDetail?.participants?.length ??
          occurrenceDetail?.currentParticipants ??
          event?.currentParticipants,
        isRegistered: occurrenceDetail?.isRegistered ?? event?.isRegistered,
        registrationId:
          occurrenceDetail?.registrationId !== undefined
            ? occurrenceDetail.registrationId
            : event?.registrationId,
      }
  const headerColor = ev.color || "#B91264"

  if (editMode === "series") {
    return (
      <CreateEventModal editEvent={ev} onClose={() => setEditMode("none")} />
    )
  }

  if (editMode === "occurrence") {
    return (
      <OverrideOccurrenceModal
        event={ev}
        occurrenceId={event?.occurrenceId}
        onClose={() => setEditMode("none")}
      />
    )
  }

  if (editMode === "choice") {
    return (
      <EditChoiceModal
        open={true}
        onClose={() => setEditMode("none")}
        onSelect={(mode) => setEditMode(mode)}
        headerColor={headerColor}
      />
    )
  }

  return (
    <Modal
      key={eventId}
      open={!!event}
      onClose={onClose}
      showCloseButton={false}
      className="p-0 !max-w-[700px] w-full bg-[#F2F2F2] rounded-none min-[426px]:rounded-xl overflow-visible"
    >
      <div className="relative flex flex-col w-full h-full bg-white rounded-none min-[426px]:rounded-xl">
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
            <div className="flex-1 overflow-y-auto">
              <EventDetailHeader
                ev={ev}
                headerColor={headerColor}
                onClose={onClose}
              />

              <EventDetailBody
                ev={ev}
                event={event}
                headerColor={headerColor}
                isLoading={isLoading}
              />
            </div>

            <div className="shrink-0 bg-white min-[426px]:rounded-b-xl">
              <EventDetailFooter
                eventId={actualEventId || eventId}
                event={ev}
                onClose={onClose}
                onEdit={() => {
                  if (ev?.isRecurring) {
                    setEditMode("choice")
                  } else {
                    setEditMode("series")
                  }
                }}
              />
            </div>
          </>
        )}
      </div>
    </Modal>
  )
}

export default EventDetailModal
