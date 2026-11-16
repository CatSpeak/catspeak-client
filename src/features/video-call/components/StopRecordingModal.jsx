import React from "react"
import Modal from "@/shared/components/ui/Modal"
import { useLanguage } from "@/shared/context/LanguageContext"
import PillButton from "@/shared/components/ui/buttons/PillButton"

const StopRecordingModal = ({ open, onClose, onConfirm }) => {
  const { t } = useLanguage()

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={t.rooms?.videoCall?.recording?.stopTitle || "Stop recording"}
      fullScreenOnMobile={false}
      className="rounded-3xl border border-border dark:border-[#3F3F3F]"
      footer={
        <div className="flex items-center justify-end gap-2">
          <PillButton onClick={onClose} variant="secondary">
            {t.rooms?.videoCall?.recording?.continueBtn || "Continue recording"}
          </PillButton>
          <PillButton
            onClick={onConfirm}
            variant="primary"
            className="!border-transparent !text-white"
          >
            {t.rooms?.videoCall?.recording?.confirmBtn || "Confirm"}
          </PillButton>
        </div>
      }
    >
      <p className="text-base text-gray-700 dark:text-neutral-200">
        {t.rooms?.videoCall?.recording?.stopDescription ? (
          <span
            dangerouslySetInnerHTML={{
              __html: t.rooms.videoCall.recording.stopDescription,
            }}
          />
        ) : (
          <>
            The recording will be saved in <strong>My Workspace</strong>.
          </>
        )}
      </p>
    </Modal>
  )
}

export default StopRecordingModal
