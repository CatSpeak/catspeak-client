import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it, vi } from "vitest"
import AiTutorLayout from "./AiTutorLayout"

const { routeState } = vi.hoisted(() => ({
  routeState: { lang: "zh", pathname: "/zh/ai-tutor/learning-path", search: "" },
}))

vi.mock("react-router-dom", async (importOriginal) => ({
  ...(await importOriginal()),
  useParams: () => ({ lang: routeState.lang }),
  useLocation: () => ({
    pathname: routeState.pathname,
    search: routeState.search,
  }),
  Outlet: () => <div>ai-tutor-outlet</div>,
  Link: ({ children, to }) => <a href={to}>{children}</a>,
}))

vi.mock("@/shared/pages", () => ({
  PageNotFound: () => <div>not-found</div>,
}))

describe("AiTutorLayout", () => {
  it("renders the AI Tutor outlet in the Chinese community", () => {
    routeState.lang = "zh"
    routeState.pathname = "/zh/ai-tutor/learning-path"

    const html = renderToStaticMarkup(<AiTutorLayout />)

    expect(html).toContain("ai-tutor-outlet")
    expect(html).not.toContain("not-found")
  })

  it.each(["en", "ja"])(
    "explains that AI Tutor only supports zh in the %s community",
    (lang) => {
      routeState.lang = lang
      routeState.pathname = `/${lang}/ai-tutor/learning-path`
      routeState.search = "?day=2"

      const html = renderToStaticMarkup(<AiTutorLayout />)

      expect(html).not.toContain("not-found")
      expect(html).not.toContain("ai-tutor-outlet")
      expect(html).toContain("zh")
      expect(html).toContain('href="/zh/ai-tutor/learning-path?day=2"')
      expect(html).toContain(`href="/${lang}/community"`)
    },
  )

  it("falls back to the zh learning path when no subpath is present", () => {
    routeState.lang = "ja"
    routeState.pathname = ""
    routeState.search = ""

    const html = renderToStaticMarkup(<AiTutorLayout />)

    expect(html).toContain('href="/zh/ai-tutor/learning-path"')
  })
})
