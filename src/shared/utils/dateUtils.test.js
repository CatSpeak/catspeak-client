import { describe, expect, it } from "vitest"
import { convertTimeStrToTz, formatWeeklyScheduleText } from "./dateUtils"

describe("dateUtils timezone conversions", () => {
  it("converts UTC HH:mm to target timezone with 2 or 3 args", () => {
    expect(convertTimeStrToTz("11:30", "Asia/Ho_Chi_Minh")).toBe("18:30")
    expect(convertTimeStrToTz("11:30", "Asia/Ho_Chi_Minh", "UTC")).toBe("18:30")
    expect(convertTimeStrToTz("18:30", null)).toBe("18:30")
    expect(convertTimeStrToTz("", "Asia/Ho_Chi_Minh")).toBe("")
  })

  it("respects non-UTC sourceTimeZone when provided as 3rd argument", () => {
    expect(convertTimeStrToTz("18:30", "UTC", "Asia/Ho_Chi_Minh")).toBe("11:30")
    expect(convertTimeStrToTz("18:30", "Asia/Tokyo", "Asia/Ho_Chi_Minh")).toBe(
      "20:30",
    )
    expect(convertTimeStrToTz("2026-08-10T11:30:00Z", "Asia/Ho_Chi_Minh")).toBe(
      "18:30",
    )
  })

  it("formats weekly schedule arrays and objects in target timezone with day shifting", () => {
    expect(
      formatWeeklyScheduleText(
        {
          schedule: [
            { dayOfWeek: "MON", startTime: "18:00", endTime: "19:30" },
          ],
        },
        "en",
        "—",
        "Asia/Ho_Chi_Minh",
      ),
    ).toBe("Tue (01:00 - 02:30)")

    expect(
      formatWeeklyScheduleText(
        {
          schedule: {
            days: ["MON", "WED"],
            startTime: "11:00",
            endTime: "12:30",
          },
        },
        "en",
        "—",
        "Asia/Ho_Chi_Minh",
      ),
    ).toBe("Mon, Wed (18:00 - 19:30)")
  })
})
