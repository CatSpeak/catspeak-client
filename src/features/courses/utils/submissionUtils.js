import { parseAttachmentList } from "./assignmentUtils"

const getMemberStudentId = (member) => (
  member?.studentId ?? member?.userId ?? member?.id
)

const getMemberName = (member, fallbackId) => (
  member?.name || member?.fullName || member?.studentName || `Học viên ${fallbackId || ""}`.trim()
)

const getSubmittedTime = (submittedAt, locale) => (
  submittedAt ? new Date(submittedAt).toLocaleString(locale) : "—"
)

const parseSubmissionFiles = (files) => parseAttachmentList(files, (error) => {
  console.error("Failed to parse files JSON:", error)
})

const createSubmittedStudent = ({ member, submission, studentId, locale }) => ({
  id: studentId,
  studentId,
  submissionId: submission.id,
  name: member
    ? getMemberName(member, studentId) || submission.studentName || `Học viên ${studentId}`
    : submission.studentName || `Học viên ${studentId}`,
  email: member?.email || member?.studentEmail || "—",
  avatar: member?.avatarUrl || member?.avatar || "",
  status: (submission.status || "submitted").toLowerCase(),
  time: getSubmittedTime(submission.submittedAt, locale),
  score: submission.grade,
  submissionText: submission.contentText || "",
  feedback: submission.comment || "",
  files: parseSubmissionFiles(submission.files),
  submittedAt: submission.submittedAt,
})

const createNotSubmittedStudent = (member, studentId) => ({
  id: studentId,
  studentId,
  submissionId: null,
  name: getMemberName(member, studentId),
  email: member.email || member.studentEmail || "—",
  avatar: member.avatarUrl || member.avatar || "",
  status: "not_submitted",
  time: "—",
  score: null,
  submissionText: "",
  feedback: "",
  files: [],
  submittedAt: null,
})

export const buildSubmissionStudentList = ({ members, submissions, language }) => {
  const locale = language === "vi" ? "vi-VN" : "en-US"
  const submissionsByStudentId = new Map()

  submissions.forEach((submission) => {
    const submissionStudentId = submission?.studentId?.toString() || ""
    if (!submissionsByStudentId.has(submissionStudentId)) {
      submissionsByStudentId.set(submissionStudentId, submission)
    }
  })

  const classStudents = members.filter((member) => {
    const role = String(member.role || "").toLowerCase()
    return role !== "teacher" && role !== "instructor"
  })
  const matchedSubmissionIds = new Set()

  const students = classStudents.map((member) => {
    const memberStudentId = getMemberStudentId(member)
    const studentId = memberStudentId?.toString() || ""
    const submission = submissionsByStudentId.get(studentId)

    if (!submission) {
      return createNotSubmittedStudent(member, studentId)
    }

    matchedSubmissionIds.add(submission.id.toString())
    return createSubmittedStudent({ member, submission, studentId, locale })
  })

  submissions.forEach((submission) => {
    if (!submission?.id || matchedSubmissionIds.has(submission.id.toString())) {
      return
    }

    const studentId = submission.studentId?.toString() || ""
    students.push(createSubmittedStudent({ submission, studentId, locale }))
  })

  return students
}

export const filterSubmissionStudents = (students, search, activeFilter) => {
  const normalizedSearch = search.toLowerCase()

  return students.filter((student) => {
    const matchesSearch = student.name.toLowerCase().includes(normalizedSearch)
      || student.email.toLowerCase().includes(normalizedSearch)

    if (!matchesSearch || activeFilter === "all") return matchesSearch
    if (activeFilter === "submitted") {
      return student.status === "submitted" || student.status === "late"
    }

    return student.status === activeFilter
  })
}

export const getSubmissionStats = (students) => {
  const total = students.length
  const notSubmitted = students.filter((student) => student.status === "not_submitted").length
  const submitted = total - notSubmitted

  return {
    total,
    submitted,
    needsGrading: students.filter((student) => (
      student.status === "submitted" || student.status === "late"
    )).length,
    submittedPercentage: total > 0 ? Math.round((submitted / total) * 100) : 0,
  }
}

export const getStudentInitials = (name) => {
  if (!name) return "ST"

  return name
    .split(" ")
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
  const start = (currentPage - 1) * itemsPerPage + 1
  const end = Math.min(currentPage * itemsPerPage, totalItems)

  if (template) {
    return template
      .replace("{{start}}", start)
      .replace("{{end}}", end)
      .replace("{{total}}", totalItems)
  }

  return `Hiển thị ${start} đến ${end} trong tổng số ${totalItems} học viên`
}
