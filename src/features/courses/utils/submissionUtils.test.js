import test from "node:test"
// The repository's alias-only import resolver does not recognize Node's built-in protocol.
// eslint-disable-next-line import/no-unresolved
import assert from "node:assert/strict"

import {
  buildSubmissionStudentList,
  filterSubmissionStudents,
  formatPaginationShowingText,
  getSafeSubmissionErrorMessage,
  getSubmissionStats,
  getValidAttachmentList,
  getValidDateMs,
} from "./submissionUtils.js"

test("submission list construction tolerates malformed containers", () => {
  assert.deepEqual(buildSubmissionStudentList({
    members: null,
    submissions: { data: [] },
    language: "en",
  }), [])

  assert.deepEqual(buildSubmissionStudentList({
    members: [null, "student", { role: "teacher", id: 1 }],
    submissions: [null, {}, { id: null }],
    language: "en",
  }), [])
})

test("submission list preserves zero grades and sanitizes display fields", () => {
  const [student] = buildSubmissionStudentList({
    members: [{
      studentId: 7,
      name: "  Mai Anh  ",
      email: { unsafe: true },
      avatarUrl: "javascript:alert(1)",
      role: "student",
    }],
    submissions: [{
      id: 12,
      studentId: 7,
      status: "graded",
      grade: 0,
      submittedAt: "2026-07-25T10:00:00.000Z",
    }],
    language: "en",
  })

  assert.equal(student.name, "Mai Anh")
  assert.equal(student.email, "—")
  assert.equal(student.avatar, "")
  assert.equal(student.score, 0)
  assert.equal(student.status, "graded")
})

test("submission list selects the latest attempt per student deterministically", () => {
  const students = buildSubmissionStudentList({
    members: [],
    submissions: [
      {
        id: "older",
        studentId: "student-1",
        studentName: "Student One",
        status: "submitted",
        submittedAt: "2026-07-24T10:00:00.000Z",
      },
      {
        id: "newer",
        studentId: "student-1",
        studentName: "Student One",
        status: "late",
        submittedAt: "2026-07-25T10:00:00.000Z",
      },
    ],
    language: "en",
  })

  assert.equal(students.length, 1)
  assert.equal(students[0].submissionId, "newer")
  assert.equal(students[0].status, "late")
})

test("duplicate roster entries do not create duplicate students", () => {
  const students = buildSubmissionStudentList({
    members: [
      { studentId: 1, name: "First", role: "student" },
      { studentId: 1, name: "Duplicate", role: "student" },
      { studentId: 2, name: "Teacher", role: "teacher" },
    ],
    submissions: [],
    language: "en",
  })

  assert.equal(students.length, 1)
  assert.equal(students[0].name, "First")
  assert.equal(students[0].status, "not_submitted")
})

test("date helpers reject invalid input", () => {
  assert.equal(getValidDateMs("not-a-date"), null)
  assert.equal(getValidDateMs(false), null)
  assert.equal(getValidDateMs([]), null)
})

test("attachment parsing rejects malformed API fields", () => {
  const files = [{ name: "answer.pdf", url: "https://example.com/answer.pdf" }]

  assert.equal(getValidAttachmentList("{invalid json"), null)
  assert.equal(getValidAttachmentList(JSON.stringify({ files })), null)
  assert.equal(getValidAttachmentList([null]), null)
  assert.deepEqual(getValidAttachmentList(JSON.stringify(files)), files)
})

test("filters, stats, and pagination handle boundary values", () => {
  const students = [
    { name: "Alice", email: "alice@example.com", status: "submitted" },
    { name: "Bob", email: "bob@example.com", status: "not_submitted" },
  ]

  assert.deepEqual(
    filterSubmissionStudents(students, "ALICE", "all"),
    [students[0]]
  )
  assert.deepEqual(getSubmissionStats(students), {
    total: 2,
    submitted: 1,
    needsGrading: 1,
    submittedPercentage: 50,
  })
  assert.equal(formatPaginationShowingText({
    currentPage: 10,
    itemsPerPage: 4,
    totalItems: 2,
    template: "{{start}}-{{end}} of {{total}}",
  }), "1-2 of 2")
})

test("safe errors never expose backend details", () => {
  const backendMessage = "SQL table assignments failed"

  assert.equal(
    getSafeSubmissionErrorMessage({
      status: 403,
      data: { message: backendMessage },
    }, "en"),
    "You do not have permission to perform this action."
  )
  assert.equal(
    getSafeSubmissionErrorMessage({
      status: 500,
      data: { message: backendMessage },
    }, "en", "Please try again."),
    "Please try again."
  )
  assert.equal(
    getSafeSubmissionErrorMessage({ status: 403 }, "zh"),
    "您没有执行此操作的权限。"
  )
  assert.ok(!getSafeSubmissionErrorMessage({
    status: 500,
    data: { message: backendMessage },
  }, "en").includes(backendMessage))
})
