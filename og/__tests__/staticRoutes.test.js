import { describe, expect, it } from "vitest"
import {
  OG_DEFAULTS,
  OG_IMAGE_META,
  RESOURCES_BY_ID,
  getFallbackMeta,
  resolveStaticRoute,
} from "../staticRoutes.js"

describe("static routes", () => {
  it("covers all 82 resources", () => {
    expect(RESOURCES_BY_ID.size).toBe(82)

    for (const [id, meta] of RESOURCES_BY_ID) {
      const resolved = resolveStaticRoute(`/resources/${id}`)
      expect(resolved.title, id).toBe(meta.title)
      expect(resolved.imageUrl).not.toMatch(/\.(svg|ico)$/i)
    }
  })

  it("resolves the resource hub and a known resource", () => {
    expect(resolveStaticRoute("/resources").title).toBe(OG_DEFAULTS.resources.title)
    expect(resolveStaticRoute("/resources/ef-set").title).toContain("EF SET")
  })

  it("uses community thumbnails for language-prefixed pages", () => {
    expect(resolveStaticRoute("/zh/cat-speak/news")).toMatchObject({
      imageUrl: "/og/thumbnail-zh.jpg",
      locale: "zh_CN",
    })
    expect(resolveStaticRoute("/en/community")).toMatchObject({
      imageUrl: "/og/thumbnail-en.jpg",
      locale: "en_US",
    })
    expect(resolveStaticRoute("/ja/cat-speak/reels")).toMatchObject({
      imageUrl: "/og/thumbnail-ja.jpg",
      locale: "ja_JP",
    })
  })

  it("maps legacy Vietnamese prefixes to zh", () => {
    expect(resolveStaticRoute("/vn/cat-speak/news").imageUrl).toBe("/og/thumbnail-zh.jpg")
  })

  it("marks workspace and auth pages noindex", () => {
    expect(resolveStaticRoute("/workspace/profile").noIndex).toBe(true)
    expect(resolveStaticRoute("/workspace/learning-path").noIndex).toBe(true)
    expect(resolveStaticRoute("/workspace/materials/3").noIndex).toBe(true)
    expect(resolveStaticRoute("/workspace/courses/class/1").noIndex).toBe(true)
    expect(resolveStaticRoute("/chat/12").noIndex).toBe(true)
    expect(resolveStaticRoute("/setting/account").noIndex).toBe(true)
    expect(resolveStaticRoute("/checkout").noIndex).toBe(true)
    expect(resolveStaticRoute("/reset-password").noIndex).toBe(true)
  })

  it("keeps public pages indexable", () => {
    expect(resolveStaticRoute("/").noIndex).toBeUndefined()
    expect(resolveStaticRoute("/explore-courses").noIndex).toBeUndefined()
    expect(resolveStaticRoute("/pricing").noIndex).toBeUndefined()
    expect(resolveStaticRoute("/resources/ef-set").noIndex).toBeUndefined()
  })

  it("falls back to home for unknown paths", () => {
    expect(resolveStaticRoute("/totally-unknown-path")).toMatchObject({
      title: OG_DEFAULTS.home.title,
      imageUrl: "/og/landing.jpg",
    })
  })

  it("exposes dimensions for every bundled OG image", () => {
    for (const [path, meta] of Object.entries(OG_IMAGE_META)) {
      expect(path).toMatch(/^\/og\/.+\.jpg$/)
      expect(meta.width).toBeGreaterThan(0)
      expect(meta.height).toBeGreaterThan(0)
      expect(meta.type).toBe("image/jpeg")
    }
  })

  it("builds fallback metadata with the request locale", () => {
    expect(getFallbackMeta("news", "ja")).toMatchObject({
      title: OG_DEFAULTS.news.title,
      locale: "ja_JP",
    })
    expect(getFallbackMeta("unknown", null).title).toBe(OG_DEFAULTS.home.title)
  })
})
