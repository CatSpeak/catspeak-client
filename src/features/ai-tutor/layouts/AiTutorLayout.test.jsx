import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it, vi } from "vitest"
import AiTutorLayout from "./AiTutorLayout"

const { routeState } = vi.hoisted(() => ({ routeState: { lang: "zh" } }))

vi.mock("react-router-dom", async (importOriginal) => ({
  ...(await importOriginal()),
  useParams: () => ({ lang: routeState.lang }),
  Outlet: () => <div>ai-tutor-outlet</div>,
}))

vi.mock("@/shared/pages", () => ({
  PageNotFound: () => <div>not-found</div>,
}))

describe("AiTutorLayout", () => {
  it("renders the AI Tutor outlet in the Chinese community", () => {
    routeState.lang = "zh"

    const html = renderToStaticMarkup(<AiTutorLayout />)

    expect(html).toContain("ai-tutor-outlet")
    expect(html).not.toContain("not-found")
  })

  it.each(["en", "ja"])(
    "renders a 404 in the %s community",
    (lang) => {
      routeState.lang = lang

      const html = renderToStaticMarkup(<AiTutorLayout />)

      expect(html).toContain("not-found")
      expect(html).not.toContain("ai-tutor-outlet")
    },
  )
})
