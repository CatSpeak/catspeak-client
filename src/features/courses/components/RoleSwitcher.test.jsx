// @vitest-environment happy-dom
import React, { act } from "react"
import { createRoot } from "react-dom/client"
import { describe, expect, it, vi } from "vitest"
import { useRoleOverride } from "./RoleSwitcher"

const mocks = vi.hoisted(() => ({
  auth: { user: null, isAuthenticated: false, refreshToken: null },
  accountProfile: {},
  userProfile: {},
  profileQueryOptions: null,
  userProfileQueryOptions: null,
  refetchAccountProfile: vi.fn(),
  refetchProfile: vi.fn(),
}))

vi.mock("@/features/auth", () => ({
  useAuth: () => mocks.auth,
}))

vi.mock("@/store/api/authApi", () => ({
  useSwitchAccountTypeMutation: () => [vi.fn(), { isLoading: false }],
  useGetProfileQuery: (arg, options) => {
    mocks.profileQueryOptions = options
    return mocks.accountProfile
  },
}))

vi.mock("@/store/api/userApi", () => ({
  useGetUserProfileQuery: (arg, options) => {
    mocks.userProfileQueryOptions = options
    return mocks.userProfile
  },
}))

vi.mock("@/shared/context/LanguageContext", () => ({
  useLanguage: () => ({ t: {} }),
}))

const Probe = () => {
  const role = useRoleOverride()
  const view = {
    isLoading: role.isLoading,
    isRoleResolved: role.isRoleResolved,
    activeRole: role.activeRole,
    isTeacherProfile: role.isTeacherProfile,
    isTeacher: role.isTeacher,
    hasError: Boolean(role.error),
  }

  return (
    <div>
      <pre data-testid="role-state">{JSON.stringify(view)}</pre>
      <button type="button" onClick={role.retry}>
        retry
      </button>
    </div>
  )
}

const renderProbe = () => {
  const container = document.createElement("div")
  const root = createRoot(container)
  act(() => {
    root.render(<Probe />)
  })
  return container
}

const readRole = (container) =>
  JSON.parse(container.querySelector('[data-testid="role-state"]').textContent)

const setQueryResult = (overrides = {}) => ({
  data: undefined,
  isLoading: false,
  isFetching: false,
  error: null,
  refetch: vi.fn(),
  ...overrides,
})

describe("ISS-78: useRoleOverride hydrates the role from /Account/profile", () => {
  it("fetches both queries while the user is still missing and resolves the role", () => {
    mocks.auth = { user: null, isAuthenticated: true, refreshToken: "rt" }
    mocks.accountProfile = setQueryResult({
      data: { data: { accountId: 474, accountType: "Teacher" } },
    })
    mocks.userProfile = setQueryResult({ data: { data: { isTeacher: true } } })

    const role = readRole(renderProbe())

    expect(mocks.profileQueryOptions.skip).toBe(false)
    expect(mocks.userProfileQueryOptions.skip).toBe(false)
    expect(role.isRoleResolved).toBe(true)
    expect(role.activeRole).toBe("Teacher")
    expect(role.isTeacherProfile).toBe(true)
    expect(role.isLoading).toBe(false)
  })

  it("resolves a Student role from the hydrated account profile", () => {
    mocks.auth = { user: null, isAuthenticated: true, refreshToken: "rt" }
    mocks.accountProfile = setQueryResult({
      data: { data: { accountId: 446, accountType: "Student" } },
    })
    mocks.userProfile = setQueryResult({ data: { data: { isTeacher: false } } })

    const role = readRole(renderProbe())

    expect(role.activeRole).toBe("Student")
    expect(role.isTeacherProfile).toBe(false)
  })

  it("exposes the error without hanging and retries both refetches", () => {
    mocks.refetchAccountProfile = vi.fn()
    mocks.refetchProfile = vi.fn()
    mocks.auth = { user: null, isAuthenticated: true, refreshToken: "rt" }
    mocks.accountProfile = setQueryResult({
      error: { status: 500 },
      refetch: mocks.refetchAccountProfile,
    })
    mocks.userProfile = setQueryResult({
      error: { status: 500 },
      refetch: mocks.refetchProfile,
    })

    const container = renderProbe()
    const role = readRole(container)

    expect(role.isRoleResolved).toBe(false)
    expect(role.isLoading).toBe(false)
    expect(role.hasError).toBe(true)

    act(() => {
      container
        .querySelector("button")
        .dispatchEvent(new MouseEvent("click", { bubbles: true }))
    })

    expect(mocks.refetchAccountProfile).toHaveBeenCalledTimes(1)
    expect(mocks.refetchProfile).toHaveBeenCalledTimes(1)
  })

  it("skips both queries for a guest and never reports a loading role", () => {
    mocks.auth = { user: null, isAuthenticated: false, refreshToken: null }
    mocks.accountProfile = { isLoading: true, isFetching: true }
    mocks.userProfile = { isLoading: true, isFetching: true }

    const role = readRole(renderProbe())

    expect(mocks.profileQueryOptions.skip).toBe(true)
    expect(mocks.userProfileQueryOptions.skip).toBe(true)
    expect(role.isLoading).toBe(false)
    expect(role.isRoleResolved).toBe(false)
    expect(role.activeRole).toBeNull()
    expect(role.isTeacher).toBeNull()
  })
})
