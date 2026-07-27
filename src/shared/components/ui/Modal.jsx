import React, { useEffect, useId, useRef } from "react"
import { createPortal } from "react-dom"
import { AnimatePresence, motion } from "framer-motion" // eslint-disable-line no-unused-vars
import { X } from "lucide-react"
import useScrollLock from "@/shared/hooks/useScrollLock"

const Modal = ({
  open,
  onClose,
  children,
  className = "",
  headerClassName = "flex items-center justify-between p-4 sm:p-6",
  title,
  ariaLabel = "Dialog",
  showCloseButton = true,
  subHeader,
  subHeaderClassName = "px-4 sm:px-6 pb-6 shrink-0",
  footer,
  footerClassName = "p-4 sm:p-6",
  bodyClassName = "p-4 sm:p-6 flex-1 overflow-y-auto",
  fullScreenOnMobile = true,
}) => {
  useScrollLock(open)
  const dialogRef = useRef(null)
  const previousFocusRef = useRef(null)
  const onCloseRef = useRef(onClose)
  const titleId = useId()

  useEffect(() => {
    onCloseRef.current = onClose
  }, [onClose])

  useEffect(() => {
    if (!open) return undefined

    previousFocusRef.current = document.activeElement
    const focusFrame = window.requestAnimationFrame(() => {
      const firstFocusable = dialogRef.current?.querySelector(
        "button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex='-1'])"
      )
      const focusTarget = firstFocusable || dialogRef.current
      focusTarget?.focus()
    })

    const handleKeyDown = (event) => {
      if (!dialogRef.current) return

      if (event.key === "Escape") {
        event.preventDefault()
        onCloseRef.current?.()
        return
      }
      if (event.key !== "Tab") return

      const focusableElements = Array.from(
        dialogRef.current.querySelectorAll(
          "button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex='-1'])"
        )
      )
      if (focusableElements.length === 0) {
        event.preventDefault()
        dialogRef.current.focus()
        return
      }

      const firstElement = focusableElements[0]
      const lastElement = focusableElements[focusableElements.length - 1]
      if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault()
        lastElement.focus()
      } else if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault()
        firstElement.focus()
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => {
      window.cancelAnimationFrame(focusFrame)
      document.removeEventListener("keydown", handleKeyDown)
      previousFocusRef.current?.focus?.()
      previousFocusRef.current = null
    }
  }, [open])

  // Use createPortal to render the modal at the document body level
  return createPortal(
    <AnimatePresence>
      {open && (
        <div
          className={`fixed inset-0 z-[1300] flex items-center justify-center ${fullScreenOnMobile ? "p-0 md:p-4" : "p-4"}`}
        >
          {/* Backdrop */}
          <motion.div
            role="presentation"
            aria-hidden="true"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/50 "
            onClick={onClose}
          />

          {/* Modal Container */}
          <motion.div
            ref={dialogRef}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className={`relative flex flex-col w-full shadow-xl overflow-hidden ${
              fullScreenOnMobile 
                ? "h-full md:h-auto md:max-h-[90vh]" 
                : "h-auto max-h-[90vh]"
            } ${
              /(^|\s)(md:|lg:|xl:|2xl:)?(max-w-|w-)/.test(className)
                ? ""
                : "md:max-w-md"
            } ${/(^|\s)bg-/.test(className) ? "" : "bg-white"} ${
              /(^|\s)rounded/.test(className)
                ? ""
                : fullScreenOnMobile
                  ? "rounded-none md:rounded-3xl md:border md:border-[#E5e5e5]"
                  : "rounded-3xl border border-[#E5e5e5]"
            } ${className}`}
            role="dialog"
            aria-modal="true"
            aria-labelledby={typeof title === "string" ? titleId : undefined}
            aria-label={typeof title === "string" ? undefined : ariaLabel}
            tabIndex={-1}
            onClick={(e) => e.stopPropagation()}
          >
            {(title || showCloseButton) && (
              <div className={headerClassName}>
                {title ? (
                  typeof title === "string" ? (
                    <h2 id={titleId} className="text-[20px] leading-[26px] font-semibold">
                      {title}
                    </h2>
                  ) : (
                    title
                  )
                ) : (
                  <div />
                )}

                {showCloseButton && (
                  <button
                    type="button"
                    aria-label="Close dialog"
                    onClick={onClose}
                    className="flex shrink-0 items-center justify-center h-10 w-10 hover:bg-[#E5E5E5] rounded-full transition-colors"
                  >
                    <X size={20} />
                  </button>
                )}
              </div>
            )}

            {subHeader && <div className={subHeaderClassName}>{subHeader}</div>}

            <div className={bodyClassName}>{children}</div>

            {footer && <div className={footerClassName}>{footer}</div>}
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  )
}

export default Modal
