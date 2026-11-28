// @vitest-environment happy-dom
import React, { act } from "react"
import { createRoot } from "react-dom/client"
import { renderToStaticMarkup } from "react-dom/server"
import { afterEach, describe, expect, it, vi } from "vitest"

globalThis.IS_REACT_ACT_ENVIRONMENT = true

vi.mock("react-router-dom", async (importOriginal) => ({
  ...(await importOriginal()),
  useNavigate: () => vi.fn(),
  useParams: () => ({}),
  Outlet: () => null,
}))

vi.mock("@/shared/context/LanguageContext", () => ({
  useLanguage: () => ({
    t: { catSpeak: { reels: { uploadReel: "Đăng tải Reel" } } },
  }),
}))

vi.mock("@/shared/hooks/useTimezone", () => ({
  useTimezone: () => ({ formatDate: vi.fn(), userTimeZone: "UTC" }),
}))

vi.mock("@/features/auth", () => ({
  useAuth: () => ({ user: { accountId: 7 } }),
}))

vi.mock("@/shared/components/ui/navigation/Tabs", () => ({
  default: () => null,
  TabContent: ({ children }) => <div>{children}</div>,
}))

vi.mock("../components/modals/CreateReelModal", () => ({
  default: ({ open }) => (
    <div data-testid="create-reel" data-open={String(open)} />
  ),
}))

vi.mock("../components/tabs/WorkspaceMyReelsTab", () => ({
  default: () => null,
}))
vi.mock("../components/tabs/WorkspacePlaylistsTab", () => ({
  default: () => null,
}))

import WorkspaceReelsPage from "./WorkspaceReelsPage"

describe("ISS-55: upload reel button on mobile", () => {
  afterEach(() => {
    document.body.innerHTML = ""
  })

  it("keeps the label visible and renders the plus icon", () => {
    const html = renderToStaticMarkup(<WorkspaceReelsPage />)

    expect(html).toContain("Đăng tải Reel")
    expect(html).not.toContain("hidden sm:inline")
    expect(html).toMatch(/<button[^>]*>[\s\S]*<svg/)
  })

  it("opens CreateReelModal when clicked", () => {
    const container = document.createElement("div")
    document.body.appendChild(container)
    const root = createRoot(container)

    act(() => {
      root.render(<WorkspaceReelsPage />)
    })

    const button = [...container.querySelectorAll("button")].find((item) =>
      item.textContent.includes("Đăng tải Reel"),
    )
    act(() => {
      button.dispatchEvent(new MouseEvent("click", { bubbles: true }))
    })

    const modal = container.querySelector('[data-testid="create-reel"]')
    expect(modal?.getAttribute("data-open")).toBe("true")
  })
})
