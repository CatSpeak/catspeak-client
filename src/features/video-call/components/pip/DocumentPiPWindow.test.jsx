// @vitest-environment happy-dom
import React, { act } from "react"
import { createRoot } from "react-dom/client"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

globalThis.IS_REACT_ACT_ENVIRONMENT = true

const storeMock = vi.hoisted(() => ({
  dispatch: vi.fn(),
  getState: () => ({ videoCall: { isPiP: true } }),
}))
const returnToCall = vi.hoisted(() => vi.fn())
const navigate = vi.hoisted(() => vi.fn())
const toastSuccess = vi.hoisted(() => vi.fn())

vi.mock("@store", () => ({ store: storeMock }))
vi.mock("@/store/slices/videoCallSlice", () => ({
  setPipFallbackMode: (value) => ({ type: "setPipFallbackMode", payload: value }),
}))
vi.mock("@/features/video-call/context/GlobalVideoCallProvider", () => ({
  useGlobalVideoCall: () => ({ returnToCall }),
}))
vi.mock("@/features/video-call/hooks/useNavigateRef", () => ({
  getNavigate: () => navigate,
}))
vi.mock("@/shared/context/LanguageContext", () => ({
  useLanguage: () => ({
    t: {
      rooms: {
        videoCall: {
          pipFallback:
            "Trình duyệt đã chặn Hình trong Hình — đang hiển thị trình phát mini trong ứng dụng.",
        },
      },
    },
    language: "en",
  }),
}))
vi.mock("react-hot-toast", () => ({
  toast: { success: toastSuccess },
}))

import DocumentPiPWindow from "./DocumentPiPWindow"

const makePipWindow = () => {
  const pipDocument = document.implementation.createHTMLDocument("pip")
  const pipWin = {
    closed: false,
    document: pipDocument,
    listeners: {},
    close: vi.fn(() => {
      pipWin.closed = true
    }),
    addEventListener: (type, handler) => {
      pipWin.listeners[type] = handler
    },
  }
  return pipWin
}

describe("ISS-85: premature Document PiP close falls back instead of returning silently", () => {
  let container
  let root
  let pipWin

  beforeEach(() => {
    storeMock.dispatch.mockClear()
    returnToCall.mockClear()
    navigate.mockClear()
    toastSuccess.mockClear()
    delete window.__pipWindowPromise
    delete window.__activePipWindow

    pipWin = makePipWindow()
    window.documentPictureInPicture = {
      requestWindow: vi.fn().mockResolvedValue(pipWin),
    }

    container = document.createElement("div")
    document.body.appendChild(container)
    root = createRoot(container)
  })

  afterEach(() => {
    act(() => root.unmount())
    document.body.innerHTML = ""
    delete window.documentPictureInPicture
    delete window.__activePipWindow
    vi.useRealTimers()
  })

  const renderPiP = async () => {
    await act(async () => {
      root.render(
        <DocumentPiPWindow>
          <span>call</span>
        </DocumentPiPWindow>,
      )
    })
  }

  it("shows the in-app fallback and leaves /meet when the OS window closes immediately", async () => {
    window.history.replaceState(null, "", "/en/meet/room-1")
    await renderPiP()
    expect(pipWin.listeners.pagehide).toBeTypeOf("function")

    pipWin.closed = true
    act(() => {
      pipWin.listeners.pagehide()
    })

    expect(storeMock.dispatch).toHaveBeenCalledWith({
      type: "setPipFallbackMode",
      payload: true,
    })
    expect(navigate).toHaveBeenCalledWith("/en/community")
    expect(toastSuccess).toHaveBeenCalledWith(
      "Trình duyệt đã chặn Hình trong Hình — đang hiển thị trình phát mini trong ứng dụng.",
      expect.any(Object),
    )
    expect(returnToCall).not.toHaveBeenCalled()
  })

  it("returns to the call when the user closes a window that was working", async () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date("2026-01-01T00:00:00Z"))
    await renderPiP()

    vi.setSystemTime(new Date("2026-01-01T00:00:02Z"))
    pipWin.closed = true
    act(() => {
      pipWin.listeners.pagehide()
    })

    expect(returnToCall).toHaveBeenCalledTimes(1)
    expect(storeMock.dispatch).not.toHaveBeenCalledWith({
      type: "setPipFallbackMode",
      payload: true,
    })
    expect(toastSuccess).not.toHaveBeenCalled()
  })
})
