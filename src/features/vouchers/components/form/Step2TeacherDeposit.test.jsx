// @vitest-environment happy-dom
import React, { act } from "react"
import { createRoot } from "react-dom/client"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import Step2TeacherDeposit from "./Step2TeacherDeposit"
import { PaymentPolicy, getPolicyComponent } from "@/features/auth/components/popups/policies"

vi.mock("@/shared/context/LanguageContext", () => ({
  useLanguage: () => ({
    t: {
      vouchers: {
        deposit: {
          qrInstruction: "Quét mã QR",
          bankName: "Ngân hàng",
          accountName: "Chủ tài khoản",
          accountNumber: "Số tài khoản",
          depositAmount: "Số tiền cọc",
          transactionContent: "Nội dung chuyển khoản",
          summaryTitle: "Tóm tắt Voucher",
          calculationTitle: "Tính toán cọc",
          termsPrefix: "Tôi đồng ý với",
          termsLink: "Điều khoản cọc và hoàn tiền",
          termsSuffix: "của Cat Speak.",
          confirmDeposit: "Xác nhận đặt cọc",
        },
      },
    },
  }),
}))

vi.mock("../../api/vouchersApi", () => ({
  useGetVoucherDepositInfoQuery: () => ({
    data: {
      data: { amount: 100000, transactionContent: "VOUCHER-ABC" },
    },
    isLoading: false,
  }),
  useSubmitVoucherDepositMutation: () => [vi.fn(), { isLoading: false }],
}))

vi.mock("@/features/auth/components/popups/PolicyModal", () => ({
  default: ({ open, title }) =>
    open ? <div data-testid="policy-modal">{title}</div> : null,
}))

let container
let root

const render = () => {
  container = document.createElement("div")
  document.body.appendChild(container)
  root = createRoot(container)
  act(() => {
    root.render(
      <Step2TeacherDeposit
        voucherId={1}
        form={{ code: "SALE10", title: "Voucher", discountValue: 10 }}
        estimatedDeposit={100000}
      />,
    )
  })
  return container
}

beforeEach(() => {
  globalThis.IS_REACT_ACT_ENVIRONMENT = true
})

afterEach(() => {
  act(() => {
    root.unmount()
  })
  container.remove()
  document.body.innerHTML = ""
})

describe("ISS-76 / ISS-30: Step2TeacherDeposit", () => {
  it("opens the deposit terms modal without toggling the agreement checkbox", () => {
    const container = render()

    const checkbox = container.querySelector('[role="checkbox"]')
    expect(checkbox.getAttribute("aria-checked")).toBe("false")

    const termsButton = [...container.querySelectorAll("button")].find(
      (button) => button.textContent.includes("Điều khoản cọc và hoàn tiền"),
    )
    expect(termsButton).toBeTruthy()

    act(() => {
      termsButton.dispatchEvent(new MouseEvent("click", { bubbles: true }))
    })

    expect(container.querySelector('[data-testid="policy-modal"]')).toBeTruthy()
    expect(checkbox.getAttribute("aria-checked")).toBe("false")
  })

  it("renders the confirm button in the grey disabled state until the terms are accepted", () => {
    const container = render()

    const confirmButton = [...container.querySelectorAll("button")].find(
      (button) => button.textContent.includes("Xác nhận đặt cọc"),
    )

    expect(confirmButton.disabled).toBe(true)
    expect(confirmButton.innerHTML).toContain("bg-[#BFBFBF]")
    expect(confirmButton.innerHTML).not.toContain("bg-cath-red-700")
  })

  it("wraps the VietQR image in a white frame so scanners work in dark mode", () => {
    const container = render()
    const image = container.querySelector('img[alt="VietQR CatSpeak"]')

    expect(image).toBeTruthy()
    expect(image.parentElement.className).toContain("bg-white")
  })

  it("maps every deposit-terms title to the real PaymentPolicy content", () => {
    for (const title of [
      "Điều khoản cọc và hoàn tiền",
      "Deposit and Refund Terms",
      "押金和退款条款",
      "デポジットおよび返金規約",
    ]) {
      expect(getPolicyComponent(title)).toBe(PaymentPolicy)
    }
  })
})
