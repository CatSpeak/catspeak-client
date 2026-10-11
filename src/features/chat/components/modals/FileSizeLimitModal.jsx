import React from "react"
import { useNavigate } from "react-router-dom"
import { AlertCircle } from "lucide-react"
import Modal from "@/shared/components/ui/Modal"
import PillButton from "@/shared/components/ui/buttons/PillButton"
import { useLanguage } from "@/shared/context/LanguageContext"

/**
 * FileSizeLimitModal — Warns users when an uploaded file exceeds the maximum 25MB limit.
 * Provides a direct call to action to view pricing plans (/pricing).
 */
const FileSizeLimitModal = ({ open, onClose }) => {
  const navigate = useNavigate()
  const { t } = useLanguage()

  const modalsT = t?.chat?.modals || {}

  return (
    <Modal
      open={open}
      onClose={onClose}
      className="md:max-w-md"
      showCloseButton={false}
      bodyClassName="p-4 sm:p-6 flex-1 overflow-y-auto"
    >
      <div className="flex flex-col items-center justify-center text-center">
        <AlertCircle className="w-14 h-14 text-[#990011] mb-6 shrink-0" />

        <h3 className="font-bold text-xl text-center mb-1">
          {modalsT.fileSizeLimitTitle || "File size exceeds limit"}
        </h3>

        <p className="text-sm text-[#606060] text-center max-w-sm leading-relaxed mb-6">
          {modalsT.fileSizeLimitDesc ||
            "Your file exceeds the maximum allowed limit of 25MB for your current account. Upgrade your plan to enjoy larger upload limits and more premium features."}
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-2 w-full">
          <PillButton
            variant="secondary"
            onClick={onClose}
            className="w-full sm:flex-1"
          >
            {modalsT.close || "Close"}
          </PillButton>
          <PillButton
            variant="primary"
            onClick={() => {
              onClose?.()
              navigate("/pricing")
            }}
            className="w-full sm:flex-1"
          >
            {modalsT.viewPricingPlans || "View pricing plans"}
          </PillButton>
        </div>
      </div>
    </Modal>
  )
}

export default FileSizeLimitModal
