// @vitest-environment happy-dom
import React from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it } from "vitest"
import Banner from "./Banner"

const VARIANTS = {
  neutral: "dark:bg-[#242424]",
  danger: "dark:bg-red-950/40",
  error: "dark:bg-red-950/40",
  warning: "dark:bg-amber-950/40",
  info: "dark:bg-blue-950/40",
  success: "dark:bg-emerald-950/40",
}

describe("ISS-30: Banner supports every variant in dark mode", () => {
  for (const [variant, darkClass] of Object.entries(VARIANTS)) {
    it(`renders ${variant} with ${darkClass}`, () => {
      const html = renderToStaticMarkup(
        <Banner variant={variant} title="Title">
          Message
        </Banner>,
      )

      expect(html).toContain(darkClass)
    })
  }

  it("gives the dismiss control a dark hover surface", () => {
    const html = renderToStaticMarkup(
      <Banner variant="info" onClose={() => {}}>
        Message
      </Banner>,
    )

    expect(html).toContain("dark:hover:bg-white/10")
  })
})
