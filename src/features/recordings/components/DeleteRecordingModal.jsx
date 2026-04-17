import React from "react"
import { AlertTriangle, Loader2 } from "lucide-react"
import Modal from "@/shared/components/ui/Modal"

/**
 * DeleteRecordingModal — confirmation dialog for deleting a recording.
 * Uses the shared Modal component for consistency with the rest of the app.
 */
const DeleteRecordingModal = ({ open, onClose, recording, onConfirm, isDeleting, t }) => {
  if (!recording) return null

  const fileSizeMb = recording.fileSizeBytes
    ? (recording.fileSizeBytes / (1024 * 1024)).toFixed(1)
    : null

  return (
    <Modal open={open} onClose={onClose} showCloseButton={false}>
      <div className="flex flex-col items-center text-center gap-4">
        {/* Warning icon */}
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-50">
          <AlertTriangle className="h-7 w-7 text-red-500" />
        </div>

        {/* Title */}
        <h3 className="text-lg font-semibold text-gray-900">
          {t?.recordings?.deleteModal?.title || "Delete Recording?"}
        </h3>

        {/* Description */}
        <p className="text-sm text-gray-500 max-w-xs">
          {t?.recordings?.deleteModal?.description || "This will permanently delete the recording"}
          {recording.meetingId && (
            <span className="font-medium text-gray-700">
              {" "}{recording.meetingId}
            </span>
          )}
          {fileSizeMb && (
            <span className="text-gray-500">
              {" "}({fileSizeMb} MB)
            </span>
          )}
          . {t?.recordings?.deleteModal?.cannotUndo || "This action cannot be undone."}
        </p>

        {/* Buttons */}
        <div className="flex w-full gap-3 mt-2">
          <button
            onClick={onClose}
            disabled={isDeleting}
            className="flex-1 rounded-xl border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50"
          >
            {t?.recordings?.deleteModal?.cancel || "Cancel"}
          </button>
          <button
            onClick={() => onConfirm?.(recording.recordingId)}
            disabled={isDeleting}
            className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:opacity-50"
          >
            {isDeleting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                {t?.recordings?.deleteModal?.deleting || "Deleting…"}
              </>
            ) : (
              t?.recordings?.deleteModal?.confirm || "Delete"
            )}
          </button>
        </div>
      </div>
    </Modal>
  )
}

export default DeleteRecordingModal
