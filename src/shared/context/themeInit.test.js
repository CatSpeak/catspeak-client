// @vitest-environment happy-dom
import { readFileSync } from "fs"
import path from "path"
import { beforeEach, describe, expect, it, vi } from "vitest"

// ISS-31: run the real pre-paint bootstrap so the CSP-safe file under `public/`
// (CS-21) stays the single source of truth.
const themeInitSource = readFileSync(
  path.resolve(globalThis.process.cwd(), "public/theme-init.js"),
  "utf8",
)

const runThemeInit = () => {
  new Function(themeInitSource)()
}

const mockSystemDark = (matches) => {
  window.matchMedia = vi.fn(() => ({
    matches,
    media: "(prefers-color-scheme: dark)",
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
  }))
}

const expectTheme = (isDark) => {
  expect(document.documentElement.classList.contains("dark")).toBe(isDark)
  expect(document.documentElement.style.colorScheme).toBe(
    isDark ? "dark" : "light",
  )
}

describe("ISS-31: theme-init pre-paint bootstrap", () => {
  beforeEach(() => {
    localStorage.clear()
    document.documentElement.classList.remove("dark")
    document.documentElement.style.colorScheme = ""
  })

  it("applies dark for saved=system when the OS prefers dark", () => {
    localStorage.setItem("theme", "system")
    mockSystemDark(true)

    runThemeInit()

    expectTheme(true)
  })

  it("applies dark for a missing theme when the OS prefers dark", () => {
    mockSystemDark(true)

    runThemeInit()

    expectTheme(true)
  })

  it("applies dark for saved=dark regardless of the OS preference", () => {
    localStorage.setItem("theme", "dark")
    mockSystemDark(false)

    runThemeInit()

    expectTheme(true)
  })

  it("keeps light for saved=system when the OS prefers light", () => {
    localStorage.setItem("theme", "system")
    mockSystemDark(false)

    runThemeInit()

    expectTheme(false)
  })

  it("keeps light for an explicit saved=light even when the OS prefers dark", () => {
    localStorage.setItem("theme", "light")
    mockSystemDark(true)

    runThemeInit()

    expectTheme(false)
  })

  it("keeps light for a missing theme when the OS prefers light", () => {
    mockSystemDark(false)

    runThemeInit()

    expectTheme(false)
  })
})
