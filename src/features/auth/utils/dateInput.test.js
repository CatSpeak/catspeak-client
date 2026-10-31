import test from "node:test"
// eslint-disable-next-line import/no-unresolved
import assert from "node:assert/strict"
import { formatDateInput, maskDateInput, parseDateInput, shouldShowDateFormatError } from "./dateInput.js"

test("accepts both typed date formats and formats only the completed date", () => {
  assert.equal(parseDateInput("24/10/2000"), "2000-10-24")
  assert.equal(parseDateInput("24102000"), "2000-10-24")
  assert.equal(formatDateInput(parseDateInput("24102000")), "24/10/2000")
})

test("rejects the malformed date shown in the QA video", () => {
  assert.equal(parseDateInput("22/24/1020"), "")
})

test("does not roll impossible dates into the next month", () => {
  for (const value of ["31/04/2000", "29/02/1900", "29/02/2001", "00/12/2000", "24/13/2000"]) {
    assert.equal(parseDateInput(value), "")
  }
  assert.equal(parseDateInput("29/02/2000"), "2000-02-29")
  assert.equal(parseDateInput("29/02/2024"), "2024-02-29")
})

test("editing or deleting a valid date clears the value sent to the form", () => {
  const edits = ["24/10/2000", "24/10/200", "24/10/", "", "31/02/2000"]
  assert.deepEqual(edits.map(parseDateInput), ["2000-10-24", "", "", "", ""])
})

test("rejects extra text and unsupported years instead of silently changing them", () => {
  for (const value of ["241020001", "24/10/2000x", "24/10/1899", "24/10/2101"]) {
    assert.equal(parseDateInput(value), "")
  }
})

test("typing 25102003 inserts separators right away after day and month", () => {
  let value = ""
  let caret = 0
  const steps = []
  for (const digit of "25102003") {
    const raw = value.slice(0, caret) + digit + value.slice(caret)
      ; ({ value, caret } = maskDateInput(raw, caret + 1))
    steps.push(value)
    assert.equal(caret, value.length)
  }
  assert.deepEqual(steps, ["2", "25/", "25/1", "25/10/", "25/10/2", "25/10/20", "25/10/200", "25/10/2003"])
})

test("pasting and editing in the middle preserves the intended digit position", () => {
  assert.deepEqual(maskDateInput("25"), { value: "25/", caret: 3 })
  assert.deepEqual(maskDateInput("2510"), { value: "25/10/", caret: 6 })
  assert.deepEqual(maskDateInput("25102003"), { value: "25/10/2003", caret: 10 })
  assert.deepEqual(maskDateInput("26/10/2003", 2), { value: "26/10/2003", caret: 3 })
  assert.deepEqual(maskDateInput("2/10/2003", 1), { value: "21/02/003", caret: 1 })
  assert.deepEqual(maskDateInput("25/10/200", 9), { value: "25/10/200", caret: 9 })
  assert.deepEqual(maskDateInput("", 0), { value: "", caret: 0 })
})

test("incomplete input only shows format errors after blur, including after refocusing", () => {
  assert.equal(shouldShowDateFormatError("25/1", true, false), false)
  assert.equal(shouldShowDateFormatError("25/1", false, true), true)
  assert.equal(shouldShowDateFormatError("25/1", true, true), false)
  assert.equal(shouldShowDateFormatError("31/02/2003", true, false), true)
  assert.equal(shouldShowDateFormatError("25/10/2003", true, true), false)
  assert.equal(shouldShowDateFormatError("", false, true), false)
})
