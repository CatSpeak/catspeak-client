import React, { useState } from "react"
import { Trash2, Pencil, X } from "lucide-react"
import SharePopover from "./SharePopover"
import useEventDelete from "../../hooks/useEventDelete"
import { useLanguage } from "@/shared/context/LanguageContext"
import { useAuth } from "@/features/auth/hooks/useAuth"
import {
  useRegisterForEventMutation,
  useCancelRegistrationMutation,
} from "@/store/api/eventsApi"
import Modal from "@/shared/components/ui/Modal"
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
  const [cancelMode, setCancelMode] = useState("none") // "none" | "choice"
  const { confirmDelete, setConfirmDelete, isDeleting, handleDelete } =
    useEventDelete(eventId, onClose)

  const [registerForEvent, { isLoading: isRegistering }] =
    useRegisterForEventMutation()
  const [cancelRegistration, { isLoading: isCancelling }] =
    useCancelRegistrationMutation()

  const isProcessing = isRegistering || isCancelling

  /** Cancel a specific occurrence's registration */
  const handleCancelOccurrence = async () => {
    try {
      const body = {
        eventId,
        cancellationReason: "User cancelled",
        registrationDate: event?.originalStartTime,
      }
      await cancelRegistration(body).unwrap()
      setCancelMode("none")
    } catch (err) {
      console.error("Cancel occurrence registration failed:", err)
    }
  }

  /** Cancel all registrations for the entire series */
  const handleCancelAll = async () => {
    try {
      const body = {
        eventId,
        cancellationReason: "User cancelled",
      }
      await cancelRegistration(body).unwrap()
      setCancelMode("none")
    } catch (err) {
      console.error("Cancel all registrations failed:", err)
    }
  }

  const handleRegister = async () => {
    if (isRegistered) {
      // For recurring events, show a choice dialog
      if (event?.isRecurring) {
        setCancelMode("choice")
        return
      }
      // For non-recurring events, cancel directly (no registrationDate)
      try {
        await cancelRegistration({
          eventId,
          cancellationReason: "User cancelled",
        }).unwrap()
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

      {/* Cancel registration choice modal for recurring events */}
      {cancelMode === "choice" && (
        <Modal
          open
          onClose={() => setCancelMode("none")}
          showCloseButton={false}
          className="!max-w-[400px] w-full p-6 bg-white rounded-xl shadow-xl border overflow-visible"
        >
          <div className="relative flex flex-col text-center">
            {/* Floating close button */}
            <button
              onClick={() => setCancelMode("none")}
              className="absolute -top-10 -right-10 bg-[#B81919] text-white p-2 rounded-full shadow-[0_4px_10px_rgba(0,0,0,0.3)] z-50 hover:bg-red-800 transition-colors border-[4px] border-white"
            >
              <X size={20} strokeWidth={4} />
            </button>
            <h3 className="text-xl font-bold mb-2 text-gray-800">
              {cal.cancelRecurringTitle || "Hủy đăng ký"}
            </h3>
            <p className="text-sm text-gray-600 mb-6">
              {cal.cancelChoicePrompt ||
                "Đây là sự kiện lặp lại. Bạn muốn hủy đăng ký nào?"}
            </p>
            <div className="flex flex-col gap-3">
              <button
                onClick={handleCancelOccurrence}
                disabled={isCancelling}
                className="bg-[#F2F2F2] hover:bg-[#E5E5E5] text-gray-800 font-semibold py-3 px-4 rounded-lg transition-colors border disabled:opacity-60"
              >
                {cal.cancelThisOccurrence || "Chỉ buổi này"}
              </button>
              <button
                onClick={handleCancelAll}
                disabled={isCancelling}
                className="bg-[#B81919] hover:bg-[#990011] text-white font-semibold py-3 px-4 rounded-lg transition-colors disabled:opacity-60"
              >
                {cal.cancelEntireSeries || "Toàn bộ đăng ký"}
              </button>
              <button
                onClick={() => setCancelMode("none")}
                className="text-gray-500 hover:text-gray-700 font-medium py-2 mt-2"
              >
                {cal.cancel || "Hủy"}
              </button>
            </div>
          </div>
        </Modal>
      )}

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
