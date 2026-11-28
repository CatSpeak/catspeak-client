// @vitest-environment happy-dom
import React, { act } from "react"
import { createRoot } from "react-dom/client"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

vi.mock("@/shared/context/LanguageContext.jsx", () => ({
  useLanguage: () => ({
    t: {
      footer: {
        policies: {
          privacy: "プライバシーポリシー",
          terms: "利用規約",
          payment: "支払い・返金ポリシー",
          navAriaLabel: "ポリシー",
        },
      },
    },
  }),
}))

vi.mock("@/features/auth", () => ({
  PolicyModal: ({ open, title, policyKey }) => (
    <div data-testid="policy-modal" data-open={String(open)} data-title={title} data-key={policyKey} />
  ),
}))

import FooterBottom from "./FooterBottom"

describe("ISS-11: FooterBottom passes policyKey to PolicyModal", () => {
  let container
  let root

  beforeEach(() => {
    container = document.createElement("div")
    document.body.appendChild(container)
    root = createRoot(container)
    act(() => {
      root.render(<FooterBottom />)
    })
  })

  afterEach(() => {
    act(() => root.unmount())
    container.remove()
  })

  it("localizes the nav aria-label", () => {
    expect(container.querySelector("nav")?.getAttribute("aria-label")).toBe(
      "ポリシー",
    )
  })

  it.each([
    [0, "privacy"],
    [1, "terms"],
    [2, "payment"],
  ])("opens policy %i with key %s", (index, key) => {
    const buttons = container.querySelectorAll("button")
    act(() => {
      buttons[index].dispatchEvent(new MouseEvent("click", { bubbles: true }))
    })

    const modal = container.querySelector('[data-testid="policy-modal"]')
    expect(modal?.getAttribute("data-key")).toBe(key)
    expect(modal?.getAttribute("data-open")).toBe("true")
  })
})
