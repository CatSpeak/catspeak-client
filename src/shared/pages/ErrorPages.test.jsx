// @vitest-environment happy-dom
import React, { act } from "react"
import { createRoot } from "react-dom/client"
import { afterEach, describe, expect, it, vi } from "vitest"
import ForbiddenPage from "./ForbiddenPage"
import PageNotFound from "./PageNotFound"
import ComingSoonPage from "./ComingSoonPage"

const mocks = vi.hoisted(() => ({
  isAuthenticated: false,
  navigate: vi.fn(),
  pathname: "/nonexistent-404",
}))

vi.mock("react-router-dom", async (importOriginal) => ({
  ...(await importOriginal()),
  useNavigate: () => mocks.navigate,
  useLocation: () => ({ pathname: mocks.pathname }),
  Link: ({ children, to }) => <a href={to}>{children}</a>,
}))

vi.mock("@/features/auth", () => ({
  useAuth: () => ({ isAuthenticated: mocks.isAuthenticated }),
}))

vi.mock("@/shared/context/LanguageContext", () => ({
  useLanguage: () => ({
    t: {
      language: "vi",
      errors: {
        forbidden: {
          title: "Không có quyền truy cập",
          description: "Bạn không được phép truy cập trang này.",
        },
        pageNotFound: {
          title: "Không tìm thấy trang",
          description: "Trang bạn tìm không tồn tại.",
          backToHome: "Quay về trang chủ",
        },
      },
      comingSoon: {
        feature: "Tính năng",
        title: "Sắp ra mắt",
        description: "Chúng tôi đang xây dựng tính năng này.",
      },
      nav: { cart: "Giỏ hàng", connect: "Kết nối" },
      auth: { loginButton: "Đăng nhập" },
    },
  }),
}))

vi.mock("@/shared/components/ui/animations", () => ({
  FluentAnimation: ({ children }) => <div>{children}</div>,
}))

vi.mock("framer-motion", async (importOriginal) => ({
  ...(await importOriginal()),
  AnimatePresence: ({ children }) => <>{children}</>,
}))

let container
let root

const render = (element) => {
  container = document.createElement("div")
  root = createRoot(container)
  act(() => {
    root.render(element)
  })
  return container
}

afterEach(() => {
  act(() => {
    root.unmount()
  })
  container.remove()
})

describe("ISS-07: /403 contrast and CTA", () => {
  it("renders a readable 403 page with home and login CTAs for guests", () => {
    mocks.isAuthenticated = false

    const html = render(<ForbiddenPage />).innerHTML

    expect(html).toContain("403")
    expect(html).toContain("Quay về trang chủ")
    expect(html).toContain("Đăng nhập")
    expect(html).toContain("text-slate-900 dark:text-white")
    expect(html).toContain("dark:bg-[#222222]")
    expect(html).toContain("dark:text-neutral-300")
    expect(html).not.toContain("text-white/60")
  })

  it("hides the login CTA for an authenticated user", () => {
    mocks.isAuthenticated = true

    const html = render(<ForbiddenPage />).innerHTML

    expect(html).toContain("Quay về trang chủ")
    expect(html).not.toContain("Đăng nhập")
  })
})

describe("ISS-18: 404 and ComingSoon dark mode", () => {
  it("renders PageNotFound with dark pill, title and description classes", () => {
    const html = render(<PageNotFound />).innerHTML

    expect(html).toContain("404")
    expect(html).toContain("dark:bg-[#222222]")
    expect(html).toContain("text-slate-900 dark:text-white")
    expect(html).toContain("text-slate-600 dark:text-neutral-300")
  })

  it("renders ComingSoonPage with dark title and description classes", () => {
    mocks.pathname = "/help"

    const html = render(<ComingSoonPage />).innerHTML

    expect(html).toContain("text-gray-900 dark:text-white")
    expect(html).toContain("text-gray-600 dark:text-neutral-300")
    expect(html).toContain("text-gray-600 dark:text-neutral-400")
  })
})
