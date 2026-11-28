// @vitest-environment happy-dom
import React from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { beforeEach, describe, expect, it, vi } from "vitest"
import RoleGuard from "./RoleGuard"

let mockRole = {
  activeRole: "Student",
  isLoading: false,
  isRoleResolved: true,
}

vi.mock("@/features/courses/components/RoleSwitcher", () => ({
  useRoleOverride: () => mockRole,
}))

vi.mock("react-router-dom", async (importOriginal) => ({
  ...(await importOriginal()),
  useLocation: () => ({ pathname: "/workspace/events" }),
  useNavigate: () => vi.fn(),
  Navigate: () => <div data-testid="redirect" />,
}))

vi.mock("@/shared/context/LanguageContext", () => ({
  useLanguage: () => ({ t: {} }),
}))

describe("ISS-16: RoleGuard fallback modes", () => {
  beforeEach(() => {
    mockRole = { activeRole: "Student", isLoading: false, isRoleResolved: true }
  })

  it("renders the unified 404 when fallbackMode=notFound", () => {
    const html = renderToStaticMarkup(
      <RoleGuard allowedRoles={["Teacher"]} fallbackMode="notFound">
        <div>secret</div>
      </RoleGuard>,
    )

    expect(html).toContain("404")
    expect(html).not.toContain("secret")
  })

  it("keeps redirecting by default", () => {
    const html = renderToStaticMarkup(
      <RoleGuard allowedRoles={["Teacher"]}>
        <div>secret</div>
      </RoleGuard>,
    )

    expect(html).toContain('data-testid="redirect"')
  })

  it("renders children for an allowed role", () => {
    mockRole = { activeRole: "Teacher", isLoading: false, isRoleResolved: true }

    const html = renderToStaticMarkup(
      <RoleGuard allowedRoles={["Teacher"]} fallbackMode="notFound">
        <div>secret</div>
      </RoleGuard>,
    )

    expect(html).toContain("secret")
  })

  it("fails closed for an unresolved role without hanging on a spinner", () => {
    mockRole = { activeRole: null, isLoading: false, isRoleResolved: false }

    const html = renderToStaticMarkup(
      <RoleGuard allowedRoles={["Teacher"]} fallbackMode="notFound">
        <div>secret</div>
      </RoleGuard>,
    )

    expect(html).toContain("404")
    expect(html).not.toContain("secret")
  })

  it("offers a retry instead of an endless spinner when role loading fails", () => {
    const retry = vi.fn()
    mockRole = {
      activeRole: null,
      isLoading: false,
      isRoleResolved: false,
      error: { status: 500 },
      retry,
    }

    const html = renderToStaticMarkup(
      <RoleGuard allowedRoles={["Teacher"]} fallbackMode="notFound">
        <div>secret</div>
      </RoleGuard>,
    )

    expect(html).toContain("Thử lại")
    expect(html).not.toContain("secret")
  })
})
