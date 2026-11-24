// @vitest-environment happy-dom
import React, { act } from "react"
import { createRoot } from "react-dom/client"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import VerifyEmailPage from "./VerifyEmailPage"

const { verifyMock, resendMock, queryState } = vi.hoisted(() => ({
  verifyMock: vi.fn(),
  resendMock: vi.fn(),
  queryState: { email: "learner@catspeak.edu.vn", otp: "123456" },
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
  useLanguage: () => ({ t: { auth: {} } }),
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
})
