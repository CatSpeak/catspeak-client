// @vitest-environment happy-dom
import React from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it, vi } from "vitest"
import SessionDetailKpis from "./SessionDetailKpis"

vi.mock("@/shared/context/LanguageContext", () => ({
  useLanguage: () => ({ t: {} }),
}))

describe("ISS-04: SessionDetailKpis never invents speaking ratios", () => {
  it("shows an em dash and 'Chưa có dữ liệu' when the API has no ratio", () => {
    const html = renderToStaticMarkup(
      <SessionDetailKpis
        sessionData={{
          teacherSpeechPercent: null,
          studentSpeechPercent: null,
          teacherStatus: null,
          studentCount: 0,
          lowSpeakingCount: 0,
        }}
      />,
    )

    expect(html).toContain("—")
    expect(html).toContain("Chưa có dữ liệu")
    expect(html).not.toContain("45%")
    expect(html).not.toContain("55%")
    expect(html).not.toContain("Lý tưởng")
  })

  it("renders real values when present", () => {
    const html = renderToStaticMarkup(
      <SessionDetailKpis
        sessionData={{
          teacherSpeechPercent: 30,
          studentSpeechPercent: 70,
          teacherStatus: "ideal",
        }}
      />,
    )

    expect(html).toContain("30%")
    expect(html).toContain("70%")
    expect(html).toContain("Lý tưởng")
  })
})
