// @vitest-environment happy-dom
import React, { act } from "react"
import { createRoot } from "react-dom/client"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import LoginPopup from "./LoginPopup"
import RequestOtpStep from "./ResetPasswordPopup/RequestOtpStep"

const mocks = vi.hoisted(() => ({
  login: vi.fn(),
  forgotPassword: vi.fn(),
}))

vi.mock("react-router-dom", async (importOriginal) => ({
  ...(await importOriginal()),
  useNavigate: () => vi.fn(),
}))

vi.mock("@/store/api/authApi", () => ({
  useLoginMutation: () => [mocks.login, { isLoading: false }],
  useResendEmailOtpMutation: () => [vi.fn(), { isLoading: false }],
  useForgotPasswordMutation: () => [mocks.forgotPassword, { isLoading: false }],
}))

vi.mock("@/shared/context/AuthModalContext", () => ({
  useAuthModal: () => ({ redirectAfterLogin: null }),
}))

vi.mock("@/shared/context/LanguageContext.jsx", () => ({
  useLanguage: () => ({
    t: {
      auth: {
        loginTitle: "Đăng nhập",
        emailLabel: "Email",
        passwordLabel: "Mật khẩu",
        emailPlaceholder: "you@example.com",
        passwordPlaceholder: "••••••",
        rememberMe: "Ghi nhớ",
        forgotLink: "Quên mật khẩu?",
        loginButton: "Đăng nhập",
        dontHaveAccount: "Chưa có tài khoản?",
        registerLink: "Đăng ký",
        invalidCredentials: "Sai email hoặc mật khẩu",
        loginFailed: "Đăng nhập thất bại",
        validationEmailRequired: "Vui lòng nhập email",
        validationEmailInvalid: "Email không hợp lệ",
        validationPasswordRequired: "Vui lòng nhập mật khẩu",
        forgotStep1Title: "Quên mật khẩu?",
        sendOtpButton: "Gửi OTP",
        haveAccount: "Đã có tài khoản?",
        loginLink: "Đăng nhập",
        sending: "Đang gửi",
      },
    },
  }),
}))

vi.mock("@/shared/components/ui/inputs/TextInput", () => ({
  default: ({ label, value, onChange }) => (
    <input aria-label={label} value={value} onChange={onChange} />
  ),
}))

vi.mock("@/shared/components/ui/Modal", () => ({
  default: ({ open, children, footer }) =>
    open ? (
      <div>
        {children}
        {footer}
      </div>
    ) : null,
}))

const setInputValue = (input, value) => {
  const setter = Object.getOwnPropertyDescriptor(
    window.HTMLInputElement.prototype,
    "value",
  ).set
  setter.call(input, value)
  input.dispatchEvent(new Event("input", { bubbles: true }))
}

const submitForm = async (form) => {
  await act(async () => {
    form.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }))
  })
}

let container
let root

const mount = (element) => {
  container = document.createElement("div")
  document.body.appendChild(container)
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
  document.body.innerHTML = ""
})

beforeEach(() => {
  mocks.login.mockReset()
  mocks.forgotPassword.mockReset()
  globalThis.IS_REACT_ACT_ENVIRONMENT = true
})

describe("ISS-36: auth modals use dark-mode contrast", () => {
  it("renders the login title and links with dark red accents", () => {
    const html = mount(
      <LoginPopup open onClose={vi.fn()} onSwitchMode={vi.fn()} />,
    ).innerHTML

    expect(html).toContain("dark:text-red-400")
  })

  it("renders the login API error box with a dark surface", async () => {
    mocks.login.mockReturnValue({
      unwrap: async () => {
        throw { data: { statusCode: 401, errorCode: "AUTH_INVALID_CREDENTIALS" } }
      },
    })

    const container = mount(
      <LoginPopup open onClose={vi.fn()} onSwitchMode={vi.fn()} />,
    )

    const [email, password] = container.querySelectorAll("input")
    act(() => {
      setInputValue(email, "learner@catspeak.edu.vn")
      setInputValue(password, "secret")
    })
    await submitForm(container.querySelector("#login-form"))

    expect(container.innerHTML).toContain("dark:bg-red-950/40")
    expect(container.innerHTML).toContain("dark:text-red-300")
    expect(container.innerHTML).toContain("Sai email hoặc mật khẩu")
  })

  it("renders the reset-password request API error box with a dark surface", async () => {
    mocks.forgotPassword.mockReturnValue({
      unwrap: async () => {
        throw { data: { message: "Server error" } }
      },
    })

    const container = mount(<RequestOtpStep onSuccess={vi.fn()} />)

    const [email] = container.querySelectorAll("input")
    act(() => {
      setInputValue(email, "learner@catspeak.edu.vn")
    })
    await submitForm(container.querySelector("form"))

    expect(container.innerHTML).toContain("dark:bg-red-950/40")
    expect(container.innerHTML).toContain("dark:text-red-300")
    expect(container.innerHTML).toContain("dark:text-red-400")
  })
})
