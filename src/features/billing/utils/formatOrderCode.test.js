import { describe, expect, it } from "vitest"
import { formatOrderCode } from "./formatOrderCode"

describe("ISS-74: formatOrderCode", () => {
  it("renders the order code when present", () => {
    expect(formatOrderCode({ orderCode: 123456 })).toBe("#123456")
    expect(formatOrderCode({ orderCode: "ABC-1" })).toBe("#ABC-1")
  })

  it("falls back to the payment id instead of #null / #undefined", () => {
    expect(formatOrderCode({ orderCode: null, paymentId: 99 })).toBe("#PAY-99")
    expect(formatOrderCode({ orderCode: undefined, paymentId: "p-7" })).toBe(
      "#PAY-p-7",
    )
    expect(formatOrderCode({ orderCode: "", paymentId: 12 })).toBe("#PAY-12")
  })

  it("renders an em dash when neither id exists", () => {
    expect(formatOrderCode({})).toBe("—")
    expect(formatOrderCode(null)).toBe("—")
    expect(formatOrderCode(undefined)).toBe("—")
  })
})
