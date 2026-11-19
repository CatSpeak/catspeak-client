// @vitest-environment happy-dom
import React, { act } from "react"
import { createRoot } from "react-dom/client"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import SessionActionButtons from "./SessionActionButtons"

const { routeState, navigateMock } = vi.hoisted(() => ({
  routeState: { lang: "zh" },
  navigateMock: vi.fn(),
}))

vi.mock("react-router-dom", () => ({
  useNavigate: () => navigateMock,
  useParams: () => ({ lang: routeState.lang }),
}))

vi.mock("@/shared/context/LanguageContext", () => ({
  useLanguage: () => ({
    t: {
      rooms: {
        sessionActions: {
          connect11: "Kết nối 1:1",
          connect25: "Kết nối 2:5",
          customRoom: "Tạo phòng",
          aiChat: "Trò chuyện với AI",
        },
      },
    },
  }),
}))

describe("SessionActionButtons - AI Chat navigation", () => {
  let container
  let root
  let originalOpen

  beforeEach(() => {
    globalThis.IS_REACT_ACT_ENVIRONMENT = true
    container = document.createElement("div")
    document.body.appendChild(container)
    root = createRoot(container)
    routeState.lang = "zh"
    navigateMock.mockReset()
    originalOpen = window.open
    window.open = vi.fn()
  })

  afterEach(() => {
    act(() => {
      root.unmount()
    })
    container.remove()
    document.body.innerHTML = ""
    window.open = originalOpen
  })

  it("navigates to /zh/ai-tutor/speaking-room when clicking 'Trò chuyện với AI' in zh community", async () => {
    await act(async () => {
      root.render(
        <SessionActionButtons
          currentLang="zh"
          handleCreateOneOnOneSession={vi.fn()}
          handleCreateStudyGroupSession={vi.fn()}
          handleCreateAISession={vi.fn()}
          handleCreateCustomRoomSession={vi.fn()}
        />
      )
    })

    const buttons = Array.from(document.querySelectorAll("button"))
    const aiButton = buttons.find((btn) =>
      btn.textContent.includes("Trò chuyện với AI")
    )

    expect(aiButton).toBeDefined()

    await act(async () => {
      aiButton.click()
    })

    // Must navigate to the internal CatSpeak speaking room
    expect(navigateMock).toHaveBeenCalledWith("/zh/ai-tutor/speaking-room")
    // Must NOT open the dead external voxis.click domain
    expect(window.open).not.toHaveBeenCalled()
  })

  it("falls back to route param lang if currentLang is undefined", async () => {
    routeState.lang = "zh"

    await act(async () => {
      root.render(
        <SessionActionButtons
          handleCreateOneOnOneSession={vi.fn()}
          handleCreateStudyGroupSession={vi.fn()}
          handleCreateAISession={vi.fn()}
          handleCreateCustomRoomSession={vi.fn()}
        />
      )
    })

    const buttons = Array.from(document.querySelectorAll("button"))
    const aiButton = buttons.find((btn) =>
      btn.textContent.includes("Trò chuyện với AI")
    )
    expect(aiButton).toBeDefined()

    await act(async () => {
      aiButton.click()
    })

    expect(navigateMock).toHaveBeenCalledWith("/zh/ai-tutor/speaking-room")
  })

  it("calls custom onAiChatClick handler if provided", async () => {
    const handleCustomAiChat = vi.fn()

    await act(async () => {
      root.render(
        <SessionActionButtons
          currentLang="zh"
          onAiChatClick={handleCustomAiChat}
          handleCreateOneOnOneSession={vi.fn()}
          handleCreateStudyGroupSession={vi.fn()}
          handleCreateAISession={vi.fn()}
          handleCreateCustomRoomSession={vi.fn()}
        />
      )
    })

    const buttons = Array.from(document.querySelectorAll("button"))
    const aiButton = buttons.find((btn) =>
      btn.textContent.includes("Trò chuyện với AI")
    )

    await act(async () => {
      aiButton.click()
    })

    expect(handleCustomAiChat).toHaveBeenCalledTimes(1)
    expect(navigateMock).not.toHaveBeenCalled()
  })

  it.each(["en", "vi", "ja"])(
    "does not render 'Trò chuyện với AI' in %s community",
    async (lang) => {
      routeState.lang = lang

      await act(async () => {
        root.render(
          <SessionActionButtons
            currentLang={lang}
            handleCreateOneOnOneSession={vi.fn()}
            handleCreateStudyGroupSession={vi.fn()}
            handleCreateAISession={vi.fn()}
            handleCreateCustomRoomSession={vi.fn()}
          />
        )
      })

      const buttons = Array.from(document.querySelectorAll("button"))
      const aiButton = buttons.find((btn) =>
        btn.textContent.includes("Trò chuyện với AI")
      )

      expect(aiButton).toBeUndefined()
    }
  )
})
