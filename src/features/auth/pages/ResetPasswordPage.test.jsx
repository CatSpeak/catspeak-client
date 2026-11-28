// @vitest-environment happy-dom
import React, { act } from "react"
import { createRoot } from "react-dom/client"
import { beforeEach, describe, expect, it, vi } from "vitest"
import ResetPasswordPage from "./ResetPasswordPage"

const routerState = vi.hoisted(() => ({
  navigate: vi.fn(),
  searchParams: new URLSearchParams(),
}))

vi.mock("react-router-dom", async (importOriginal) => ({
  ...(await importOriginal()),
  useNavigate: () => routerState.navigate,
  useSearchParams: () => [routerState.searchParams],
}))

vi.mock("@/shared/context/LanguageContext.jsx", () => ({
  useLanguage: () => ({
    t: {
      auth: {
        back: "Quay lại",
        passwordChangedTitle: "Đổi mật khẩu thành công!",
        passwordChangedSubtitle: "OK",
        loginNowButton: "Đăng nhập ngay",
      },
    },
  }),
}))

vi.mock(
  "@/features/auth/components/popups/ResetPasswordPopup/RequestOtpStep",
  () => ({
    default: ({ onSwitchMode }) => (
      <div>
        <button type="button" onClick={() => onSwitchMode("login")}>
          switch-login
        </button>
        <button type="button" onClick={() => onSwitchMode("register")}>
          switch-register
        </button>
      </div>
    ),
  }),
)

vi.mock(
  "@/features/auth/components/popups/ResetPasswordPopup/VerifyOtpStep",
  () => ({
    default: () => null,
  }),
)

vi.mock(
  "@/features/auth/components/popups/ResetPasswordPopup/ResetPasswordFormStep",
  () => ({
    default: ({ onSuccess }) => (
      <button type="button" onClick={() => onSuccess()}>
        reset-success
      </button>
    ),
  }),
)

const render = () => {
  const container = document.createElement("div")
  const root = createRoot(container)
  act(() => {
    root.render(<ResetPasswordPage />)
  })
  return container
}

const clickByText = (container, text) => {
  const button = [...container.querySelectorAll("button")].find(
    (item) => item.textContent === text,
  )
  expect(button).toBeTruthy()
  act(() => {
    button.dispatchEvent(new MouseEvent("click", { bubbles: true }))
  })
}

describe("ISS-37/ISS-45: ResetPasswordPage hands off to the shared auth modal", () => {
  beforeEach(() => {
    routerState.navigate.mockClear()
    routerState.searchParams = new URLSearchParams()
  })

  it("opens the login modal when switching to login", () => {
    const container = render()

    clickByText(container, "switch-login")

    expect(routerState.navigate).toHaveBeenCalledWith("/", {
      replace: true,
      state: { requireLogin: true, authMode: "login" },
    })
  })

  it("opens the register modal when switching to register", () => {
    const container = render()

    clickByText(container, "switch-register")

    expect(routerState.navigate).toHaveBeenCalledWith("/", {
      replace: false,
      state: { requireLogin: true, authMode: "register" },
    })
  })

  it("opens the login modal from the success screen 'Đăng nhập ngay' button", () => {
    routerState.searchParams = new URLSearchParams("email=a@b.com&token=tok")
    const container = render()

    clickByText(container, "reset-success")
    clickByText(container, "Đăng nhập ngay")

    expect(routerState.navigate).toHaveBeenCalledWith("/", {
      replace: true,
      state: { requireLogin: true, authMode: "login" },
    })
  })
})
