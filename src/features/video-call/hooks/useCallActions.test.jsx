// @vitest-environment happy-dom
import React, { act, useEffect } from "react"
import { createRoot } from "react-dom/client"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

globalThis.IS_REACT_ACT_ENVIRONMENT = true

const dispatch = vi.hoisted(() => vi.fn())
const navigate = vi.hoisted(() => vi.fn())
const toastSuccess = vi.hoisted(() => vi.fn())
const toastError = vi.hoisted(() => vi.fn())

vi.mock("react-redux", () => ({ useDispatch: () => dispatch }))
vi.mock("@/store/api/moderationApi", () => ({
  useMaskTextMutation: () => [vi.fn()],
}))
vi.mock("@/store/slices/videoCallSlice", () => ({
  setPiP: (value) => ({ type: "setPiP", payload: value }),
  setPipFallbackMode: (value) => ({ type: "setPipFallbackMode", payload: value }),
  leaveCall: () => ({ type: "leaveCall" }),
}))
vi.mock("./useNavigateRef", () => ({ getNavigate: () => navigate }))
vi.mock("react-hot-toast", () => ({
  toast: { success: toastSuccess, error: toastError },
}))

import { useCallActions } from "./useCallActions"

const t = {
  rooms: {
    videoCall: {
      pipActivated: "Đã bật Hình trong Hình",
      pipFallback:
        "Trình duyệt đã chặn Hình trong Hình — đang hiển thị trình phát mini trong ứng dụng.",
      pipNotAvailable: "Hình trong Hình không khả dụng trong môi trường này.",
    },
  },
}

const makeCover = () => {
  const capture = vi.fn()
  const Probe = () => {
    const actions = useCallActions({
      t,
      language: "en",
      isPiP: false,
      callInfo: { callPath: "/en/meet/room-1" },
      toggleAudioFn: vi.fn(),
      toggleVideoFn: vi.fn(),
      leaveMeetingFn: vi.fn(),
      screenShareState: { toggleScreenShare: vi.fn() },
      chatSend: vi.fn(),
      setActiveSidePanel: vi.fn(),
    })
    useEffect(() => {
      capture(actions)
    }, [actions])
    return null
  }
  return { capture, Probe }
}

describe("ISS-85: enterPiP never silently no-ops", () => {
  let container
  let root

  beforeEach(() => {
    dispatch.mockClear()
    navigate.mockClear()
    toastSuccess.mockClear()
    toastError.mockClear()
    delete window.documentPictureInPicture
    delete window.__pipWindow
    delete window.__activePipWindow

    container = document.createElement("div")
    document.body.appendChild(container)
    root = createRoot(container)
  })

  afterEach(() => {
    act(() => root.unmount())
    document.body.innerHTML = ""
    delete window.documentPictureInPicture
    delete window.__pipWindow
    delete window.__activePipWindow
  })

  const renderHook = async () => {
    const { capture, Probe } = makeCover()
    await act(async () => {
      root.render(<Probe />)
    })
    return capture.mock.calls.at(-1)[0]
  }

  it("returns to the community page through the in-app fallback when the window is already closed", async () => {
    window.documentPictureInPicture = {
      requestWindow: vi.fn().mockResolvedValue({ closed: true }),
    }
    const actions = await renderHook()

    await act(async () => {
      await actions.enterPiP("/en/community")
    })

    expect(dispatch).toHaveBeenCalledWith({
      type: "setPipFallbackMode",
      payload: true,
    })
    expect(dispatch).toHaveBeenCalledWith({ type: "setPiP", payload: true })
    expect(navigate).toHaveBeenCalledWith("/en/community")
    expect(toastSuccess).toHaveBeenCalledWith(
      t.rooms.videoCall.pipFallback,
      expect.any(Object),
    )
  })

  it("returns to the community page through the in-app fallback when requestWindow throws", async () => {
    window.documentPictureInPicture = {
      requestWindow: vi.fn().mockRejectedValue(new Error("denied")),
    }
    const actions = await renderHook()

    await act(async () => {
      await actions.enterPiP()
    })

    expect(dispatch).toHaveBeenCalledWith({
      type: "setPipFallbackMode",
      payload: true,
    })
    expect(navigate).toHaveBeenCalledWith("/en/community")
    expect(toastSuccess).toHaveBeenCalledWith(
      t.rooms.videoCall.pipFallback,
      expect.any(Object),
    )
  })

  it("activates PiP, shows the toast and keeps the explicit target", async () => {
    const pipWin = { closed: false }
    window.documentPictureInPicture = {
      requestWindow: vi.fn().mockResolvedValue(pipWin),
    }
    const actions = await renderHook()

    await act(async () => {
      await actions.enterPiP("/en/community")
    })

    expect(dispatch).toHaveBeenCalledWith({
      type: "setPipFallbackMode",
      payload: false,
    })
    expect(dispatch).toHaveBeenCalledWith({ type: "setPiP", payload: true })
    expect(navigate).toHaveBeenCalledWith("/en/community")
    expect(window.__activePipWindow).toBe(pipWin)
    expect(toastSuccess).toHaveBeenCalledWith(
      t.rooms.videoCall.pipActivated,
      expect.any(Object),
    )
  })
})
