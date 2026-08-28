import test from "node:test"
// The repository's alias-only import resolver does not recognize this built-in subpath.
// eslint-disable-next-line import/no-unresolved
import assert from "node:assert/strict"

import {
  duplicateQuestion,
  moveQuestion,
  reorderQuestion,
} from "./questionListOps.js"

const build = () => [
  { id: "a", content: "A", options: ["x", "y"], correctAnswers: ["0"] },
  { id: "b", content: "B", options: ["x", "y"], correctAnswers: [] },
  { id: "c", content: "C", options: ["x", "y"], correctAnswers: ["1"] },
]

const ids = (list) => list.map((q) => q.id).join("")

// ─── moveQuestion ───────────────────────────────────────────────────

test("moveQuestion swaps with the previous question", () => {
  assert.equal(ids(moveQuestion(build(), 1, "up")), "bac")
})

test("moveQuestion swaps with the next question", () => {
  assert.equal(ids(moveQuestion(build(), 1, "down")), "acb")
})

test("moveQuestion is a no-op at both bounds", () => {
  const questions = build()
  assert.equal(moveQuestion(questions, 0, "up"), questions)
  assert.equal(moveQuestion(questions, 2, "down"), questions)
})

test("moveQuestion keeps untouched questions referentially identical", () => {
  const questions = build()
  const moved = moveQuestion(questions, 0, "down")
  assert.equal(moved[2], questions[2])
  assert.equal(moved[0], questions[1])
})

// ─── duplicateQuestion ──────────────────────────────────────────────

test("duplicateQuestion inserts the copy directly below the original", () => {
  assert.equal(ids(duplicateQuestion(build(), 0, "a2")), "aa2bc")
})

test("duplicateQuestion deep-copies options and correctAnswers", () => {
  const questions = build()
  const copy = duplicateQuestion(questions, 0, "a2")[1]

  assert.notEqual(copy.options, questions[0].options)
  assert.deepEqual(copy.options, questions[0].options)

  copy.options.push("z")
  assert.deepEqual(questions[0].options, ["x", "y"])
})

test("duplicateQuestion drops the server-side questionId", () => {
  const questions = [{ id: "a", questionId: 42, content: "A" }]
  assert.equal(duplicateQuestion(questions, 0, "a2")[1].questionId, undefined)
})

test("duplicateQuestion is a no-op for an out-of-range index", () => {
  const questions = build()
  assert.equal(duplicateQuestion(questions, 9, "x"), questions)
})

// ─── reorderQuestion ────────────────────────────────────────────────

test("reorderQuestion moves a question forward", () => {
  assert.equal(ids(reorderQuestion(build(), 0, 2)), "bca")
})

test("reorderQuestion moves a question backward", () => {
  assert.equal(ids(reorderQuestion(build(), 2, 0)), "cab")
})

test("reorderQuestion is a no-op when the source equals the target", () => {
  const questions = build()
  assert.equal(reorderQuestion(questions, 1, 1), questions)
})

test("reorderQuestion is a no-op when no drag is in progress", () => {
  const questions = build()
  assert.equal(reorderQuestion(questions, null, 1), questions)
})

test("reorderQuestion is a no-op for an out-of-range target", () => {
  const questions = build()
  assert.equal(reorderQuestion(questions, 0, 9), questions)
})
