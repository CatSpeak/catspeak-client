import { useState } from "react"
import { useDeleteEventMutation, useCancelEventOccurrenceMutation } from "@/store/api/eventsApi"

const useEventDelete = (eventId, occurrenceId, onClose, onActionComplete) => {
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [deleteEvent, { isLoading: isDeletingEvent }] = useDeleteEventMutation()
  const [cancelOccurrence, { isLoading: isCancellingOccurrence }] = useCancelEventOccurrenceMutation()

  const isDeleting = isDeletingEvent || isCancellingOccurrence

  const handleDelete = async (deleteType = 'occurrence') => {
    try {
      if (occurrenceId && deleteType === 'occurrence') {
        await cancelOccurrence({ eventId, occurrenceId }).unwrap()
      } else {
        await deleteEvent(eventId).unwrap()
      }
      onClose()
      if (onActionComplete) onActionComplete('delete', 'success')
    } catch (err) {
      console.error("Failed to delete event:", err)
      if (onActionComplete) onActionComplete('delete', 'error')
    }
  }

  return {
    confirmDelete,
    setConfirmDelete,
    isDeleting,
    handleDelete,
  }
}

export default useEventDelete
