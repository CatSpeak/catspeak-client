import React from "react"
import Modal from "@/shared/components/ui/Modal"
import { useLanguage } from "@/shared/context/LanguageContext"
import PillButton from "@/shared/components/ui/buttons/PillButton"

const SwitchCallModal = ({
  open,
  onConfirm,
  onCancel,
  message,
  cancelText,
  confirmText,
}) => {
  const { t } = useLanguage()

  return (
    <Modal
      open={open}
      onClose={onCancel}
      title={t.rooms?.videoCall?.provider?.switchTitle ?? "Switch Call?"}
      footer={
        <div className="flex justify-end gap-2">
          <PillButton
            onClick={onCancel}
            variant="secondary"
            className="h-10 border border-gray-300"
          >
            {cancelText ??
              t.rooms?.videoCall?.provider?.switchCancel ??
              "Stay in Current Call"}
          </PillButton>
          <PillButton onClick={onConfirm} variant="primary" className="h-10">
            {confirmText ??
              t.rooms?.videoCall?.provider?.switchConfirm ??
              "Leave & Continue"}
          </PillButton>
        </div>
      }
    >
      <p className="text-[#606060">
        {message ??
          t.rooms?.videoCall?.provider?.switchMessage ??
          "You are already in an active call. Do you want to leave your current call and join this new one?"}
      </p>
    </Modal>
  )
}

export default SwitchCallModal
