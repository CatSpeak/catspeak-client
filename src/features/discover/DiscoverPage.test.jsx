// @vitest-environment happy-dom
import React, { act } from "react"
import { createRoot } from "react-dom/client"
import { MemoryRouter } from "react-router-dom"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import DiscoverPage from "./DiscoverPage"

vi.mock("@/shared/context/LanguageContext", () => ({
  useLanguage: () => ({
    t: {
      catSpeak: {
        discover: {
          title: "Khám phá thế giới",
          description: "Sắp ra mắt: Khám phá các nền văn hóa.",
        },
      },
      common: {
        back: "Quay lại",
        comingSoon: {
          badge: "Sắp ra mắt",
          backToHome: "Về trang chủ",
        },
      },
    },
  }),
}))

const renderPage = () => {
  const container = document.createElement("div")
  document.body.appendChild(container)
  const root = createRoot(container)
  act(() => {
    root.render(
      <MemoryRouter>
        <DiscoverPage />
      </MemoryRouter>,
    )
  })
  return { container, root }
}

describe("ISS-39: DiscoverPage uses a dark-mode ready coming-soon card", () => {
  let container
  let root

  beforeEach(() => {
    ;({ container, root } = renderPage())
  })

  afterEach(() => {
    act(() => {
      root.unmount()
    })
    container.remove()
    document.body.innerHTML = ""
  })

  it("renders the discover title, description and both CTAs", () => {
    expect(container.textContent).toContain("Khám phá thế giới")
    expect(container.textContent).toContain("Sắp ra mắt: Khám phá các nền văn hóa.")
    expect(container.textContent).toContain("Quay lại")
    expect(container.textContent).toContain("Về trang chủ")
  })

  it("gives the card a dark surface", () => {
    const card = container.firstElementChild.firstElementChild
    expect(card.className).toContain("dark:bg-[#1A1A1A]")
    expect(card.className).toContain("dark:border-[#3F3F3F]")
  })
})
