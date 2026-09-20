import React, { useEffect, useId, useRef } from "react"
import { createPortal } from "react-dom"
import { AnimatePresence, motion } from "framer-motion" // eslint-disable-line no-unused-vars
import { X } from "lucide-react"
import useScrollLock from "@/shared/hooks/useScrollLock"
import { CAPTURE_IGNORE_ATTR } from "@/shared/utils/screenshotUtils"

export const DISABLED_TEXT_CLASS = "text-[#98A2B3] cursor-not-allowed"
export const DISABLED_FILLED_CLASS =
  "bg-[#F2F4F7] text-[#98A2B3] border border-[#E2E2E2] cursor-not-allowed"

const FOCUSABLE_SELECTOR =
  "button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex='-1'])"

const DrawerContent = ({
  onClose,
  title,
  children,
  secondaryLabel,
  primaryLabel,
  onSecondary,
  onPrimary,
  primaryDisabled = false,
  ariaLabel = "Dialog",
  className = "",
}) => {
  useScrollLock(true)
  const panelRef = useRef(null)
  const previousFocusRef = useRef(null)
  const onCloseRef = useRef(onClose)
  const titleId = useId()

  useEffect(() => {
    onCloseRef.current = onClose
  }, [onClose])

  useEffect(() => {
    previousFocusRef.current = document.activeElement
    const focusFrame = window.requestAnimationFrame(() => {
      const preferred = panelRef.current?.querySelector("[data-autofocus]")
      const firstFocusable = panelRef.current?.querySelector(FOCUSABLE_SELECTOR)
      const focusTarget = preferred || firstFocusable || panelRef.current
      focusTarget?.focus()
    })

    const handleKeyDown = (event) => {
      if (!panelRef.current) return

      if (event.key === "Escape") {
        event.preventDefault()
        onCloseRef.current?.()
        return
      }
      if (event.key !== "Tab") return

      const focusableElements = Array.from(
        panelRef.current.querySelectorAll(FOCUSABLE_SELECTOR),
      )
      if (focusableElements.length === 0) {
        event.preventDefault()
        panelRef.current.focus()
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
  }, [])

  return (
    <div
      {...{ [CAPTURE_IGNORE_ATTR]: "true" }}
      className="fixed inset-0 z-[1300]"
    >
      <motion.div
        role="presentation"
        aria-hidden="true"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 bg-[#101828]/[0.44]"
        onClick={onClose}
      />

      <motion.div
        ref={panelRef}
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "tween", duration: 0.25 }}
        className={`fixed top-0 right-0 z-[1301] flex h-full w-full flex-col bg-white shadow-xl sm:w-[448px] ${className}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={typeof title === "string" ? titleId : undefined}
        aria-label={typeof title === "string" ? undefined : ariaLabel}
        tabIndex={-1}
      >
        <div className="flex h-[70px] shrink-0 items-center justify-between gap-3 border-b border-[#E2E2E2] pl-7 pr-6">
          {title ? (
            typeof title === "string" ? (
              <h2
                id={titleId}
                className="truncate text-[20px] font-semibold leading-[26px] text-[#101828]"
              >
                {title}
              </h2>
            ) : (
              title
            )
          ) : (
            <div />
          )}
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[#101828] transition-colors hover:bg-[#F2F4F7]"
          >
            <X size={22} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">{children}</div>

        <div className="flex h-[101px] shrink-0 items-center gap-4 border-t border-[#E2E2E2] px-6">
          <button
            type="button"
            onClick={onSecondary}
            className="h-[50px] w-[130px] shrink-0 rounded-[7px] border border-[#D0D5DD] bg-white text-xs font-semibold text-[#101828] transition-colors hover:bg-[#F9FAFB]"
          >
            {secondaryLabel}
          </button>
          <button
            type="button"
            onClick={onPrimary}
            disabled={primaryDisabled}
            className={`h-[50px] flex-1 rounded-[7px] text-xs font-semibold transition-colors ${
              primaryDisabled
                ? DISABLED_FILLED_CLASS
                : "bg-[#990011] text-white hover:bg-[#7a000e]"
            }`}
          >
            {primaryLabel}
          </button>
        </div>
      </motion.div>
    </div>
  )
}

const ProfileDrawer = ({ open, onClose, ...props }) => {
  return createPortal(
    <AnimatePresence>
      {open && <DrawerContent onClose={onClose} {...props} />}
    </AnimatePresence>,
    document.body,
  )
}

export default ProfileDrawer
