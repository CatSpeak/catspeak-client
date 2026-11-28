// @vitest-environment happy-dom
import React, { act } from "react"
import { createRoot } from "react-dom/client"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import VerifyEmailPage from "./VerifyEmailPage"

const { verifyMock, resendMock, queryState, authText } = vi.hoisted(() => ({
  verifyMock: vi.fn(),
  resendMock: vi.fn(),
  queryState: { email: "learner@catspeak.edu.vn", otp: "123456" },
  authText: { current: {} },
}))

vi.mock("react-router-dom", () => ({
  useSearchParams: () => [
    new URLSearchParams(
      queryState.otp
        ? { email: queryState.email, otp: queryState.otp }
        : { email: queryState.email },
    ),
  ],
  Link: ({ children, to }) => <a href={to}>{children}</a>,
}))

vi.mock("@/features/auth", () => ({
  useVerifyEmailOtpMutation: () => [verifyMock, { isLoading: false }],
  useResendEmailOtpMutation: () => [resendMock, { isLoading: false }],
}))

vi.mock("@/shared/context/LanguageContext.jsx", () => ({
  useLanguage: () => ({ t: { auth: authText.current } }),
}))

describe("VerifyEmailPage", () => {
  let container
  let root

  beforeEach(() => {
    globalThis.IS_REACT_ACT_ENVIRONMENT = true
    container = document.createElement("div")
    document.body.appendChild(container)
    root = createRoot(container)
    verifyMock.mockReset()
    resendMock.mockReset()
    authText.current = {}
  })

  afterEach(() => {
    act(() => {
      root.unmount()
    })
    container.remove()
    document.body.innerHTML = ""
  })

  it("auto-verifies email & otp query params via useVerifyEmailOtpMutation", async () => {
    queryState.email = "learner@catspeak.edu.vn"
    queryState.otp = "654321"
    verifyMock.mockReturnValue({ unwrap: async () => ({ verified: true }) })

    await act(async () => {
      root.render(<VerifyEmailPage />)
    })

    expect(verifyMock).toHaveBeenCalledWith({
      email: "learner@catspeak.edu.vn",
      otp: "654321",
    })
    expect(container.textContent).toContain("Email Verified Successfully!")
  })

  it("renders the error state with dark-mode contrast classes", async () => {
    queryState.email = "learner@catspeak.edu.vn"
    queryState.otp = "000000"
    verifyMock.mockReturnValue({
      unwrap: async () => {
        throw { data: { message: "Invalid or expired OTP." } }
      },
    })

    await act(async () => {
      root.render(<VerifyEmailPage />)
    })

    expect(container.innerHTML).toContain("dark:bg-red-950/40")
    expect(container.innerHTML).toContain("dark:text-red-300")
    expect(container.innerHTML).toContain("dark:text-red-400")
  })

  it.each([
    [
      "vi",
      {
        emailVerifiedTitle: "Xác minh Email thành công!",
        emailVerifiedSubtitle:
          "Cảm ơn bạn đã xác minh địa chỉ email. Bạn có thể sử dụng đầy đủ các tính năng của Cat Speak.",
        backToHome: "Về trang chủ",
      },
      "Xác minh Email thành công!",
    ],
    [
      "zh",
      {
        emailVerifiedTitle: "邮箱验证成功！",
        emailVerifiedSubtitle: "感谢您验证邮箱地址。",
        backToHome: "返回首页",
      },
      "邮箱验证成功！",
    ],
    [
      "ja",
      {
        emailVerifiedTitle: "メールアドレスの確認が完了しました！",
        emailVerifiedSubtitle:
          "メールアドレスをご確認いただきありがとうございます。",
        backToHome: "ホームに戻る",
      },
      "メールアドレスの確認が完了しました！",
    ],
  ])(
    "renders the %s success state without leaking the English fallback",
    async (_lang, text, expectedTitle) => {
      queryState.email = "learner@catspeak.edu.vn"
      queryState.otp = "654321"
      authText.current = text
      verifyMock.mockReturnValue({ unwrap: async () => ({ verified: true }) })

      await act(async () => {
        root.render(<VerifyEmailPage />)
      })

      expect(container.textContent).toContain(expectedTitle)
      expect(container.textContent).toContain(text.backToHome)
      expect(container.textContent).not.toContain(
        "Email Verified Successfully!",
      )
    },
  )
})
