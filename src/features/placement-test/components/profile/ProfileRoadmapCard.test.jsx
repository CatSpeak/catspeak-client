import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it, vi } from "vitest"
import viCopy from "../../i18n/vi"
import ProfileRoadmapCard from "./ProfileRoadmapCard"

const copy = viCopy.placementTest.profile
const progress = {
  completed: 0,
  total: 5,
  percent: 0,
  stages: [{ active: true }, {}, {}],
}

describe("ProfileRoadmapCard", () => {
  // Oracle: user report 2026-10-31 — pressing the roadmap CTA must open the
  // day-1 lesson in the 5-day module, and the sibling cooldown CTA
  // (PlacementProfilePage.jsx:138-140) is already a real button.
  it("renders the continue CTA as a button that can open the day lesson", () => {
    const html = renderToStaticMarkup(
      <ProfileRoadmapCard
        copy={copy}
        band={3}
        progress={progress}
        onContinue={vi.fn()}
      />,
    )

    expect(html).toContain("Tiếp tục bài học Ngày 1 →")
    expect(html).toMatch(
      /<button[^>]*type="button"[^>]*>Tiếp tục bài học Ngày 1 →<\/button>/,
    )
  })
})
