import { toLocalDateString } from "./dateUtils.js"

export const getAssignmentTitle = (assignment, fallback = "") => {
  const title = [assignment?.name, assignment?.title]
    .find((value) => typeof value === "string" && value.trim())
  return title?.trim() || fallback
}

export const getAssignmentStatus = (assignment) => (
  String(assignment?.status || "").toLowerCase()
)

export const getAssignmentCount = (assignment, keys) => {
  const value = keys
    .map((key) => assignment?.[key])
    .find((item) => item !== undefined && item !== null)
  const parsed = Number(value)

  return Number.isFinite(parsed) && parsed >= 0 ? parsed : null
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

export const getAssignmentErrorMessage = (error, fallback, messages = {}) => {
  const status = error?.status
  if (status === 401 || status === 403) {
    return messages.errorForbidden || fallback || messages.errorGeneric || ""
  }
  if (status === 404) {
    return messages.errorNotFound || fallback || messages.errorGeneric || ""
  }
  if (status === 413) {
    return messages.errorFileTooLarge || fallback || messages.errorGeneric || ""
  }
  if (status === 415) {
    return messages.errorFileTypeUnsupported || fallback || messages.errorGeneric || ""
  }
  if (status === "FETCH_ERROR" || status === "TIMEOUT_ERROR") {
    return messages.errorNetwork || fallback || messages.errorGeneric || ""
  }

  return fallback || messages.errorGeneric || ""
}

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

export const getFileMeta = (file, fallbackName = "") => {
  if (typeof file === "string") {
    const pathWithoutQuery = file.split(/[?#]/, 1)[0]
    const encodedName = pathWithoutQuery.split("/").pop() || ""
    let displayName = encodedName

    try {
      displayName = decodeURIComponent(encodedName)
    } catch {
      // Keep the encoded name when the server returns invalid percent encoding.
    }

    return {
      name: displayName || fallbackName,
      url: file,
      size: 0,
    }
  }

  const getText = (...values) => {
    const value = values.find((item) => (
      typeof item === "string"
      || (typeof item === "number" && Number.isFinite(item))
    ))
    return value === undefined ? "" : String(value)
  }

  return {
    name: getText(file?.name, file?.fileName, file?.FileName) || fallbackName,
    url: getText(file?.url, file?.fileUrl, file?.FileUrl),
    size: Number(file?.size ?? file?.fileSize ?? file?.FileSize) || 0,
  }
}

export const getSafeFileUrl = (rawUrl) => {
  if (typeof rawUrl !== "string") return ""

  const value = rawUrl.trim()
  const hasControlCharacter = [...value].some((character) => {
    const codePoint = character.codePointAt(0)
    return codePoint <= 31 || codePoint === 127
  })
  if (
    !value
    || value.startsWith("#")
    || hasControlCharacter
  ) {
    return ""
  }

  try {
    const baseUrl = typeof window === "undefined"
      ? "https://local.invalid/"
      : `${window.location.origin}/`
    const parsedUrl = new URL(value, baseUrl)

    if (
      !["http:", "https:"].includes(parsedUrl.protocol)
      || parsedUrl.username
      || parsedUrl.password
    ) {
      return ""
    }

    return parsedUrl.href
  } catch {
    return ""
  }
}

export const clampMaxFiles = (value) => Math.min(5, Math.max(1, Number(value) || 1))

export const getAssignmentFormDefaults = (assignment) => {
  const dueDate = assignment?.dueDate ? new Date(assignment.dueDate) : null
  const hasValidDueDate = dueDate && !Number.isNaN(dueDate.getTime())
  const rawAllowedFileTypes = assignment?.allowedFileTypes
  const allowedFileTypes = (
    Array.isArray(rawAllowedFileTypes)
      ? rawAllowedFileTypes
      : (typeof rawAllowedFileTypes === "string"
          ? rawAllowedFileTypes.split(",")
          : [])
  )
    .map((type) => String(type).replace(".", "").trim().toUpperCase())
    .filter(Boolean)

  const getText = (value) => (
    typeof value === "string"
      ? value
      : (typeof value === "number" && Number.isFinite(value) ? String(value) : "")
  )
  const releaseMode = getText(assignment?.releaseMode).toLowerCase()

  return {
    title: getText(assignment?.name) || getText(assignment?.title),
    editorText: getText(assignment?.description),
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
    resultRelease: releaseMode === "automatic" ? "automatic" : "manual",
    publishStatus: (String(assignment?.status || "").toLowerCase().trim() === "draft" || String(assignment?.status) === "0") ? "draft" : "now",
    postToFeed: assignment?.postToBulletinBoard ?? true,
    existingAttachments: parseAttachmentList(assignment?.attachments || assignment?.files),
  }
}
