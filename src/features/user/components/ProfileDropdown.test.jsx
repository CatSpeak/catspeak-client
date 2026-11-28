// @vitest-environment happy-dom
import React, { act } from "react"
import { createRoot } from "react-dom/client"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

globalThis.IS_REACT_ACT_ENVIRONMENT = true

const mediaState = vi.hoisted(() => ({ isMobile: false }))
const mediaQuery = vi.hoisted(() => vi.fn())

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
  useNavigate: () => vi.fn(),
}))

vi.mock("react-redux", () => ({
  useSelector: () => ({ isInCall: false }),
}))

const t = {
  nav: {
    settings: "Cài đặt",
    systemConfig: "Thiết lập hệ thống",
    accountInfo: "Thông tin tài khoản",
    instructor: "Hồ sơ giáo viên",
    billing: "Lịch sử thanh toán",
    themeTitle: "Giao diện",
    themeLight: "Sáng",
    themeDark: "Tối",
    themeSystem: "Hệ thống",
  },
  header: {
    profile: "Hồ sơ",
    logout: "Đăng xuất",
    language: "Ngôn ngữ",
    switchRole: "Vai trò",
    studentRole: "Học viên",
    teacherRole: "Giảng viên",
    tourGuide: "Hướng dẫn",
  },
  common: { close: "Đóng", back: "Quay lại" },
  profile: { personalInfo: { nickname: "Biệt danh" } },
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

vi.mock("@/shared/context/SidebarContext", () => ({
  useSidebar: () => ({ setIsDesktopExpanded: vi.fn() }),
}))

vi.mock("@/features/auth", () => ({
  useAuth: () => ({ user: { username: "tester" }, isAuthenticated: true }),
  useGetProfileQuery: () => ({ data: null, isLoading: false }),
  useLogoutMutation: () => [vi.fn()],
}))

vi.mock("@/store/api/userApi", () => ({
  useGetUserProfileQuery: () => ({ data: null }),
}))

vi.mock("@/features/courses/components/RoleSwitcher", () => ({
  useRoleOverride: () => ({
    isTeacherProfile: true,
    isTeacher: false,
    isStudent: true,
    switchRole: vi.fn(),
    isSwitching: false,
  }),
}))

vi.mock("@/features/tour-guide", () => ({
  useTourGuide: () => ({ resetTour: vi.fn() }),
}))

import ProfileDropdown from "./ProfileDropdown"

const render = () => {
  const container = document.createElement("div")
  document.body.appendChild(container)
  const root = createRoot(container)
  act(() => {
    root.render(<ProfileDropdown />)
  })
  return container
}

const clickAvatar = (container) => {
  act(() => {
    container
      .querySelector("button")
      .dispatchEvent(new MouseEvent("click", { bubbles: true }))
  })
}

describe("ISS-33: ProfileDropdown md breakpoint (768px)", () => {
  beforeEach(() => {
    mediaState.isMobile = false
    mediaQuery.mockClear()
  })

  afterEach(() => {
    document.body.innerHTML = ""
  })

  it("uses the (max-width: 767px) media query", () => {
    render()

    expect(mediaQuery).toHaveBeenCalledWith("(max-width: 767px)")
  })

  it("opens the full-screen mobile sheet at 426-767px", () => {
    mediaState.isMobile = true
    const container = render()

    clickAvatar(container)

    expect(document.body.innerHTML).toContain("flex md:hidden")
    expect(document.body.innerHTML).not.toContain("w-[300px]")
    expect(document.body.textContent).toContain("Cài đặt")
  })

  it("opens the 300px desktop popover at 768px+ without a mobile header", () => {
    mediaState.isMobile = false
    const container = render()

    clickAvatar(container)

    expect(document.body.innerHTML).toContain("w-[300px]")
    expect(document.body.innerHTML).not.toContain("flex md:hidden")
  })

  it("keeps the back header available in desktop submenus", () => {
    mediaState.isMobile = false
    const container = render()
    clickAvatar(container)

    const themeTrigger = [...document.querySelectorAll("button")].find(
      (button) => button.getAttribute("title") === "Giao diện",
    )
    act(() => {
      themeTrigger.dispatchEvent(new MouseEvent("click", { bubbles: true }))
    })

    const hasBackHeader = [...document.querySelectorAll("div")].some((div) =>
      typeof div.className === "string"
        ? div.className.includes("hidden md:block")
        : false,
    )
    expect(hasBackHeader).toBe(true)
    expect(document.body.textContent).toContain("Giao diện")
  })
})
