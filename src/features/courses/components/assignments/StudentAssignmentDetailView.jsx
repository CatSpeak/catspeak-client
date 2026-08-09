import React, { useEffect, useState, useMemo, useRef } from "react"
import { useLanguage } from "@/shared/context/LanguageContext"
import { useTimezone } from "@/shared/hooks/useTimezone"
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

const interpolate = (template, values) => Object.entries(values).reduce(
  (message, [key, value]) => message.replace(`{{${key}}}`, String(value)),
  template || "",
)

const StudentAssignmentDetailContent = ({ assignment: initialAssignment, assignmentId: assignmentIdProp, classId, onBack }) => {
  const { language, t } = useLanguage()
  const { formatDateTime } = useTimezone()
  const c = t.courses || {}
  const cd = c.classDetail || {}
  const cg = c.grading || {}
  const sa = cg.studentAssignment || {}
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
      toast.error(interpolate(sa.maxFilesAllowed, { maxFiles }))
      return
    }

    const existingFingerprints = new Set(selectedFiles.map((file) => (
      `${file.name}-${file.size}-${file.lastModified}`
    )))
    const selectionFingerprints = new Set()

    for (const file of files) {
      if (!file || typeof file.name !== "string") {
        toast.error(sa.invalidSelectedFile)
        return
      }

      const extension = getFileExtension(file.name)
      if (allowedFileTypes.length > 0 && !allowedFileTypes.includes(extension)) {
        toast.error(interpolate(sa.fileFormatNotAllowed, {
          extension: extension || sa.noFileExtension,
          formats: allowedFileTypes.join(", "),
        }))
        return
      }

      const fileSize = Number(file.size)
      if (!Number.isFinite(fileSize) || fileSize <= 0) {
        toast.error(interpolate(sa.fileEmptyOrInvalid, { fileName: file.name }))
        return
      }
      if (fileSize > MAX_FILE_SIZE_BYTES) {
        toast.error(interpolate(sa.fileExceedsLimit, { fileName: file.name }))
        return
      }

      const fingerprint = `${file.name}-${file.size}-${file.lastModified}`
      if (
        existingFingerprints.has(fingerprint)
        || selectionFingerprints.has(fingerprint)
      ) {
        toast.error(interpolate(sa.fileAlreadySelected, { fileName: file.name }))
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
      toast.error(sa.submissionsClosedOrExpired)
      return
    }

    const hasText = allowsTextSubmission && hasMeaningfulText(textContent)
    const hasNewFiles = allowsFileSubmission && selectedFiles.length > 0
    const hasExistingFiles = allowsFileSubmission && parsedSubmissionFiles.length > 0
    const originalText = allowsTextSubmission ? submissionText.trim() : ""
    const currentText = allowsTextSubmission ? textContent.trim() : ""
    const hasTextChanged = currentText !== originalText

    if (!submission && !hasText && !hasNewFiles) {
      toast.error(sa.contentOrFileRequired)
      return
    }

    if (submission && !hasTextChanged && !hasNewFiles) {
      toast.error(sa.changeBeforeResubmit)
      return
    }

    if (!hasText && !hasNewFiles && !hasExistingFiles) {
      toast.error(sa.submissionCannotBeEmpty)
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

      toast.success(sa.submitSuccess)
      setSelectedFiles([])
      setLastSubmittedText(currentText)
      setTextDraft(currentText)
    } catch (err) {
      if (!componentActiveRef.current) return

      toast.error(getSafeSubmissionErrorMessage(
        err,
        language,
        sa.submitError
      ))
    } finally {
      submitInFlightRef.current = false
    }
  }

  if (isAssignmentLoading || isSubmissionLoading) {
    return (
      <div
        role="status"
        aria-label={sa.loadingAssignment}
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
              sa.loadAssignmentError
            )
            : isDraftAssignment
              ? sa.assignmentNotPublished
              : sa.invalidAssignmentSubmissionData}
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
              {sa.retry}
            </button>
            {typeof onBack === "function" && (
              <button
                type="button"
                onClick={onBack}
                className="rounded-lg border border-red-300 bg-white px-3 py-1.5 text-xs font-extrabold text-red-700 hover:bg-red-50"
              >
                {sa.goBack}
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
          {cd.statusNotSubmitted}
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
          {cg.filterReturned}
        </span>
      )
    }
    if (displayStatus === "late") {
      return (
        <span className="bg-red-50 text-red-650 text-[10px] font-extrabold px-2.5 py-1 rounded border border-red-100 uppercase tracking-wide">
          {cg.filterLate}
        </span>
      )
    }
    return (
      <span className="bg-orange-50 text-orange-655 text-[10px] font-extrabold px-2.5 py-1 rounded border border-orange-100 uppercase tracking-wide">
        {cd.statusNeedsGrading}
      </span>
    )
  }

  // File rendering function
  const renderFileRow = (file, index, isPending = false) => {
    const { name: rawName, url, size } = getFileMeta(file, sa.unnamedFile)
    const name = typeof rawName === "string" && rawName.trim()
      ? rawName
      : sa.unnamedFile
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
              aria-label={interpolate(sa.viewFileNamed, { fileName: name })}
              className="p-1.5 text-gray-400 hover:text-[#990011] hover:bg-[#990011]/5 rounded-lg transition-colors"
              title={sa.viewFile}
            >
              <Eye size={14} />
            </a>
          )}
          {isPending && (
            <button
              type="button"
              onClick={() => removePendingFile(index)}
              disabled={isSubmitting}
              aria-label={interpolate(sa.removeFileNamed, { fileName: name })}
              className="p-1.5 text-gray-400 hover:text-red-655 hover:bg-red-50 rounded-lg transition-colors disabled:cursor-not-allowed disabled:opacity-50"
              title={sa.removeFile}
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
            aria-label={sa.goBack}
            className="p-2.5 border border-gray-200 hover:bg-gray-50 text-gray-500 rounded-xl transition-all cursor-pointer shadow-2xs"
            title={sa.goBack}
          >
            <ChevronLeft size={16} />
          </button>
          <div>
            <h1 className="text-2xl font-black text-gray-950 tracking-tight leading-tight">
              {typeof assignment.name === "string" && assignment.name.trim()
                ? assignment.name
                : sa.untitledAssignment}
            </h1>
            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
              {getStatusBadge()}

              {!isPublishedAssignment ? (
                <span className="bg-gray-150 text-gray-500 text-[10px] font-extrabold px-2.5 py-1 rounded uppercase tracking-wide flex items-center gap-1">
                  <Lock size={10} />
                  {isClosed
                    ? cg.badgeClosed
                    : cg.badgeDraft}
                </span>
              ) : (
                <span className="bg-emerald-50 text-emerald-600 text-[10px] font-extrabold px-2.5 py-1 rounded border border-emerald-100 uppercase tracking-wide flex items-center gap-1">
                  <Unlock size={10} />
                  {sa.badgeOpen}
                </span>
              )}

              {dueDateMs !== null && (isExpired ? (
                <span className="bg-red-50 border border-red-100 text-red-655 text-[10px] font-extrabold px-2.5 py-1 rounded uppercase tracking-wide">
                  {cg.badgeExpired}
                </span>
              ) : (
                <span className="bg-orange-50 border border-orange-100 text-orange-600 text-[10px] font-extrabold px-2.5 py-1 rounded uppercase tracking-wide">
                  {cg.badgeUpcoming}
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
              {sa.deadlineLabel}{" "}
              <strong className="text-gray-700 font-extrabold">
                {formatDateTime(assignment.dueDate)}
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
                {ca.descriptionLabel}
              </h3>
            </div>

            <RenderHTML
              html={assignmentDescription}
              className="text-xs font-semibold text-gray-700 min-h-[80px]"
              fallback={
                <span className="italic text-gray-400 font-medium text-xs">
                  {sa.noDetailedDescription}
                </span>
              }
            />

            {/* Teacher attachments */}
            {parsedTeacherAttachments.length > 0 && (
              <div className="mt-4 border-t border-gray-100 pt-4">
                <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <Paperclip size={12} />
                  {ca.attachmentsLabel}
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
                  {submission ? sa.resubmitHeading : sa.submitHeading}
                </h3>
              </div>

              {/* Text submission input */}
              {allowsTextSubmission && (
                <div className="flex flex-col gap-2.5">
                  <label
                    htmlFor="assignment-text-submission"
                    className="text-[10px] font-black text-gray-400 tracking-wider uppercase flex justify-between"
                  >
                    <span>{ca.directInput}</span>
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
                        placeholder: sa.textSubmissionPlaceholder,
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
                    {ca.uploadFile}
                  </label>
                  <div className="text-[10px] text-gray-400 font-semibold leading-normal">
                    {interpolate(sa.supportedFilesSummary, {
                      formats: allowedFileTypes.join(", ") || sa.anyFileFormat,
                      maxFiles,
                    })}
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
                    aria-label={ca.dropzoneMainText}
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
                      {ca.dropzoneMainText}
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
                        {sa.filesPendingUpload}
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
                      {sa.submittingAssignment}
                    </span>
                  </>
                ) : (
                  <>
                    <Upload size={14} />
                    <span>
                      {submission ? sa.resubmitButton : sa.submitButton}
                    </span>
                  </>
                )}
              </button>
            </form>
          ) : (
            <div className="bg-white border border-gray-150 rounded-3xl p-6 shadow-xs flex flex-col gap-4 border-t-4 border-t-red-500 animate-fadeIn">
              <h3 className="text-xs font-black text-red-500 uppercase tracking-wider flex items-center gap-1.5 leading-none">
                <AlertTriangle size={14} />
                {sa.submissionsClosedHeading}
              </h3>
              <p className="text-xs font-semibold text-gray-500 leading-relaxed">
                {isClosed
                  ? sa.submissionsLockedDescription
                  : !isPublishedAssignment
                    ? sa.assignmentUnavailableDescription
                    : sa.deadlinePassedDescription}
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
                {sa.gradingDetails}
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
                    {interpolate(sa.outOfScore, {
                      maxScore: displayMaxScore ?? "—",
                    })}
                  </span>
                  <span className="text-[9px] bg-emerald-100 text-emerald-700 font-extrabold px-2 py-0.5 rounded uppercase tracking-wider mt-2 inline-block w-fit">
                    {cg.filterReturned}
                  </span>
                </div>
              </div>

              {/* Feedback comment */}
              <div className="flex flex-col gap-2.5">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider leading-none">
                  {cg.generalFeedback}
                </span>
                {submissionComment ? (
                  <p className="bg-gray-50 border border-gray-150 rounded-2xl p-4 text-xs font-semibold text-gray-750 leading-relaxed whitespace-pre-line">
                    {submissionComment}
                  </p>
                ) : (
                  <p className="italic text-gray-400 text-xs font-medium pl-1">
                    {sa.noFeedback}
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
                  {cg.mySubmission}
                </h3>
              </div>
              {submission ? (
                <span className="text-[10px] text-gray-400 font-semibold">
                  {cg.submittedAtLabel}
                  <strong className="text-gray-600 font-extrabold">
                    {submission.submittedAt
                      ? formatDateTime(submission.submittedAt)
                      : "—"}
                  </strong>
                </span>
              ) : (
                <span className="text-[9px] bg-gray-100 text-gray-500 font-extrabold px-2 py-0.5 rounded uppercase tracking-wider">
                  {cg.filterNotSubmitted}
                </span>
              )}
            </div>

            {submission ? (
              <div className="flex flex-col gap-3">
                {/* Submission text response */}
                {allowsTextSubmission && (
                  <div className="mt-2">
                    <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-2.5">
                      {cg.textResponseHeader}
                    </h4>
                    <RenderHTML
                      html={displayedSubmissionText}
                      className="bg-gray-50 border border-gray-150 rounded-2xl p-4 text-xs font-semibold text-gray-750"
                      fallback={
                        <span className="italic text-gray-400 text-xs font-medium">
                          {cg.noTextResponse}
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
                      {cg.submittedFilesHeader}
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
                    {cg.noSubmissionYetTitle}
                  </span>
                  <p className="text-[11px] font-medium text-gray-400 leading-relaxed">
                    {cg.noSubmissionYetMsg}
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
