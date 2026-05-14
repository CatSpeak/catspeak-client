import React, { useState } from "react"
import { Trash2, Pencil } from "lucide-react"
import SharePopover from "./SharePopover"
import useEventDelete from "../../hooks/useEventDelete"
import { useLanguage } from "@/shared/context/LanguageContext"
import { useAuth } from "@/features/auth/hooks/useAuth"
import {
  useRegisterForEventMutation,
  useCancelRegistrationMutation,
} from "@/store/api/eventsApi"

import ParticipantListModal from "./ParticipantListModal"

const EventDetailFooter = ({ eventId, event, onClose, onEdit }) => {
  const { user, isAdmin } = useAuth()
  const { t } = useLanguage()
  const cal = t.calendar || {}
  const [showParticipants, setShowParticipants] = useState(false)

  const isCreatorOrAdmin =
    isAdmin ||
    (user &&
      event &&
      (user.id === event.creatorId ||
        user.username === event.creatorName ||
        (user.fullName && user.fullName === event.creatorName)))
  const isRegistered = event?.isRegistered ?? false

  const { confirmDelete, setConfirmDelete, isDeleting, handleDelete } =
    useEventDelete(eventId, onClose)

  const [registerForEvent, { isLoading: isRegistering }] =
    useRegisterForEventMutation()
  const [cancelRegistration, { isLoading: isCancelling }] =
    useCancelRegistrationMutation()

  const isProcessing = isRegistering || isCancelling

  const handleRegister = async () => {
    if (isRegistered) {
      // Cancel registration for this occurrence (or the single event)
      try {
        const body = {
          eventId,
          cancellationReason: "User cancelled",
          ...(event?.occurrenceId ? { occurrenceId: event.occurrenceId } : {}),
          ...(event?.isRecurring && event?.originalStartTime && !event?.occurrenceId
            ? { registrationDate: event.originalStartTime }
            : {}),
        }
        await cancelRegistration(body).unwrap()
      } catch (err) {
        console.error("Cancel registration failed:", err)
      }
      return
    }

    try {
      const isRecurring = event?.isRecurring
      const occurrenceId = event?.occurrenceId

      let body = { eventId }
      if (occurrenceId) {
        body = { eventId, occurrenceId, registrationType: "SINGLE_OCCURRENCE" }
      } else if (event?.isRecurring) {
        body = { eventId, registrationType: "ENTIRE_SERIES" }
      }

      console.log("REGISTER PAYLOAD:", body)

      await registerForEvent(body).unwrap()
    } catch (err) {
      console.error("Registration failed:", err)
    }
  }

  return (
    <>
      <div className="p-5 rounded-none min-[426px]:rounded-b-xl flex items-center justify-between gap-4 bg-white">
        {/* Register / Unregister */}
        {!confirmDelete &&
          (isCreatorOrAdmin ? (
            <button
              onClick={() => setShowParticipants(true)}
              className="flex-1 transition-colors text-base text-white font-bold h-10 rounded-lg bg-[#B91264] hover:bg-[#990011]"
            >
              {cal.viewParticipants || "Xem danh sách người đăng ký"}
            </button>
          ) : (
            <button
              onClick={handleRegister}
              disabled={isProcessing}
              className={`flex-1 transition-colors text-base text-white font-bold h-10 rounded-lg ${
                isProcessing
                  ? "bg-gray-400 cursor-not-allowed"
                  : isRegistered
                    ? "bg-cath-red-700 hover:bg-cath-red-800"
                    : "bg-[#06AA3B] hover:bg-green-700"
              }`}
            >
              {isProcessing
                ? cal.processing || "Đang xử lý..."
                : isRegistered
                  ? cal.cancelRegistration || "Hủy đăng kí"
                  : cal.register || "Đăng kí"}
            </button>
          ))}

        {/* Delete confirm / action icons */}
        {confirmDelete ? (
          <div className="flex items-center gap-2 w-full">
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="flex-1 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 transition-colors h-10 rounded-[10px] disabled:opacity-60"
            >
              {isDeleting
                ? cal.deleting || "Đang xóa..."
                : cal.confirm || "Xác nhận?"}
            </button>
            <button
              onClick={() => setConfirmDelete(false)}
              className="flex-1 text-sm bg-[#f2f2f2] transition-colors h-10 rounded-[10px] hover:bg-[#d9d9d9]"
            >
              {cal.cancel || "Hủy"}
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            {isCreatorOrAdmin && (
              <>
                <button
                  onClick={onEdit}
                  className="bg-[#F2F2F2] hover:bg-[#D9D9D9] transition-colors flex items-center justify-center rounded-full w-10 h-10"
                >
                  <Pencil />
                </button>
                <button
                  onClick={() => setConfirmDelete(true)}
                  className="bg-[#F2F2F2] hover:bg-[#D9D9D9] transition-colors flex items-center justify-center rounded-full w-10 h-10"
                >
                  <Trash2 />
                </button>
              </>
            )}
            <SharePopover
              eventId={eventId}
              occurrenceId={event?.occurrenceId}
            />
          </div>
        )}
      </div>

      {/* Participant List Modal */}
      {showParticipants && (
        <ParticipantListModal
          open={showParticipants}
          onClose={() => setShowParticipants(false)}
          occurrenceId={event?.occurrenceId}
        />
      )}
    </>
  )
}

export default EventDetailFooter
