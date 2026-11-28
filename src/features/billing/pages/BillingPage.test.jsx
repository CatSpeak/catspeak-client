// @vitest-environment happy-dom
import React from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { beforeEach, describe, expect, it, vi } from "vitest"
import planUsageVi from "@/shared/i18n/locales/vi/pages/planUsage"
import BillingPage from "./BillingPage"

const mocks = vi.hoisted(() => ({
  isTeacher: true,
  tab: "payouts",
}))

vi.mock("react-router-dom", async (importOriginal) => ({
  ...(await importOriginal()),
  useSearchParams: () => [
    new URLSearchParams(mocks.tab ? `tab=${mocks.tab}` : ""),
    vi.fn(),
  ],
}))

vi.mock("@/features/courses/components/RoleSwitcher", () => ({
  default: () => ({ isTeacher: mocks.isTeacher }),
  useRoleOverride: () => ({ isTeacher: mocks.isTeacher }),
}))

vi.mock("@/shared/context/LanguageContext", () => ({
  useLanguage: () => ({ t: {} }),
}))

vi.mock("@/shared/components/ui/navigation", () => ({
  Tabs: ({ tabs }) => (
    <div data-testid="tabs" data-labels={tabs.map((tab) => tab.label).join("|")}>
      {tabs.map((tab) => tab.id).join(",")}
    </div>
  ),
  TabContent: ({ activeTab, children }) => (
    <div>
      <span data-testid="active">{activeTab}</span>
      {children}
    </div>
  ),
}))

vi.mock("../components/PaymentHistoryTab", () => ({
  default: () => <div data-testid="payments" />,
}))
vi.mock("../components/RefundHistoryTab", () => ({
  default: () => <div data-testid="refunds" />,
}))
vi.mock("../components/PayoutsTab", () => ({
  default: () => <div data-testid="payouts" />,
}))
vi.mock("./PlanUsageTab", () => ({
  default: () => <div data-testid="usage" />,
}))

const render = () => renderToStaticMarkup(<BillingPage />)

describe("ISS-61: BillingPage payouts tab is teacher-only", () => {
  beforeEach(() => {
    mocks.isTeacher = true
    mocks.tab = "payouts"
  })

  it("shows the payouts tab to Teachers and mounts PayoutsTab", () => {
    const html = render()

    expect(html).toContain("usage,payments,refunds,payouts")
    expect(html).toContain('data-testid="payouts"')
    expect(html).toContain('data-testid="active">payouts')
  })

  it("hides payouts and falls back to usage for Students", () => {
    mocks.isTeacher = false

    const html = render()

    expect(html).not.toContain("payouts")
    expect(html).not.toContain('data-testid="payouts"')
    expect(html).toContain('data-testid="active">usage')
    expect(html).toContain('data-testid="usage"')
  })

  it("uses the Vietnamese 'Hạn Ngạch & Sử Dụng' fallback label", () => {
    const html = render()

    expect(html).toContain("Hạn Ngạch &amp; Sử Dụng")
    expect(html).not.toContain("Hạn Ngạch &amp; Gói")
  })

  it("localizes planUsage key terminology in Vietnamese", () => {
    expect(planUsageVi.tabUsage).toBe("Hạn Ngạch & Sử Dụng")
    expect(planUsageVi.errorTitle).toBe("Không Thể Tải Dữ Liệu Sử Dụng")
    expect(planUsageVi.tabUsage).not.toContain("Usage")
    expect(planUsageVi.errorTitle).not.toContain("Usage")
  })
})
