// @vitest-environment happy-dom
import React from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it, vi } from "vitest"
import Footer from "./index"

vi.mock("@/shared/context/LanguageContext.jsx", () => ({
  useLanguage: () => ({
    t: {
      footer: {
        policies: { privacy: "Privacy", terms: "Terms", payment: "Payment" },
      },
    },
  }),
}))

vi.mock("@/features/auth", () => ({
  PolicyModal: () => null,
}))

describe("ISS-43: Footer quick links point at real landing anchors", () => {
  const html = renderToStaticMarkup(<Footer />)

  it.each([
    "Vấn đề người học",
    "Giải pháp CAT SPEAK",
    "Tính năng cốt lõi (Room 1-1, AI)",
    "Cách hoạt động",
    "So sánh phương pháp học",
    "Câu hỏi thường gặp (FAQ)",
    "Trạng thái hệ thống",
  ])("renders the %s link", (label) => {
    expect(html).toContain(label)
  })

  it("uses the real section ids and no dead anchors", () => {
    const hrefs = [...html.matchAll(/href="(\/#[^"]+)"/g)].map((m) => m[1])

    expect(hrefs).toEqual([
      "/#learning-barriers",
      "/#catspeak-solutions",
      "/#core-features",
      "/#how-it-works",
      "/#solutions",
      "/#faq",
      "/#contact",
    ])
    expect(html).not.toContain('href="/#features"')
    expect(html).not.toContain('href="/#problem"')
    expect(hrefs.filter((href) => href === "/#solutions")).toHaveLength(1)
  })
})
