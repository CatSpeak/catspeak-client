// @vitest-environment happy-dom
import React, { act } from "react"
import { createRoot } from "react-dom/client"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

const mediaState = vi.hoisted(() => ({ isDesktop: false }))
const scrollLock = vi.hoisted(() => vi.fn())

vi.mock("@/shared/hooks/useMediaQuery", () => ({
  useMediaQuery: () => mediaState.isDesktop,
}))

vi.mock("@/shared/hooks/useScrollLock", () => ({
  default: scrollLock,
}))

vi.mock("./MobileNavItems", () => ({
  default: () => null,
}))

vi.mock("react-router-dom", async (importOriginal) => ({
  ...(await importOriginal()),
  Link: ({ children }) => <a href="/">{children}</a>,
}))

globalThis.IS_REACT_ACT_ENVIRONMENT = true

import MobileSidebar from "./MobileSidebar"

const render = (props) => {
  const container = document.createElement("div")
  document.body.appendChild(container)
  const root = createRoot(container)
  act(() => {
    root.render(<MobileSidebar {...props} />)
  })
  return root
}

describe("ISS-34: MobileSidebar desktop breakpoint handling", () => {
  beforeEach(() => {
    mediaState.isDesktop = false
    scrollLock.mockClear()
  })

  afterEach(() => {
    document.body.innerHTML = ""
  })

  it("defaults to the lg breakpoint (lg:hidden)", () => {
    render({ isMobileOpen: true, setIsMobileOpen: vi.fn() })

    expect(document.body.innerHTML).toContain("lg:hidden")
    expect(document.body.innerHTML).not.toContain("xl:hidden")
  })

  it("uses xl:hidden when hideBreakpoint is xl", () => {
    render({
      isMobileOpen: true,
      setIsMobileOpen: vi.fn(),
      hideBreakpoint: "xl",
    })

    expect(document.body.innerHTML).toContain("xl:hidden")
    expect(document.body.innerHTML).not.toContain("lg:hidden")
  })

  it("locks the body scroll while the drawer is open below the breakpoint", () => {
    render({ isMobileOpen: true, setIsMobileOpen: vi.fn() })

    expect(scrollLock).toHaveBeenLastCalledWith(true)
  })

  it("closes the drawer and releases the scroll lock once desktop matches", () => {
    mediaState.isDesktop = true
    const setIsMobileOpen = vi.fn()

    render({ isMobileOpen: true, setIsMobileOpen })

    expect(setIsMobileOpen).toHaveBeenCalledWith(false)
    expect(scrollLock).toHaveBeenLastCalledWith(false)
  })
})
