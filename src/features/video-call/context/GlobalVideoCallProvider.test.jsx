// @vitest-environment happy-dom
import React, { useEffect } from "react"
import { createRoot } from "react-dom/client"
import { act } from "react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

const store = vi.hoisted(() => ({
  inCall: false,
  token: null,
  callInfo: { sessionId: "s1", user: { accountId: 7 } },
  publish: true,
}))

vi.mock("react-redux", () => ({
  useSelector: (selector) =>
    selector({
      videoCall: {
        isInCall: store.inCall,
        livekitToken: store.token,
        livekitServerUrl: "ws://livekit.test",
        callInfo: store.callInfo,
      },
      auth: { user: { accountId: 7 } },
    }),
  useDispatch: () => () => {},
}))

vi.mock("@livekit/components-react", async (importOriginal) => ({
  ...(await importOriginal()),
  LiveKitRoom: ({ children }) => (
    <div data-testid="livekit-room">{children}</div>
  ),
}))

vi.mock("@/features/video-call/hooks/useVideoCallAuthHeartbeat", () => ({
  useVideoCallAuthHeartbeat: () => {},
}))

vi.mock("@/features/video-call/services/callBroadcastChannel", () => ({
  subscribeToCallBroadcast: () => () => {},
  broadcastCallEvent: () => {},
  BROADCAST_EVENT_TYPES: {
    PING_ACTIVE_CALL: "ping",
    PONG_ACTIVE_CALL: "pong",
    REQUEST_LEAVE_CALL: "leave",
  },
}))

vi.mock("@/features/video-call/utils/userPreferences", () => ({
  getUserPref: (_accountId, _key, options) => options?.defaultValue ?? null,
  setUserPref: () => {},
}))

vi.mock("@/features/video-call/utils/callPolicy", () => ({
  resolveCallPolicy: () => ({}),
}))

vi.mock("@/features/video-call/utils/roomOptions", () => ({
  buildRoomOptions: () => ({}),
}))

vi.mock("./GlobalCallContent", async () => {
  const ReactModule = await import("react")
  const MockGlobalCallContent = ({ onSync, onClear, panelState }) => {
    const publishEnabled = store.publish
    const value = ReactModule.useMemo(
      () => ({
        isInCall: true,
        user: { accountId: 7 },
        room: { id: 1 },
        sessionId: "s1",
        isCallReady: false,
        panelState,
      }),
      [panelState],
    )

    ReactModule.useLayoutEffect(() => {
      if (!publishEnabled) return
      onSync?.({ name: "lk-room" }, value)
    }, [onSync, value, publishEnabled])
    ReactModule.useEffect(() => () => onClear?.(), [onClear])

    return ReactModule.createElement(
      "div",
      {
        "data-testid": "call-content",
        "data-panel": panelState?.activeSidePanel ?? "",
      },
      ReactModule.createElement(
        "button",
        {
          type: "button",
          "data-testid": "toggle-panel",
          onClick: () =>
            panelState?.setShowChat?.(
              panelState.activeSidePanel !== "chat",
            ),
        },
        "toggle-panel",
      ),
      "call-content",
    )
  }
  return { default: MockGlobalCallContent }
})

import { GlobalVideoCallProvider, useGlobalVideoCall } from "./GlobalVideoCallProvider"
import { useMaybeRoomContext } from "@livekit/components-react"

const mounts = { count: 0 }
const unmounts = { count: 0 }

const Child = () => {
  const { isCallReady, user } = useGlobalVideoCall()
  const lkRoom = useMaybeRoomContext()
  useEffect(() => {
    mounts.count += 1
    return () => {
      unmounts.count += 1
    }
  }, [])
  return (
    <div
      data-testid="child"
      data-ready={String(isCallReady)}
      data-user={user?.accountId ?? ""}
      data-room={lkRoom?.name ?? ""}
    >
      app-child
    </div>
  )
}

describe("ISS-79: GlobalVideoCallProvider keeps the app tree mounted", () => {
  let container
  let root

  beforeEach(() => {
    store.inCall = false
    store.token = null
    store.publish = true
    mounts.count = 0
    unmounts.count = 0
    container = document.createElement("div")
    document.body.appendChild(container)
    root = createRoot(container)
  })

  afterEach(() => {
    act(() => root.unmount())
    container.remove()
  })

  it("mounts children once while isInCall cycles false -> true -> false", async () => {
    await act(async () => {
      root.render(
        <GlobalVideoCallProvider>
          <Child />
        </GlobalVideoCallProvider>,
      )
    })

    const childNode = container.querySelector('[data-testid="child"]')
    expect(childNode).toBeTruthy()
    expect(mounts.count).toBe(1)

    store.inCall = true
    store.token = "livekit-token"

    await act(async () => {
      root.render(
        <GlobalVideoCallProvider>
          <Child />
        </GlobalVideoCallProvider>,
      )
    })

    expect(container.querySelector('[data-testid="livekit-room"]')).toBeTruthy()
    expect(container.querySelector('[data-testid="call-content"]')).toBeTruthy()
    expect(container.querySelector('[data-testid="child"]')).toBe(childNode)
    expect(mounts.count).toBe(1)
    expect(unmounts.count).toBe(0)
    expect(childNode.getAttribute("data-ready")).toBe("true")
    expect(childNode.getAttribute("data-user")).toBe("7")

    store.inCall = false
    store.token = null

    await act(async () => {
      root.render(
        <GlobalVideoCallProvider>
          <Child />
        </GlobalVideoCallProvider>,
      )
    })

    expect(container.querySelector('[data-testid="livekit-room"]')).toBeNull()
    expect(container.querySelector('[data-testid="child"]')).toBe(childNode)
    expect(mounts.count).toBe(1)
    expect(unmounts.count).toBe(0)
    expect(childNode.getAttribute("data-ready")).toBe("false")
  })

  it("Vòng 3 (#185): real useSidePanelState toggles converge without a sync loop", async () => {
    store.inCall = true
    store.token = "livekit-token"

    const renderTree = () =>
      root.render(
        <GlobalVideoCallProvider>
          <Child />
        </GlobalVideoCallProvider>,
      )

    await act(async () => {
      renderTree()
    })

    const childNode = container.querySelector('[data-testid="child"]')
    expect(childNode.getAttribute("data-ready")).toBe("true")
    expect(childNode.getAttribute("data-room")).toBe("lk-room")

    const clickToggle = async () => {
      await act(async () => {
        container
          .querySelector('[data-testid="toggle-panel"]')
          .dispatchEvent(new MouseEvent("click", { bubbles: true }))
      })
    }

    await clickToggle()
    expect(
      container.querySelector('[data-testid="call-content"]').getAttribute(
        "data-panel",
      ),
    ).toBe("chat")

    await clickToggle()
    expect(
      container.querySelector('[data-testid="call-content"]').getAttribute(
        "data-panel",
      ),
    ).toBe("")

    await clickToggle()
    expect(
      container.querySelector('[data-testid="call-content"]').getAttribute(
        "data-panel",
      ),
    ).toBe("chat")

    expect(container.querySelector('[data-testid="child"]')).toBe(childNode)
    expect(mounts.count).toBe(1)
    expect(unmounts.count).toBe(0)
  })

  it("Vòng 3: RoomContext is undefined until the current session syncs", async () => {
    store.inCall = true
    store.token = "livekit-token"
    store.publish = false

    const renderTree = () =>
      root.render(
        <GlobalVideoCallProvider>
          <Child />
        </GlobalVideoCallProvider>,
      )

    await act(async () => {
      renderTree()
    })

    const childNode = container.querySelector('[data-testid="child"]')
    expect(childNode.getAttribute("data-ready")).toBe("false")
    expect(childNode.getAttribute("data-room")).toBe("")

    store.publish = true

    await act(async () => {
      renderTree()
    })

    expect(container.querySelector('[data-testid="child"]')).toBe(childNode)
    expect(childNode.getAttribute("data-ready")).toBe("true")
    expect(childNode.getAttribute("data-room")).toBe("lk-room")
    expect(mounts.count).toBe(1)
    expect(unmounts.count).toBe(0)
  })
})
