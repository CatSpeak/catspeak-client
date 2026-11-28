// @vitest-environment happy-dom
import React from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { AuthRedirectRoute } from "./RouteShells"

const state = vi.hoisted(() => ({
  isAuthenticated: false,
  redirects: [],
}))

vi.mock("@/features/auth", () => ({
  useAuth: () => ({ isAuthenticated: state.isAuthenticated }),
}))

vi.mock("react-router-dom", async (importOriginal) => ({
  ...(await importOriginal()),
  Navigate: ({ to, state: navigateState }) => {
    state.redirects.push({ to, state: navigateState })
    return <div data-testid="navigate" />
  },
}))

const render = (mode) =>
  renderToStaticMarkup(<AuthRedirectRoute mode={mode} />)

describe("ISS-45: /login and /register auth redirect route", () => {
  beforeEach(() => {
    state.redirects = []
    state.isAuthenticated = false
    localStorage.setItem("communityLanguage", "zh")
  })

  it("sends guests back to / with the login intent", () => {
    render("login")

    expect(state.redirects).toEqual([
      { to: "/", state: { requireLogin: true, authMode: "login" } },
    ])
  })

  it("sends guests back to / with the register intent", () => {
    render("register")

    expect(state.redirects).toEqual([
      { to: "/", state: { requireLogin: true, authMode: "register" } },
    ])
  })

  it("sends authenticated users to their community instead of opening a modal", () => {
    state.isAuthenticated = true

    render("login")

    expect(state.redirects).toEqual([
      { to: "/zh/community", state: undefined },
    ])
  })
})
