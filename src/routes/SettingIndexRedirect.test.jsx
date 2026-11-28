// @vitest-environment happy-dom
import React, { act } from "react"
import { createRoot } from "react-dom/client"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import SettingIndexRedirect from "./SettingIndexRedirect"

const mocks = vi.hoisted(() => ({
  auth: { isAuthenticated: true },
  role: {
    isTeacher: false,
    isLoading: false,
    isRoleResolved: true,
    error: null,
    retry: vi.fn(),
  },
}))

vi.mock("react-router-dom", () => ({
  Navigate: ({ to }) => <div data-testid="redirect">{to}</div>,
}))

vi.mock("@/features/auth", () => ({
  useAuth: () => mocks.auth,
}))

vi.mock("@/features/courses/components/RoleSwitcher", () => ({
  useRoleOverride: () => mocks.role,
}))

let container
let root

const mount = () => {
  container = document.createElement("div")
  document.body.appendChild(container)
  root = createRoot(container)
  act(() => {
    root.render(<SettingIndexRedirect />)
  })
  return container
}

beforeEach(() => {
  globalThis.IS_REACT_ACT_ENVIRONMENT = true
  mocks.auth = { isAuthenticated: true }
  mocks.role = {
    isTeacher: false,
    isLoading: false,
    isRoleResolved: true,
    error: null,
    retry: vi.fn(),
  }
})

afterEach(() => {
  act(() => {
    root.unmount()
  })
  container.remove()
  document.body.innerHTML = ""
})

describe("R1-1: SettingIndexRedirect role loading failures", () => {
  it("redirects a guest to the system settings page", () => {
    mocks.auth = { isAuthenticated: false }

    const container = mount()

    expect(container.querySelector('[data-testid="redirect"]').textContent).toBe(
      "system",
    )
  })

  it("shows a retryable error instead of an endless spinner", () => {
    mocks.role = {
      isTeacher: null,
      isLoading: false,
      isRoleResolved: false,
      error: { status: 500 },
      retry: mocks.role.retry,
    }

    const container = mount()

    expect(container.querySelector('[role="alert"]')).toBeTruthy()
    expect(container.textContent).toContain("Thử lại")
    expect(container.querySelector('[data-testid="redirect"]')).toBeNull()

    act(() => {
      container
        .querySelector('[role="alert"] button')
        .dispatchEvent(new MouseEvent("click", { bubbles: true }))
    })

    expect(mocks.role.retry).toHaveBeenCalledTimes(1)
  })

  it("keeps the spinner while the role is loading", () => {
    mocks.role = {
      isTeacher: null,
      isLoading: true,
      isRoleResolved: false,
      error: null,
      retry: vi.fn(),
    }

    const container = mount()

    expect(container.querySelector('[role="status"]')).toBeTruthy()
    expect(container.querySelector('[role="alert"]')).toBeNull()
    expect(container.querySelector('[data-testid="redirect"]')).toBeNull()
  })

  it("redirects a resolved teacher to instructor settings", () => {
    mocks.role = {
      isTeacher: true,
      isLoading: false,
      isRoleResolved: true,
      error: null,
      retry: vi.fn(),
    }

    const container = mount()

    expect(container.querySelector('[data-testid="redirect"]').textContent).toBe(
      "instructor",
    )
  })
})
