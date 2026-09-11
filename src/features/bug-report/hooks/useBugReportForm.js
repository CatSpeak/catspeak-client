import { useState, useEffect, useCallback } from "react"
import { toast } from "react-hot-toast"
import { useLanguage } from "@/shared/context/LanguageContext"
import { parseApiError } from "@/shared/utils/apiError"
import { extractRelevantLogs } from "@/shared/utils/telemetry/logFilter"
import {
  useSubmitBugReportMutation,
  useUploadBugScreenshotMutation,
} from "@/store/api/bugReportApi"

export const MAX_BUG_IMAGES = 3
export const MAX_BUG_FILE_SIZE = 5 * 1024 * 1024
// Viewport-only capture (Q1/Q7): chỉ chụp đúng vùng đang nhìn thấy,
// không chụp full-page. Modal giữ nguyên trên màn hình (Q2/Q3) và bị loại
// khỏi ảnh qua ignoreElements nên không cần unmount nữa.
// Delay nhỏ chỉ để spinner kịp paint trước khi html2canvas block main thread.
export const CAPTURE_PAINT_DELAY_MS = 80
// Giữ export cũ để không gãy import bên ngoài (deprecated, không dùng nữa).
export const CAPTURE_HIDE_DELAY_MS = CAPTURE_PAINT_DELAY_MS
// Q6: viewport đã nhỏ hơn full-page nhiều nên tăng nét vẫn khó vượt 5MB.
export const CAPTURE_SCALE = 0.85
export const CAPTURE_IGNORE_ATTR = "data-html2canvas-ignore"

/**
 * Q5: loại mọi overlay khỏi ảnh, chỉ giữ nền web phía sau.
 * - [data-html2canvas-ignore]: Modal root, nút bug nổi, dropdown portal...
 * - .p-toast*: PrimeReact toast (AppToaster)
 * - .go4109123758 / [data-rht-toaster]: react-hot-toast container
 * - [data-dropdown-portal] / .dropdown-portal: Dropdown portal (nằm ngoài modal)
 * Pure function để dễ test đơn.
 */
export function shouldIgnoreCaptureElement(el) {
  if (!el || typeof el.closest !== "function") return false
  try {
    if (el.closest(`[${CAPTURE_IGNORE_ATTR}]`)) return true
    if (
      el.closest(
        ".p-toast, .p-toast-message, [data-dropdown-portal], .dropdown-portal, [data-rht-toaster], .go4109123758",
      )
    )
      return true
  } catch {
    return false
  }
  return false
}

export function useBugReportForm({
  isOpen,
  initialTitle = "",
  initialDescription = "",
  onClose,
  roomContext = null,
}) {
  const { t } = useLanguage()
  const lang = t.bugReport || {}

  // Merge legacy title into description for new modal without title field
  const mergedInitialDescription = initialTitle
    ? initialDescription
      ? `${initialTitle}\n\n${initialDescription}`
      : initialTitle
    : initialDescription

  const [description, setDescription] = useState(mergedInitialDescription)
  const [category, setCategory] = useState("ui_issue")
  const [includeScreenshot, setIncludeScreenshot] = useState(false)
  const [screenshotDataUrl, setScreenshotDataUrl] = useState(null)
  const [screenshotUrl, setScreenshotUrl] = useState(null)
  const [isCapturing, setIsCapturing] = useState(false)
  // Deprecated (Q2/Q3): modal không còn bị unmount khi chụp nữa, luôn giữ false
  // để tương thích import cũ ở BugReportModal.
  const [isHiddenForCapture] = useState(false)
  const [previewOpen, setPreviewOpen] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const [submitBugReport, { isLoading }] = useSubmitBugReportMutation()
  const [uploadScreenshot] = useUploadBugScreenshotMutation()

  const resolveErrorMessage = (err, fallback) => {
    const { errorCode, message, validationErrors } = parseApiError(err)
    if (errorCode && lang.errorCodes?.[errorCode]) {
      return lang.errorCodes[errorCode]
    }
    if (Array.isArray(validationErrors) && validationErrors.length > 0) {
      const firstValErr = validationErrors[0]
      if (firstValErr?.errorCode && lang.errorCodes?.[firstValErr.errorCode]) {
        return lang.errorCodes[firstValErr.errorCode]
      }
      if (firstValErr?.message) {
        return firstValErr.message
      }
    }
    return message || fallback
  }

  // Reset state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setDescription(mergedInitialDescription)
      setCategory("ui_issue")
      setIncludeScreenshot(false)
      setScreenshotDataUrl(null)
      setScreenshotUrl(null)
      setPreviewOpen(false)
      setShowConfirm(false)
    } else {
      // cleanup on close
      setScreenshotDataUrl(null)
      setScreenshotUrl(null)
      setPreviewOpen(false)
      setShowConfirm(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, mergedInitialDescription])

  const captureScreenshot = useCallback(async () => {
    if (isCapturing) return
    setIsCapturing(true)
    // Q3: giữ nguyên modal + freeze nút, chỉ chờ spinner kịp paint.
    await new Promise((r) => setTimeout(r, CAPTURE_PAINT_DELAY_MS))
    try {
      const html2canvas = (await import("html2canvas")).default
      // Q1/Q7: viewport-only tại đúng vị trí scroll hiện tại.
      const x = window.scrollX || window.pageXOffset || 0
      const y = window.scrollY || window.pageYOffset || 0
      const width = window.innerWidth || document.documentElement.clientWidth
      const height = window.innerHeight || document.documentElement.clientHeight
      const canvas = await html2canvas(document.body, {
        scale: CAPTURE_SCALE,
        useCORS: true,
        logging: false,
        x,
        y,
        width,
        height,
        windowWidth: document.documentElement.clientWidth,
        windowHeight: document.documentElement.clientHeight,
        // Q2/Q5: modal vẫn hiện nhưng bị loại khỏi ảnh, chỉ giữ nền web.
        ignoreElements: (el) => shouldIgnoreCaptureElement(el),
      })
      const dataUrl = canvas.toDataURL("image/png")
      setScreenshotDataUrl(dataUrl)

      // Try to upload to get persistent URL
      try {
        const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/png", 0.8))
        if (blob) {
          const file = new File([blob], `screenshot-${Date.now()}.png`, { type: "image/png" })
          const formData = new FormData()
          formData.append("file", file)
          const res = await uploadScreenshot(formData).unwrap()
          const rawUrl = res?.data?.url ?? res?.url
          const uploadedUrl =
            typeof rawUrl === "string"
              ? rawUrl
              : typeof rawUrl?.url === "string"
                ? rawUrl.url
                : null
          if (uploadedUrl) {
            setScreenshotUrl(uploadedUrl)
          } else {
            // fallback to dataUrl as URL
            setScreenshotUrl(dataUrl)
          }
        } else {
          setScreenshotUrl(dataUrl)
        }
      } catch (uploadErr) {
        // fallback to dataUrl if upload fails
        console.warn("Screenshot upload failed, using dataUrl fallback:", uploadErr)
        setScreenshotUrl(dataUrl)
      }
    } catch (err) {
      console.error("Failed to capture screenshot:", err)
      toast.error(lang.captureFailed || "Không thể chụp màn hình. Vui lòng thử lại.")
      // Q8: fail thì giữ nội dung + giữ checkbox để user Chụp lại/upload tay,
      // không tự tắt checkbox hay xóa mô tả.
      setScreenshotDataUrl(null)
      setScreenshotUrl(null)
    } finally {
      setIsCapturing(false)
    }
  }, [uploadScreenshot, lang.captureFailed, isCapturing])

  const handleToggleScreenshot = async (checked) => {
    setIncludeScreenshot(checked)
    if (checked) {
      if (!screenshotDataUrl) {
        await captureScreenshot()
      }
    }
  }

  const handleRetakeScreenshot = useCallback(async () => {
    setScreenshotDataUrl(null)
    setScreenshotUrl(null)
    setIncludeScreenshot(true)
    await captureScreenshot()
  }, [captureScreenshot])

  const handleRemoveScreenshot = useCallback(() => {
    setScreenshotDataUrl(null)
    setScreenshotUrl(null)
    setIncludeScreenshot(false)
  }, [])

  const hasUnsaved = description.trim().length > 0 || includeScreenshot

  const handleRequestClose = useCallback(() => {
    // Q3: đang chụp thì freeze, không cho đóng (kể cả X/backdrop/Escape).
    if (isCapturing) return
    if (hasUnsaved) {
      setShowConfirm(true)
    } else {
      onClose?.()
    }
  }, [hasUnsaved, onClose, isCapturing])

  const confirmDiscard = useCallback(() => {
    setShowConfirm(false)
    onClose?.()
  }, [onClose])

  const cancelDiscard = useCallback(() => {
    setShowConfirm(false)
  }, [])

  const handleSubmit = async (e) => {
    e?.preventDefault()
    if (!description.trim()) {
      toast.error(lang.errorCodes?.BUG_REPORT_DESCRIPTION_REQUIRED || lang.descRequired || "Vui lòng nhập mô tả sự cố")
      return
    }

    try {
      const diagnosticsData = extractRelevantLogs()

      // Screenshots: if includeScreenshot and we have URL/dataUrl, send it
      let screenshotsPayload = null
      if (includeScreenshot) {
        const urlToSend = screenshotUrl || screenshotDataUrl
        if (urlToSend) {
          screenshotsPayload = JSON.stringify([urlToSend])
        } else if (isCapturing) {
          toast.error(lang.captureFailed || "Đang chụp màn hình, vui lòng đợi...")
          return
        }
      }

      // Q6: gửi ngầm room context — BE không có field roomId nên prefix vào description.
      // url (room URL) + userId (auth claim) BE đã tự ghi nhận.
      const roomPrefix =
        roomContext?.roomId || roomContext?.roomName
          ? `[Phòng: ${roomContext.roomName || roomContext.roomId}${roomContext.roomId && roomContext.roomName ? ` (${roomContext.roomId})` : ""}]\n`
          : ""

      const payload = {
        // Title optional per BE Q6=A, BE will auto-generate; send null to let BE generate from description
        title: null,
        description: `${roomPrefix}${description.trim()}`,
        category,
        severity: diagnosticsData?.suggestedSeverity || "low",
        url: window.location.href,
        userAgent: navigator.userAgent,
        deviceInfo: diagnosticsData?.deviceInfo || null,
        networkLogs: diagnosticsData?.networkLogs || null,
        consoleLogs: diagnosticsData?.consoleLogs || null,
        screenshots: screenshotsPayload,
      }

      await submitBugReport(payload).unwrap()
      toast.success(lang.submitSuccess || "Báo cáo sự cố đã được gửi thành công!")
      onClose?.()
    } catch (err) {
      console.error("Bug report submission failed:", err)
      const errMsg = resolveErrorMessage(err, lang.submitError || "Không thể gửi báo cáo sự cố. Vui lòng thử lại sau.")
      toast.error(errMsg)
    }
  }

  const categoryOptions = [
    { value: "ui_issue", label: lang.categories?.ui_issue || "Giao diện / Hiển thị" },
    { value: "api_error", label: lang.categories?.api_error || "Lỗi kết nối / Tải dữ liệu" },
    { value: "video_audio", label: lang.categories?.video_audio || "Video Call / Âm thanh" },
    { value: "payment", label: lang.categories?.payment || "Thanh toán / Giao dịch" },
    { value: "course_exam", label: lang.categories?.course_exam || "Khóa học / Bài học / Đề thi" },
    { value: "other", label: lang.categories?.other || "Khác" },
  ]

  return {
    lang,
    description,
    setDescription,
    category,
    setCategory,
    includeScreenshot,
    screenshotDataUrl,
    screenshotUrl,
    isCapturing,
    isHiddenForCapture,
    previewOpen,
    setPreviewOpen,
    showConfirm,
    isLoading,
    categoryOptions,
    handleToggleScreenshot,
    handleRetakeScreenshot,
    handleRemoveScreenshot,
    captureScreenshot,
    handleRequestClose,
    confirmDiscard,
    cancelDiscard,
    handleSubmit,
    hasUnsaved,
  }
}
