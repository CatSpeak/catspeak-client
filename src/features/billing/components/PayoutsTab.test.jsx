// @vitest-environment happy-dom
import React, { act } from "react"
import { createRoot } from "react-dom/client"
import { beforeEach, describe, expect, it, vi } from "vitest"
import PayoutsTab from "./PayoutsTab"

const mocks = vi.hoisted(() => ({
  navigate: vi.fn(),
  isTeacher: true,
  queryCalls: [],
  queryResult: {
    data: [],
    isLoading: false,
    isError: false,
    isFetching: false,
    refetch: vi.fn(),
  },
}))

vi.mock("react-router-dom", async (importOriginal) => ({
  ...(await importOriginal()),
  useNavigate: () => mocks.navigate,
}))

vi.mock("@/features/courses/components/RoleSwitcher", () => ({
  default: () => ({ isTeacher: mocks.isTeacher }),
  useRoleOverride: () => ({ isTeacher: mocks.isTeacher }),
}))

vi.mock("@/shared/context/LanguageContext", () => ({
  useLanguage: () => ({ t: {} }),
}))

vi.mock("../api/payoutsApi", () => ({
  useGetPayoutHistoryQuery: (...args) => {
    mocks.queryCalls.push(args)
    return mocks.queryResult
  },
}))

const payout = {
  id: "p-1",
  referenceId: "PAYOUT-001",
  bankShortName: "VCB",
  accountNumber: "0123456789",
  accountHolderName: "Nguyen Van A",
  requestedAmount: 1000000,
  platformFee: 100000,
  netAmount: 900000,
  status: "Succeeded",
  createdAt: "2026-11-01T10:00:00Z",
  completedAt: "2026-11-02T10:00:00Z",
  failureReason: null,
}

const render = () => {
  const container = document.createElement("div")
  const root = createRoot(container)
  act(() => {
    root.render(<PayoutsTab />)
  })
  return container
}

const clickByText = (container, text) => {
  const button = [...container.querySelectorAll("button")].find((item) =>
    item.textContent.includes(text),
  )
  expect(button).toBeTruthy()
  act(() => {
    button.dispatchEvent(new MouseEvent("click", { bubbles: true }))
  })
}

describe("ISS-61: PayoutsTab teacher payout history", () => {
  beforeEach(() => {
    mocks.navigate.mockClear()
    mocks.isTeacher = true
    mocks.queryCalls = []
    mocks.queryResult = {
      data: [],
      isLoading: false,
      isError: false,
      isFetching: false,
      refetch: vi.fn(),
    }
  })

  it("skips the payout history request for non-teachers", () => {
    mocks.isTeacher = false
    render()

    expect(mocks.queryCalls[0][1]).toEqual({ skip: true })
  })

  it("renders payout rows with status and amounts, and links to revenue/bank settings", () => {
    mocks.queryResult.data = [payout]
    const container = render()

    expect(container.textContent).toContain("PAYOUT-001")
    expect(container.textContent).toContain("VCB")
    expect(container.textContent).toContain("Succeeded")
    expect(container.textContent).toContain("900.000")

    clickByText(container, "Xem thống kê doanh thu")
    expect(mocks.navigate).toHaveBeenCalledWith(
      "/workspace/analytics?tab=revenue",
    )

    clickByText(container, "Quản lý tài khoản ngân hàng")
    expect(mocks.navigate).toHaveBeenCalledWith("/setting/instructor")
  })

  it("shows the empty state with a bank-account CTA", () => {
    const container = render()

    expect(container.textContent).toContain("Chưa có yêu cầu rút tiền nào")
    clickByText(container, "Liên kết ngân hàng nhận chi trả")
    expect(mocks.navigate).toHaveBeenCalledWith("/setting/instructor")
  })

  it("shows an error state and retries the query", () => {
    mocks.queryResult = {
      ...mocks.queryResult,
      isError: true,
    }
    const container = render()

    expect(container.textContent).toContain("Không thể tải lịch sử rút tiền")
    clickByText(container, "Thử lại")
    expect(mocks.queryResult.refetch).toHaveBeenCalled()
  })
})
