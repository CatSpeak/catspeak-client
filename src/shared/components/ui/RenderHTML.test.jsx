// @vitest-environment happy-dom
import React from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it, vi } from "vitest"
import { RenderHTML } from "./RenderHTML"

vi.mock("@/shared/utils/sanitizeHtml", () => ({
  sanitizeHtml: (html) => html,
}))

describe("ISS-17: RenderHTML supports dark mode", () => {
  it("emits dark variants for text, bold, headings and links", () => {
    const html = renderToStaticMarkup(
      <RenderHTML html="<h2>Title</h2><p>Body <strong>bold</strong> <b>bold</b> <a href='#'>link</a></p>" />,
    )

    expect(html).toContain("text-gray-800 dark:text-neutral-200")
    expect(html).toContain("dark:[&amp;_strong]:text-white")
    expect(html).toContain("dark:[&amp;_b]:text-white")
    expect(html).toContain("dark:[&amp;_a]:text-[#FF6B6B]")
    expect(html).toContain("dark:[&amp;_h2]:text-white")
  })

  it("keeps caller classes without dropping the base dark variants", () => {
    const html = renderToStaticMarkup(
      <RenderHTML html="<p>Body</p>" className="px-4" />,
    )

    expect(html).toContain("px-4")
    expect(html).toContain("dark:text-neutral-200")
  })

  it("renders the fallback for empty content", () => {
    const html = renderToStaticMarkup(
      <RenderHTML html="   " fallback={<span>empty</span>} />,
    )

    expect(html).toContain("empty")
  })
})
