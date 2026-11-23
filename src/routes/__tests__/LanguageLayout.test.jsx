import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it, vi } from "vitest"
import React from "react"

const { paramsState, locationState } = vi.hoisted(() => ({
  paramsState: { lang: "zh" },
  locationState: { pathname: "/zh/community", search: "", hash: "" },
}))

vi.mock("react-router-dom", async (importOriginal) => {
  const actual = await importOriginal()
  return {
    ...actual,
    useParams: () => paramsState,
    useLocation: () => locationState,
    Navigate: ({ to }) => <div data-testid="navigate" data-to={to} />,
    Outlet: () => <div data-testid="outlet" />,
  }
})

vi.mock("@/shared/context/GlobalPresenceContext", () => ({
  useGlobalPresence: () => ({ setPresenceLanguage: vi.fn() }),
}))

import LanguageLayout from "../LanguageLayout"

function renderFor(lang, pathname, search = "") {
  paramsState.lang = lang
  locationState.pathname = pathname
  locationState.search = search
  locationState.hash = ""
  return renderToStaticMarkup(<LanguageLayout />)
}

describe("LanguageLayout legacy language aliases", () => {
  it("redirects /vn/cat-speak/news/:token to the zh community and keeps the query", () => {
    const html = renderFor("vn", "/vn/cat-speak/news/abc12345", "?x=1")

    expect(html).toContain('data-to="/zh/cat-speak/news/abc12345?x=1"')
  })

  it("redirects /vi/cat-speak/reels/:id to the zh community", () => {
    const html = renderFor("vi", "/vi/cat-speak/reels/42")

    expect(html).toContain('data-to="/zh/cat-speak/reels/42"')
  })

  it("still sends totally invalid prefixes to the community root", () => {
    const html = renderFor("de", "/de/cat-speak/news")

    expect(html).toContain('data-to="/zh/community"')
  })

  it("renders the outlet for supported languages", () => {
    const html = renderFor("en", "/en/cat-speak/news")

    expect(html).toContain('data-testid="outlet"')
  })
})
