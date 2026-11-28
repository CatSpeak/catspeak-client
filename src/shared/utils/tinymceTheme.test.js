import { describe, expect, it } from "vitest"
import { getTinyMceThemeInit } from "./tinymceTheme"

describe("ISS-59 / ISS-64: getTinyMceThemeInit", () => {
  it("returns the dark skin, dark content css and light readable text", () => {
    const init = getTinyMceThemeInit(true)

    expect(init.skin).toBe("oxide-dark")
    expect(init.content_css).toBe("dark")
    expect(init.content_style).toContain("color: #f3f4f6")
    expect(init.content_style).toContain("background-color: #1A1A1A")
    expect(init.content_style).toContain("#9CA3AF")
  })

  it("returns the light skin and default content css", () => {
    const init = getTinyMceThemeInit(false)

    expect(init.skin).toBe("oxide")
    expect(init.content_css).toBe("default")
    expect(init.content_style).toContain("color: #1f2937")
  })

  it("supports a transparent background and extra component styles", () => {
    const init = getTinyMceThemeInit(true, {
      background: "transparent",
      fontSize: "15px",
      extraContentStyle: "body { padding: 16px !important; }",
    })

    expect(init.content_style).toContain("background-color: transparent")
    expect(init.content_style).toContain("font-size: 15px")
    expect(init.content_style).toContain("padding: 16px !important")
  })
})
