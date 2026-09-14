// eslint-disable-next-line import/no-unresolved
import test from "node:test"
// The repository's alias-only import resolver does not recognize Node's built-in protocol.
// eslint-disable-next-line import/no-unresolved
import assert from "node:assert/strict"

import {
  getClassEnrollmentIssue,
  getMemberAvatar,
  getMemberDisplayName,
  getMemberEmail,
  getMemberId,
  getSafeMediaUrl,
  isClosingSoon,
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

test("enrollment eligibility blocks full classes", () => {
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
      classData: { ...openClass, status: "CLOSED" },
      nowMs: Date.parse("2026-07-25T00:00:00.000Z"),
    }),
    "closed",
  )
  assert.equal(
    getClassEnrollmentIssue({
      classData: { ...openClass, status: "UPCOMING" },
      nowMs: Date.parse("2026-07-25T00:00:00.000Z"),
    }),
    "upcoming",
  )
  assert.equal(
    getClassEnrollmentIssue({
      classData: openClass,
      nowMs: Date.parse("2026-06-30T23:59:59.000Z"),
    }),
    "upcoming",
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

test("member display name never returns whitespace and falls back to nickname/username/email", () => {
  assert.equal(getMemberDisplayName({ id: 2, name: "An" }), "An")
  assert.equal(getMemberDisplayName({ id: 2, name: "  An  " }), "An")
  assert.equal(getMemberDisplayName({ id: 2, name: null, nickname: "AnNick" }), "AnNick")
  assert.equal(getMemberDisplayName({ id: 2, username: "an123" }), "an123")
  assert.equal(
    getMemberDisplayName({ id: 2, name: "   ", email: "an@example.com" }),
    "an@example.com",
  )
  assert.equal(getMemberDisplayName({ id: 2, name: null, avatar: "x" }), "")
  assert.equal(getMemberDisplayName({ Id: 2, FullName: "Binh" }), "Binh")
  assert.equal(getMemberId({ Id: 2 }), 2)
  assert.equal(getMemberId({ AccountId: 3 }), 3)
  assert.equal(getMemberEmail({ Email: "a@b.co" }), "a@b.co")
  assert.equal(getMemberAvatar({ AvatarImageUrl: "https://cdn.example.com/a.png" }), "https://cdn.example.com/a.png")
})

test("isClosingSoon flags deadlines within threshold and ignores past/far deadlines", () => {
  const now = Date.parse("2026-07-25T00:00:00.000Z")
  assert.equal(
    isClosingSoon("2026-07-28T00:00:00.000Z", now), // 3 days out
    true,
  )
  assert.equal(
    isClosingSoon("2026-08-25T00:00:00.000Z", now), // 31 days out
    false,
  )
  assert.equal(
    isClosingSoon("2026-07-20T00:00:00.000Z", now), // past
    false,
  )
  assert.equal(isClosingSoon(null, now), false)
  assert.equal(isClosingSoon("not-a-date", now), false)
})
