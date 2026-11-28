// @vitest-environment happy-dom
import React, { act } from "react"
import { createRoot } from "react-dom/client"
import { beforeEach, describe, expect, it, vi } from "vitest"
import MainLayout from "./index"

const routerState = vi.hoisted(() => ({
  location: {
    pathname: "/",
    search: "",
    hash: "",
    state: null,
  },
  navigate: vi.fn(),
  searchParams: new URLSearchParams(),
}))

vi.mock("react-router-dom", async (importOriginal) => ({
  ...(await importOriginal()),
  useLocation: () => routerState.location,
  useNavigate: () => routerState.navigate,
  useSearchParams: () => [routerState.searchParams, vi.fn()],
  Outlet: () => null,
  ScrollRestoration: () => null,
}))

vi.mock("@/features/auth/components", () => ({
  default: ({ isOpen, mode }) => (
    <div data-testid="auth" data-open={String(isOpen)} data-mode={mode} />
  ),
}))

vi.mock("@/shared/context/SidebarContext", () => ({
  useSidebar: () => ({
    isMobileSidebarOpen: false,
    setIsMobileSidebarOpen: vi.fn(),
  }),
}))

vi.mock("@/features/landing/components/LandingHeader/LandingHeader", () => ({
  default: ({ onGetStarted }) => (
    <button type="button" onClick={() => onGetStarted?.("register")}>
      join-now
    </button>
  ),
}))

vi.mock("@/shared/components/Header/MainHeader", () => ({
  default: () => null,
}))
vi.mock("@/shared/components/Sidebar/MainSidebar", () => ({
  default: () => null,
}))
vi.mock("@/shared/components/Footer", () => ({
  default: () => null,
}))
vi.mock("@/features/tour-guide", () => ({
  TourGuideProvider: ({ children }) => children,
  TourGuideContainer: () => null,
  useTourGuideTrigger: () => {},
}))

const render = () => {
  const container = document.createElement("div")
  const root = createRoot(container)
  act(() => {
    root.render(<MainLayout />)
  })
  return container
}

const authState = (container) => {
  const auth = container.querySelector('[data-testid="auth"]')
  return {
    open: auth?.getAttribute("data-open"),
    mode: auth?.getAttribute("data-mode"),
  }
}

describe("ISS-37/ISS-44/ISS-45: MainLayout auth modal routing", () => {
  beforeEach(() => {
    routerState.location = { pathname: "/", search: "", hash: "", state: null }
    routerState.searchParams = new URLSearchParams()
    routerState.navigate.mockClear()
  })

  it("does not open a modal over the standalone /reset-password page", () => {
    routerState.location = {
      pathname: "/reset-password",
      search: "",
      hash: "",
      state: null,
    }

    const container = render()

    expect(authState(container)).toEqual({ open: "false", mode: "login" })
  })

  it("still opens reset-password from the ?mode=resetPassword email link", () => {
    routerState.searchParams = new URLSearchParams("mode=resetPassword")

    const container = render()

    expect(authState(container)).toEqual({
      open: "true",
      mode: "reset-password",
    })
  })

  it("opens the requested mode from /register router state and consumes it", () => {
    routerState.location = {
      pathname: "/register",
      search: "",
      hash: "",
      state: { requireLogin: true, authMode: "register" },
    }

    const container = render()

    expect(authState(container)).toEqual({ open: "true", mode: "register" })
    expect(routerState.navigate).toHaveBeenCalledWith("/register", {
      replace: true,
      state: null,
    })
  })

  it("keeps the legacy login default when no authMode is supplied", () => {
    routerState.location = {
      pathname: "/",
      search: "",
      hash: "",
      state: { requireLogin: true },
    }

    const container = render()

    expect(authState(container)).toEqual({ open: "true", mode: "login" })
  })

  it("opens the register modal when LandingHeader 'Tham gia ngay' is clicked", () => {
    const container = render()
    const joinButton = [...container.querySelectorAll("button")].find(
      (button) => button.textContent === "join-now",
    )

    act(() => {
      joinButton.dispatchEvent(new MouseEvent("click", { bubbles: true }))
    })

    expect(authState(container)).toEqual({ open: "true", mode: "register" })
  })
})
