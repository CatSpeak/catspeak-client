import { describe, expect, it } from "vitest"
import { classifyWatchInput, normalizeSearchQuery } from "./watchTogetherSearch"

describe("classifyWatchInput", () => {
  it("treats blank input as empty", () => {
    expect(classifyWatchInput("")).toBe("empty")
    expect(classifyWatchInput("   ")).toBe("empty")
    expect(classifyWatchInput(null)).toBe("empty")
    expect(classifyWatchInput(undefined)).toBe("empty")
  })

  it("classifies a valid YouTube link as url", () => {
    expect(classifyWatchInput("https://www.youtube.com/watch?v=dQw4w9WgXcQ")).toBe("url")
    expect(classifyWatchInput("  https://youtu.be/dQw4w9WgXcQ?t=42 ")).toBe("url")
    expect(classifyWatchInput("https://youtube.com/shorts/dQw4w9WgXcQ")).toBe("url")
    expect(classifyWatchInput("youtube.com/watch?v=dQw4w9WgXcQ")).toBe("url")
  })

  it("rejects a pasted link that is not a playable YouTube video", () => {
    expect(classifyWatchInput("https://example.com/watch?v=dQw4w9WgXcQ")).toBe("invalid_url")
    expect(classifyWatchInput("https://youtu.be/abc")).toBe("invalid_url")
    expect(classifyWatchInput("www.youtube.com/watch?v=abc")).toBe("invalid_url")
  })

  it("treats keywords as search, not as links", () => {
    expect(classifyWatchInput("lofi hip hop")).toBe("search")
    expect(classifyWatchInput("  lofi   hip hop  ")).toBe("search")
    expect(classifyWatchInput("catspeak")).toBe("search")
    expect(classifyWatchInput("2")).toBe("search")
  })
})

describe("normalizeSearchQuery", () => {
  it("trims and collapses whitespace", () => {
    expect(normalizeSearchQuery("  lofi   hip\nhop ")).toBe("lofi hip hop")
    expect(normalizeSearchQuery("   ")).toBe("")
  })
})
