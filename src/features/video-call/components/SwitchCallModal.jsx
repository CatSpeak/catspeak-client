import React from "react"
import Modal from "@/shared/components/ui/Modal"
import { useLanguage } from "@/shared/context/LanguageContext"
import PillButton from "@/shared/components/ui/buttons/PillButton"

const SwitchCallModal = ({
  open,
  onConfirm,
  onCancel,
  onClose,
  message,
  cancelText,
  confirmText,
}) => {
  const { t } = useLanguage()

  if (!open) return null

  const handleClose = onCancel || onClose

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title={t.rooms?.videoCall?.provider?.switchTitle ?? "Switch Call?"}
      showCloseButton={false}
      fullScreenOnMobile={false}
      className="rounded-xl border border-border"
      headerClassName="flex items-start justify-between p-4"
      bodyClassName="px-4"
      footerClassName="p-4"
      footer={
        <div className="flex justify-end gap-2">
          <PillButton onClick={handleClose} variant="secondary">
            {cancelText ??
              t.rooms?.videoCall?.provider?.switchCancel ??
              t.cancel ??
              "Stay in Call"}
          </PillButton>
          <PillButton
            onClick={onConfirm}
            variant="primary"
            className="!border-transparent !text-white disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {confirmText ??
              t.rooms?.videoCall?.provider?.switchConfirm ??
              "Leave & Continue"}
          </PillButton>
        </div>
      }
    >
      <div className="text-sm text-secondary">
        <p>
          {message ??
            t.rooms?.videoCall?.provider?.switchMessage ??
            "You are already in an active call. Do you want to leave your current call and join this new one?"}
        </p>
      </div>
    </Modal>
  )
}

export default SwitchCallModal
