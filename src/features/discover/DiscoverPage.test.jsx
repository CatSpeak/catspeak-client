// @vitest-environment happy-dom
import React, { act } from "react"
import { createRoot } from "react-dom/client"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { translations } from "@/shared/i18n"

const mocks = vi.hoisted(() => ({
  navigate: vi.fn(),
  t: null,
}))

vi.mock("react-router-dom", async (importOriginal) => ({
  ...(await importOriginal()),
  useNavigate: () => mocks.navigate,
}))

vi.mock("@/shared/context/LanguageContext", () => ({
  useLanguage: () => ({ t: mocks.t }),
}))

vi.mock("@/shared/components/ui/buttons/PillButton", () => ({
  default: ({ children, onClick }) => (
    <button type="button" onClick={onClick}>
      {children}
    </button>
  ),
}))

import DiscoverPage from "./DiscoverPage"

describe("R1-1: DiscoverPage reads top-level comingSoon/back keys", () => {
  let container
  let root

  beforeEach(() => {
    container = document.createElement("div")
    document.body.appendChild(container)
    root = createRoot(container)
  })

  afterEach(() => {
    act(() => root.unmount())
    container.remove()
  })

  it.each([
    ["en", translations.en, "Coming Soon", "Back", "Back to Home"],
    ["ja", translations.ja, "近日公開", "戻る", "ホームに戻る"],
  ])(
    "renders the real %s translations without falling back to Vietnamese",
    (_lang, realTranslations, badge, backLabel, homeLabel) => {
      mocks.t = realTranslations

      act(() => {
        root.render(<DiscoverPage />)
      })

      const text = container.textContent
      expect(text).toContain(badge)
      expect(text).toContain(backLabel)
      expect(text).toContain(homeLabel)
      expect(text).not.toContain("Sắp ra mắt")
      expect(text).not.toContain("Quay lại")
    },
  )
})
