// @vitest-environment happy-dom
import React, { act } from "react"
import { createRoot } from "react-dom/client"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

globalThis.IS_REACT_ACT_ENVIRONMENT = true

const FONT_SIZES = [
  ["default", "Mặc định"],
  ["xs", "Rất nhỏ"],
  ["sm", "Nhỏ"],
  ["md", "Vừa"],
  ["lg", "Lớn"],
  ["xl", "Rất lớn"],
  ["2xl", "Lớn nhất"],
]

const t = {
  rooms: {
    videoCall: {
      subtitles: "Phụ đề",
      fontSize: "Cỡ chữ",
      subtitleWaiting: "Phụ đề sẽ xuất hiện khi có người nói...",
      subtitleLanguages: { en: "Tiếng Anh" },
      displayLanguage: "Ngôn ngữ hiển thị",
      fontSizes: Object.fromEntries(FONT_SIZES),
      controls: { captionsOff: "Tắt phụ đề" },
    },
  },
}

vi.mock("@/features/video-call/context/GlobalVideoCallProvider", () => ({
  useGlobalVideoCall: () => ({
    room: { languageType: "English" },
    subtitleSelectedLanguage: "en",
    isStartingSubtitles: false,
    isStoppingSubtitles: false,
    stopSubtitles: vi.fn(),
    changeSubtitleLanguage: vi.fn(),
  }),
}))

vi.mock("@/features/video-call/hooks/useSubtitles", () => ({
  useSubtitles: () => ({ subtitles: [] }),
}))

vi.mock("@/shared/context/LanguageContext", () => ({
  useLanguage: () => ({ t, language: "vi" }),
}))

import SubtitleOverlayNonAI from "./SubtitleOverlayNonAI"

describe("ISS-84: subtitle font-size menu is never clipped", () => {
  let container
  let root

  beforeEach(() => {
    localStorage.clear()
    container = document.createElement("div")
    document.body.appendChild(container)
    root = createRoot(container)
    act(() => {
      root.render(<SubtitleOverlayNonAI showRoomSubtitles />)
    })
  })

  afterEach(() => {
    act(() => root.unmount())
    document.body.innerHTML = ""
  })

  it("keeps the h-52 container from clipping overflowing children", () => {
    const box = container.querySelector(".h-52")
    expect(box).toBeTruthy()
    expect(box.className).not.toContain("overflow-hidden")

    const scrollArea = container.querySelector(".overscroll-contain")
    expect(scrollArea.className).toContain("rounded-b-2xl")
  })

  it("opens the font-size menu upwards with its own scroll area", () => {
    const trigger = container.querySelector('button[title="Cỡ chữ"]')
    expect(trigger).toBeTruthy()

    act(() => {
      trigger.dispatchEvent(new MouseEvent("click", { bubbles: true }))
    })

    const menu = container.querySelector(".bottom-full")
    expect(menu).toBeTruthy()
    expect(menu.className).toContain("right-0")
    expect(menu.className).toContain("mb-2")
    expect(menu.className).toContain("max-h-[min(280px,42dvh)]")
    expect(menu.className).toContain("overflow-y-auto")
    expect(menu.className).not.toContain("top-full")
  })

  it("renders all seven font-size options", () => {
    const trigger = container.querySelector('button[title="Cỡ chữ"]')
    act(() => {
      trigger.dispatchEvent(new MouseEvent("click", { bubbles: true }))
    })

    const menu = container.querySelector(".bottom-full")
    const labels = [...menu.querySelectorAll("button")].map((b) =>
      b.textContent.trim(),
    )
    expect(labels).toEqual(FONT_SIZES.map(([, label]) => label))
  })
})
