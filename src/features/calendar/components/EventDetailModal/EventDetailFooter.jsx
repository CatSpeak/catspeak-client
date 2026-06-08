import React, { useState } from "react"
import { Trash2, Pencil } from "lucide-react"
import SharePopover from "./SharePopover"
import useEventDelete from "../../hooks/useEventDelete"
import { useLanguage } from "@/shared/context/LanguageContext"
import { useAuth } from "@/features/auth/hooks/useAuth"
import {
  useRegisterForEventMutation,
  useCancelRegistrationMutation,
  useDeleteRegistrationMutation,
} from "@/store/api/eventsApi"
import { useLocation, useNavigate } from "react-router-dom"
import { useAuthModal } from "@/shared/context/AuthModalContext"

import ParticipantListModal from "./ParticipantListModal"
import PillButton from "@/shared/components/ui/buttons/PillButton"

const EventDetailFooter = ({ eventId, event, onClose, onEdit }) => {
  const { user, isAdmin } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const { openAuthModal } = useAuthModal()
  const { t } = useLanguage()
  const cal = t.calendar || {}
  const [showParticipants, setShowParticipants] = useState(false)

  const isCreator = Boolean(
    user &&
    event &&
    ((user.id != null &&
      event.creatorId != null &&
      user.id === event.creatorId) ||
      (user.username != null &&
        event.creatorName != null &&
        user.username === event.creatorName) ||
      (user.fullName != null &&
        event.creatorName != null &&
        user.fullName === event.creatorName)),
  )

  const isRegistered = event?.isRegistered ?? false

  const { confirmDelete, setConfirmDelete, isDeleting, handleDelete } =
    useEventDelete(eventId, event?.occurrenceId, onClose)

  const [registerForEvent, { isLoading: isRegistering }] =
    useRegisterForEventMutation()
  const [cancelRegistration, { isLoading: isCancelling }] =
    useCancelRegistrationMutation()
  const [deleteRegistration, { isLoading: isDeletingReg }] =
    useDeleteRegistrationMutation()

  const isProcessing = isRegistering || isCancelling || isDeletingReg

  const handleRegister = async () => {
    if (!user || !user.id) {
      if (location.pathname.includes("/events/shared/")) {
        navigate("/", {
          replace: true,
          state: {
            requireLogin: true,
            redirectTo: location.pathname + location.search,
          },
        })
      } else {
        openAuthModal("login", location.pathname + location.search)
      }
      return
    }

    if (isRegistered) {
      // Cancel registration for this occurrence (or the single event)
      try {
        if (event?.registrationId) {
          await deleteRegistration({
            registrationId: event.registrationId,
            cancellationReason: "User cancelled",
          }).unwrap()
        } else {
          const body = {
            eventId,
            cancellationReason: "User cancelled",
            ...(event?.occurrenceId
              ? { occurrenceId: event.occurrenceId }
              : {}),
            ...(event?.isRecurring &&
            event?.originalStartTime &&
            !event?.occurrenceId
              ? { registrationDate: event.originalStartTime }
              : {}),
          }
          await cancelRegistration(body).unwrap()
        }
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
      <div className="p-4 min-[426px]:p-6 rounded-none min-[426px]:rounded-b-[24px] flex flex-col min-[426px]:flex-row items-center justify-between gap-3 min-[426px]:gap-2 bg-white">
        {/* Register / Unregister */}
        {!confirmDelete &&
          (isCreator ? (
            <PillButton
              onClick={() => setShowParticipants(true)}
              bgColor="#B91264"
              className="w-full min-[426px]:flex-1"
            >
              {cal.viewParticipants || "Xem danh sách người đăng ký"}
            </PillButton>
          ) : (
            <PillButton
              onClick={handleRegister}
              loading={isProcessing}
              loadingText={cal.processing || "Đang xử lý..."}
              bgColor={isRegistered ? undefined : "#06AA3B"}
              className={`w-full min-[426px]:flex-1 ${isRegistered ? "bg-cath-red-700 hover:bg-cath-red-800" : ""}`}
            >
              {isRegistered
                ? cal.cancelRegistration || "Hủy đăng kí"
                : cal.register || "Đăng kí"}
            </PillButton>
          ))}

        {/* Delete confirm / action icons */}
        {confirmDelete ? (
          <div className="flex flex-wrap items-center gap-2 w-full">
            {event?.isRecurring && event?.occurrenceId ? (
              <>
                <PillButton
                  onClick={() => handleDelete("occurrence")}
                  loading={isDeleting}
                  loadingText={cal.deleting || "Đang xóa..."}
                  bgColor="#dc2626"
                  className="flex-1 min-w-[max-content]"
                >
                  {cal.deleteThisOccurrence || "Chỉ xóa buổi này"}
                </PillButton>
                <PillButton
                  onClick={() => handleDelete("series")}
                  loading={isDeleting}
                  loadingText={cal.deleting || "Đang xóa..."}
                  bgColor="#991b1b"
                  className="flex-1 min-w-[max-content]"
                >
                  {cal.deleteEntireSeries || "Xóa toàn bộ chuỗi"}
                </PillButton>
              </>
            ) : (
              <PillButton
                onClick={() => handleDelete("series")}
                loading={isDeleting}
                loadingText={cal.deleting || "Đang xóa..."}
                bgColor="#dc2626"
                className="flex-1"
              >
                {cal.confirm || "Xác nhận?"}
              </PillButton>
            )}
            <PillButton
              onClick={() => setConfirmDelete(false)}
              variant="secondary"
              bgColor="#f2f2f2"
              className="flex-1 min-w-[60px]"
            >
              {cal.cancel || "Hủy"}
            </PillButton>
          </div>
        ) : (
          <div className="relative flex items-center justify-center min-[426px]:justify-end gap-2 w-full min-[426px]:w-auto">
            {isCreator && (
              <>
                <button
                  onClick={onEdit}
                  className="bg-[#F2F2F2] hover:bg-[#D9D9D9] transition-colors shrink-0 flex items-center justify-center rounded-full w-12 h-12 text-[#111111]"
                >
                  <Pencil />
                </button>
                <button
                  onClick={() => setConfirmDelete(true)}
                  className="bg-[#F2F2F2] hover:bg-[#D9D9D9] transition-colors shrink-0 flex items-center justify-center rounded-full w-12 h-12 text-[#111111]"
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
