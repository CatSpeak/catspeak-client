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
// Q7: chờ animation modal đóng xong trước khi html2canvas, tránh dính form vào ảnh
export const CAPTURE_HIDE_DELAY_MS = 350

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
  const [isHiddenForCapture, setIsHiddenForCapture] = useState(false)
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
    setIsCapturing(true)
    // Q4/Q7: ẩn modal tạm thời để ảnh chụp không dính form.
    // Modal là portal z-[1300] nên html2canvas(document.body) sẽ dính nó.
    // Unmount tạm + delay cho animation đóng xong rồi mới chụp.
    setIsHiddenForCapture(true)
    await new Promise((r) => setTimeout(r, CAPTURE_HIDE_DELAY_MS))
    try {
      const html2canvas = (await import("html2canvas")).default
      const canvas = await html2canvas(document.body, {
        scale: 0.5,
        useCORS: true,
        logging: false,
        windowWidth: document.documentElement.clientWidth,
        windowHeight: document.documentElement.clientHeight,
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
      setIncludeScreenshot(false)
      setScreenshotDataUrl(null)
      setScreenshotUrl(null)
    } finally {
      setIsHiddenForCapture(false)
      setIsCapturing(false)
    }
  }, [uploadScreenshot, lang.captureFailed])

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
    if (hasUnsaved) {
      setShowConfirm(true)
    } else {
      onClose?.()
    }
  }, [hasUnsaved, onClose])

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
