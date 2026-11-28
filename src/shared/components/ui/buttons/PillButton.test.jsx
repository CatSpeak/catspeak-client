// @vitest-environment happy-dom
import React from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it } from "vitest"
import PillButton from "./PillButton"

describe("ISS-30: PillButton disabled state is grey, not brand red", () => {
  it("drops the primary red background when disabled", () => {
    const html = renderToStaticMarkup(
      <PillButton variant="primary" disabled>
        Confirm
      </PillButton>,
    )

    expect(html).toContain("bg-[#BFBFBF]")
    expect(html).toContain("dark:bg-[#3A3A3A]")
    expect(html).toContain("text-neutral-800")
    expect(html).toContain("dark:text-neutral-400")
    expect(html).not.toContain("bg-cath-red-700")
    expect(html).toContain("disabled")
  })

  it("keeps the brand background for an enabled primary button", () => {
    const html = renderToStaticMarkup(
      <PillButton variant="primary">Confirm</PillButton>,
    )

    expect(html).toContain("bg-cath-red-700")
    expect(html).not.toContain("bg-[#BFBFBF]")
  })

  it("keeps the secondary variant readable with a dimmed look when disabled", () => {
    const html = renderToStaticMarkup(
      <PillButton variant="secondary" disabled>
        Cancel
      </PillButton>,
    )

    expect(html).toContain("opacity-50")
    expect(html).not.toContain("bg-[#BFBFBF]")
  })
})
