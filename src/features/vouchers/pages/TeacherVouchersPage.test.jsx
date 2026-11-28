// @vitest-environment happy-dom
import React from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it, vi } from "vitest"
import TeacherVouchersPage from "./TeacherVouchersPage"

vi.mock("react-router-dom", async (importOriginal) => ({
  ...(await importOriginal()),
  useNavigate: () => vi.fn(),
}))

vi.mock("@/shared/context/LanguageContext", () => ({
  useLanguage: () => ({
    t: {
      nav: { workspace: "Workspace" },
      vouchers: {
        pageTitle: "Quản lý Voucher & Ưu đãi",
        pageSubtitle: "Quản lý tất cả voucher của giảng viên.",
      },
    },
  }),
}))

vi.mock("../components/VouchersTab", () => ({
  default: ({ scope }) => <div data-testid="vouchers-tab">{scope}</div>,
}))

describe("ISS-22: TeacherVouchersPage", () => {
  it("renders the title, breadcrumb and the all-scope vouchers tab", () => {
    const html = renderToStaticMarkup(<TeacherVouchersPage />)

    expect(html).toContain("Quản lý Voucher &amp; Ưu đãi")
    expect(html).toContain("Workspace")
    expect(html).toContain('data-testid="vouchers-tab">all')
  })
})
