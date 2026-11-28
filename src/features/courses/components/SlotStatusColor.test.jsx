import { describe, expect, it } from "vitest"
import { getSlotStatusColor } from "../utils/teacherUtils.js"

describe("ISS-60: remaining-slot badges keep WCAG contrast in both themes", () => {
  it("uses a readable emerald badge above 5 slots", () => {
    const colors = getSlotStatusColor(6)

    expect(colors.status).toBe("green")
    expect(colors.textColor).toBe("text-emerald-700 dark:text-emerald-400")
    expect(colors.bgColor).toBe("bg-emerald-50 dark:bg-emerald-950/40")
    expect(colors.borderColor).toBe(
      "border-emerald-200 dark:border-emerald-800/60",
    )
  })

  it("uses a readable amber badge for 1-5 slots", () => {
    const colors = getSlotStatusColor(3)

    expect(colors.status).toBe("yellow")
    expect(colors.textColor).toBe("text-amber-700 dark:text-amber-400")
    expect(colors.bgColor).toBe("bg-amber-50 dark:bg-amber-950/40")
  })

  it("uses a readable red badge when no slots remain", () => {
    const colors = getSlotStatusColor(0)

    expect(colors.status).toBe("red")
    expect(colors.textColor).toBe("text-red-700 dark:text-red-400")
    expect(colors.bgColor).toBe("bg-red-50 dark:bg-red-950/40")
  })
})
