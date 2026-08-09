import React from "react"
import Modal from "./Modal"
import PillButton from "@/shared/components/ui/buttons/PillButton"
import { useLanguage } from "@/shared/context/LanguageContext"

const ConfirmationModal = ({
  open,
  onClose,
  onConfirm,
  title,
  message,
  cancelText,
  confirmText,
  confirmVariant = "destructive", // "primary" | "destructive"
  isPending = false,
  children,
}) => {
  const { t } = useLanguage()

  const finalCancelText = cancelText || t.cancel || "Cancel"
  const finalConfirmText = confirmText || t.confirm || "Confirm"

  return (
    <Modal
      open={open}
      onClose={isPending ? undefined : onClose}
      title={title}
      showCloseButton={false}
      fullScreenOnMobile={false}
      headerClassName="flex items-start justify-between px-4 sm:px-6 pt-4 sm:pt-6"
      bodyClassName="px-4 sm:px-6 pt-2"
      footerClassName="p-4 sm:p-6"
      footer={
        <div className="flex justify-end gap-2">
          {!isPending && (
            <PillButton variant="secondary" onClick={onClose}>
              {finalCancelText}
            </PillButton>
          )}
          <PillButton
            variant="primary"
            bgColor={confirmVariant === "destructive" ? "#dc2626" : undefined}
            onClick={onConfirm}
            loading={isPending}
          >
            {finalConfirmText}
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
