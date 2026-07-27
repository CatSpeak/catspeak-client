import React, { useEffect, useState, useMemo, useRef } from "react"
import { useLanguage } from "@/shared/context/LanguageContext"
import { toast } from "react-hot-toast"
import {
  ChevronLeft,
  FileText,
  Upload,
  Trash2,
  Calendar,
  Paperclip,
  Lock,
  Unlock,
  AlertTriangle,
  Eye
} from "lucide-react"
import {
  useGetStudentAssignmentByIdQuery,
  useGetMyAssignmentSubmissionQuery,
  useSubmitAssignmentMutation
} from "@/store/api/coursesApi"
import { LoadingSpinner } from "@/shared/components/ui/indicators"
import RenderHTML from "@/shared/components/ui/RenderHTML"
import { Editor } from "@tinymce/tinymce-react"
import { formatFileSize, getFileIconColorClass } from "../../utils/courseUtils"
import {
  getFileMeta,
  getSafeFileUrl,
} from "../../utils/assignmentUtils"
import {
  formatSubmissionDate,
  getSafeSubmissionErrorMessage,
  getValidAttachmentList,
  getValidDateMs,
} from "../../utils/submissionUtils"

const MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024
const EMPTY_ATTACHMENTS = Object.freeze([])
const ASSIGNMENT_STATUSES = new Set(["closed", "draft", "published"])
const SUBMISSION_STATUSES = new Set(["graded", "late", "returned", "submitted"])

const isRecord = (value) => (
  value !== null && typeof value === "object" && !Array.isArray(value)
)

const unwrapResponse = (response) => (
  isRecord(response)
    && Object.prototype.hasOwnProperty.call(response, "data")
    ? response.data
    : response
)

const getRecordFromResponse = (response) => {
  const payload = unwrapResponse(response)
  return isRecord(payload) ? payload : null
}

const isNotFoundError = (error) => (
  Number(error?.status ?? error?.originalStatus) === 404
)

const hasValidId = (value) => (
  ["string", "number"].includes(typeof value)
  && String(value).trim().length > 0
)

const getAllowedFileTypes = (value) => {
  const values = Array.isArray(value)
    ? value
    : (typeof value === "string" ? value.split(",") : [])

  return [...new Set(values
    .map((type) => String(type).trim().toLowerCase())
    .filter(Boolean)
    .map((type) => type.startsWith(".") ? type : `.${type}`)
    .filter((type) => /^\.[a-z0-9]+$/.test(type)))]
}

const getFileExtension = (fileName) => {
  if (typeof fileName !== "string") return ""
  const dotIndex = fileName.lastIndexOf(".")
  return dotIndex >= 0 ? fileName.slice(dotIndex).toLowerCase() : ""
}

const getValidMaxFiles = (value) => {
  const maxFiles = Number(value)
  return Number.isInteger(maxFiles) && maxFiles >= 1 && maxFiles <= 5
    ? maxFiles
    : null
}

const hasMeaningfulText = (html) => (
  typeof html === "string"
  && html
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;|&#160;/gi, " ")
    .trim().length > 0
)

const formatSubmissionFileSize = (value) => {
  if (value === null || value === undefined || value === "") return "—"

  const size = Number(value)
  return Number.isFinite(size) && size > 0 && size < (1024 ** 4)
    ? formatFileSize(size)
    : "—"
}

const StudentAssignmentDetailContent = ({ assignment: initialAssignment, assignmentId: assignmentIdProp, classId, onBack }) => {
  const { language, t } = useLanguage()
  const c = t.courses || {}
  const cd = c.classDetail || {}
  const cg = c.grading || {}
  const ca = c.createAssignment || {}

  const assignmentId = assignmentIdProp ?? initialAssignment?.id

  // Fetch complete/latest details of the assignment for student
  const {
    currentData: assignmentResponse,
    isSuccess: isAssignmentSuccess,
    isLoading: isAssignmentLoading,
    error: assignmentError,
    refetch: refetchAssignment,
  } = useGetStudentAssignmentByIdQuery(
    { classId, assignmentId },
    { skip: !classId || !assignmentId }
  )
  const assignmentPayload = getRecordFromResponse(assignmentResponse)
  const fallbackAssignment = isRecord(initialAssignment) ? initialAssignment : null
  const assignment = assignmentResponse == null
    ? fallbackAssignment
    : assignmentPayload
  const hasMalformedAssignment = (
    !isAssignmentLoading
    && (
      !assignment
      || (isAssignmentSuccess && !assignmentPayload)
      || (assignmentResponse != null && !assignmentPayload)
    )
  )

  // Fetch the submission of the student
  const {
    currentData: submissionResponse,
    isSuccess: isSubmissionSuccess,
    isLoading: isSubmissionLoading,
    error: submissionError,
    refetch: refetchSubmission,
  } = useGetMyAssignmentSubmissionQuery(
    { classId, assignmentId },
    { skip: !classId || !assignmentId }
  )
  const submissionPayload = unwrapResponse(submissionResponse)
  const submission = isRecord(submissionPayload) ? submissionPayload : null
  const parsedSubmissionFiles = useMemo(
    () => getValidAttachmentList(submission?.files),
    [submission?.files]
  )
  const submissionStatus = typeof submission?.status === "string"
    ? submission.status.trim().toLowerCase()
    : ""
  const hasSubmissionGrade = (
    submission?.grade !== null
    && submission?.grade !== undefined
    && submission?.grade !== ""
  )
  const hasInvalidSubmissionDate = Boolean(
    submission?.submittedAt
    && getValidDateMs(submission.submittedAt) === null
  )
  const hasInvalidSubmissionFiles = parsedSubmissionFiles === null
  const hasMalformedSubmission = (
    (isSubmissionSuccess && submissionResponse === undefined)
    || (
      submissionResponse != null
      && submissionPayload != null
      && (
        !submission
        || !hasValidId(submission?.id)
        || !SUBMISSION_STATUSES.has(submissionStatus)
        || (
          submission.contentText !== null
          && submission.contentText !== undefined
          && typeof submission.contentText !== "string"
        )
        || (
          submission.comment !== null
          && submission.comment !== undefined
          && typeof submission.comment !== "string"
        )
        || (hasSubmissionGrade && !Number.isFinite(Number(submission.grade)))
        || hasInvalidSubmissionDate
        || hasInvalidSubmissionFiles
      )
    )
  )

  const [submitAssignment, { isLoading: isSubmitting }] = useSubmitAssignmentMutation()

  // Form states
  const [textDraft, setTextDraft] = useState(null)
  const [lastSubmittedText, setLastSubmittedText] = useState(null)
  const [selectedFiles, setSelectedFiles] = useState([])
  const fileInputRef = useRef(null)
  const submitInFlightRef = useRef(false)
  const componentActiveRef = useRef(true)
  const [dragActive, setDragActive] = useState(false)
  const [nowMs, setNowMs] = useState(() => Date.now())
  const submissionText = typeof submission?.contentText === "string"
    ? submission.contentText
    : ""
  const submissionComment = typeof submission?.comment === "string"
    ? submission.comment
    : ""
  const textContent = textDraft ?? submissionText
  const displayedSubmissionText = lastSubmittedText ?? submissionText
  const assignmentDescription = typeof assignment?.description === "string"
    ? assignment.description
    : ""
  const dueDateMs = getValidDateMs(assignment?.dueDate)
  const hasInvalidDueDate = Boolean(assignment?.dueDate && dueDateMs === null)
  const teacherAttachments = (
    assignment?.attachments
    ?? assignment?.files
    ?? EMPTY_ATTACHMENTS
  )
  const parsedTeacherAttachments = useMemo(
    () => getValidAttachmentList(teacherAttachments),
    [teacherAttachments]
  )
  const hasInvalidTeacherAttachments = parsedTeacherAttachments === null
  const maxFiles = getValidMaxFiles(assignment?.maxFiles)
  const allowedFileTypes = getAllowedFileTypes(assignment?.allowedFileTypes)
  const hasConfiguredFileTypes = (
    Array.isArray(assignment?.allowedFileTypes)
      ? assignment.allowedFileTypes.length > 0
      : typeof assignment?.allowedFileTypes === "string"
      && assignment.allowedFileTypes.trim().length > 0
  )
  const hasInvalidAllowedFileTypes = Boolean(
    assignment?.allowedFileTypes !== null
    && assignment?.allowedFileTypes !== undefined
    && !Array.isArray(assignment.allowedFileTypes)
    && typeof assignment.allowedFileTypes !== "string"
  ) || (hasConfiguredFileTypes && allowedFileTypes.length === 0)
  const allowsTextSubmission = assignment?.allowTextSubmission === true
  const allowsFileSubmission = assignment?.allowFileSubmission === true
  const assignmentStatus = typeof assignment?.status === "string"
    ? assignment.status.trim().toLowerCase()
    : ""
  const allowsLateSubmission = assignment?.allowLateSubmission === true
  const isDraftAssignment = assignmentStatus === "draft"
  const isPublishedAssignment = assignmentStatus === "published"
  const assignmentMaxScore = Number(assignment?.maxScore)
  const displayMaxScore = Number.isFinite(assignmentMaxScore) && assignmentMaxScore > 0
    ? assignmentMaxScore
    : null
  const hasInvalidSubmissionConfiguration = Boolean(
    assignment
    && (
      (!allowsTextSubmission && !allowsFileSubmission)
      || (allowsFileSubmission && maxFiles === null)
      || (allowsFileSubmission && hasInvalidAllowedFileTypes)
      || !ASSIGNMENT_STATUSES.has(assignmentStatus)
      || typeof assignment.allowLateSubmission !== "boolean"
    )
  )

  useEffect(() => {
    const timerId = window.setInterval(() => setNowMs(Date.now()), 30_000)
    return () => window.clearInterval(timerId)
  }, [])

  useEffect(() => {
    componentActiveRef.current = true
    return () => {
      componentActiveRef.current = false
    }
  }, [])

  // Get status details
  const isExpired = dueDateMs !== null && dueDateMs < nowMs

  const isSubmissionLate = useMemo(() => {
    const submittedAtMs = getValidDateMs(submission?.submittedAt)
    return (
      submittedAtMs !== null
      && dueDateMs !== null
      && submittedAtMs > dueDateMs
    )
  }, [dueDateMs, submission?.submittedAt])

  const isClosed = assignmentStatus === "closed"

  const allowSubmission = useMemo(() => {
    if (!isPublishedAssignment || hasInvalidDueDate || hasInvalidSubmissionConfiguration) return false
    if (isExpired && !allowsLateSubmission) return false
    return true
  }, [
    allowsLateSubmission,
    hasInvalidDueDate,
    hasInvalidSubmissionConfiguration,
    isExpired,
    isPublishedAssignment,
  ])

  // Drag & drop handlers
  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (isSubmitting) return

    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    if (isSubmitting) return

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      addFiles(e.dataTransfer.files)
    }
  }

  const handleFileSelect = (e) => {
    if (isSubmitting) {
      e.target.value = ""
      return
    }

    if (e.target.files && e.target.files.length > 0) {
      addFiles(e.target.files)
    }
    e.target.value = ""
  }

  const addFiles = (filesList) => {
    const files = Array.from(filesList || [])
    if (isSubmitting || files.length === 0 || maxFiles === null) return

    if (selectedFiles.length + files.length > maxFiles) {
      toast.error(
        language === "vi"
          ? `Tối đa ${maxFiles} tệp tin cho phép`
          : `Maximum of ${maxFiles} files allowed`
      )
      return
    }

    const existingFingerprints = new Set(selectedFiles.map((file) => (
      `${file.name}-${file.size}-${file.lastModified}`
    )))
    const selectionFingerprints = new Set()

    for (const file of files) {
      if (!file || typeof file.name !== "string") {
        toast.error(language === "vi" ? "Tệp đã chọn không hợp lệ." : "The selected file is invalid.")
        return
      }

      const extension = getFileExtension(file.name)
      if (allowedFileTypes.length > 0 && !allowedFileTypes.includes(extension)) {
        toast.error(
          language === "vi"
            ? `Định dạng tệp ${extension || "(không có)"} không hợp lệ. Chỉ chấp nhận: ${allowedFileTypes.join(", ")}`
            : `File format ${extension || "(none)"} is not allowed. Supported: ${allowedFileTypes.join(", ")}`
        )
        return
      }

      const fileSize = Number(file.size)
      if (!Number.isFinite(fileSize) || fileSize <= 0) {
        toast.error(
          language === "vi"
            ? `Tệp ${file.name} bị rỗng hoặc không hợp lệ`
            : `File ${file.name} is empty or invalid`
        )
        return
      }
      if (fileSize > MAX_FILE_SIZE_BYTES) {
        toast.error(
          language === "vi"
            ? `Kích thước tệp ${file.name} vượt quá 50MB`
            : `File ${file.name} exceeds the 50MB limit`
        )
        return
      }

      const fingerprint = `${file.name}-${file.size}-${file.lastModified}`
      if (
        existingFingerprints.has(fingerprint)
        || selectionFingerprints.has(fingerprint)
      ) {
        toast.error(
          language === "vi"
            ? `Tệp ${file.name} đã được chọn`
            : `File ${file.name} has already been selected`
        )
        return
      }
      selectionFingerprints.add(fingerprint)
    }

    setSelectedFiles((prev) => [...prev, ...files])
  }

  const removePendingFile = (idx) => {
    if (isSubmitting) return
    setSelectedFiles((prev) => prev.filter((_, i) => i !== idx))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (
      isSubmitting
      || submitInFlightRef.current
      || !classId
      || !assignmentId
    ) {
      return
    }

    const deadlineHasPassed = (
      dueDateMs !== null
      && dueDateMs < Date.now()
      && !allowsLateSubmission
    )
    if (!allowSubmission || deadlineHasPassed) {
      toast.error(
        language === "vi"
          ? "Bài nộp đã khóa hoặc hết hạn nộp!"
          : "Submissions are closed or expired!"
      )
      return
    }

    const hasText = allowsTextSubmission && hasMeaningfulText(textContent)
    const hasNewFiles = allowsFileSubmission && selectedFiles.length > 0
    const hasExistingFiles = allowsFileSubmission && parsedSubmissionFiles.length > 0
    const originalText = allowsTextSubmission ? submissionText.trim() : ""
    const currentText = allowsTextSubmission ? textContent.trim() : ""
    const hasTextChanged = currentText !== originalText

    if (!submission && !hasText && !hasNewFiles) {
      toast.error(
        language === "vi"
          ? "Vui lòng nhập nội dung hoặc tải lên ít nhất một tệp."
          : "Enter submission text or upload at least one file."
      )
      return
    }

    if (submission && !hasTextChanged && !hasNewFiles) {
      toast.error(
        language === "vi"
          ? "Hãy thay đổi nội dung hoặc chọn tệp mới trước khi nộp lại."
          : "Change the text or select a new file before resubmitting."
      )
      return
    }

    if (!hasText && !hasNewFiles && !hasExistingFiles) {
      toast.error(
        language === "vi"
          ? "Bài nộp không được để trống."
          : "The submission cannot be empty."
      )
      return
    }

    const formData = new FormData()
    if (allowsTextSubmission) {
      formData.append("ContentText", currentText)
    }

    if (allowsFileSubmission) {
      selectedFiles.forEach((file) => {
        formData.append("Files", file)
      })
    }

    submitInFlightRef.current = true
    try {
      await submitAssignment({
        classId,
        assignmentId,
        formData
      }).unwrap()

      if (!componentActiveRef.current) return

      toast.success(
        language === "vi"
          ? "Nộp bài tập thành công!"
          : "Successfully submitted assignment!"
      )
      setSelectedFiles([])
      setLastSubmittedText(currentText)
      setTextDraft(currentText)
    } catch (err) {
      if (!componentActiveRef.current) return

      toast.error(getSafeSubmissionErrorMessage(
        err,
        language,
        language === "vi"
          ? "Không thể nộp bài. Vui lòng kiểm tra nội dung và thử lại."
          : "The assignment could not be submitted. Check your work and try again."
      ))
    } finally {
      submitInFlightRef.current = false
    }
  }

  if (isAssignmentLoading || isSubmissionLoading) {
    return (
      <div
        role="status"
        aria-label={language === "vi" ? "Đang tải bài tập" : "Loading assignment"}
        className="flex justify-center items-center min-h-[400px]"
      >
        <LoadingSpinner />
      </div>
    )
  }

  const relevantSubmissionError = isNotFoundError(submissionError)
    ? null
    : submissionError

  if (
    !classId
    || !assignmentId
    || assignmentError
    || relevantSubmissionError
    || hasMalformedAssignment
    || hasMalformedSubmission
    || hasInvalidDueDate
    || hasInvalidTeacherAttachments
    || hasInvalidSubmissionConfiguration
    || isDraftAssignment
  ) {
    const requestError = assignmentError || relevantSubmissionError
    return (
      <div
        role="alert"
        className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl text-sm font-semibold flex flex-col items-start gap-3"
      >
        <span>
          {requestError
            ? getSafeSubmissionErrorMessage(
              requestError,
              language,
              language === "vi"
                ? "Không thể tải bài tập hoặc bài nộp."
                : "The assignment or submission could not be loaded."
            )
            : isDraftAssignment
              ? (language === "vi"
                ? "Bài tập này chưa được xuất bản."
                : "This assignment has not been published.")
              : (language === "vi"
                ? "Dữ liệu bài tập hoặc bài nộp không hợp lệ."
                : "The assignment or submission data is invalid.")}
        </span>
        {classId && assignmentId && (
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => {
                refetchAssignment()
                if (!isNotFoundError(submissionError)) {
                  refetchSubmission()
                }
              }}
              className="rounded-lg border border-red-300 bg-white px-3 py-1.5 text-xs font-extrabold text-red-700 hover:bg-red-50"
            >
              {language === "vi" ? "Thử lại" : "Try again"}
            </button>
            {typeof onBack === "function" && (
              <button
                type="button"
                onClick={onBack}
                className="rounded-lg border border-red-300 bg-white px-3 py-1.5 text-xs font-extrabold text-red-700 hover:bg-red-50"
              >
                {language === "vi" ? "Quay lại" : "Go back"}
              </button>
            )}
          </div>
        )}
      </div>
    )
  }

  const getStatusBadge = () => {
    if (!submission) {
      return (
        <span className="bg-red-50 text-red-655 text-[10px] font-extrabold px-2.5 py-1 rounded border border-red-100 uppercase tracking-wide">
          {cd.statusNotSubmitted || "Chưa nộp"}
        </span>
      )
    }

    const status = submissionStatus
    let displayStatus = status
    if (status === "graded") {
      displayStatus = isSubmissionLate ? "late" : "submitted"
    }

    if (displayStatus === "returned") {
      return (
        <span className="bg-emerald-50 text-emerald-650 text-[10px] font-extrabold px-2.5 py-1 rounded border border-emerald-100 uppercase tracking-wide">
          {cg.filterReturned || cd.statusGraded || "Đã trả bài"}
        </span>
      )
    }
    if (displayStatus === "late") {
      return (
        <span className="bg-red-50 text-red-650 text-[10px] font-extrabold px-2.5 py-1 rounded border border-red-100 uppercase tracking-wide">
          {cg.filterLate || "Nộp muộn"}
        </span>
      )
    }
    return (
      <span className="bg-orange-50 text-orange-655 text-[10px] font-extrabold px-2.5 py-1 rounded border border-orange-100 uppercase tracking-wide">
        {cd.statusNeedsGrading || "Đã nộp"}
      </span>
    )
  }

  // File rendering function
  const renderFileRow = (file, index, isPending = false) => {
    const { name: rawName, url, size } = getFileMeta(file)
    const name = typeof rawName === "string" && rawName.trim()
      ? rawName
      : (language === "vi" ? "Tệp không tên" : "Unnamed file")
    const safeUrl = getSafeFileUrl(url)

    return (
      <div
        key={`${safeUrl || name}-${index}`}
        className="flex items-center justify-between p-3 bg-gray-50 border border-gray-150 rounded-xl hover:bg-gray-100/50 transition-colors"
      >
        <div className="flex items-center gap-3 min-w-0">
          <FileText size={18} className={getFileIconColorClass(name)} />
          <div className="flex flex-col min-w-0">
            <span className="text-xs font-bold text-gray-800 truncate max-w-[200px] md:max-w-xs">{name}</span>
            <span className="text-[10px] text-gray-400 font-semibold">{formatSubmissionFileSize(size)}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {safeUrl && (
            <a
              href={safeUrl}
              target="_blank"
              rel="noopener noreferrer"
              referrerPolicy="no-referrer"
              aria-label={`${language === "vi" ? "Xem tệp" : "View file"}: ${name}`}
              className="p-1.5 text-gray-400 hover:text-[#990011] hover:bg-[#990011]/5 rounded-lg transition-colors"
              title={language === "vi" ? "Xem trực tiếp" : "View file"}
            >
              <Eye size={14} />
            </a>
          )}
          {isPending && (
            <button
              type="button"
              onClick={() => removePendingFile(index)}
              disabled={isSubmitting}
              aria-label={`${language === "vi" ? "Xóa tệp" : "Remove file"}: ${name}`}
              className="p-1.5 text-gray-400 hover:text-red-655 hover:bg-red-50 rounded-lg transition-colors disabled:cursor-not-allowed disabled:opacity-50"
              title="Xóa"
            >
              <Trash2 size={14} />
            </button>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 text-[#2e2e2e]">

      {/* Header Title & Navigation back */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-150 pb-5">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            aria-label={language === "vi" ? "Quay lại" : "Go back"}
            className="p-2.5 border border-gray-200 hover:bg-gray-50 text-gray-500 rounded-xl transition-all cursor-pointer shadow-2xs"
            title="Quay lại"
          >
            <ChevronLeft size={16} />
          </button>
          <div>
            <h1 className="text-2xl font-black text-gray-950 tracking-tight leading-tight">
              {typeof assignment.name === "string" && assignment.name.trim()
                ? assignment.name
                : (language === "vi" ? "Bài tập chưa đặt tên" : "Untitled assignment")}
            </h1>
            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
              {getStatusBadge()}

              {!isPublishedAssignment ? (
                <span className="bg-gray-150 text-gray-500 text-[10px] font-extrabold px-2.5 py-1 rounded uppercase tracking-wide flex items-center gap-1">
                  <Lock size={10} />
                  {isClosed
                    ? (cg.badgeClosed || "Đã đóng")
                    : (cg.badgeDraft || (language === "vi" ? "Nháp" : "Draft"))}
                </span>
              ) : (
                <span className="bg-emerald-50 text-emerald-600 text-[10px] font-extrabold px-2.5 py-1 rounded border border-emerald-100 uppercase tracking-wide flex items-center gap-1">
                  <Unlock size={10} />
                  {language === "vi" ? "MỞ" : "OPEN"}
                </span>
              )}

              {dueDateMs !== null && (isExpired ? (
                <span className="bg-red-50 border border-red-100 text-red-655 text-[10px] font-extrabold px-2.5 py-1 rounded uppercase tracking-wide">
                  {cg.badgeExpired || "Hết hạn"}
                </span>
              ) : (
                <span className="bg-orange-50 border border-orange-100 text-orange-600 text-[10px] font-extrabold px-2.5 py-1 rounded uppercase tracking-wide">
                  {cg.badgeUpcoming || "Sắp đến hạn"}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Due Date Indicator */}
        {assignment.dueDate && (
          <div className="flex items-center gap-2 text-xs text-gray-400 bg-gray-50 border border-gray-150 rounded-xl px-4 py-2.5 w-fit">
            <Calendar size={14} className="text-gray-400" />
            <span className="font-semibold">
              {language === "vi" ? "Hạn nộp:" : "Deadline:"}{" "}
              <strong className="text-gray-700 font-extrabold">
                {formatSubmissionDate(
                  assignment.dueDate,
                  language === "vi" ? "vi-VN" : "en-US"
                )}
              </strong>
            </span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (65%) */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {/* Instructions and Details */}
          <div className="bg-white border border-gray-150 rounded-3xl p-6 shadow-xs flex flex-col gap-4">
            <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
              <span className="w-1.5 h-4 bg-[#990011] rounded-full" />
              <h3 className="text-sm font-extrabold text-gray-800 uppercase tracking-wider">
                {ca.descriptionLabel || "Mô tả / Hướng dẫn bài tập"}
              </h3>
            </div>

            <RenderHTML
              html={assignmentDescription}
              className="text-xs font-semibold text-gray-700 min-h-[80px]"
              fallback={
                <span className="italic text-gray-400 font-medium text-xs">
                  {language === "vi" ? "Không có mô tả chi tiết." : "No detailed description provided."}
                </span>
              }
            />

            {/* Teacher attachments */}
            {parsedTeacherAttachments.length > 0 && (
              <div className="mt-4 border-t border-gray-100 pt-4">
                <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <Paperclip size={12} />
                  {ca.attachmentsLabel || "Tài liệu đính kèm từ giáo viên"}
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 animate-fadeIn">
                  {parsedTeacherAttachments.map((file, idx) => renderFileRow(file, idx))}
                </div>
              </div>
            )}
          </div>

          {/* Submission Form panel */}
          {allowSubmission ? (
            <form
              onSubmit={handleSubmit}
              aria-busy={isSubmitting}
              className="bg-white border border-gray-150 rounded-3xl p-6 shadow-xs flex flex-col gap-5"
            >
              <div className="flex items-center gap-2 border-b border-gray-50 pb-3">
                <span className="w-1.5 h-4 bg-[#990011] rounded-full" />
                <h3 className="text-sm font-extrabold text-[#990011] uppercase tracking-wider">
                  {submission ? (language === "vi" ? "NỘP LẠI BÀI" : "RESUBMIT") : (language === "vi" ? "NỘP BÀI" : "SUBMIT ASSIGNMENT")}
                </h3>
              </div>

              {/* Text submission input */}
              {allowsTextSubmission && (
                <div className="flex flex-col gap-2.5">
                  <label
                    htmlFor="assignment-text-submission"
                    className="text-[10px] font-black text-gray-400 tracking-wider uppercase flex justify-between"
                  >
                    <span>{ca.directInput || "Nội dung bài làm"}</span>
                  </label>
                  <div className="assignment-editor overflow-hidden transition-all">
                    <Editor
                      id="assignment-text-submission"
                      tinymceScriptSrc="https://cdnjs.cloudflare.com/ajax/libs/tinymce/6.8.3/tinymce.min.js"
                      value={textContent}
                      disabled={isSubmitting}
                      onEditorChange={(newVal) => setTextDraft(newVal)}
                      init={{
                        height: 250,
                        menubar: false,
                        statusbar: false,
                        plugins: ["autolink", "lists", "link", "charmap", "emoticons"],
                        toolbar:
                          "bold italic underline strikethrough | emoticons link | bullist numlist",
                        placeholder: language === "vi" ? "Nhập nội dung bài làm của bạn tại đây..." : "Type your submission here...",
                        skin: "oxide",
                      }}
                    />
                  </div>
                </div>
              )}

              {/* File submission drag-and-drop */}
              {allowsFileSubmission && (
                <div className="flex flex-col gap-2.5">
                  <label className="text-[10px] font-black text-gray-400 tracking-wider uppercase leading-none">
                    {ca.uploadFile || "Tải lên tệp tin"}
                  </label>
                  <div className="text-[10px] text-gray-400 font-semibold leading-normal">
                    {language === "vi"
                      ? `Hỗ trợ: ${allowedFileTypes.join(", ") || "Tất cả"} (Tối đa ${maxFiles} tệp, tối đa 50MB/tệp)`
                      : `Supported formats: ${allowedFileTypes.join(", ") || "Any"} (Max ${maxFiles} files, 50MB max each)`}
                  </div>

                  <div
                    onDragEnter={handleDrag}
                    onDragOver={handleDrag}
                    onDragLeave={handleDrag}
                    onDrop={handleDrop}
                    onClick={() => {
                      if (!isSubmitting) fileInputRef.current?.click()
                    }}
                    onKeyDown={(event) => {
                      if (
                        !isSubmitting
                        && (event.key === "Enter" || event.key === " ")
                      ) {
                        event.preventDefault()
                        fileInputRef.current?.click()
                      }
                    }}
                    role="button"
                    tabIndex={isSubmitting ? -1 : 0}
                    aria-disabled={isSubmitting}
                    aria-label={ca.dropzoneMainText || "Select submission files"}
                    className={`border-2 border-dashed rounded-2xl p-6 flex flex-col items-center justify-center text-center transition-all ${isSubmitting
                      ? "cursor-not-allowed opacity-60"
                      : "cursor-pointer"
                      } ${dragActive
                        ? "border-[#990011] bg-[#990011]/5"
                        : "border-gray-255 hover:border-gray-400 hover:bg-gray-50/50"
                      }`}
                  >
                    <Upload size={24} className="text-gray-400 mb-2" />
                    <span className="text-xs font-bold text-gray-700 leading-snug">
                      {ca.dropzoneMainText || "Nhấn để chọn tệp hoặc kéo thả vào đây"}
                    </span>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    disabled={isSubmitting}
                    multiple={maxFiles > 1}
                    accept={allowedFileTypes.length > 0
                      ? allowedFileTypes.join(",")
                      : undefined}
                    onChange={handleFileSelect}
                    className="hidden"
                  />

                  {/* List of pending files */}
                  {selectedFiles.length > 0 && (
                    <div className="flex flex-col gap-2 mt-2">
                      <span className="text-[9px] font-black text-gray-400 uppercase tracking-wider leading-none mb-1">
                        {language === "vi" ? "Tệp chuẩn bị tải lên:" : "Files pending upload:"}
                      </span>
                      {selectedFiles.map((file, idx) => renderFileRow(file, idx, true))}
                    </div>
                  )}
                </div>
              )}

              {/* Submit button */}
              <button
                type="submit"
                disabled={isSubmitting}
                aria-busy={isSubmitting}
                className="w-full py-3 bg-[#990011] hover:bg-[#80000e] text-white font-extrabold text-xs rounded-xl text-center transition-all shadow-sm uppercase tracking-wider flex items-center justify-center gap-2 active:scale-99 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <span
                      aria-hidden="true"
                      className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"
                    />
                    <span className="sr-only">
                      {language === "vi" ? "Đang nộp bài" : "Submitting assignment"}
                    </span>
                  </>
                ) : (
                  <>
                    <Upload size={14} />
                    <span>
                      {submission
                        ? (language === "vi" ? "NỘP LẠI BÀI" : "RESUBMIT ASSIGNMENT")
                        : (language === "vi" ? "NỘP BÀI TẬP" : "SUBMIT ASSIGNMENT")}
                    </span>
                  </>
                )}
              </button>
            </form>
          ) : (
            <div className="bg-white border border-gray-150 rounded-3xl p-6 shadow-xs flex flex-col gap-4 border-t-4 border-t-red-500 animate-fadeIn">
              <h3 className="text-xs font-black text-red-500 uppercase tracking-wider flex items-center gap-1.5 leading-none">
                <AlertTriangle size={14} />
                {language === "vi" ? "BÀI NỘP ĐÃ KHÓA" : "SUBMISSIONS CLOSED"}
              </h3>
              <p className="text-xs font-semibold text-gray-500 leading-relaxed">
                {isClosed
                  ? (language === "vi" ? "Giảng viên đã khóa hoặc đóng bài tập này, học viên không thể nộp bài hoặc chỉnh sửa bài làm." : "The instructor has locked submissions for this assignment. You cannot submit or edit.")
                  : !isPublishedAssignment
                    ? (language === "vi" ? "Bài tập này chưa sẵn sàng để nộp." : "This assignment is not available for submission.")
                    : (language === "vi" ? "Hạn nộp bài đã qua và nộp muộn không được cho phép đối với bài tập này." : "The submission deadline has passed and late submissions are not allowed for this assignment.")}
              </p>
            </div>
          )}
        </div>

        {/* Right Column (35%) */}
        <div className="flex flex-col gap-6">
          {/* Grade and feedback panel (if released/returned) */}
          {submission && submissionStatus === "returned" && (
            <div className="bg-white border border-gray-150 rounded-3xl p-6 shadow-xs flex flex-col gap-5 border-t-4 border-t-emerald-500 animate-fadeIn">
              <h3 className="text-xs font-black text-gray-400 tracking-wider uppercase leading-none">
                {language === "vi" ? "KẾT QUẢ ĐÁNH GIÁ" : "GRADING DETAILS"}
              </h3>

              <div className="flex items-center gap-4 bg-emerald-50/40 border border-emerald-100 rounded-2xl p-4 shadow-2xs">
                <div className="text-3xl font-black text-emerald-600 font-mono">
                  {submission.grade !== null
                    && submission.grade !== undefined
                    && submission.grade !== ""
                    && Number.isFinite(Number(submission.grade))
                    ? Number(submission.grade)
                    : "—"}
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-gray-400 leading-none">
                    {language === "vi"
                      ? `Thang điểm tối đa ${displayMaxScore ?? "—"}`
                      : `Out of ${displayMaxScore ?? "—"}`}
                  </span>
                  <span className="text-[9px] bg-emerald-100 text-emerald-700 font-extrabold px-2 py-0.5 rounded uppercase tracking-wider mt-2 inline-block w-fit">
                    {cg.filterReturned || "ĐÃ TRẢ BÀI"}
                  </span>
                </div>
              </div>

              {/* Feedback comment */}
              <div className="flex flex-col gap-2.5">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider leading-none">
                  {cg.generalFeedback || "Nhận xét của giáo viên"}
                </span>
                {submissionComment ? (
                  <p className="bg-gray-50 border border-gray-150 rounded-2xl p-4 text-xs font-semibold text-gray-750 leading-relaxed whitespace-pre-line">
                    {submissionComment}
                  </p>
                ) : (
                  <p className="italic text-gray-400 text-xs font-medium pl-1">
                    {language === "vi" ? "Chưa có nhận xét chi tiết." : "No feedback comments provided."}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Submission Details View / Empty State */}
          <div className="bg-white border border-gray-150 rounded-3xl p-6 shadow-xs flex flex-col gap-4 animate-fadeIn">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2">
                <span className={`w-1.5 h-4 rounded-full ${submission ? "bg-emerald-500" : "bg-gray-300"}`} />
                <h3 className="text-sm font-extrabold text-gray-800 uppercase tracking-wider">
                  {cg.mySubmission || (language === "vi" ? "Bài làm của tôi" : "My Submission")}
                </h3>
              </div>
              {submission ? (
                <span className="text-[10px] text-gray-400 font-semibold">
                  {cg.submittedAtLabel || (language === "vi" ? "Nộp lúc: " : "Submitted on: ")}
                  <strong className="text-gray-600 font-extrabold">
                    {submission.submittedAt
                      ? formatSubmissionDate(
                        submission.submittedAt,
                        language === "vi"
                          ? "vi-VN"
                          : (language === "zh" ? "zh-CN" : "en-US")
                      )
                      : "—"}
                  </strong>
                </span>
              ) : (
                <span className="text-[9px] bg-gray-100 text-gray-500 font-extrabold px-2 py-0.5 rounded uppercase tracking-wider">
                  {cg.filterNotSubmitted || (language === "vi" ? "Chưa nộp" : "Not Submitted")}
                </span>
              )}
            </div>

            {submission ? (
              <div className="flex flex-col gap-3">
                {/* Submission text response */}
                {allowsTextSubmission && (
                  <div className="mt-2">
                    <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-2.5">
                      {cg.textResponseHeader || (language === "vi" ? "Nội dung bài viết" : "Text Response")}
                    </h4>
                    <RenderHTML
                      html={displayedSubmissionText}
                      className="bg-gray-50 border border-gray-150 rounded-2xl p-4 text-xs font-semibold text-gray-750"
                      fallback={
                        <span className="italic text-gray-400 text-xs font-medium">
                          {cg.noTextResponse || (language === "vi" ? "Không có nội dung trả lời trực tiếp." : "No text response provided.")}
                        </span>
                      }
                    />
                  </div>
                )}

                {/* Submission files */}
                {allowsFileSubmission && parsedSubmissionFiles.length > 0 && (
                  <div className="border-t border-gray-50">
                    <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                      <Paperclip size={12} />
                      {cg.submittedFilesHeader || (language === "vi" ? "Các tệp tin đã nộp" : "Submitted Files")}
                    </h4>
                    <div className="grid grid-cols-1 gap-3">
                      {parsedSubmissionFiles.map((file, idx) => renderFileRow(file, idx))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="py-6 flex flex-col items-center justify-center text-center gap-2.5 bg-gray-50/50 rounded-2xl border border-dashed border-gray-200 p-4">
                <div className="w-10 h-10 rounded-2xl bg-gray-100 text-gray-400 flex items-center justify-center">
                  <FileText size={20} />
                </div>
                <div className="flex flex-col gap-1 max-w-[260px]">
                  <span className="text-xs font-extrabold text-gray-700">
                    {cg.noSubmissionYetTitle || (language === "vi" ? "Chưa có bài nộp" : "No Submission Yet")}
                  </span>
                  <p className="text-[11px] font-medium text-gray-400 leading-relaxed">
                    {cg.noSubmissionYetMsg ||
                      (language === "vi"
                        ? "Bạn chưa gửi bài làm cho bài tập này. Hãy nhập nội dung và nhấn Nộp bài."
                        : "You haven't submitted your response for this assignment yet. Complete your work and click Submit.")}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

const StudentAssignmentDetailView = (props) => {
  const assignmentId = props.assignmentId ?? props.assignment?.id ?? ""
  const viewKey = `${props.classId ?? ""}-${assignmentId}`

  return <StudentAssignmentDetailContent key={viewKey} {...props} />
}

export default StudentAssignmentDetailView
