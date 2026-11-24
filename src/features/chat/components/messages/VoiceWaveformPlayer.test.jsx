// @vitest-environment happy-dom
import React, { act } from "react"
import { createRoot } from "react-dom/client"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import VoiceWaveformPlayer from "./VoiceWaveformPlayer"

vi.mock("@/shared/context/LanguageContext", () => ({
  useLanguage: () => ({ t: {} }),
}))

vi.mock("@/shared/utils/authenticatedMedia", () => ({
  useAuthenticatedMediaUrl: (url) => ({ url }),
}))

describe("VoiceWaveformPlayer", () => {
  let container
  let root

  beforeEach(() => {
    globalThis.IS_REACT_ACT_ENVIRONMENT = true
    container = document.createElement("div")
    document.body.appendChild(container)
    root = createRoot(container)
  })

  afterEach(() => {
    act(() => {
      root.unmount()
    })
    container.remove()
  })

  const renderAndGetHeights = (messageId) => {
    act(() => {
      root.render(
        <VoiceWaveformPlayer
          audioUrl="/api/chat/1/attachment/voice.webm"
          messageId={messageId}
          duration={12}
        />,
      )
    })
    return Array.from(container.querySelectorAll('[style*="height:"]')).map(
      (el) => el.style.height,
    )
  }

  it("renders deterministic bounded waveform bars using Math.trunc hash truncation", () => {
    const firstRender = renderAndGetHeights("voice-message-seed-42")
    const secondRender = renderAndGetHeights("voice-message-seed-42")
    const differentSeed = renderAndGetHeights("different-message-seed-99")

    expect(firstRender).toHaveLength(32)
    expect(secondRender).toEqual(firstRender)
    expect(differentSeed).not.toEqual(firstRender)

    for (const height of firstRender) {
      const numeric = Number.parseInt(height, 10)
      expect(numeric).toBeGreaterThanOrEqual(20)
      expect(numeric).toBeLessThanOrEqual(95)
    }
  })
})
