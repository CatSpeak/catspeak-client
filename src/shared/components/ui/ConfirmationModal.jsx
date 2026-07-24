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
      showCloseButton={false}
      fullScreenOnMobile={false}
      headerClassName="flex items-start justify-between px-4 sm:px-6 pt-4 sm:pt-6"
      bodyClassName="px-4 sm:px-6 pt-2"
      footerClassName="p-4 sm:p-6"
      footer={
        <div className="flex justify-end gap-2">
          <PillButton variant="secondary" onClick={onClose}>
            {cancelText}
          </PillButton>
          <PillButton variant="primary" onClick={onConfirm}>
            {confirmText}
          </PillButton>
        </div>
      }
    >
      <div className="text-[#606060] text-sm">
        {message ? <p>{message}</p> : children}
      </div>
    </Modal>
  )
}

export default ConfirmationModal
