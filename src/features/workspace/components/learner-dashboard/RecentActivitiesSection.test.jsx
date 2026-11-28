// @vitest-environment happy-dom
import React, { act } from "react"
import { createRoot } from "react-dom/client"
import { beforeEach, describe, expect, it, vi } from "vitest"
import RecentActivitiesSection from "./RecentActivitiesSection"

const mocks = vi.hoisted(() => ({ navigate: vi.fn() }))

vi.mock("react-router-dom", async (importOriginal) => ({
  ...(await importOriginal()),
  useNavigate: () => mocks.navigate,
}))

vi.mock("@/shared/context/LanguageContext", () => ({
  useLanguage: () => ({ language: "vi" }),
}))

const render = () => {
  const container = document.createElement("div")
  const root = createRoot(container)
  act(() => {
    root.render(<RecentActivitiesSection activities={[]} />)
  })
  return container
}

describe("ISS-13: learner dashboard recent activities 'Xem tất cả'", () => {
  beforeEach(() => {
    mocks.navigate.mockClear()
  })

  it("opens the home tab timeline instead of the removed activity tab", () => {
    const container = render()

    const viewAll = [...container.querySelectorAll("button")].find((button) =>
      button.textContent.includes("Xem tất cả"),
    )
    expect(viewAll).toBeTruthy()

    act(() => {
      viewAll.dispatchEvent(new MouseEvent("click", { bubbles: true }))
    })

    expect(mocks.navigate).toHaveBeenCalledWith("/workspace/profile?tab=home")
  })
})
