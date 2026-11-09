import React, { useEffect, useRef } from "react"
import { createPortal } from "react-dom"
import { X } from "lucide-react"

/**
 * Hộp thoại dùng chung cho các màn flashcard. Esc để đóng, focus vào hộp thoại khi mở.
 */
const FlashcardModal = ({ isOpen, title, onClose, children, footer, labelledBy, maxWidth = "max-w-md" }) => {
  const ref = useRef(null)

  useEffect(() => {
    if (!isOpen) return undefined
    const onKey = (e) => {
      if (e.key === "Escape") onClose?.()
    }
    window.addEventListener("keydown", onKey)
    ref.current?.focus()
    return () => window.removeEventListener("keydown", onKey)
  }, [isOpen, onClose])

  if (!isOpen || typeof document === "undefined") return null
  const titleId = labelledBy || "flashcard-modal-title"

  return createPortal(
    <div className="fixed inset-0 z-[1300] flex items-center justify-center p-4">
      <div onClick={onClose} className="fixed inset-0 bg-black/50 backdrop-blur-xs" aria-hidden="true" />
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className={`relative z-10 w-full ${maxWidth} max-h-[90vh] overflow-y-auto rounded-3xl bg-white dark:bg-[#1A1A1A] border border-transparent dark:border-[#3F3F3F] p-6 shadow-2xl outline-none`}
      >
        <div className="flex items-start justify-between gap-4">
          <h2 id={titleId} className="text-lg font-bold text-slate-900 dark:text-white">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 dark:bg-[#272727] text-slate-500 dark:text-neutral-400 hover:bg-slate-200 dark:hover:bg-[#333]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="mt-3 text-sm text-slate-600 dark:text-neutral-300">{children}</div>
        {footer && <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">{footer}</div>}
      </div>
    </div>,
    document.body,
  )
}

export default FlashcardModal
