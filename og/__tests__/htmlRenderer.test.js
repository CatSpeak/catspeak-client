import { describe, expect, it } from "vitest"
import { escapeHtml, renderOgHtml } from "../htmlRenderer.js"

const ORIGIN = "https://catspeak.com.vn"

describe("escapeHtml", () => {
  it("escapes every HTML metacharacter", () => {
    expect(escapeHtml(`"><script>alert('x')</script>&`)).toBe(
      "&quot;&gt;&lt;script&gt;alert(&#39;x&#39;)&lt;/script&gt;&amp;",
    )
  })
})

describe("renderOgHtml", () => {
  it("renders the core OG and Twitter tags", () => {
    const html = renderOgHtml({
      meta: {
        title: "Tiêu đề & thử nghiệm",
        description: "Mô tả",
        imageUrl: "/og/news.jpg",
        ogType: "article",
        locale: "vi_VN",
        imageAlt: "Ảnh",
      },
      canonicalUrl: `${ORIGIN}/zh/cat-speak/news/abc`,
      origin: ORIGIN,
    })

    expect(html).toContain("<title>Tiêu đề &amp; thử nghiệm</title>")
    expect(html).toContain('<meta name="description" content="Mô tả" />')
    expect(html).toContain('<meta property="og:type" content="article" />')
    expect(html).toContain('<meta property="og:url" content="https://catspeak.com.vn/zh/cat-speak/news/abc" />')
    expect(html).toContain('<meta property="og:image" content="https://catspeak.com.vn/og/news.jpg" />')
    expect(html).toContain('<meta property="og:image:type" content="image/jpeg" />')
    expect(html).toContain('<meta property="og:image:width" content="1200" />')
    expect(html).toContain('<meta property="og:image:height" content="556" />')
    expect(html).toContain('<meta property="og:image:alt" content="Ảnh" />')
    expect(html).toContain('<meta name="twitter:card" content="summary_large_image" />')
    expect(html).toContain('<meta name="twitter:image" content="https://catspeak.com.vn/og/news.jpg" />')
  })

  it("escapes crawler-facing values to prevent XSS", () => {
    const html = renderOgHtml({
      meta: {
        title: `"><script>alert(1)</script>`,
        description: `" onload="alert(2)`,
        imageUrl: "/og/landing.jpg",
      },
      canonicalUrl: `${ORIGIN}/x?y="><script>`,
      origin: ORIGIN,
    })

    expect(html).not.toContain("<script>alert(1)</script>")
    expect(html).not.toContain('onload="alert(2)')
    expect(html).toContain("&quot;&gt;&lt;script&gt;")
  })

  it("replaces blocked image types with the fallback card", () => {
    const html = renderOgHtml({
      meta: { title: "T", imageUrl: "https://cdn.example/logo.svg", fallbackKey: "news" },
      canonicalUrl: `${ORIGIN}/t`,
      origin: ORIGIN,
    })

    expect(html).toContain('https://catspeak.com.vn/og/news.jpg')
    expect(html).not.toContain("logo.svg")
  })

  it("rejects data URIs and falls back", () => {
    const html = renderOgHtml({
      meta: { title: "T", imageUrl: "data:image/png;base64,AAAA" },
      canonicalUrl: `${ORIGIN}/t`,
      origin: ORIGIN,
    })

    expect(html).toContain('https://catspeak.com.vn/og/landing.jpg')
    expect(html).not.toContain("data:image")
  })

  it("infers the type of external images and upgrades http to https", () => {
    const html = renderOgHtml({
      meta: { title: "T", imageUrl: "http://cdn.example/cover.png", imageWidth: 800, imageHeight: 400 },
      canonicalUrl: `${ORIGIN}/t`,
      origin: ORIGIN,
    })

    expect(html).toContain('content="https://cdn.example/cover.png"')
    expect(html).toContain('<meta property="og:image:type" content="image/png" />')
    expect(html).toContain('<meta property="og:image:width" content="800" />')
    expect(html).toContain('<meta property="og:image:height" content="400" />')
  })

  it("adds robots noindex when requested", () => {
    const html = renderOgHtml({
      meta: { title: "T", noIndex: true, imageUrl: "/og/landing.jpg" },
      canonicalUrl: `${ORIGIN}/workspace`,
      origin: ORIGIN,
    })

    expect(html).toContain('<meta name="robots" content="noindex, nofollow" />')
  })
})
