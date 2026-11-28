// @vitest-environment happy-dom
import React from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it, vi } from "vitest"
import enFooter from "@/shared/i18n/locales/en/components/footer"
import jaFooter from "@/shared/i18n/locales/ja/components/footer"
import zhFooter from "@/shared/i18n/locales/zh/components/footer"
import Footer from "./index"

const { footerState } = vi.hoisted(() => ({
  footerState: {
    current: {
      policies: { privacy: "Privacy", terms: "Terms", payment: "Payment" },
    },
  },
}))

vi.mock("@/shared/context/LanguageContext.jsx", () => ({
  useLanguage: () => ({
    t: {
      footer: footerState.current,
    },
  }),
}))

vi.mock("@/features/auth", () => ({
  PolicyModal: () => null,
}))

describe("ISS-43: Footer quick links point at real landing anchors", () => {
  footerState.current = {
    policies: { privacy: "Privacy", terms: "Terms", payment: "Payment" },
  }
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

describe("ISS-48: Footer copy is localized in every interface language", () => {
  it.each([
    ["en", enFooter, "Core features (1-on-1 rooms, AI)", "Contact & partnership page"],
    ["zh", zhFooter, "核心功能（1对1房间、AI）", "联系与合作页面"],
    ["ja", jaFooter, "主な機能（1対1ルーム・AI）", "お問い合わせ・提携ページ"],
  ])("renders %s footer labels", (_lang, footerText, quickLink, contactLink) => {
    footerState.current = footerText

    const html = renderToStaticMarkup(<Footer />)

    expect(html).toContain(quickLink)
    expect(html).toContain(contactLink.replace("&", "&amp;"))
    expect(html).toContain(footerText.copyrightNotice.replace("{year}", String(new Date().getFullYear())))
  })
})
