// @vitest-environment happy-dom
import React, { act } from "react"
import { createRoot } from "react-dom/client"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import RefundEligibleModal from "./RefundEligibleModal"
import RefundIneligibleModal from "./RefundIneligibleModal"
import RequestRefundModal from "./RequestRefundModal"
import RefundSuccessModal from "./RefundSuccessModal"

const mocks = vi.hoisted(() => ({
  eligibility: {
    data: undefined,
    isLoading: true,
    isError: false,
    refetch: vi.fn(),
  },
  banks: { data: [], isLoading: false },
}))

vi.mock("../api/refundsApi", () => ({
  useCheckRefundEligibilityQuery: () => mocks.eligibility,
  useRequestRefundMutation: () => [
    vi.fn(() => ({ unwrap: () => Promise.resolve({}) })),
    { isLoading: false },
  ],
}))

vi.mock("@/features/bank-accounts/api/instructorBankAccountsApi", () => ({
  useGetBanksQuery: () => mocks.banks,
}))

vi.mock("@/shared/hooks/useSubmitLock", () => ({
  useSubmitLock: () => ({ runLocked: (fn) => fn() }),
}))

vi.mock("@/shared/context/LanguageContext", () => ({
  useLanguage: () => ({ t: {} }),
}))

const hasClass = (needle) =>
  [...document.body.querySelectorAll("*")].some(
    (node) =>
      typeof node.className === "string" && node.className.includes(needle),
  )

const findByText = (selector, text) =>
  [...document.body.querySelectorAll(selector)].find((node) =>
    node.textContent.includes(text),
  )

describe("ISS-58: refund surfaces are readable in dark mode", () => {
  let container
  let root

  const mount = (ui) => {
    container = document.createElement("div")
    document.body.appendChild(container)
    root = createRoot(container)
    act(() => {
      root.render(ui)
    })
  }

  beforeEach(() => {
    mocks.eligibility = {
      data: undefined,
      isLoading: true,
      isError: false,
      refetch: vi.fn(),
    }
    mocks.banks = { data: [], isLoading: false }
  })

  afterEach(() => {
    act(() => {
      root.unmount()
    })
    container.remove()
    document.body.innerHTML = ""
  })

  it("styles the eligible modal icon, reason and max-amount label for dark mode", () => {
    mount(
      <RefundEligibleModal
        isOpen
        onClose={vi.fn()}
        onContinue={vi.fn()}
        orderCode="123"
        eligibility={{
          reason: "Đủ điều kiện",
          maxRefundAmount: 100000,
          paymentType: "Bank",
        }}
      />,
    )

    expect(hasClass("dark:bg-emerald-950/40")).toBe(true)
    expect(hasClass("dark:text-emerald-400")).toBe(true)
    expect(hasClass("dark:border-emerald-800/60")).toBe(true)

    const reason = findByText("p", "Đủ điều kiện")
    expect(reason.className).toContain("dark:text-neutral-300")

    const amountLabel = findByText("p", "Số tiền hoàn tối đa")
    expect(amountLabel.className).toContain("dark:text-neutral-400")
  })

  it("styles the ineligible modal icon and copy for dark mode", () => {
    mount(
      <RefundIneligibleModal
        isOpen
        onClose={vi.fn()}
        reason="Giao dịch đã quá hạn"
      />,
    )

    expect(hasClass("dark:bg-rose-950/40")).toBe(true)
    expect(hasClass("dark:text-rose-400")).toBe(true)

    const heading = findByText("h3", "Không đủ điều kiện hoàn tiền")
    expect(heading.className).toContain("dark:text-white")

    const copy = findByText("p", "Giao dịch đã quá hạn")
    expect(copy.className).toContain("dark:text-neutral-300")
  })

  it("styles the success modal for dark mode", () => {
    mount(<RefundSuccessModal isOpen onClose={vi.fn()} />)

    expect(hasClass("dark:bg-emerald-950/40")).toBe(true)
    expect(hasClass("dark:text-emerald-400")).toBe(true)

    const heading = findByText("h3", "Gửi yêu cầu hoàn tiền thành công!")
    expect(heading.className).toContain("dark:text-white")

    const copy = findByText("p", "Vui lòng chờ Admin phê duyệt")
    expect(copy.className).toContain("dark:text-neutral-300")
  })

  it("styles the request modal step 1 loader for dark mode", () => {
    mount(<RequestRefundModal isOpen onClose={vi.fn()} paymentId={1} />)

    expect(hasClass("dark:text-red-400")).toBe(true)

    const loading = findByText("p", "Đang kiểm tra điều kiện hoàn tiền")
    expect(loading.className).toContain("dark:text-neutral-300")
  })

  it("styles the request modal step 1 error box for dark mode", () => {
    mocks.eligibility = {
      data: undefined,
      isLoading: false,
      isError: true,
      refetch: vi.fn(),
    }

    mount(<RequestRefundModal isOpen onClose={vi.fn()} paymentId={1} />)

    expect(hasClass("dark:bg-rose-950/35")).toBe(true)
    expect(hasClass("dark:border-rose-800/70")).toBe(true)
    expect(hasClass("dark:text-rose-400")).toBe(true)

    const error = findByText("p", "Không thể kiểm tra điều kiện hoàn tiền")
    expect(error.className).toContain("dark:text-rose-200")
  })

  it("styles the request modal bank form and dropdown for dark mode", () => {
    mocks.eligibility = {
      data: { isEligible: true, maxRefundAmount: 500000 },
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    }
    mocks.banks = {
      data: [{ bin: "970436", name: "Vietcombank", shortName: "VCB" }],
      isLoading: false,
    }

    mount(<RequestRefundModal isOpen onClose={vi.fn()} paymentId={1} />)

    const continueButton = findByText("button", "Tiếp tục nhập thông tin")
    act(() => {
      continueButton.click()
    })

    expect(hasClass("dark:bg-[#242424]")).toBe(true)
    expect(hasClass("dark:border-[#3F3F3F]")).toBe(true)

    const backButton = findByText("button", "Quay lại")
    expect(backButton.className).toContain("dark:text-neutral-400")
    expect(backButton.className).toContain("dark:hover:text-white")

    const labels = [...document.body.querySelectorAll("label")]
    expect(labels.length).toBeGreaterThanOrEqual(4)
    for (const label of labels) {
      expect(label.className).toContain("dark:text-neutral-200")
    }

    const textarea = document.body.querySelector("textarea")
    expect(textarea.className).toContain("dark:bg-[#242424]")
    expect(textarea.className).toContain("dark:border-[#3F3F3F]")
    expect(textarea.className).toContain("dark:placeholder:text-neutral-500")

    const search = document.body.querySelector(
      'input[placeholder="Tìm kiếm ngân hàng..."]',
    )
    act(() => {
      search.focus()
    })

    expect(hasClass("dark:bg-[#1E1E1E]")).toBe(true)
    expect(hasClass("dark:divide-[#2E2E2E]")).toBe(true)
    expect(hasClass("dark:hover:bg-[#2A2A2A]")).toBe(true)

    const shortName = findByText("span", "VCB")
    expect(shortName.className).toContain("dark:text-white")

    const fullName = findByText("span", "Vietcombank")
    expect(fullName.className).toContain("dark:text-neutral-400")
  })
})
