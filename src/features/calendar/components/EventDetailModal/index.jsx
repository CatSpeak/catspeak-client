import React, { useState } from "react"
import { X } from "lucide-react"
import Modal from "@/shared/components/ui/Modal"
import { useGetEventByIdQuery } from "@/store/api/eventsApi"
import EventDetailHeader from "./EventDetailHeader"
import EventDetailBody from "./EventDetailBody"
import EventDetailFooter from "./EventDetailFooter"
import CreateEventModal from "../CreateEventModal"
import OverrideOccurrenceModal from "../OverrideOccurrenceModal"
import { useLanguage } from "@/shared/context/LanguageContext"

const EventDetailModal = ({ event, onClose }) => {
  const { t } = useLanguage()
  const cal = t.calendar || {}
  const [editMode, setEditMode] = useState("none") // "none" | "choice" | "series" | "occurrence"
  const eventId = event?.eventId ?? event?.id

  const { data: detail, isLoading } = useGetEventByIdQuery(eventId, {
    skip: !eventId,
  })

  if (!event) return null

  // Merge: prefer fully-loaded detail, fall back to the summary object
  const ev = detail
    ? {
        ...event,
        ...detail,
        currentParticipants:
          detail.currentParticipants ?? event.currentParticipants,
      }
    : event
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
      <Modal open onClose={() => setEditMode("none")} showCloseButton={false} className="!max-w-[400px] w-full p-6 bg-white rounded-xl shadow-xl border overflow-visible">
        <div className="relative flex flex-col text-center">
            {/* Floating close button */}
            <button
                onClick={() => setEditMode("none")}
                className="absolute -top-10 -right-10 bg-[#B81919] text-white p-2 rounded-full shadow-[0_4px_10px_rgba(0,0,0,0.3)] z-50 hover:bg-red-800 transition-colors border-[4px] border-white"
            >
                <X size={20} strokeWidth={4} />
            </button>
            <h3 className="text-xl font-bold mb-2 text-gray-800">
                {cal.editRecurringEvent || "Chỉnh sửa sự kiện"}
            </h3>
            <p className="text-sm text-gray-600 mb-6">
                {cal.editChoicePrompt || "Đây là sự kiện lặp lại. Bạn muốn sửa đổi điều gì?"}
            </p>
            <div className="flex flex-col gap-3">
                <button
                onClick={() => setEditMode("occurrence")}
                className="bg-[#F2F2F2] hover:bg-[#E5E5E5] text-gray-800 font-semibold py-3 px-4 rounded-lg transition-colors border"
                >
                {cal.editThisOccurrence || "Chỉ buổi này"}
                </button>
                <button
                onClick={() => setEditMode("series")}
                className="bg-[var(--cath-primary)] hover:bg-[#990011] text-white font-semibold py-3 px-4 rounded-lg transition-colors"
                style={{ backgroundColor: headerColor }}
                >
                {cal.editEntireSeries || "Toàn bộ chuỗi sự kiện"}
                </button>
                <button
                onClick={() => setEditMode("none")}
                className="text-gray-500 hover:text-gray-700 font-medium py-2 mt-2"
                >
                {cal.cancel || "Hủy"}
                </button>
            </div>
        </div>
      </Modal>
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
            eventId={eventId}
            event={event}
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
      </div>
    </Modal>
  )
}

export default EventDetailModal
