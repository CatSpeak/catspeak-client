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
      className="!max-w-[400px] w-full p-6 bg-white rounded-xl shadow-xl border overflow-visible"
    >
      <div className="relative flex flex-col text-center">
        {/* Floating close button */}
        <button
          onClick={onClose}
          className="absolute -top-10 -right-10 bg-[#B81919] text-white p-2 rounded-full shadow-[0_4px_10px_rgba(0,0,0,0.3)] z-50 hover:bg-red-800 transition-colors border-[4px] border-white"
        >
          <X size={20} strokeWidth={4} />
        </button>
        <h3 className="text-xl font-bold mb-2 text-gray-800">
          {cal.editRecurringEvent}
        </h3>
        <p className="text-sm text-gray-600 mb-6">
          {cal.editChoicePrompt}
        </p>
        <div className="flex flex-col gap-3">
          <button
            onClick={() => onSelect("occurrence")}
            className="bg-[#F2F2F2] hover:bg-[#E5E5E5] text-gray-800 font-semibold h-10 px-4 rounded-lg transition-colors border"
          >
            {cal.editThisOccurrence}
          </button>
          <button
            onClick={() => onSelect("series")}
            className="bg-[var(--cath-primary)] hover:bg-[#990011] text-white font-semibold h-10 px-4 rounded-lg transition-colors"
            style={{ backgroundColor: headerColor }}
          >
            {cal.editEntireSeries}
          </button>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 font-medium h-10 mt-2"
          >
            {cal.cancel}
          </button>
        </div>
      </div>
    </Modal>
  )
}

export default EditChoiceModal
