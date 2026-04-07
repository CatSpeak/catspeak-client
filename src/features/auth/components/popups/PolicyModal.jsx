import { FiX } from "react-icons/fi"
import { getPolicyComponent } from "./policies"
import { useLanguage } from "@/shared/context/LanguageContext"

const PolicyModal = ({ open, onClose, title }) => {
  const { t } = useLanguage()
  const PolicyComponent = getPolicyComponent(title)

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div 
        className="relative w-full max-w-4xl max-h-[90vh] bg-white rounded-[24px] p-6 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          aria-label="Close"
          className="absolute right-6 top-6 z-10 text-2xl text-gray-500 transition hover:text-gray-700"
          onClick={onClose}
        >
          <FiX />
        </button>

        <h2 className="text-center text-[#8f0d15] text-2xl font-bold font-[var(--font-outfit)] pb-4 pr-6">
          {title}
        </h2>

        <div className="max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
          {PolicyComponent ? (
            <PolicyComponent />
          ) : (
            <div className="flex justify-center items-center min-h-[200px]">
              <p className="text-lg text-gray-600 font-medium">
                {t.comingSoon.badge}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default PolicyModal
