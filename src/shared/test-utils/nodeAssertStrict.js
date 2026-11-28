import { expect } from "vitest"

// Minimal node:assert/strict-compatible facade so the existing video-call
// utility suites can run under Vitest without rewriting every assertion.
const assert = {
  ok(value, message) {
    expect(value, message).toBeTruthy()
  },
  equal(actual, expected, message) {
    expect(actual, message).toBe(expected)
  },
  notEqual(actual, expected, message) {
    expect(actual, message).not.toBe(expected)
  },
  strictEqual(actual, expected, message) {
    expect(actual, message).toBe(expected)
  },
  deepEqual(actual, expected, message) {
    expect(actual, message).toEqual(expected)
  },
  throws(fn, expected, message) {
    if (expected === undefined) {
      expect(fn, message).toThrow()
      return
    }
    expect(fn, message).toThrow(expected)
  },
  fail(message) {
    throw new Error(message || "assert.fail()")
  },
}

export default assert
