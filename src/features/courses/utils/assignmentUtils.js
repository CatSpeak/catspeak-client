import { toLocalDateString } from "./dateUtils"

export const getAssignmentTitle = (assignment, fallback = "Untitled assignment") => (
  assignment?.name || assignment?.title || fallback
)

export const getAssignmentStatus = (assignment) => (
  String(assignment?.status || "").toLowerCase()
)

export const getAssignmentMaxScore = (assignment, fallback = 10) => {
  const maxScore = Number(assignment?.maxScore)
  return Number.isFinite(maxScore) && maxScore > 0 ? maxScore : fallback
}

export const getAssignmentCount = (assignment, keys) => {
  const value = keys
    .map((key) => assignment?.[key])
    .find((item) => item !== undefined && item !== null)
  const parsed = Number(value)

  return Number.isFinite(parsed) ? parsed : 0
}

export const getAssignmentTimeline = (assignment, nowMs) => {
  const dueTime = assignment?.dueDate ? new Date(assignment.dueDate).getTime() : null
  const hasDueDate = Boolean(dueTime && !Number.isNaN(dueTime))

  return {
    isExpired: Boolean(hasDueDate && dueTime < nowMs),
    isUpcoming: Boolean(hasDueDate && dueTime >= nowMs),
  }
}

export const isAssignmentExpired = (assignment, nowMs) => (
  getAssignmentTimeline(assignment, nowMs).isExpired
)

export const getSubmissionStatus = (submission) => {
  if (!submission) return "not_submitted"
  return String(submission.status || "submitted").toLowerCase()
}

export const getAssignmentErrorMessage = (error, fallback) => (
  error?.data?.error?.message ||
  error?.data?.message ||
  error?.error ||
  error?.message ||
  fallback
)

export const parseAttachmentList = (raw, onError) => {
  if (!raw) return []
  if (Array.isArray(raw)) return raw

  if (typeof raw === "string") {
    try {
      const parsed = JSON.parse(raw)
      return Array.isArray(parsed) ? parsed : []
    } catch (error) {
      onError?.(error)
      return []
    }
  }

  return []
}

export const getFileMeta = (file, fallbackName = "Unnamed file") => {
  if (typeof file === "string") {
    return {
      name: file.split("/").pop() || fallbackName,
      url: file,
      size: 0,
    }
  }

  return {
    name: file?.name || file?.fileName || file?.FileName || fallbackName,
    url: file?.url || file?.fileUrl || file?.FileUrl || "",
    size: file?.size || file?.fileSize || file?.FileSize || 0,
  }
}

export const clampMaxFiles = (value) => Math.min(5, Math.max(1, Number(value) || 1))

export const getAssignmentFormDefaults = (assignment) => {
  const dueDate = assignment?.dueDate ? new Date(assignment.dueDate) : null
  const hasValidDueDate = dueDate && !Number.isNaN(dueDate.getTime())
  const allowedFileTypes = assignment?.allowedFileTypes
    ? assignment.allowedFileTypes
      .split(",")
      .map((type) => type.replace(".", "").trim().toUpperCase())
      .filter(Boolean)
    : ["PDF", "DOCX"]

  return {
    title: assignment?.name || assignment?.title || "",
    editorText: assignment?.description || "",
    dueDate: hasValidDueDate ? toLocalDateString(dueDate) : "",
    dueTime: hasValidDueDate
      ? `${String(dueDate.getHours()).padStart(2, "0")}:${String(dueDate.getMinutes()).padStart(2, "0")}`
      : "23:59",
    allowLateSubmission: assignment?.allowLateSubmission ?? true,
    submissionTypeFile: assignment?.allowFileSubmission ?? true,
    submissionTypeText: assignment?.allowTextSubmission ?? false,
    allowedFileTypes,
    maxFiles: assignment?.maxFiles || 1,
    enableGrading: assignment?.hasGrading ?? false,
    gradeScale: Number(assignment?.maxScore) === 100 ? "scale100" : "scale10",
    resultRelease: assignment?.releaseMode?.toLowerCase() === "automatic" ? "automatic" : "manual",
    publishStatus: assignment?.status?.toLowerCase() === "draft" ? "draft" : "now",
    existingAttachments: parseAttachmentList(assignment?.attachments || assignment?.files),
  }
}
