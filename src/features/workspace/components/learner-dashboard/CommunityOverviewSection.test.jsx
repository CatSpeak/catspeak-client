// @vitest-environment happy-dom
import React, { act } from "react"
import { createRoot } from "react-dom/client"
import { beforeEach, describe, expect, it, vi } from "vitest"
import CommunityOverviewSection from "./CommunityOverviewSection"

const mocks = vi.hoisted(() => ({ navigate: vi.fn() }))

vi.mock("react-router-dom", async (importOriginal) => ({
  ...(await importOriginal()),
  useNavigate: () => mocks.navigate,
}))

vi.mock("@/shared/context/LanguageContext", () => ({
  useLanguage: () => ({ language: "vi" }),
}))

const render = (data) => {
  const container = document.createElement("div")
  const root = createRoot(container)
  act(() => {
    root.render(<CommunityOverviewSection data={data} />)
  })
  return container
}

const clickAll = (container) => {
  const buttons = [...container.querySelectorAll("button")]
  expect(buttons).toHaveLength(5)
  for (const button of buttons) {
    act(() => {
      button.dispatchEvent(new MouseEvent("click", { bubbles: true }))
    })
  }
}

describe("ISS-13: CommunityOverviewSection fallback URLs", () => {
  beforeEach(() => {
    mocks.navigate.mockClear()
  })

  it("falls back to real workspace routes when the API omits targetUrl", () => {
    const container = render({})

    clickAll(container)

    expect(mocks.navigate.mock.calls.map(([url]) => url)).toEqual([
      "/workspace/profile?tab=friends",
      "/workspace/rooms",
      "/workspace/reels",
      "/workspace/reels",
      "/workspace/profile?tab=home",
    ])
  })
})
