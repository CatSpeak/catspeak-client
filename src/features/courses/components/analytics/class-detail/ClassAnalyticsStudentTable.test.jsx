// @vitest-environment happy-dom
import React from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it, vi } from "vitest"
import ClassAnalyticsStudentTable from "./ClassAnalyticsStudentTable"

vi.mock("@/shared/context/LanguageContext", () => ({
  useLanguage: () => ({
    t: {
      courses: {
        analytics: {
          classDetail: {
            expectedThresholdHint:
              "Ngưỡng kỳ vọng: mỗi học viên phát biểu ≥ {{rate}}% thời gian (kỳ vọng cân bằng 1/{{total}} học viên)",
            expectedThresholdHintNoStudents:
              "Ngưỡng kỳ vọng: mỗi học viên phát biểu ≥ {{rate}}% thời gian",
            sessionsCount: "{{count}} buổi",
            colStudent: "Học viên",
            colAvgPercent: "% TB",
            colSessionsMet: "Buổi đạt",
            colSessionsUnmet: "Buổi chưa đạt",
            colTrend: "Xu hướng",
            colStatus: "Trạng thái",
          },
        },
      },
    },
  }),
}))

describe("ISS-23: ClassAnalyticsStudentTable threshold hint never divides by zero", () => {
  it("uses the no-students copy when totalStudents is 0 (the default)", () => {
    const html = renderToStaticMarkup(<ClassAnalyticsStudentTable students={[]} />)

    expect(html).not.toContain("1/0")
    expect(html).toContain("mỗi học viên phát biểu ≥ 25% thời gian")
    expect(html).not.toContain("kỳ vọng cân bằng")
  })

  it("shows the balance hint with a real total when totalStudents > 0", () => {
    const html = renderToStaticMarkup(
      <ClassAnalyticsStudentTable students={[]} totalStudents={4} />,
    )

    expect(html).toContain("1/4 học viên")
    expect(html).not.toContain("1/0")
  })
})
