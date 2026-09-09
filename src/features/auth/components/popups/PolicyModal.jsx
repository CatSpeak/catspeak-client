/* eslint-disable react-hooks/static-components */
import { FiX } from "react-icons/fi"
import { useEffect } from "react"
import { createPortal } from "react-dom"
import { getPolicyComponent } from "./policies"
import { useLanguage } from "@/shared/context/LanguageContext"

const PolicyModal = ({ open, onClose, title }) => {
  const { t } = useLanguage()
  const PolicyComponent = getPolicyComponent(title)

  useEffect(() => {
    if (!open) return
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"
    const onKeyDown = (e) => {
      if (e.key === "Escape") onClose?.()
    }
    document.addEventListener("keydown", onKeyDown)
    return () => {
      document.body.style.overflow = prevOverflow
      document.removeEventListener("keydown", onKeyDown)
    }
  }, [open, onClose])

  if (!open) return null

  const modalContent = (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
      role="presentation"
    >
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

        <h2 className="text-center text-primary text-2xl font-bold pb-4 pr-6">
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

  if (typeof document === "undefined") return modalContent
  return createPortal(modalContent, document.body)
}

export default PolicyModal
