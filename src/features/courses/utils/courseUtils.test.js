import test from "node:test"
// The repository's alias-only import resolver does not recognize Node's built-in protocol.
// eslint-disable-next-line import/no-unresolved
import assert from "node:assert/strict"

import {
  getClassEnrollmentIssue,
  getSafeMediaUrl,
} from "./courseUtils.js"

const openClass = {
  id: 42,
  status: "OPEN",
  enrolledCount: 3,
  slots: 10,
  enrollmentStart: "2026-07-01T00:00:00.000Z",
  enrollmentEnd: "2026-08-01T00:00:00.000Z",
}

test("enrollment eligibility accepts an available open class", () => {
  assert.equal(
    getClassEnrollmentIssue({
      classData: openClass,
      nowMs: Date.parse("2026-07-25T00:00:00.000Z"),
    }),
    null,
  )
})

test("enrollment eligibility blocks another batch and full classes", () => {
  assert.equal(
    getClassEnrollmentIssue({
      classData: openClass,
      enrolledClassId: 99,
      nowMs: Date.parse("2026-07-25T00:00:00.000Z"),
    }),
    "already_enrolled_in_course",
  )
  assert.equal(
    getClassEnrollmentIssue({
      classData: { ...openClass, enrolledCount: 10 },
      nowMs: Date.parse("2026-07-25T00:00:00.000Z"),
    }),
    "full",
  )
})

test("enrollment eligibility enforces status and enrollment boundaries", () => {
  assert.equal(
    getClassEnrollmentIssue({
      classData: { ...openClass, status: "TEACHING" },
      nowMs: Date.parse("2026-07-25T00:00:00.000Z"),
    }),
    "not_open",
  )
  assert.equal(
    getClassEnrollmentIssue({
      classData: openClass,
      nowMs: Date.parse("2026-06-30T23:59:59.000Z"),
    }),
    "not_started",
  )
  assert.equal(
    getClassEnrollmentIssue({
      classData: openClass,
      nowMs: Date.parse("2026-08-01T00:00:01.000Z"),
    }),
    "closed",
  )
})

test("enrollment eligibility does not treat malformed limits as available", () => {
  assert.equal(
    getClassEnrollmentIssue({
      classData: { ...openClass, slots: "unknown" },
      nowMs: Date.parse("2026-07-25T00:00:00.000Z"),
    }),
    "unavailable",
  )
  assert.equal(
    getClassEnrollmentIssue({
      classData: { ...openClass, enrollmentEnd: "not-a-date" },
      nowMs: Date.parse("2026-07-25T00:00:00.000Z"),
    }),
    "unavailable",
  )
})

test("safe media URLs reject executable schemes and embedded credentials", () => {
  assert.equal(getSafeMediaUrl("javascript:alert(1)"), null)
  assert.equal(getSafeMediaUrl("https://user:secret@example.com/file.png"), null)
  assert.equal(
    getSafeMediaUrl("https://cdn.example.com/file.png"),
    "https://cdn.example.com/file.png",
  )
})
