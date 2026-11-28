// @vitest-environment happy-dom
import React, { act } from "react"
import { createRoot } from "react-dom/client"
import { afterEach, beforeEach, describe, expect, it } from "vitest"
import OrganizationPage from "./OrganizationPage"

describe("ISS-54: OrganizationPage heading and copy are readable in dark mode", () => {
  let container
  let root

  beforeEach(() => {
    container = document.createElement("div")
    document.body.appendChild(container)
    root = createRoot(container)
    act(() => {
      root.render(<OrganizationPage />)
    })
  })

  afterEach(() => {
    act(() => {
      root.unmount()
    })
    container.remove()
    document.body.innerHTML = ""
  })

  it("keeps the red heading visible on dark surfaces", () => {
    const heading = container.querySelector("h1")
    expect(heading.className).toContain("dark:text-[#FF7A8A]")
  })

  it("lifts the body copy for dark mode", () => {
    const copy = container.querySelector("p")
    expect(copy.className).toContain("dark:text-neutral-300")
  })
})
