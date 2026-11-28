import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it, vi } from "vitest"

vi.mock("./policies", () => ({
  getPolicyComponent: (key) =>
    key === "privacy" || key === "Chính sách bảo mật"
      ? () => <div>privacy-body</div>
      : null,
}))

vi.mock("@/shared/context/LanguageContext", () => ({
  useLanguage: () => ({ t: { comingSoon: { badge: "Sắp ra mắt" } } }),
}))

import PolicyModal from "./PolicyModal"

describe("ISS-11: PolicyModal prefers the language-independent policyKey", () => {
  it("renders the policy body from policyKey even when the title is localized", () => {
    const html = renderToStaticMarkup(
      <PolicyModal open title="プライバシーポリシー" policyKey="privacy" />,
    )

    expect(html).toContain("privacy-body")
    expect(html).toContain("プライバシーポリシー")
  })

  it("falls back to the translated title when no policyKey is passed", () => {
    const html = renderToStaticMarkup(
      <PolicyModal open title="Chính sách bảo mật" />,
    )

    expect(html).toContain("privacy-body")
  })

  it("shows the coming-soon badge when the policy cannot be resolved", () => {
    const html = renderToStaticMarkup(
      <PolicyModal open title="Không tồn tại" policyKey="unknown" />,
    )

    expect(html).toContain("Sắp ra mắt")
  })
})
