// @vitest-environment happy-dom
import React from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { beforeEach, describe, expect, it, vi } from "vitest"
import WebsitePage from "./WebsitePage"

let mockWebsite = null

vi.mock("react-router-dom", async (importOriginal) => ({
  ...(await importOriginal()),
  useParams: () => ({ lang: "en", id: "ef-set" }),
  Link: ({ to, children, ...rest }) => (
    <a href={to} {...rest}>
      {children}
    </a>
  ),
}))

vi.mock("@/features/navigation/hooks/useActiveLink", () => ({
  useActiveLink: () => ({
    resolvePath: (p) => p,
    currentLang: "en",
  }),
}))

vi.mock("@/features/websites/api/websiteApi", () => ({
  useGetWebsiteByIdQuery: () => ({
    data: mockWebsite,
    isLoading: false,
    error: undefined,
  }),
}))

vi.mock("@/shared/context/LanguageContext", () => ({
  useLanguage: () => ({ t: {} }),
}))

describe("ISS-03: WebsitePage iframe hardening", () => {
  beforeEach(() => {
    mockWebsite = {
      id: "ef-set",
      label: "EF SET",
      url: "https://www.efset.org/",
      embeddable: true,
    }
  })

  it("embeds with a restrictive sandbox and minimal permissions", () => {
    const html = renderToStaticMarkup(<WebsitePage />)

    expect(html).toContain(
      'sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox"',
    )
    expect(html).not.toContain("allow-top-navigation")
    expect(html).toContain('allow="fullscreen; autoplay; microphone"')
    expect(html.toLowerCase()).toContain('referrerpolicy="no-referrer"')
    expect(html).not.toContain("payment")
    expect(html).not.toContain("geolocation")
    expect(html).not.toContain("camera")
    // R1-4: full navigation back to /resources so Vercel re-applies the strict CSP.
    expect(html).toContain('href="/resources"')
  })

  it("never renders an iframe for embeddable:false and offers a new-window link", () => {
    mockWebsite = {
      id: "quizlet",
      label: "Quizlet",
      url: "https://quizlet.com/",
      embeddable: false,
    }

    const html = renderToStaticMarkup(<WebsitePage />)

    expect(html).not.toContain("<iframe")
    expect(html).toContain("Mở ở cửa sổ mới")
    expect(html).toContain('rel="noopener noreferrer"')
  })

  it("rejects non-http(s) resource URLs", () => {
    mockWebsite = {
      id: "bad",
      label: "Bad",
      url: "javascript:alert(1)",
      embeddable: true,
    }

    const html = renderToStaticMarkup(<WebsitePage />)

    expect(html).not.toContain("<iframe")
  })
})
