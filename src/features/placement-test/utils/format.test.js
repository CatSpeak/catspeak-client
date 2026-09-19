import { describe, expect, it } from "vitest"
import {
  formatClock,
  formatDate,
  formatDurationShort,
  formatExpiryStamp,
  formatTemplate,
} from "./format"

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

describe("formatDate", () => {
  it("formats a timestamp as DD/MM/YYYY", () => {
    expect(formatDate(new Date(2026, 7, 28).getTime())).toBe("28/08/2026")
    expect(formatDate(new Date(2026, 0, 5).getTime())).toBe("05/01/2026")
  })

  it("accepts a Date instance", () => {
    expect(formatDate(new Date(2026, 8, 16))).toBe("16/09/2026")
  })

  it("returns an empty string for invalid input", () => {
    expect(formatDate(undefined)).toBe("")
    expect(formatDate("not-a-date")).toBe("")
  })
})

describe("formatDurationShort", () => {
  it("formats hours and minutes", () => {
    expect(formatDurationShort(18 * 60 * 60 * 1000 + 24 * 60 * 1000)).toBe(
      "18h 24m",
    )
  })

  it("formats sub-hour durations in minutes", () => {
    expect(formatDurationShort(45 * 60 * 1000)).toBe("45m")
  })

  it("clamps negative and missing values", () => {
    expect(formatDurationShort(-1)).toBe("0m")
    expect(formatDurationShort(undefined)).toBe("0m")
  })
})

describe("formatExpiryStamp", () => {
  it("formats a timestamp as HH:mm - DD/MM/YYYY", () => {
    const stamp = new Date(2026, 8, 16, 6, 30).getTime()
    expect(formatExpiryStamp(stamp)).toBe("06:30 - 16/09/2026")
  })

  it("returns an empty string for invalid input", () => {
    expect(formatExpiryStamp(undefined)).toBe("")
  })
})
