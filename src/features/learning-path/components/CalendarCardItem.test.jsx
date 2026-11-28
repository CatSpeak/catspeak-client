import React from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it } from "vitest"
import CalendarCardItem from "./CalendarCardItem"

const render = (card, props = {}) =>
  renderToStaticMarkup(<CalendarCardItem card={card} {...props} />)

const baseCard = {
  cardId: 2,
  dayIndex: 2,
  scheduledDate: "2026-12-02",
  topicTitle: "Miêu tả các thành viên",
  topicDescription: "Gia đình và Người thân",
  category: "Core",
}

describe("CalendarCardItem today/upcoming resolution", () => {
  it("renders a Scheduled card with no isToday as today (no regression)", () => {
    const html = render({ ...baseCard, status: "Scheduled" })

    expect(html).toContain("Hôm nay")
    expect(html).toContain("Vào học")
    expect(html).not.toContain("Sắp tới")
  })

  it("never renders the today badge when isToday is explicitly false", () => {
    const html = render({ ...baseCard, status: "Scheduled", isToday: false })

    expect(html).not.toContain("Hôm nay")
    expect(html).toContain("Sắp tới")
    expect(html).toContain("Chưa tới")
    expect(html).not.toContain("Vào học")
  })

  it("offers Học sớm instead of Chưa tới when the cycle starts tomorrow", () => {
    const html = render(
      { ...baseCard, status: "Scheduled", isToday: false },
      { startsTomorrow: true },
    )

    expect(html).not.toContain("Hôm nay")
    expect(html).toContain("Sắp tới")
    expect(html).toContain("Học sớm")
    expect(html).not.toContain("Chưa tới")
  })

  it("renders the today badge and active launch button when isToday is true", () => {
    const html = render({ ...baseCard, status: "Scheduled", isToday: true })

    expect(html).toContain("Hôm nay")
    expect(html).toContain("Vào học")
    expect(html).not.toContain("Sắp tới")
  })
})
