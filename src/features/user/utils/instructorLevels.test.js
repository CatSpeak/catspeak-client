import test from "node:test"
import assert from "node:assert/strict"
import { isAllowedInstructorLevel } from "./instructorLevels.js"

test("teacher qualifications exclude beginner HSK levels without removing other qualifications", () => {
  for (const value of ["HSK 1", "hsk2", " HSK-3 ", "", null]) {
    assert.equal(isAllowedInstructorLevel(value), false)
  }
  for (const value of ["HSK 4", "HSK 5", "HSK 6", "JLPT N1", "IELTS 7.0"]) {
    assert.equal(isAllowedInstructorLevel(value), true)
  }
})
