// @vitest-environment happy-dom
import React, { act } from "react"
import { createRoot } from "react-dom/client"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

globalThis.IS_REACT_ACT_ENVIRONMENT = true

const mediaState = vi.hoisted(() => ({ isMobile: false }))
const mediaQuery = vi.hoisted(() => vi.fn())
const navigate = vi.hoisted(() => vi.fn())

vi.mock("@/shared/hooks/useMediaQuery", () => ({
  useMediaQuery: (query) => {
    mediaQuery(query)
    return mediaState.isMobile
  },
}))

vi.mock("@/shared/hooks/useScrollLock", () => ({
  default: vi.fn(),
}))

vi.mock("@/shared/hooks/useClickOutside", () => ({
  default: vi.fn(),
}))

vi.mock("react-router-dom", async (importOriginal) => ({
  ...(await importOriginal()),
  useNavigate: () => navigate,
}))

const t = {
  nav: {
    themeTitle: "Giao diện",
    themeLight: "Sáng",
    themeDark: "Tối",
    themeSystem: "Hệ thống",
    systemConfig: "Thiết lập hệ thống",
  },
  header: { settings: "Cài đặt", language: "Ngôn ngữ" },
  common: { close: "Đóng", back: "Quay lại" },
}

vi.mock("@/shared/context/LanguageContext", () => ({
  useLanguage: () => ({
    t,
    language: "vi",
    setLanguage: vi.fn(),
  }),
}))

vi.mock("@/shared/context/ThemeContext", () => ({
  useTheme: () => ({ theme: "light", setTheme: vi.fn() }),
}))

import GuestSettingsDropdown from "./GuestSettingsDropdown"

const render = () => {
  const container = document.createElement("div")
  document.body.appendChild(container)
  const root = createRoot(container)
  act(() => {
    root.render(<GuestSettingsDropdown />)
  })
  return container
}

const clickSettingsButton = () => {
  const button = document.querySelector('button[aria-label="Cài đặt"]')
  act(() => {
    button.dispatchEvent(new MouseEvent("click", { bubbles: true }))
  })
}

describe("ISS-42: GuestSettingsDropdown sm breakpoint (640px)", () => {
  beforeEach(() => {
    mediaState.isMobile = false
    mediaQuery.mockClear()
    navigate.mockClear()
  })

  afterEach(() => {
    document.body.innerHTML = ""
  })

  it("uses the (max-width: 639px) media query", () => {
    render()

    expect(mediaQuery).toHaveBeenCalledWith("(max-width: 639px)")
  })

  it("renders the full-screen sheet with a mobile title bar below 640px", () => {
    mediaState.isMobile = true
    render()

    clickSettingsButton()

    expect(document.body.innerHTML).toContain("flex sm:hidden")
    expect(document.body.innerHTML).not.toContain("w-[280px]")
    expect(document.body.textContent).toContain("Cài đặt")
  })

  it("renders the 280px desktop popover without the mobile title bar at 640px+", () => {
    mediaState.isMobile = false
    render()

    clickSettingsButton()

    expect(document.body.innerHTML).toContain("w-[280px]")
    expect(document.body.innerHTML).not.toContain("flex sm:hidden")
  })

  it("shows the back header inside submenus on desktop only", () => {
    mediaState.isMobile = false
    render()
    clickSettingsButton()

    const themeTrigger = [...document.querySelectorAll("button")].find(
      (button) => button.getAttribute("title") === "Giao diện",
    )
    act(() => {
      themeTrigger.dispatchEvent(new MouseEvent("click", { bubbles: true }))
    })

    const hasBackHeader = [...document.querySelectorAll("div")].some((div) =>
      typeof div.className === "string"
        ? div.className.includes("hidden sm:block")
        : false,
    )
    expect(hasBackHeader).toBe(true)
    expect(document.body.textContent).toContain("Giao diện")
  })
})
