/* global process */
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from "vitest"
import middleware from "../../middleware.js"
import { OG_DEFAULTS } from "../staticRoutes.js"
import { escapeHtml } from "../htmlRenderer.js"

const ORIGIN = "https://catspeak.com.vn"
const API_ORIGIN = "https://api.catspeak.com.vn"

function makeRequest(path, userAgent) {
  return new Request(`${ORIGIN}${path}`, {
    headers: { "user-agent": userAgent },
  })
}

function jsonResponse(payload) {
  return new Response(JSON.stringify(payload), {
    status: 200,
    headers: { "content-type": "application/json" },
  })
}

describe("middleware", () => {
  const fetchMock = vi.fn()

  beforeAll(() => {
    process.env.VITE_API_BASE_URL = API_ORIGIN
    vi.stubGlobal("fetch", fetchMock)
  })

  afterEach(() => {
    fetchMock.mockReset()
  })

  afterAll(() => {
    delete process.env.VITE_API_BASE_URL
    vi.unstubAllGlobals()
  })

  it("renders static routes without calling the backend", async () => {
    const response = await middleware(makeRequest("/resources/ef-set", "facebookexternalhit/1.1"))
    const html = await response.text()

    expect(response.status).toBe(200)
    expect(response.headers.get("content-type")).toContain("text/html")
    expect(response.headers.get("cache-control")).toBe("no-store")
    expect(response.headers.get("vary")).toBe("User-Agent")
    expect(fetchMock).not.toHaveBeenCalled()
    expect(html).toContain("<title>EF SET - Kho tài nguyên Cat Speak</title>")
    expect(html).toContain("https://catspeak.com.vn/og/thumbnail-en.jpg")
  })

  it("calls /api/og/resolve for dynamic routes and strips pwd/ver/tracking params", async () => {
    fetchMock.mockResolvedValue(
      jsonResponse({
        found: true,
        title: "Bài viết chia sẻ",
        description: "Mô tả bài viết",
        imageUrl: "https://cdn.example/cover.jpg",
        ogType: "article",
        locale: "zh_CN",
        fallbackKey: "news",
        cachePolicy: "public",
      }),
    )

    const response = await middleware(
      makeRequest(
        "/zh/cat-speak/news/abc12345?ver=173000&fbclid=xyz&utm_source=fb&pwd=MySecret123",
        "ZaloBot/1.0",
      ),
    )
    const html = await response.text()

    expect(fetchMock).toHaveBeenCalledTimes(1)
    const calledUrl = new URL(fetchMock.mock.calls[0][0])
    expect(calledUrl.origin).toBe(API_ORIGIN)
    expect(calledUrl.pathname).toBe("/api/og/resolve")
    expect(calledUrl.searchParams.get("path")).toBe("/zh/cat-speak/news/abc12345")
    expect(calledUrl.searchParams.get("ver")).toBeNull()
    expect(calledUrl.searchParams.get("fbclid")).toBeNull()
    expect(calledUrl.searchParams.get("utm_source")).toBeNull()
    expect(calledUrl.searchParams.get("pwd")).toBeNull()

    expect(html).toContain("<title>Bài viết chia sẻ</title>")
    expect(html).toContain('content="https://catspeak.com.vn/zh/cat-speak/news/abc12345"')
    expect(html).not.toContain("173000")
    expect(html).not.toContain("MySecret123")
  })

  it("forwards only allowlisted query params for events", async () => {
    fetchMock.mockResolvedValue(
      jsonResponse({ found: true, title: "Workshop", fallbackKey: "calendar" }),
    )

    const response = await middleware(
      makeRequest(
        "/vi/cat-speak/calendar?occurrenceId=42&token=tok_1&pwd=secret&ver=9",
        "TelegramBot",
      ),
    )
    const html = await response.text()

    const calledUrl = new URL(fetchMock.mock.calls[0][0])
    expect(calledUrl.searchParams.get("occurrenceId")).toBe("42")
    expect(calledUrl.searchParams.get("token")).toBe("tok_1")
    expect(calledUrl.searchParams.get("pwd")).toBeNull()
    expect(calledUrl.searchParams.get("ver")).toBeNull()

    expect(html).toContain(`content="${ORIGIN}/vi/cat-speak/calendar?occurrenceId=42&amp;token=tok_1"`)
  })

  it("never leaks room passwords in canonical or backend URLs", async () => {
    fetchMock.mockResolvedValue(
      jsonResponse({ found: true, title: "Phòng học", fallbackKey: "rooms" }),
    )

    const response = await middleware(makeRequest("/en/meet/5?pwd=MySecret123&ver=999999", "Discordbot/2.0"))
    const html = await response.text()

    const calledUrl = new URL(fetchMock.mock.calls[0][0])
    expect(calledUrl.search).toBe("?path=%2Fen%2Fmeet%2F5")
    expect(html).not.toContain("MySecret123")
    expect(html).not.toContain("999999")
    expect(html).toContain('content="https://catspeak.com.vn/en/meet/5"')
  })

  it("falls back to static metadata when the backend fails", async () => {
    fetchMock.mockRejectedValue(new DOMException("The operation was aborted.", "AbortError"))

    const response = await middleware(makeRequest("/zh/cat-speak/news/abc12345", "ZaloBot/1.0"))
    const html = await response.text()

    expect(response.status).toBe(200)
    expect(html).toContain(`<title>${escapeHtml(OG_DEFAULTS.news.title)}</title>`)
    expect(html).toContain("https://catspeak.com.vn/og/thumbnail-zh.jpg")
  })

  it("falls back when the backend returns 500", async () => {
    fetchMock.mockResolvedValue(new Response("boom", { status: 500 }))

    const response = await middleware(makeRequest("/explore-courses/details/42", "facebookexternalhit"))
    const html = await response.text()

    expect(response.status).toBe(200)
    expect(html).toContain(`<title>${escapeHtml(OG_DEFAULTS.courses.title)}</title>`)
  })

  it.each([
    "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)",
    "Mozilla/5.0 (compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm)",
    "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) Mobile/15E148 ZaloTheme/light Zalo/24.08",
    "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) FBAN/FBIOS;FBAV/400.0",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120 Safari/537.36",
  ])("passes through non-preview user agents: %s", async (userAgent) => {
    const response = await middleware(makeRequest("/explore-courses", userAgent))

    expect(response).toBeUndefined()
    expect(fetchMock).not.toHaveBeenCalled()
  })
})
