import React, { useEffect, useRef } from "react"
import { createPortal } from "react-dom"
import { AnimatePresence, motion } from "framer-motion" // eslint-disable-line no-unused-vars
import { Check, X, Calendar, Clock, Loader2 } from "lucide-react"
import { formatCurrencyVND } from "../../utils/courseUtils"
import { useTimezone } from "@/shared/hooks/useTimezone"

const FOCUSABLE_SELECTOR = [
  "button:not([disabled])",
  "[href]",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  "[tabindex]:not([tabindex='-1'])",
].join(", ")

const StudentJoinModal = ({
  open,
  onClose,
  onConfirm,
  course,
  selectedClass,
  isSubmitting,
  success,
  onSuccessClose,
  t,
}) => {
  const { formatScheduleDays, formatScheduleTime } = useTimezone()
  const dialogRef = useRef(null)
  const previousFocusRef = useRef(null)

  useEffect(() => {
    if (!open) return undefined

    previousFocusRef.current = document.activeElement
    const frameId = window.requestAnimationFrame(() => {
      const firstFocusableElement = dialogRef.current?.querySelector(
        FOCUSABLE_SELECTOR,
      )
      const focusTarget = firstFocusableElement || dialogRef.current
      focusTarget?.focus()
    })

    return () => {
      window.cancelAnimationFrame(frameId)
      previousFocusRef.current?.focus?.()
      previousFocusRef.current = null
    }
  }, [open])

  useEffect(() => {
    if (!open) return undefined

    const handleKeyDown = (event) => {
      if (event.key === "Escape" && !isSubmitting) {
        event.preventDefault()
        if (success) onSuccessClose?.()
        else onClose?.()
        return
      }

      if (event.key !== "Tab" || !dialogRef.current) return
      const focusableElements = dialogRef.current.querySelectorAll(
        FOCUSABLE_SELECTOR,
      )
      if (focusableElements.length === 0) {
        event.preventDefault()
        dialogRef.current.focus()
        return
      }

      const firstElement = focusableElements[0]
      const lastElement = focusableElements[focusableElements.length - 1]
      const activeElementIsOutside = !dialogRef.current.contains(
        document.activeElement,
      )
      if (
        event.shiftKey
        && (
          document.activeElement === firstElement
          || document.activeElement === dialogRef.current
          || activeElementIsOutside
        )
      ) {
        event.preventDefault()
        lastElement.focus()
      } else if (
        !event.shiftKey
        && (
          document.activeElement === lastElement
          || document.activeElement === dialogRef.current
          || activeElementIsOutside
        )
      ) {
        event.preventDefault()
        firstElement.focus()
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [isSubmitting, onClose, onSuccessClose, open, success])

  if (!open || !course || !selectedClass) return null

  const sc = t?.courses?.student || {}
  const tuitionLabel = selectedClass.tuitionFee == null
    ? sc.toBeAnnounced
    : Number(selectedClass.tuitionFee) === 0
      ? (sc.priceFree || "Miễn phí")
      : formatCurrencyVND(selectedClass.tuitionFee)
  const startFormatted = formatScheduleTime && selectedClass.schedule?.startTime
    ? formatScheduleTime(selectedClass.schedule.startTime, selectedClass.startDate)
    : selectedClass.schedule?.startTime

  const endFormatted = formatScheduleTime && selectedClass.schedule?.endTime
    ? formatScheduleTime(selectedClass.schedule.endTime, selectedClass.startDate)
    : selectedClass.schedule?.endTime

  const scheduleTime = (startFormatted && endFormatted)
    ? `${startFormatted} - ${endFormatted}`
    : sc.toBeAnnounced

  const modalBody = (
    <AnimatePresence>
      <div className="fixed inset-0 z-[1500] flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          role="presentation"
          aria-hidden="true"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-xs"
          onClick={isSubmitting ? null : success ? onSuccessClose : onClose}
        />

        {/* Modal Window */}
        <motion.div
          ref={dialogRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby="student-enrollment-dialog-title"
          tabIndex={-1}
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-md bg-white rounded-3xl overflow-hidden shadow-2xl p-6 z-10 flex flex-col items-center"
        >
          {/* Close button (only shown if not submitting and not success) */}
          {!isSubmitting && !success && (
            <button
              type="button"
              onClick={onClose}
              aria-label={sc.closeEnrollmentDialog}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-50 hover:bg-gray-100 text-gray-400 hover:text-gray-600 flex items-center justify-center transition-colors"
            >
              <X size={16} />
            </button>
          )}

          {success ? (
            /* Success State */
            <div className="flex flex-col items-center text-center py-4 w-full">
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: [1.2, 1], opacity: 1 }}
                transition={{ duration: 0.4, type: "spring" }}
                className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center text-green-600 mb-5"
              >
                <Check size={36} className="stroke-[3.5]" />
              </motion.div>

              <h3 id="student-enrollment-dialog-title" className="text-xl font-black text-gray-950 tracking-tight">
                {sc.enrollmentConfirmedTitle}
              </h3>
              <p className="text-sm text-gray-500 font-semibold mt-2.5 px-4 leading-relaxed">
                {sc.enrolledSuccess.replace("{{className}}", selectedClass.title)}
              </p>

              {/* Class summary card */}
              <div className="bg-gray-50 rounded-2xl p-4 border border-border w-full text-left my-6 flex flex-col gap-2.5 text-xs text-gray-600 font-semibold">
                <p className="font-extrabold text-gray-900 text-sm truncate">{course.title}</p>
                <div className="flex items-center gap-2">
                  <Calendar size={13} className="text-gray-400" />
                  <span>
                    {formatScheduleDays(
                      selectedClass.schedule?.days,
                      sc.toBeAnnounced,
                      " - ",
                      selectedClass.schedule?.startTime,
                    )}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock size={13} className="text-gray-400" />
                  <span>{scheduleTime}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={onSuccessClose}
                className="w-full h-11 bg-green-600 hover:bg-green-700 text-white font-extrabold text-sm rounded-full flex items-center justify-center transition-colors shadow-sm active:scale-95"
              >
                {sc.goToClasses}
              </button>
            </div>
          ) : (
            /* Confirmation State */
            <div className="w-full flex flex-col items-center">
              <h3 id="student-enrollment-dialog-title" className="text-lg font-black text-gray-950 tracking-tight text-center mt-2">
                {sc.enrollmentConfirmTitle}
              </h3>

              <p className="text-sm text-gray-500 font-semibold text-center mt-3 leading-relaxed px-2">
                {sc.enrollmentConfirmMsg
                  .replace("{{className}}", selectedClass.title)
                  .replace("{{courseName}}", course.title)}
              </p>

              {/* Fee info */}
              <div className="w-full bg-gray-50 rounded-2xl p-4 border border-border my-5 flex flex-col gap-2">
                <div className="flex justify-between items-center text-xs font-bold">
                  <span className="text-gray-400">{sc.classBatch}</span>
                  <span className="text-gray-800 text-right truncate max-w-[200px]">{selectedClass.title}</span>
                </div>
                <div className="flex justify-between items-center text-xs font-bold border-t border-border/50 pt-2 mt-1">
                  <span className="text-gray-400 uppercase">{sc.tuition}</span>
                  <span className="text-[#b20a1c] font-black text-sm">{tuitionLabel}</span>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex flex-col gap-2.5 w-full">
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={onConfirm}
                  className="w-full h-11 bg-[#b20a1c] hover:bg-[#990011] disabled:bg-gray-300 text-white font-extrabold text-sm rounded-full flex items-center justify-center gap-2 transition-colors shadow-xs active:scale-95"
                >
                  {isSubmitting && <Loader2 size={16} className="animate-spin" />}
                  <span>{sc.enrollNow}</span>
                </button>

                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={onClose}
                  className="w-full h-11 bg-white hover:bg-gray-50 border border-gray-250 text-gray-700 font-extrabold text-sm rounded-full flex items-center justify-center transition-colors active:scale-95"
                >
                  {sc.cancel}
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  )

  return createPortal(modalBody, document.body)
}

export default StudentJoinModal
