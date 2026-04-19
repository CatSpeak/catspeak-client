import React from "react"
import { AlertTriangle, Loader2 } from "lucide-react"
import Modal from "@/shared/components/ui/Modal"
import PillButton from "@/shared/components/ui/buttons/PillButton"

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
    <Modal
      open={open}
      onClose={onClose}
      showCloseButton={false}
      className="max-w-sm min-[426px]:max-w-md max-[425px]:max-w-none max-[425px]:h-full max-[425px]:flex max-[425px]:flex-col"
    >
      <div className="flex flex-col flex-1">
        <div className="flex flex-col items-center justify-center flex-1 text-center gap-4 max-h-[60vh] overflow-y-auto -mx-5 px-5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-[#990011] [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar]:w-1.5 max-[425px]:max-h-none">
          {/* Warning icon */}
          <div className="flex h-14 w-14 items-center justify-center shrink-0 rounded-full bg-red-50">
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
        </div>

        {/* Buttons */}
        <div className="mt-8 flex flex-wrap justify-center gap-2">
          <PillButton
            onClick={onClose}
            disabled={isDeleting}
            variant="secondary"
            className="h-10 flex-1 min-w-[120px]"
          >
            {t?.recordings?.deleteModal?.cancel || "Cancel"}
          </PillButton>
          <PillButton
            onClick={() => onConfirm?.(recording.recordingId)}
            disabled={isDeleting}
            loading={isDeleting}
            loadingText={t?.recordings?.deleteModal?.deleting || "Deleting…"}
            className="h-10 flex-1 min-w-[120px] !bg-red-600 hover:!bg-red-700 !text-white !border-red-600 border"
          >
            {t?.recordings?.deleteModal?.confirm || "Delete"}
          </PillButton>
        </div>
      </div>
    </Modal>
  )
}

export default DeleteRecordingModal
