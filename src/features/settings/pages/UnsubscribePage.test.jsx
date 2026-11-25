// @vitest-environment happy-dom
import React, { act } from "react"
import { createRoot } from "react-dom/client"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import UnsubscribePage from "./UnsubscribePage"

const { queryState, authState, unsubscribeMock } = vi.hoisted(() => ({
  queryState: { email: "learner@catspeak.edu.vn", token: "hmac-sig-123" },
  authState: { token: null },
  unsubscribeMock: vi.fn(),
}))

vi.mock("react-router-dom", () => ({
  useSearchParams: () => {
    const params = new URLSearchParams()
    if (queryState.email !== null) params.set("email", queryState.email)
    if (queryState.token !== null) params.set("token", queryState.token)
    return [params]
  },
  Link: ({ children, to }) => <a href={to}>{children}</a>,
}))

vi.mock("react-redux", () => ({
  useSelector: (selector) => selector({ auth: { token: authState.token } }),
}))

vi.mock("@/features/settings/utils/unsubscribeApi", () => ({
  unsubscribeEmailNotifications: unsubscribeMock,
}))

describe("UnsubscribePage", () => {
  let container
  let root

  beforeEach(() => {
    globalThis.IS_REACT_ACT_ENVIRONMENT = true
    container = document.createElement("div")
    document.body.appendChild(container)
    root = createRoot(container)
    localStorage.clear()
    unsubscribeMock.mockReset()
    authState.token = null
    queryState.email = "learner@catspeak.edu.vn"
    queryState.token = "hmac-sig-123"
  })

  afterEach(() => {
    act(() => {
      root.unmount()
    })
    container.remove()
    document.body.innerHTML = ""
  })

  it("calls unsubscribe API with email and HMAC token without requiring login", async () => {
    unsubscribeMock.mockResolvedValue({ success: true })

    await act(async () => {
      root.render(<UnsubscribePage />)
    })

    expect(unsubscribeMock).toHaveBeenCalledTimes(1)
    expect(unsubscribeMock).toHaveBeenCalledWith({
      email: "learner@catspeak.edu.vn",
      token: "hmac-sig-123",
      authToken: "",
    })
    expect(localStorage.getItem("catspeak_email_notification_enabled")).toBe(
      "false",
    )
    expect(container.textContent).toContain("Đã hủy nhận email thông báo")
  })

  it("shows error state when API rejects missing/invalid token", async () => {
    queryState.token = ""
    unsubscribeMock.mockRejectedValue(
      new Error("Liên kết hủy đăng ký không hợp lệ hoặc thiếu mã xác thực."),
    )

    await act(async () => {
      root.render(<UnsubscribePage />)
    })

    expect(container.textContent).toContain("Không thể hủy đăng ký")
    expect(container.textContent).toContain(
      "Liên kết hủy đăng ký không hợp lệ hoặc thiếu mã xác thực.",
    )
    expect(localStorage.getItem("catspeak_email_notification_enabled")).toBeNull()
  })

  it("fails immediately without calling API when email param is missing", async () => {
    queryState.email = ""
    queryState.token = ""

    await act(async () => {
      root.render(<UnsubscribePage />)
    })

    expect(unsubscribeMock).not.toHaveBeenCalled()
    expect(container.textContent).toContain("thiếu địa chỉ email")
  })
})
