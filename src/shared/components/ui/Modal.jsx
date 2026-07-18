import React from "react"
import { createPortal } from "react-dom"
import { AnimatePresence, motion } from "framer-motion"
import { X } from "lucide-react"
import useScrollLock from "@/shared/hooks/useScrollLock"

const Modal = ({
  open,
  onClose,
  children,
  className = "",
  headerClassName = "flex items-center justify-between p-3 pl-6",
  title,
  showCloseButton = true,
  footer,
  bodyClassName = "px-4 flex-1 overflow-y-auto",
  fullScreenOnMobile = true,
}) => {
  useScrollLock(open)

  // Modal visibility is handled by the "open" prop and AnimatePresence

  // Use createPortal to render the modal at the document body level
  return createPortal(
    <AnimatePresence>
      {open && (
        <div className={`fixed inset-0 z-[1300] flex items-center justify-center ${fullScreenOnMobile ? "p-0 md:p-4" : "p-4"}`}>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/50 "
            onClick={onClose}
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className={`relative flex flex-col w-full shadow-xl ${
              fullScreenOnMobile 
                ? "h-full md:h-auto md:max-h-[90vh]" 
                : "h-auto max-h-[90vh]"
            } ${
              /(^|\s)(md:|lg:|xl:|2xl:)?(max-w-|w-)/.test(
                className,
              )
                ? ""
                : "md:max-w-md"
            } ${/(^|\s)bg-/.test(className) ? "" : "bg-white"} ${
              /(^|\s)rounded/.test(className)
                ? ""
                : fullScreenOnMobile ? "rounded-none md:rounded-3xl md:border md:border-[#E5e5e5]" : "rounded-3xl border border-[#E5e5e5]"
            } ${className}`}
            role="dialog"
            aria-modal="true"
            onClick={(e) => e.stopPropagation()}
          >
            {(title || showCloseButton) && (
              <div className={headerClassName}>
                {title ? (
                  <h2 className="text-[20px] leading-[26px] font-semibold">
                    {title}
                  </h2>
                ) : (
                  <div />
                )}

                {showCloseButton && (
                  <button
                    onClick={onClose}
                    className="flex shrink-0 items-center justify-center h-10 w-10 hover:bg-[#E5E5E5] rounded-full transition-colors"
                  >
                    <X size={20} />
                  </button>
                )}
              </div>
            )}

            <div className={bodyClassName}>{children}</div>

            {footer && <div className="p-4">{footer}</div>}
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  )
}

export default Modal
