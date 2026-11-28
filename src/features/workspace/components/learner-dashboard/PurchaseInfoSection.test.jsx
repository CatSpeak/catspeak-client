// @vitest-environment happy-dom
import React, { act } from "react"
import { createRoot } from "react-dom/client"
import { beforeEach, describe, expect, it, vi } from "vitest"
import PurchaseInfoSection from "./PurchaseInfoSection"

const mocks = vi.hoisted(() => ({ navigate: vi.fn() }))

vi.mock("react-router-dom", async (importOriginal) => ({
  ...(await importOriginal()),
  useNavigate: () => mocks.navigate,
}))

vi.mock("@/shared/context/LanguageContext", () => ({
  useLanguage: () => ({ language: "vi" }),
}))

const render = () => {
  const container = document.createElement("div")
  const root = createRoot(container)
  act(() => {
    root.render(
      <PurchaseInfoSection
        data={{
          subscription: {},
          rewards: {},
          paymentHistory: {},
          vipPackagesBought: 0,
        }}
      />,
    )
  })
  return container
}

describe("ISS-13: learner dashboard 'Đổi ưu đãi' CTA", () => {
  beforeEach(() => {
    mocks.navigate.mockClear()
  })

  it("navigates to /workspace/points-and-offers", () => {
    const container = render()

    const redeem = [...container.querySelectorAll("button")].find((button) =>
      button.textContent.includes("Đổi ưu đãi"),
    )
    expect(redeem).toBeTruthy()

    act(() => {
      redeem.dispatchEvent(new MouseEvent("click", { bubbles: true }))
    })

    expect(mocks.navigate).toHaveBeenCalledWith("/workspace/points-and-offers")
  })
})
