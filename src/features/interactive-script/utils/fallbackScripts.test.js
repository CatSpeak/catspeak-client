import { describe, expect, it } from "vitest"
import { getNextFallbackScriptIndex } from "./fallbackScripts"

describe("getNextFallbackScriptIndex", () => {
  it("selects a different fallback script when multiple scripts are available", () => {
    expect(getNextFallbackScriptIndex(["first", "second"], 0, () => 0)).toBe(1)
  })

  it("keeps the only available fallback script selected", () => {
    expect(getNextFallbackScriptIndex(["only"], 0, () => 0)).toBe(0)
  })
})
