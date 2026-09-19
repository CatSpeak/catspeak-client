import { describe, expect, it } from "vitest"
import { canRetry, nextRetryCount } from "./retry"

describe("retry counter", () => {
  it("allows retries up to the max", () => {
    expect(canRetry(0)).toBe(true)
    expect(canRetry(1)).toBe(true)
    expect(canRetry(2)).toBe(false)
    expect(canRetry(3)).toBe(false)
  })

  it("increments without exceeding the max", () => {
    expect(nextRetryCount(0)).toBe(1)
    expect(nextRetryCount(1)).toBe(2)
    expect(nextRetryCount(2)).toBe(2)
    expect(nextRetryCount(undefined)).toBe(1)
  })
})
