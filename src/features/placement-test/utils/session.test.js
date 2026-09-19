import { describe, expect, it } from "vitest"
import { createSessionCode } from "./session"

describe("createSessionCode", () => {
  it("formats the code as CS-PT-<year>-<4digits>", () => {
    expect(createSessionCode({ year: 2026, random: 0.8891 })).toBe(
      "CS-PT-2026-8891",
    )
  })

  it("pads the suffix to four digits", () => {
    expect(createSessionCode({ year: 2026, random: 0 })).toBe("CS-PT-2026-0000")
  })

  it("never exceeds four digits", () => {
    expect(createSessionCode({ year: 2026, random: 0.99999 })).toBe(
      "CS-PT-2026-9999",
    )
  })

  it("defaults the year to the current year", () => {
    expect(createSessionCode()).toMatch(/^CS-PT-\d{4}-\d{4}$/)
  })
})
