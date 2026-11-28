// @vitest-environment happy-dom
import React, { act } from "react"
import { createRoot } from "react-dom/client"
import { beforeEach, describe, expect, it, vi } from "vitest"
import SharedMaterialRedirectPage from "./SharedMaterialRedirectPage"

const mocks = vi.hoisted(() => ({
  token: undefined,
  isAuthenticated: false,
  navigate: vi.fn(),
  openAuthModal: vi.fn(),
  redirects: [],
}))

vi.mock("react-router-dom", async (importOriginal) => ({
  ...(await importOriginal()),
  useParams: () => ({ token: mocks.token }),
  useNavigate: () => mocks.navigate,
  Navigate: ({ to }) => {
    mocks.redirects.push(to)
    return <div data-testid="navigate" />
  },
}))

vi.mock("@/features/auth", () => ({
  useAuth: () => ({ isAuthenticated: mocks.isAuthenticated }),
}))

vi.mock("@/shared/context/AuthModalContext", () => ({
  useAuthModal: () => ({ openAuthModal: mocks.openAuthModal }),
}))

vi.mock("@/shared/context/LanguageContext", () => ({
  useLanguage: () => ({ t: {} }),
}))

const render = () => {
  const container = document.createElement("div")
  const root = createRoot(container)
  act(() => {
    root.render(<SharedMaterialRedirectPage />)
  })
  return container
}

const clickByText = (container, text) => {
  const button = [...container.querySelectorAll("button")].find((item) =>
    item.textContent.includes(text),
  )
  expect(button).toBeTruthy()
  act(() => {
    button.dispatchEvent(new MouseEvent("click", { bubbles: true }))
  })
}

describe("ISS-73: SharedMaterialRedirectPage", () => {
  beforeEach(() => {
    mocks.token = undefined
    mocks.isAuthenticated = false
    mocks.navigate.mockClear()
    mocks.openAuthModal.mockClear()
    mocks.redirects = []
  })

  it("shows an invalid-link card when the token is missing", () => {
    const container = render()

    expect(container.textContent).toContain("Liên kết chia sẻ không hợp lệ")
    expect(mocks.redirects).toEqual([])

    clickByText(container, "Về trang chủ")
    expect(mocks.navigate).toHaveBeenCalledWith("/")
  })

  it("asks guests to sign in and preserves the material path", () => {
    mocks.token = "abc/def?"
    const container = render()

    expect(container.textContent).toContain(
      "Tài liệu được chia sẻ yêu cầu đăng nhập",
    )
    expect(mocks.redirects).toEqual([])

    clickByText(container, "Đăng nhập để xem")
    expect(mocks.openAuthModal).toHaveBeenCalledWith(
      "login",
      "/workspace/profile?sharedMaterialToken=abc%2Fdef%3F",
    )
  })

  it("redirects authenticated users to the profile documents tab", () => {
    mocks.token = "token-1"
    mocks.isAuthenticated = true

    render()

    expect(mocks.redirects).toEqual([
      "/workspace/profile?sharedMaterialToken=token-1",
    ])
  })
})
