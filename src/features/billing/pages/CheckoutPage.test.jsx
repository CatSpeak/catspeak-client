import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it, vi } from "vitest"

vi.mock("react-router-dom", async (importOriginal) => ({
  ...(await importOriginal()),
  useLocation: () => ({
    state: { plan: { name: "Pro", price: 199000, id: 2 } },
  }),
  useNavigate: () => vi.fn(),
}))

vi.mock("@/shared/context/LanguageContext", () => ({
  useLanguage: () => ({
    t: {
      billing: {
        checkout: { title: "Thanh toán dịch vụ" },
        pricing: { processing: "Đang xử lý..." },
      },
    },
    language: "vi",
  }),
}))

vi.mock("@/features/auth", () => ({
  useAuth: () => ({ user: { fullName: "Nguyen Van A" } }),
}))

vi.mock("@/store/api/userApi", () => ({
  useGetUserProfileQuery: () => ({ data: null, isLoading: false }),
}))

vi.mock("@/store/api/paymentsApi", () => ({
  useCheckoutMutation: () => [vi.fn(), { isLoading: false }],
}))

vi.mock("@/shared/hooks/useSubmitLock", () => ({
  useSubmitLock: () => ({ runLocked: vi.fn() }),
}))

vi.mock("../checkout/components/CheckoutBreadcrumbs", () => ({
  default: () => null,
}))
vi.mock("../checkout/components/RecipientInfoBox", () => ({
  default: () => null,
}))
vi.mock("../checkout/components/BuyerInfoBox", () => ({
  default: () => null,
}))
vi.mock("../checkout/components/PaymentMethodSelector", () => ({
  default: () => null,
}))
vi.mock("../checkout/components/PaymentSummaryBox", () => ({
  default: () => null,
}))

import CheckoutPage from "./CheckoutPage"

describe("ISS-56: /checkout mobile spacing", () => {
  it("uses responsive horizontal padding and heading sizes", () => {
    const html = renderToStaticMarkup(<CheckoutPage />)

    expect(html).toContain("px-4 sm:px-8 lg:px-12")
    expect(html).not.toContain("mx-auto px-12 pt-6")
    expect(html).toContain("text-2xl sm:text-3xl md:text-4xl")
    expect(html).toContain("rounded-2xl sm:rounded-3xl p-4 sm:p-6")
  })
})
