// @vitest-environment happy-dom
import React, { act } from "react"
import { createRoot } from "react-dom/client"
import { describe, expect, it, vi } from "vitest"
import LandingPage from "./LandingPage"

const { openAuthModal } = vi.hoisted(() => ({ openAuthModal: vi.fn() }))

vi.mock("@/shared/context/AuthModalContext", () => ({
  useAuthModal: () => ({ openAuthModal }),
}))

vi.mock("@/features/landing/components/HeroSection", () => ({
  default: ({ openAuthModal: open }) => (
    <button type="button" onClick={() => open?.("forgot")}>
      hero-forgot
    </button>
  ),
}))

vi.mock("@/features/landing/components/LeadingTeamSection", () => ({
  default: ({ openAuthModal: open }) => (
    <button type="button" onClick={() => open?.("forgot")}>
      leading-forgot
    </button>
  ),
}))

vi.mock("@/features/landing/components/AISection", () => ({
  default: () => null,
}))

vi.mock("@/features/landing/components/PartnerNetworkSection", () => ({
  default: () => null,
}))
vi.mock("@/features/landing/components/LearningBarriersSection", () => ({
  default: () => null,
}))
vi.mock("@/features/landing/components/SolutionSection", () => ({
  default: () => null,
}))
vi.mock("@/features/landing/components/CoreFeaturesSection", () => ({
  default: () => null,
}))
vi.mock("@/features/landing/components/ResponseSection", () => ({
  default: () => null,
}))
vi.mock("@/features/landing/components/HowItWorksSection", () => ({
  default: () => null,
}))
vi.mock("@/features/landing/components/TargetAudienceSection", () => ({
  default: () => null,
}))
vi.mock("@/features/landing/components/MethodComparisonSection", () => ({
  default: () => null,
}))
vi.mock("@/features/landing/components/TrustSection", () => ({
  default: () => null,
}))
vi.mock("@/features/landing/components/AchievementsSection", () => ({
  default: () => null,
}))
vi.mock("@/features/landing/components/FAQSection", () => ({
  default: () => null,
}))
vi.mock("@/features/landing/components/LandingContactSection", () => ({
  default: () => null,
}))

describe("ISS-05: LandingPage delegates auth modals to MainLayout context", () => {
  it("opens the shared 'forgot' mode from the hero and leading sections", () => {
    const container = document.createElement("div")
    const root = createRoot(container)

    act(() => {
      root.render(<LandingPage />)
    })

    const buttons = [...container.querySelectorAll("button")]
    const hero = buttons.find((button) => button.textContent === "hero-forgot")
    const leading = buttons.find(
      (button) => button.textContent === "leading-forgot",
    )

    act(() => {
      hero.dispatchEvent(new MouseEvent("click", { bubbles: true }))
    })
    act(() => {
      leading.dispatchEvent(new MouseEvent("click", { bubbles: true }))
    })

    expect(openAuthModal).toHaveBeenCalledTimes(2)
    expect(openAuthModal).toHaveBeenNthCalledWith(1, "forgot")
    expect(openAuthModal).toHaveBeenNthCalledWith(2, "forgot")
  })
})
