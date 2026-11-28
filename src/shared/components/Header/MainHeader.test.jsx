import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it, vi } from "vitest"
import MainHeader from "./MainHeader"

vi.mock("react-router-dom", async (importOriginal) => ({
  ...(await importOriginal()),
  Link: ({ children }) => <a href="/">{children}</a>,
  useLocation: () => ({ pathname: "/zh/cat-speak/learning-path" }),
}))

vi.mock("@/features/auth", () => ({
  useAuth: () => ({ isAuthenticated: false }),
}))

vi.mock("./HeaderUserControls", () => ({ default: () => null }))
vi.mock("./HeaderGuestControls", () => ({ default: () => null }))
vi.mock("./GuestSettingsControls", () => ({ default: () => null }))
vi.mock("./CommunitySwitcher", () => ({ default: () => null }))
vi.mock("./OnlinePresence", () => ({ default: () => null }))
vi.mock("./HeaderSearchBar", () => ({ default: () => null }))
vi.mock("@/shared/components/ui/LanguageSwitcher", () => ({ default: () => null }))
vi.mock("@/shared/components/ui/ThemeToggle", () => ({ default: () => null }))

describe("MainHeader learning path title", () => {
  it("keeps the 5-day path label readable in dark mode", () => {
    const html = renderToStaticMarkup(<MainHeader />)

    expect(html).toContain("Lộ trình 5 ngày")
    expect(html).toContain("text-gray-900 dark:text-white")
    expect(html).toContain("dark:text-[#FF7A8A]")
  })
})
