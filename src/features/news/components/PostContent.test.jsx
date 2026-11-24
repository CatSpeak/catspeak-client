// @vitest-environment happy-dom
import React, { act } from "react"
import { createRoot } from "react-dom/client"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import PostContent from "./PostContent"

vi.mock("@/features/news/components/CmsCarousel", () => ({
  CmsCarousel: () => null,
}))

vi.mock("../constants/contentClasses", () => ({
  CONTENT_CLASSES: "cms-content",
}))

describe("PostContent XSS sanitization", () => {
  let container
  let root

  beforeEach(() => {
    globalThis.IS_REACT_ACT_ENVIRONMENT = true
    container = document.createElement("div")
    document.body.appendChild(container)
    root = createRoot(container)
  })

  afterEach(() => {
    act(() => {
      root.unmount()
    })
    container.remove()
    document.body.innerHTML = ""
  })

  it("strips iframe, svg, javascript: URIs and secures target=_blank links", async () => {
    const dirtyHtml = `
      <p>Hello CatSpeak</p>
      <iframe src="https://evil.example/embed" srcdoc="<script>alert(1)</script>"></iframe>
      <svg onload="alert(1)"><circle /></svg>
      <a href="javascript:alert(1)" target="_blank">Bad Link</a>
      <a href="https://catspeak.edu.vn/post" target="_blank">Safe Link</a>
    `

    await act(async () => {
      root.render(<PostContent html={dirtyHtml} />)
    })

    expect(container.querySelector("iframe")).toBeNull()
    expect(container.querySelector("svg")).toBeNull()
    expect(container.textContent).toContain("Hello CatSpeak")

    const links = Array.from(container.querySelectorAll("a"))
    const badLink = links.find((a) => a.textContent === "Bad Link")
    const safeLink = links.find((a) => a.textContent === "Safe Link")

    expect(badLink?.getAttribute("href")).toBeNull()
    expect(safeLink?.getAttribute("href")).toBe("https://catspeak.edu.vn/post")
    expect(safeLink?.getAttribute("rel")).toContain("noopener")
    expect(safeLink?.getAttribute("rel")).toContain("noreferrer")
  })
})
