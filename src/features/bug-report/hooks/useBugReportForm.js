import { useState, useEffect, useRef } from "react"
import { toast } from "react-hot-toast"
import { useLanguage } from "@/shared/context/LanguageContext"
import { extractRelevantLogs } from "@/shared/utils/telemetry/logFilter"
import {
  useSubmitBugReportMutation,
  useUploadBugScreenshotMutation,
} from "@/store/api/bugReportApi"

export const MAX_BUG_IMAGES = 3
export const MAX_BUG_FILE_SIZE = 5 * 1024 * 1024 // 5MB

export function useBugReportForm({
  isOpen,
  initialTitle = "",
  initialDescription = "",
  onClose,
}) {
  const { t } = useLanguage()
  const lang = t.bugReport || {}

  const [title, setTitle] = useState(initialTitle)
  const [description, setDescription] = useState(initialDescription)
  const [category, setCategory] = useState("ui_issue")
  const [screenshots, setScreenshots] = useState([])
  const [isUploadingImage, setIsUploadingImage] = useState(false)
  const fileInputRef = useRef(null)

  const [submitBugReport, { isLoading }] = useSubmitBugReportMutation()
  const [uploadScreenshot] = useUploadBugScreenshotMutation()

  // Reset or initialize state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setTitle(initialTitle)
      setDescription(initialDescription)
    } else {
      setScreenshots([])
    }
  }, [isOpen, initialTitle, initialDescription])

  // Upload image file to server storage and store public URL
  const processImageFile = async (file) => {
    if (!file || !file.type.startsWith("image/")) return

    if (file.size > MAX_BUG_FILE_SIZE) {
      toast.error(lang.imageTooLarge || "Dung lượng ảnh vượt quá giới hạn 5MB")
      return
    }

    if (screenshots.length >= MAX_BUG_IMAGES) {
      toast.error(lang.maxImagesReached || "Bạn chỉ có thể đính kèm tối đa 3 hình ảnh")
      return
    }

    try {
      setIsUploadingImage(true)
      const formData = new FormData()
      formData.append("file", file)

      const res = await uploadScreenshot(formData).unwrap()
      const uploadedUrl = res?.data?.url || res?.url
      if (uploadedUrl) {
        setScreenshots((prev) => [...prev, uploadedUrl])
        toast.success("Đã tải ảnh lên thành công!")
      } else {
        toast.error("Không nhận được đường dẫn ảnh từ máy chủ.")
      }
    } catch (err) {
      console.error("Failed to upload screenshot:", err)
      toast.error("Không thể tải ảnh lên kho lưu trữ. Vui lòng thử lại.")
    } finally {
      setIsUploadingImage(false)
    }
  }

  // Handle file picker selection
  const handleFileSelect = async (e) => {
    const files = Array.from(e.target.files || [])
    for (const file of files) {
      await processImageFile(file)
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  // Handle clipboard paste (Ctrl+V) anywhere inside the modal
  useEffect(() => {
    if (!isOpen) return

    const handlePaste = (e) => {
      const items = e.clipboardData?.items
      if (!items) return

      for (const item of items) {
        if (item.type.startsWith("image/")) {
          const file = item.getAsFile()
          if (file) {
            processImageFile(file)
          }
        }
      }
    }

    window.addEventListener("paste", handlePaste)
    return () => window.removeEventListener("paste", handlePaste)
  }, [isOpen, screenshots.length])

  const removeScreenshot = (indexToRemove) => {
    setScreenshots((prev) => prev.filter((_, idx) => idx !== indexToRemove))
  }

  const handleSubmit = async (e) => {
    e?.preventDefault()
    if (!title.trim()) {
      toast.error(lang.titleRequired || "Vui lòng nhập tiêu đề sự cố")
      return
    }
    if (!description.trim()) {
      toast.error(lang.descRequired || "Vui lòng nhập mô tả sự cố")
      return
    }

    try {
      // Extract technical telemetry logs silently in background
      const diagnosticsData = extractRelevantLogs()

      const payload = {
        title: title.trim(),
        description: description.trim(),
        category,
        severity: diagnosticsData?.suggestedSeverity || "low",
        url: window.location.href,
        userAgent: navigator.userAgent,
        deviceInfo: diagnosticsData?.deviceInfo || null,
        networkLogs: diagnosticsData?.networkLogs || null,
        consoleLogs: diagnosticsData?.consoleLogs || null,
        screenshots: screenshots.length > 0 ? JSON.stringify(screenshots) : null,
      }

      await submitBugReport(payload).unwrap()
      toast.success(lang.submitSuccess || "Báo cáo sự cố đã được gửi thành công!")
      setScreenshots([])
      onClose?.()
    } catch (err) {
      console.error("Bug report submission failed:", err)
      toast.error(lang.submitError || "Không thể gửi báo cáo sự cố. Vui lòng thử lại sau.")
    }
  }

  const categoryOptions = [
    { value: "ui_issue", label: lang.categories?.ui_issue || "Giao diện / Hiển thị" },
    { value: "api_error", label: lang.categories?.api_error || "Lỗi kết nối / Tải dữ liệu" },
    { value: "video_audio", label: lang.categories?.video_audio || "Video Call / Âm thanh" },
    { value: "payment", label: lang.categories?.payment || "Thanh toán / Giao dịch" },
    { value: "course_exam", label: lang.categories?.course_exam || "Khóa học / Bài tập / Đề thi" },
    { value: "other", label: lang.categories?.other || "Khác" },
  ]

  return {
    lang,
    title,
    setTitle,
    description,
    setDescription,
    category,
    setCategory,
    screenshots,
    isUploadingImage,
    fileInputRef,
    isLoading,
    categoryOptions,
    processImageFile,
    handleFileSelect,
    removeScreenshot,
    handleSubmit,
  }
}
