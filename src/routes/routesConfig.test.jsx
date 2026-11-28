import { describe, expect, it, vi } from "vitest"
import { Navigate } from "react-router-dom"
import routesConfig from "./routesConfig"
import { RoleGuard } from "@/shared/components"
import { AuthRedirectRoute, LazyRoute } from "./RouteShells"

vi.mock("@/shared/config/firebase", () => ({
  app: {},
  auth: {},
  db: {},
  storage: {},
}))

const collectRoutes = (children = []) =>
  children.flatMap((route) => [route, ...collectRoutes(route.children)])

const allRoutes = collectRoutes(routesConfig[0].children)

const findByPath = (path) => allRoutes.filter((route) => route.path === path)

const rootRoute = routesConfig[0].children.find((route) => route.path === "/")

describe("ISS-22/ISS-45/ISS-61: routesConfig structure", () => {
  it("registers /login and /register as auth redirect routes", () => {
    const login = rootRoute.children.find((route) => route.path === "login")
    const register = rootRoute.children.find(
      (route) => route.path === "register",
    )

    expect(login.element.type).toBe(AuthRedirectRoute)
    expect(login.element.props.mode).toBe("login")
    expect(register.element.type).toBe(AuthRedirectRoute)
    expect(register.element.props.mode).toBe("register")
  })

  it("declares the real courses route exactly once", () => {
    expect(findByPath("courses")).toHaveLength(1)
    expect(findByPath("courses")[0].element.type).toBe(RoleGuard)
    expect(findByPath("courses/all")).toHaveLength(1)
  })

  it("protects /workspace/vouchers with a Teacher notFound guard", () => {
    const [route] = findByPath("vouchers")

    expect(route).toBeTruthy()
    expect(route.element.type).toBe(RoleGuard)
    expect(route.element.props.allowedRoles).toEqual(["Teacher"])
    expect(route.element.props.fallbackMode).toBe("notFound")
    expect(route.element.props.children.type).toBe(LazyRoute)
  })

  it("adds /workspace/classes/my as a guarded redirect", () => {
    const [route] = findByPath("classes/my")

    expect(route).toBeTruthy()
    expect(route.element.type).toBe(RoleGuard)
    expect(route.element.props.fallbackMode).toBe("notFound")
    expect(route.element.props.children.type).toBe(Navigate)
    expect(route.element.props.children.props.to).toBe("/workspace/classes")
    expect(route.element.props.children.props.replace).toBe(true)
  })

  it("adds /workspace/classes/edit-class/:id with a Teacher notFound guard", () => {
    const [route] = findByPath("classes/edit-class/:id")

    expect(route).toBeTruthy()
    expect(route.element.type).toBe(RoleGuard)
    expect(route.element.props.allowedRoles).toEqual(["Teacher"])
    expect(route.element.props.fallbackMode).toBe("notFound")
    expect(route.element.props.children.type).toBe(LazyRoute)
  })

  it("keeps every workspace Teacher route on the unified 404 fallback", () => {
    const teacherRoutes = allRoutes.filter(
      (route) => route.element?.type === RoleGuard &&
        route.element?.props?.allowedRoles?.includes("Teacher") &&
        typeof route.path === "string",
    )

    expect(teacherRoutes.length).toBeGreaterThan(10)
    for (const route of teacherRoutes) {
      expect(route.element.props.fallbackMode).toBe("notFound")
    }
  })
})
