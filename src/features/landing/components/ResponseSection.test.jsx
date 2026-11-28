// @vitest-environment happy-dom
import React, { act } from "react"
import { createRoot } from "react-dom/client"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import ResponseSection from "./ResponseSection"

vi.mock("@/shared/context/LanguageContext", () => ({
  useLanguage: () => ({
    t: {
      landing: {
        response: {
          title: "Phản hồi",
          subtitle: "Học viên nói gì",
          reviews: [{ name: "Nguyen Van A", role: "Giáo viên", text: "Tuyệt vời" }],
        },
      },
    },
  }),
}))

vi.mock("./ScrollReveal", () => ({
  default: ({ children }) => <div>{children}</div>,
  ScrollItem: ({ children }) => <div>{children}</div>,
}))

describe("ISS-50: landing response avatar and role label are readable in dark mode", () => {
  let container
  let root

  beforeEach(() => {
    container = document.createElement("div")
    document.body.appendChild(container)
    root = createRoot(container)
    act(() => {
      root.render(<ResponseSection />)
    })
  })

  afterEach(() => {
    act(() => {
      root.unmount()
    })
    container.remove()
    document.body.innerHTML = ""
  })

  it("uses dark initials on the pastel avatar background", () => {
    const avatar = container.querySelector('[aria-label="Nguyen Van A"]')
    expect(avatar).not.toBeNull()
    expect(avatar.className).toContain("text-neutral-900")
  })

  it("adds a light role-label colour for dark mode", () => {
    const role = [...container.querySelectorAll("span")].find(
      (node) => node.textContent === "Giáo viên",
    )
    expect(role).toBeTruthy()
    expect(role.className).toContain("dark:text-neutral-300")
  })
})
