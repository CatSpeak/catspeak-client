import { getSafeFileUrl } from "./assignmentUtils.js"

const SUBMISSION_STATUSES = new Set([
  "graded",
  "late",
  "returned",
  "submitted",
])

const isRecord = (value) => (
  value !== null && typeof value === "object" && !Array.isArray(value)
)

const getLocalizedMessage = (language, messages) => (
  messages[language] || messages.en
)

const getId = (value) => {
  if (!["string", "number"].includes(typeof value)) return ""
  return String(value).trim()
}

const getMemberStudentId = (member) => (
  member?.studentId ?? member?.userId ?? member?.id
)

const getPersonName = (person) => (
  [person?.name, person?.fullName, person?.studentName]
    .find((value) => typeof value === "string" && value.trim())
    ?.trim() || ""
)

const getDisplayText = (values, fallback = "—") => (
  values
    .find((value) => typeof value === "string" && value.trim())
    ?.trim() || fallback
)

const getSubmittedTime = (submittedAt, locale) => (
  formatSubmissionDate(submittedAt, locale)
)

const parseSubmissionFiles = (files) => getValidAttachmentList(files) || []

const getSubmissionStatus = (status) => {
  const normalizedStatus = typeof status === "string"
    ? status.trim().toLowerCase()
    : ""
  return SUBMISSION_STATUSES.has(normalizedStatus)
    ? normalizedStatus
    : "unknown"
}

const getScore = (value) => {
  if (value === undefined || value === null || value === "") return null
  const score = Number(value)
  return Number.isFinite(score) ? score : null
}

const createSubmittedStudent = ({
  fallbackName,
  locale,
  member,
  studentId,
  submission,
}) => {
  const submissionId = submission.id
  const resolvedStudentId = studentId || getId(submission.studentId)
  const memberAvatar = member?.avatarUrl || member?.avatar
  const submissionAvatar = submission.studentAvatarUrl || submission.avatarUrl

  return {
    id: resolvedStudentId || `submission-${getId(submissionId)}`,
    studentId: resolvedStudentId || null,
    submissionId,
    name: getPersonName(member) || getPersonName(submission) || fallbackName,
    email: getDisplayText([
      member?.email,
      member?.studentEmail,
      submission.studentEmail,
      submission.email,
    ]),
    avatar: getSafeFileUrl(memberAvatar || submissionAvatar),
    status: getSubmissionStatus(submission.status),
    time: getSubmittedTime(submission.submittedAt, locale),
    score: getScore(submission.grade),
    submissionText: typeof submission.contentText === "string"
      ? submission.contentText
      : "",
    feedback: typeof submission.comment === "string" ? submission.comment : "",
    files: parseSubmissionFiles(submission.files),
    submittedAt: getValidDateMs(submission.submittedAt) === null
      ? null
      : submission.submittedAt,
  }
}

const createNotSubmittedStudent = (member, studentId, fallbackName) => ({
  id: studentId,
  studentId,
  submissionId: null,
  name: getPersonName(member) || fallbackName,
  email: getDisplayText([member.email, member.studentEmail]),
  avatar: getSafeFileUrl(member.avatarUrl || member.avatar),
  status: "not_submitted",
  time: "—",
  score: null,
  submissionText: "",
  feedback: "",
  files: [],
  submittedAt: null,
})

export const getValidDateMs = (value) => {
  if (value === undefined || value === null || value === "") return null
  if (
    typeof value !== "string"
    && typeof value !== "number"
    && !(value instanceof Date)
  ) {
    return null
  }
  if (typeof value === "string" && !value.trim()) return null

  const date = new Date(value)
  const timestamp = date.getTime()
  return Number.isFinite(timestamp) ? timestamp : null
}

export const getValidAttachmentList = (value) => {
  if (value === null || value === undefined || value === "") return []

  const validateEntries = (entries) => (
    Array.isArray(entries)
    && entries.every((entry) => typeof entry === "string" || isRecord(entry))
  )

  if (Array.isArray(value)) return validateEntries(value) ? value : null
  if (typeof value !== "string" || !value.trim()) return null

  try {
    const parsed = JSON.parse(value)
    return validateEntries(parsed) ? parsed : null
  } catch {
    return null
  }
}

export const formatSubmissionDate = (value, locale = "en-US", fallback = "—") => {
  const timestamp = getValidDateMs(value)
  if (timestamp === null) return fallback

  try {
    return new Date(timestamp).toLocaleString(locale)
  } catch {
    return fallback
  }
}

export const getSafeSubmissionErrorMessage = (
  error,
  language = "en",
  fallback
) => {
  const rawStatus = error?.status ?? error?.originalStatus
  const status = ["string", "number"].includes(typeof rawStatus)
    ? Number(rawStatus)
    : Number.NaN
  const code = error?.data?.code || error?.data?.errorCode || error?.data?.error?.code

  if (status === 401 || status === 403 || code === "Forbidden") {
    return getLocalizedMessage(language, {
      en: "You do not have permission to perform this action.",
      vi: "Bạn không có quyền thực hiện thao tác này.",
      zh: "您没有执行此操作的权限。",
    })
  }
  if (status === 404) {
    return getLocalizedMessage(language, {
      en: "The assignment or submission could not be found.",
      vi: "Không tìm thấy bài tập hoặc bài nộp.",
      zh: "找不到该作业或提交内容。",
    })
  }
  if (status === 409 || code === "AssignmentClosed") {
    return getLocalizedMessage(language, {
      en: "The data changed or submissions are closed. Refresh and try again.",
      vi: "Dữ liệu đã thay đổi hoặc bài nộp đã đóng. Hãy tải lại và thử lại.",
      zh: "数据已更改或提交已关闭。请刷新后重试。",
    })
  }
  if (status === 413 || code === "FileTooLarge") {
    return getLocalizedMessage(language, {
      en: "An uploaded file exceeds the size limit.",
      vi: "Tệp tải lên vượt quá giới hạn dung lượng.",
      zh: "上传文件超过大小限制。",
    })
  }
  if (status === 415 || code === "InvalidFileType") {
    return getLocalizedMessage(language, {
      en: "An uploaded file type is not supported.",
      vi: "Định dạng tệp tải lên không được hỗ trợ.",
      zh: "不支持该上传文件类型。",
    })
  }
  if (error?.status === "FETCH_ERROR" || error?.status === "TIMEOUT_ERROR") {
    return getLocalizedMessage(language, {
      en: "The server could not be reached. Check your connection and try again.",
      vi: "Không thể kết nối máy chủ. Hãy kiểm tra mạng và thử lại.",
      zh: "无法连接服务器。请检查网络后重试。",
    })
  }

  if (typeof fallback === "string" && fallback.trim()) return fallback
  return getLocalizedMessage(language, {
    en: "The action could not be completed. Please try again.",
    vi: "Không thể hoàn tất thao tác. Vui lòng thử lại.",
    zh: "无法完成操作。请重试。",
  })
}

export const buildSubmissionStudentList = ({ members, submissions, language }) => {
  const locale = language === "vi"
    ? "vi-VN"
    : (language === "zh" ? "zh-CN" : "en-US")
  const fallbackName = language === "vi"
    ? "Học viên"
    : (language === "zh" ? "学生" : "Student")
  const validMembers = Array.isArray(members) ? members.filter(isRecord) : []
  const validSubmissions = []
  const seenSubmissionIds = new Set()

  if (Array.isArray(submissions)) {
    submissions.forEach((submission) => {
      if (!isRecord(submission)) return

      const submissionId = getId(submission.id)
      if (!submissionId || seenSubmissionIds.has(submissionId)) return

      seenSubmissionIds.add(submissionId)
      validSubmissions.push(submission)
    })
  }

  const submissionsByStudentId = new Map()

  validSubmissions.forEach((submission) => {
    const submissionStudentId = getId(submission.studentId)
    if (!submissionStudentId) return

    const existingSubmission = submissionsByStudentId.get(submissionStudentId)
    const existingTime = getValidDateMs(existingSubmission?.submittedAt)
    const candidateTime = getValidDateMs(submission.submittedAt)

    if (
      !existingSubmission
      || (candidateTime ?? Number.NEGATIVE_INFINITY)
        >= (existingTime ?? Number.NEGATIVE_INFINITY)
    ) {
      submissionsByStudentId.set(submissionStudentId, submission)
    }
  })

  const seenStudentIds = new Set()
  const classStudents = validMembers.filter((member) => {
    const role = String(member.role || "").toLowerCase()
    const studentId = getId(getMemberStudentId(member))
    const isStudent = (
      role !== "teacher"
      && role !== "instructor"
      && studentId
      && !seenStudentIds.has(studentId)
    )

    if (isStudent) seenStudentIds.add(studentId)
    return isStudent
  })
  const matchedSubmissionIds = new Set()

  const students = classStudents.map((member) => {
    const memberStudentId = getMemberStudentId(member)
    const studentId = getId(memberStudentId)
    const submission = submissionsByStudentId.get(studentId)

    if (!submission) {
      return createNotSubmittedStudent(member, studentId, fallbackName)
    }

    matchedSubmissionIds.add(getId(submission.id))
    return createSubmittedStudent({
      fallbackName,
      locale,
      member,
      studentId,
      submission,
    })
  })

  validSubmissions.forEach((submission) => {
    const submissionId = getId(submission.id)
    const studentId = getId(submission.studentId)
    const currentSubmission = studentId
      ? submissionsByStudentId.get(studentId)
      : null

    if (
      currentSubmission
      && getId(currentSubmission.id) !== submissionId
    ) {
      return
    }

    if (matchedSubmissionIds.has(submissionId)) {
      return
    }

    students.push(createSubmittedStudent({
      fallbackName,
      locale,
      member: null,
      studentId,
      submission,
    }))
  })

  return students
}

export const filterSubmissionStudents = (students, search, activeFilter) => {
  const normalizedSearch = String(search || "").toLocaleLowerCase()
  const validStudents = Array.isArray(students) ? students : []

  return validStudents.filter((student) => {
    const matchesSearch = String(student?.name || "").toLocaleLowerCase().includes(normalizedSearch)
      || String(student?.email || "").toLocaleLowerCase().includes(normalizedSearch)

    if (!matchesSearch || activeFilter === "all") return matchesSearch
    if (activeFilter === "submitted") {
      return student.status === "submitted" || student.status === "late"
    }

    return student.status === activeFilter
  })
}

export const getSubmissionStats = (students) => {
  const validStudents = Array.isArray(students) ? students : []
  const total = validStudents.length
  const notSubmitted = validStudents
    .filter((student) => student?.status === "not_submitted").length
  const submitted = total - notSubmitted

  return {
    total,
    submitted,
    needsGrading: validStudents.filter((student) => (
      student?.status === "submitted" || student?.status === "late"
    )).length,
    submittedPercentage: total > 0 ? Math.round((submitted / total) * 100) : 0,
  }
}

export const getStudentInitials = (name, fallback = "") => {
  if (typeof name !== "string" || !name.trim()) return fallback

  return name
    .trim()
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase()
}

export const formatPaginationShowingText = ({
  currentPage,
  itemsPerPage,
  totalItems,
  template,
}) => {
  const safeTotal = Math.max(0, Number(totalItems) || 0)
  const safeItemsPerPage = Math.max(1, Number(itemsPerPage) || 1)
  const lastPage = Math.max(1, Math.ceil(safeTotal / safeItemsPerPage))
  const safePage = Math.min(
    lastPage,
    Math.max(1, Number(currentPage) || 1)
  )
  const start = safeTotal === 0 ? 0 : (safePage - 1) * safeItemsPerPage + 1
  const end = Math.min(safePage * safeItemsPerPage, safeTotal)

  if (typeof template === "string") {
    return template
      .replace("{{start}}", start)
      .replace("{{end}}", end)
      .replace("{{total}}", safeTotal)
  }

  return `${start}–${end} / ${safeTotal}`
}
