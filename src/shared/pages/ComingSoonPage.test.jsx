// @vitest-environment happy-dom
import React, { act } from "react"
import { createRoot } from "react-dom/client"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { translations } from "@/shared/i18n"

const mocks = vi.hoisted(() => ({
  navigate: vi.fn(),
  pathname: "/help",
  t: null,
}))

vi.mock("react-router-dom", async (importOriginal) => ({
  ...(await importOriginal()),
  useNavigate: () => mocks.navigate,
  useLocation: () => ({ pathname: mocks.pathname }),
}))

vi.mock("@/shared/context/LanguageContext", () => ({
  useLanguage: () => ({ t: mocks.t }),
}))

vi.mock("@/shared/components/ui/animations", () => ({
  FluentAnimation: ({ children }) => <div>{children}</div>,
}))

vi.mock("framer-motion", async (importOriginal) => ({
  ...(await importOriginal()),
  AnimatePresence: ({ children }) => <>{children}</>,
}))

import ComingSoonPage from "./ComingSoonPage"

const VI_TEXT = {
  comingSoon: {
    feature: "Tính năng",
    title: "Sắp ra mắt",
    description: "Chúng tôi đang xây dựng tính năng này.",
    backToHome: "Quay về trang chủ",
    faqCta: "Xem Câu hỏi thường gặp (FAQ)",
  },
  nav: { cart: "Giỏ hàng", connect: "Kết nối" },
  back: "Quay lại",
}

describe("ISS-35: ComingSoonPage navigation CTAs", () => {
  let container
  let root

  beforeEach(() => {
    mocks.navigate.mockClear()
    mocks.pathname = "/help"
    mocks.t = VI_TEXT
    container = document.createElement("div")
    document.body.appendChild(container)
    root = createRoot(container)
    act(() => {
      root.render(<ComingSoonPage />)
    })
  })

  afterEach(() => {
    act(() => root.unmount())
    container.remove()
  })

  const getButton = (label) =>
    [...container.querySelectorAll("button")].find(
      (node) => node.textContent === label,
    )

  it("navigates back and home from the two CTAs", () => {
    act(() => {
      getButton("Quay lại").dispatchEvent(
        new MouseEvent("click", { bubbles: true }),
      )
    })
    expect(mocks.navigate).toHaveBeenNthCalledWith(1, -1)

    act(() => {
      getButton("Quay về trang chủ").dispatchEvent(
        new MouseEvent("click", { bubbles: true }),
      )
    })
    expect(mocks.navigate).toHaveBeenNthCalledWith(2, "/")
  })

  it("shows the FAQ shortcut only on /help", () => {
    expect(container.querySelector('a[href="/#faq"]')).toBeTruthy()

    mocks.pathname = "/cart"
    act(() => {
      root.render(<ComingSoonPage />)
    })

    expect(container.querySelector('a[href="/#faq"]')).toBeNull()
  })

  it.each([
    ["en", translations.en, "Back", "Back to Home"],
    ["ja", translations.ja, "戻る", "ホームに戻る"],
  ])(
    "R1-1 reads the real %s top-level common keys",
    (_lang, realTranslations, backLabel, homeLabel) => {
      mocks.t = realTranslations
      mocks.pathname = "/nonexistent-404"

      act(() => {
        root.render(<ComingSoonPage />)
      })

      expect(getButton(backLabel)).toBeTruthy()
      expect(getButton(homeLabel)).toBeTruthy()
    },
  )
})
