import React from "react"
import Modal from "@/shared/components/ui/Modal"
import { useLanguage } from "@/shared/context/LanguageContext"
import PillButton from "@/shared/components/ui/buttons/PillButton"

const LeaveCallModal = ({ open, onClose, onConfirm }) => {
  const { t } = useLanguage()

  if (!open) return null

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={t.rooms?.videoCall?.leaveCall || "Leave Call"}
      size="sm"
    >
      <div className="flex flex-col gap-6 pb-6">
        <p className="text-sm text-gray-600">
          {t.rooms?.videoCall?.leaveCallConfirmText ||
            "Are you sure you want to leave this call?"}
        </p>

        <div className="flex justify-end gap-3">
          <PillButton onClick={onClose} variant="secondary">
            {t.cancel || "Cancel"}
          </PillButton>
          <PillButton
            onClick={onConfirm}
            variant="primary"
            className="!border-transparent !text-white"
          >
            {t.rooms?.videoCall?.leaveCall || "Leave"}
          </PillButton>
        </div>
      </div>
    </Modal>
  )
}

export default LeaveCallModal
