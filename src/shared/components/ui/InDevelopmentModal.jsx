import React from "react"
import Modal from "@/shared/components/ui/Modal"
import { useLanguage } from "@/shared/context/LanguageContext"

const InDevelopmentModal = ({ open, onCancel }) => {
  const { t } = useLanguage()

  // Safeguard against missing translations
  const comingSoon = t?.comingSoon || {}

  return (
    <Modal open={open} onClose={onCancel}>
      <div className="flex flex-col gap-4 items-center justify-center text-center pb-6">
        {/* You can add an illustration here if desired from constants or assets */}
        <h2 className="text-2xl font-bold">
          {comingSoon.title || "Feature in Development"}
        </h2>

        <p>
          {comingSoon.description ||
            "We are working hard to bring you this feature."}
        </p>

        <p className="m-0 text-sm text-[#7A7574]">
          {comingSoon.thankYou || "Thank you for your patience!"}
        </p>
      </div>
    </Modal>
  )
}

export default InDevelopmentModal
