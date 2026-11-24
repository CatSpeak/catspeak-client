// @vitest-environment happy-dom
import React, { act } from "react"
import { createRoot } from "react-dom/client"
import { Provider } from "react-redux"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { store } from "@/store"
import OrderSummary from "./OrderSummary"

describe("OrderSummary modal XSS prevention", () => {
  let container
  let root

  beforeEach(() => {
    globalThis.IS_REACT_ACT_ENVIRONMENT = true
    container = document.createElement("div")
    document.body.appendChild(container)
    root = createRoot(container)
  })

  afterEach(() => {
    act(() => {
      root.unmount()
    })
    container.remove()
    document.body.innerHTML = ""
  })

  it("renders voucher code as escaped text instead of injecting raw HTML", async () => {
    const xssCode = "<img src=x onerror=alert(1)>"
    const voucher = {
      id: 1,
      code: xssCode,
      discountType: "FixedAmount",
      discountValue: 10000,
    }

    await act(async () => {
      root.render(
        <Provider store={store}>
          <OrderSummary
            unitPrice={100000}
            learnersCount={1}
            vouchers={[voucher]}
            suggestedTags={[]}
            selectedVouchers={[voucher]}
            onToggleVoucher={vi.fn()}
            onRemoveVoucher={vi.fn()}
            onOpenModal={vi.fn()}
            onCheckout={vi.fn()}
            isProcessing={false}
            isVoucherLoading={false}
            t={{
              billing: {
                checkoutClass: {
                  orderSummary: "Order Summary",
                  unitPrice: "Unit Price",
                  free: "Free",
                  perPerson: "/person",
                  learnerCount: "Learners",
                  subtotal: "Subtotal",
                  discount: "Discount",
                  totalPayment: "Total",
                  youSaved: "Saved {{amount}}",
                  processing: "Processing",
                  confirmPayment: "Confirm",
                  removeVoucherTitle: "Remove Voucher",
                  cancel: "Cancel",
                  voucherCode: "Voucher Code",
                  appliedCount: "{{count}} applied",
                  sponsorInstructor: "Instructor",
                  viewAllOffers: "View all offers",
                  removeVoucherConfirm: "Remove",
                  removeVoucherDesc:
                    "Remove {{code}} saving {{discountAmount}} from {{totalAmount}}?",
                },
              },
            }}
          />
        </Provider>,
      )
    })

    const removeBtn = Array.from(container.querySelectorAll("button")).find(
      (b) => b.getAttribute("aria-label") || b.textContent.includes(xssCode),
    )
    if (removeBtn) {
      await act(async () => {
        removeBtn.click()
      })
    }

    expect(container.querySelector("img")).toBeNull()
    expect(document.body.querySelector("img")).toBeNull()
  })
})
