import { describe, expect, it } from "vitest"
import { formatClock, formatTemplate } from "./format"

describe("formatTemplate", () => {
  it("replaces every token occurrence", () => {
    expect(
      formatTemplate("Câu {{current}} / {{total}} · {{current}}", {
        current: 3,
        total: 5,
      }),
    ).toBe("Câu 3 / 5 · 3")
  })

  it("returns an empty string for a missing template", () => {
    expect(formatTemplate(undefined)).toBe("")
  })
})

describe("formatClock", () => {
  it("formats milliseconds as MM:SS", () => {
    expect(formatClock(0)).toBe("00:00")
    expect(formatClock(45000)).toBe("00:45")
    expect(formatClock(125000)).toBe("02:05")
  })

  it("clamps negative values to zero", () => {
    expect(formatClock(-500)).toBe("00:00")
  })
})
