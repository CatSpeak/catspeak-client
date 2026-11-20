import React, { useEffect, useRef } from "react"
import { createPortal } from "react-dom"
import { X } from "lucide-react"
import useScrollLock from "@/shared/hooks/useScrollLock"

/**
 * Hộp thoại dùng chung cho các màn flashcard. Esc để đóng, focus vào hộp thoại khi mở.
 */
const FlashcardModal = ({ isOpen, title, onClose, children, footer, labelledBy, maxWidth = "max-w-md" }) => {
  const ref = useRef(null)
  const onCloseRef = useRef(onClose)
  useScrollLock(Boolean(isOpen))

  useEffect(() => {
    onCloseRef.current = onClose
  }, [onClose])

  useEffect(() => {
    if (!isOpen) return undefined
    const onKey = (e) => {
      if (e.key === "Escape") onCloseRef.current?.()
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) return undefined
    // Chỉ focus modal container nếu activeElement chưa nằm bên trong modal
    // (ví dụ: tránh cướp focus của input có autoFocus hoặc người dùng đang gõ)
    if (ref.current && !ref.current.contains(document.activeElement)) {
      ref.current.focus()
    }
  }, [isOpen])

  if (!isOpen) return null
  const titleId = labelledBy || "flashcard-modal-title"

  const modalElement = (
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
    </div>
  )

  if (typeof document === "undefined" || !document?.body) return modalElement
  return createPortal(modalElement, document.body)
}

export default FlashcardModal
