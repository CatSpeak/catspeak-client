import React, { useState } from "react"
import { Trash2, Pencil } from "lucide-react"
import SharePopover from "./SharePopover"
import useEventDelete from "../../hooks/useEventDelete"
import { useLanguage } from "@/shared/context/LanguageContext"
import {
  useRegisterForEventMutation,
  useCancelRegistrationMutation,
} from "@/store/api/eventsApi"

const EventDetailFooter = ({ eventId, event, onClose, onEdit }) => {
  const { t } = useLanguage()
  const [isRegistered, setIsRegistered] = useState(event?.isRegistered ?? false)
  const { confirmDelete, setConfirmDelete, isDeleting, handleDelete } =
    useEventDelete(eventId, onClose)

  const [registerForEvent, { isLoading: isRegistering }] =
    useRegisterForEventMutation()
  const [cancelRegistration, { isLoading: isCancelling }] =
    useCancelRegistrationMutation()

  const isProcessing = isRegistering || isCancelling

  const handleRegister = async () => {
    if (isRegistered) {
      try {
        await cancelRegistration({
          registrationId: event?.registrationId,
          cancellationReason: "User cancelled",
        }).unwrap()
        setIsRegistered(false)
      } catch (err) {
        console.error("Cancel registration failed:", err)
      }
      return
    }

    try {
      const isRecurring = event?.isRecurring
      const occurrenceId = event?.occurrenceId

      const body =
        isRecurring && !occurrenceId
          ? {
              eventId,
              registrationType: "ENTIRE_SERIES",
            }
          : {
              eventId,
              occurrenceId,
              registrationType: "SINGLE_OCCURRENCE",
            }

      await registerForEvent(body).unwrap()
      setIsRegistered(true)
    } catch (err) {
      console.error("Registration failed:", err)
    }
  }

  return (
    <div className="p-5 rounded-none min-[426px]:rounded-b-xl flex items-center justify-between gap-4 bg-white">
      {/* Register / Unregister */}
      {!confirmDelete && (
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
            ? t.calendar?.processing || "Đang xử lý..."
            : isRegistered
              ? t.calendar?.cancelRegistration || "Hủy đăng kí"
              : t.calendar?.register || "Đăng kí"}
        </button>
      )}

      {/* Delete confirm / action icons */}
      {confirmDelete ? (
        <div className="flex items-center gap-2 w-full">
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="flex-1 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 transition-colors h-10 rounded-[10px] disabled:opacity-60"
          >
            {isDeleting
              ? t.calendar?.deleting || "Đang xóa..."
              : t.calendar?.confirm || "Xác nhận?"}
          </button>
          <button
            onClick={() => setConfirmDelete(false)}
            className="flex-1 text-sm bg-[#f2f2f2] transition-colors h-10 rounded-[10px] hover:bg-[#d9d9d9]"
          >
            {t.calendar?.cancel || "Hủy"}
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-2">
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
          <SharePopover eventId={eventId} />
        </div>
      )}
    </div>
  )
}

export default EventDetailFooter
