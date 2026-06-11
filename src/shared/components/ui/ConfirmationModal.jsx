import React from "react"
import Modal from "./Modal"
import PillButton from "@/shared/components/ui/buttons/PillButton"

const ConfirmationModal = ({
  open,
  onClose,
  onConfirm,
  title,
  message,
  cancelText = "Cancel",
  confirmText = "Confirm",
  confirmVariant = "destructive", // "primary" | "destructive"
  children,
}) => {
  const isDestructive = confirmVariant === "destructive"

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      footer={
        <div className="flex justify-end gap-3">
          <PillButton
            variant="secondary"
            onClick={onClose}
            className="h-10 text-sm !bg-[#F6F6F6] text-[#7A7574]"
          >
            {cancelText}
          </PillButton>
          <PillButton
            variant="primary"
            onClick={onConfirm}
            className="h-10 text-sm"
            bgColor={isDestructive ? undefined : "#18181B"}
          >
            {confirmText}
          </PillButton>
        </div>
      }
    >
      <div className="text-[#7A7574] text-sm py-2">
        {message ? <p>{message}</p> : children}
      </div>
    </Modal>
  )
}

export default ConfirmationModal
