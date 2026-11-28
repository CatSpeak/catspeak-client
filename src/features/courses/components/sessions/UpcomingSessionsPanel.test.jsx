// @vitest-environment happy-dom
import React from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it, vi } from "vitest"
import UpcomingSessionsPanel from "./UpcomingSessionsPanel"

vi.mock("@/shared/context/LanguageContext", () => ({
  useLanguage: () => ({ t: {} }),
}))

vi.mock("../CourseStatusPill", () => ({ default: () => null }))

describe("ISS-26: UpcomingSessionsPanel count pill", () => {
  it("uses dark text on the amber pill and can hold 2-3 digits", () => {
    const html = renderToStaticMarkup(
      <UpcomingSessionsPanel title="Upcoming Classes" count={12} sessions={[]} />,
    )

    expect(html).toContain("bg-[#EAB308]")
    expect(html).toContain("text-gray-950")
    expect(html).toContain("min-w-[20px]")
    expect(html).not.toContain("text-white text-[10px]")
  })
})
