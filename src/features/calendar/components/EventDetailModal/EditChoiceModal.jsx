import React from "react"
import { X } from "lucide-react"
import Modal from "@/shared/components/ui/Modal"
import { useLanguage } from "@/shared/context/LanguageContext"

const EditChoiceModal = ({ open, onClose, onSelect, headerColor }) => {
  const { t } = useLanguage()
  const cal = t.calendar || {}

  if (!open) return null

  return (
    <Modal
      open={open}
      onClose={onClose}
      showCloseButton={false}
      className="!max-w-[400px] w-full p-6 bg-white dark:bg-[#1A1A1A] rounded-xl shadow-xl border border-border dark:border-[#3F3F3F] overflow-visible"
      bodyClassName="flex-1"
    >
      <div className="relative flex flex-col text-center">
        <h3 className="text-xl font-bold mb-2 text-gray-800 dark:text-white">
          {cal.editRecurringEvent}
        </h3>
        <p className="text-sm text-gray-600 dark:text-neutral-400 mb-6">
          {cal.editChoicePrompt}
        </p>
        <div className="flex flex-col gap-3">
          <button
            onClick={() => onSelect("occurrence")}
            className="bg-primaryBg dark:bg-[#272727] hover:bg-[#E5E5E5] dark:hover:bg-[#333333] text-gray-800 dark:text-neutral-100 font-semibold h-10 px-4 rounded-lg transition-colors border border-border dark:border-[#3F3F3F]"
          >
            {cal.editThisOccurrence}
          </button>
          <button
            onClick={() => onSelect("series")}
            className="bg-[var(--cath-primary)] hover:bg-cath-red-700 text-white font-semibold h-10 px-4 rounded-lg transition-colors"
            style={{ backgroundColor: headerColor }}
          >
            {cal.editEntireSeries}
          </button>
          <button
            onClick={onClose}
            className="text-gray-500 dark:text-neutral-400 hover:text-gray-700 dark:hover:text-white font-medium h-10 mt-2"
          >
            {cal.cancel}
          </button>
        </div>
      </div>
    </Modal>
  )
}

export default EditChoiceModal
