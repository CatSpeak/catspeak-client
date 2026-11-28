// @vitest-environment happy-dom
import React, { act } from "react"
import { createRoot } from "react-dom/client"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import WorkspaceDashboardRouter from "./WorkspaceDashboardRouter"

const mocks = vi.hoisted(() => ({
  role: {
    isTeacher: false,
    isRoleResolved: true,
    isLoading: false,
    error: null,
    retry: vi.fn(),
  },
}))

vi.mock("@/features/courses/components/RoleSwitcher", () => ({
  useRoleOverride: () => mocks.role,
}))

vi.mock("./LearnerDashboardPage", () => ({
  default: () => <div data-testid="learner-dashboard" />,
}))

vi.mock("@/features/courses/components/WorkspaceDashboardPage", () => ({
  default: () => <div data-testid="teacher-dashboard" />,
}))

let container
let root

const mount = () => {
  container = document.createElement("div")
  document.body.appendChild(container)
  root = createRoot(container)
  act(() => {
    root.render(<WorkspaceDashboardRouter />)
  })
  return container
}

beforeEach(() => {
  globalThis.IS_REACT_ACT_ENVIRONMENT = true
  mocks.role = {
    isTeacher: false,
    isRoleResolved: true,
    isLoading: false,
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

describe("R1-1: WorkspaceDashboardRouter role loading failures", () => {
  it("renders the learner dashboard for a resolved student", () => {
    const container = mount()

    expect(container.querySelector('[data-testid="learner-dashboard"]')).toBeTruthy()
  })

  it("shows a retryable error instead of guessing a dashboard", () => {
    mocks.role = {
      isTeacher: null,
      isRoleResolved: false,
      isLoading: false,
      error: { status: 500 },
      retry: mocks.role.retry,
    }

    const container = mount()

    expect(container.querySelector('[role="alert"]')).toBeTruthy()
    expect(container.textContent).toContain("Thử lại")
    expect(container.querySelector('[data-testid="learner-dashboard"]')).toBeNull()

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
      isRoleResolved: false,
      isLoading: true,
      error: null,
      retry: vi.fn(),
    }

    const container = mount()

    expect(container.querySelector('[role="status"]')).toBeTruthy()
    expect(container.querySelector('[role="alert"]')).toBeNull()
    expect(container.querySelector('[data-testid="learner-dashboard"]')).toBeNull()
  })
})
