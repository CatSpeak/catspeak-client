import { describe, expect, it } from "vitest"
import {
  buildCanonicalOgUrl,
  extractCommunityLang,
  normalizePath,
  pickAllowedQueryParams,
} from "../urlNormalizer.js"

describe("normalizePath", () => {
  it("keeps the root path", () => {
    expect(normalizePath("/")).toBe("/")
    expect(normalizePath("")).toBe("/")
  })

  it("removes trailing slashes", () => {
    expect(normalizePath("/explore-courses/")).toBe("/explore-courses")
    expect(normalizePath("/en/cat-speak/news///")).toBe("/en/cat-speak/news")
  })
})

describe("extractCommunityLang", () => {
  it("reads supported community prefixes", () => {
    expect(extractCommunityLang("/zh/cat-speak/news")).toBe("zh")
    expect(extractCommunityLang("/en/cat-speak/news")).toBe("en")
    expect(extractCommunityLang("/ja/cat-speak/news")).toBe("ja")
  })

  it("maps legacy Vietnamese prefixes to zh", () => {
    expect(extractCommunityLang("/vi/cat-speak/reels/1")).toBe("zh")
    expect(extractCommunityLang("/vn/cat-speak/news/abc")).toBe("zh")
  })

  it("returns null outside community routes", () => {
    expect(extractCommunityLang("/explore-courses")).toBe(null)
  })
})

describe("pickAllowedQueryParams", () => {
  it("drops pwd, ver and tracking params", () => {
    const params = new URLSearchParams(
      "pwd=MySecret123&ver=999999&utm_source=fb&fbclid=xyz&occurrenceId=42&token=abc",
    )

    const picked = pickAllowedQueryParams(params, ["occurrenceId", "token"])
    const serialized = picked.toString()

    expect(serialized).toContain("occurrenceId=42")
    expect(serialized).toContain("token=abc")
    expect(serialized).not.toContain("MySecret123")
    expect(serialized).not.toContain("999999")
    expect(serialized).not.toContain("utm_source")
    expect(serialized).not.toContain("fbclid")
  })

  it("keeps only sharedMaterialToken for the workspace query route", () => {
    const params = new URLSearchParams("sharedMaterialToken=tok_1&pwd=secret&ver=1")
    const picked = pickAllowedQueryParams(params, ["sharedMaterialToken"])

    expect(picked.toString()).toBe("sharedMaterialToken=tok_1")
  })
})

describe("buildCanonicalOgUrl", () => {
  it("builds a clean canonical URL", () => {
    const query = pickAllowedQueryParams(new URLSearchParams("occurrenceId=7&ver=3"), ["occurrenceId"])
    expect(buildCanonicalOgUrl("https://catspeak.com.vn", "/zh/cat-speak/calendar", query)).toBe(
      "https://catspeak.com.vn/zh/cat-speak/calendar?occurrenceId=7",
    )
  })

  it("omits the query string when nothing is allowlisted", () => {
    expect(buildCanonicalOgUrl("https://catspeak.com.vn", "/resources/ef-set", new URLSearchParams())).toBe(
      "https://catspeak.com.vn/resources/ef-set",
    )
  })
})
