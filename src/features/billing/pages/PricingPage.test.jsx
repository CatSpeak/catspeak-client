// @vitest-environment happy-dom
import React, { act } from "react"
import { createRoot } from "react-dom/client"
import { renderToStaticMarkup } from "react-dom/server"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

globalThis.IS_REACT_ACT_ENVIRONMENT = true

const state = vi.hoisted(() => ({
  isAuthenticated: false,
  planName: "",
  isPro: false,
}))
const openAuthModal = vi.hoisted(() => vi.fn())

const plans = vi.hoisted(() => [
  {
    planId: 1,
    planName: "Free",
    priceVnd: 0,
    billingCycle: "month",
    description: "Gói miễn phí",
    subscriptionFeatures: [],
    applicableRole: "Student",
    packageStatus: "Published",
  },
  {
    planId: 2,
    planName: "Pro",
    priceVnd: 199000,
    billingCycle: "month",
    description: "Gói Pro",
    subscriptionFeatures: [
      {
        id: 21,
        featureCode: "ROOM_LIMIT",
        featureName: "Phòng học",
        limitValue: "10",
        valueType: "number",
        displayOrder: 1,
      },
    ],
    applicableRole: "Student",
    packageStatus: "Published",
  },
  {
    planId: 3,
    planName: "AI Speaking",
    priceVnd: 299000,
    billingCycle: "month",
    description: "Gói AI",
    subscriptionFeatures: [],
    applicableRole: "Student",
    packageStatus: "Published",
  },
])

vi.mock("@/store/api/plansApi", () => ({
  useGetPlansQuery: () => ({ data: plans, isLoading: false }),
}))

vi.mock("@/shared/hooks/usePlanFeatures", () => ({
  usePlanFeatures: () => ({
    planName: state.planName,
    isPro: state.isPro,
    isLoading: false,
  }),
}))

vi.mock("@/features/auth", () => ({
  useAuth: () => ({ isAuthenticated: state.isAuthenticated }),
}))

vi.mock("@/shared/context/AuthModalContext", () => ({
  useAuthModal: () => ({ openAuthModal }),
}))

vi.mock("@/shared/context/ThemeContext", () => ({
  useTheme: () => ({ isDark: false }),
}))

const t = {
  billing: {
    pricing: {
      title: "Gói đăng ký",
      currentPlan: "Gói hiện tại",
      activated: "Đã kích hoạt",
      included: "Đã bao gồm trong gói của bạn",
      popular: "Phổ biến",
      processing: "Đang xử lý...",
      upgradeTo: "Nâng cấp lên {{planName}}",
      startFree: "Bắt đầu miễn phí",
    },
  },
}

vi.mock("@/shared/context/LanguageContext", () => ({
  useLanguage: () => ({ t, language: "vi" }),
}))

vi.mock("react-router-dom", async (importOriginal) => ({
  ...(await importOriginal()),
  useLocation: () => ({ pathname: "/pricing", state: null }),
  useNavigate: () => vi.fn(),
}))

import PricingPage from "./PricingPage"

const renderStatic = () => renderToStaticMarkup(<PricingPage />)

describe("ISS-38: /pricing guest state and layout", () => {
  beforeEach(() => {
    state.isAuthenticated = false
    state.planName = ""
    state.isPro = false
    openAuthModal.mockClear()
  })

  afterEach(() => {
    document.body.innerHTML = ""
  })

  it("uses a single column until lg and lifts the height locks", () => {
    const html = renderStatic()

    expect(html).toContain("grid-cols-1 lg:grid-cols-3")
    expect(html).not.toContain("md:grid-cols-3")
    expect(html).not.toContain("md:h-screen")
    expect(html).not.toContain("md:overflow-hidden")
    expect(html).not.toContain("h-[calc(100dvh-11rem)]")
    expect(html).not.toContain("overflow-y-hidden")
    expect(html).toContain("h-full min-h-[480px]")
    expect(html).toContain("flex flex-wrap shrink-0 items-start justify-between")
  })

  it("never shows activated/current plan state to guests", () => {
    const html = renderStatic()

    expect(html).not.toContain("Đã kích hoạt")
    expect(html).not.toContain("Gói hiện tại")
    expect(html).toContain("Bắt đầu miễn phí")
  })

  it("opens the register modal from the guest free CTA", () => {
    const container = document.createElement("div")
    document.body.appendChild(container)
    const root = createRoot(container)

    act(() => {
      root.render(<PricingPage />)
    })

    const freeButton = [...container.querySelectorAll("button")].find(
      (button) => button.textContent.includes("Bắt đầu miễn phí"),
    )
    expect(freeButton).toBeTruthy()

    act(() => {
      freeButton.dispatchEvent(new MouseEvent("click", { bubbles: true }))
    })

    expect(openAuthModal).toHaveBeenCalledWith("register")
  })

  it("keeps the current-plan state for an authenticated Free user", () => {
    state.isAuthenticated = true
    state.planName = "Free"

    const html = renderStatic()

    expect(html).toContain("Gói hiện tại")
    expect(html).toContain("Đã kích hoạt")
    expect(html).not.toContain(">Bắt đầu miễn phí<")
  })
})
