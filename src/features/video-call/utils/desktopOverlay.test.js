import { afterEach, describe, expect, it, vi } from "vitest"

import {
  ANNOTATION_PROTOCOL_VERSION,
  ANNOTATION_TOPIC,
  buildStrokeStartPacket,
  validateAnnotationPacket,
} from "./annotationProtocol.js"
import {
  buildOverlayState,
  createDesktopOverlayBridge,
  evaluateOverlayLifecycle,
  overlayModeForTool,
  shouldHideInAppCanvas,
  translateOverlayEvent,
} from "./desktopOverlay.js"

const TRACK = "TR_screen_1"

const strokeItem = (overrides = {}) => ({
  id: "stroke-1",
  kind: "stroke",
  tool: "pen",
  color: "#ef4444",
  width: 4,
  authorId: "42",
  authorName: "An",
  pts: [
    [0.1, 0.2],
    [0.2, 0.3],
  ],
  ...overrides,
})

afterEach(() => {
  vi.useRealTimers()
})

describe("createDesktopOverlayBridge", () => {
  it("is inert when the Electron bridge is absent", async () => {
    const bridge = createDesktopOverlayBridge({})

    expect(bridge.available).toBe(false)
    await expect(bridge.start({ displayId: "1" })).resolves.toEqual({
      ok: false,
      error: "UNAVAILABLE",
    })
    await expect(bridge.setMode("draw")).resolves.toEqual({
      ok: false,
      error: "UNAVAILABLE",
    })
    expect(bridge.onEvent(() => {})).toBeTypeOf("function")
    expect(() => bridge.onEvent(() => {})()).not.toThrow()
  })

  it("forwards start/stop/setMode/updateState to the preload API", async () => {
    const overlay = {
      isAvailable: true,
      start: vi.fn().mockResolvedValue({ ok: true }),
      stop: vi.fn().mockResolvedValue({ ok: true }),
      setMode: vi.fn().mockResolvedValue({ ok: true }),
      updateState: vi.fn().mockResolvedValue({ ok: true }),
      onEvent: vi.fn(() => () => {}),
    }
    const bridge = createDesktopOverlayBridge({ catspeakDesktop: { overlay } })

    expect(bridge.available).toBe(true)
    await bridge.start({ displayId: "2" })
    await bridge.stop()
    await bridge.setMode("draw")
    await bridge.updateState({ tool: "pen" })

    expect(overlay.start).toHaveBeenCalledWith({ displayId: "2" })
    expect(overlay.stop).toHaveBeenCalled()
    expect(overlay.setMode).toHaveBeenCalledWith("draw")
    expect(overlay.updateState).toHaveBeenCalledWith({ tool: "pen" })
  })

  it("subscribes to overlay events and unsubscribes once", () => {
    let listener = null
    const unsubscribe = vi.fn()
    const overlay = {
      isAvailable: true,
      start: vi.fn(),
      onEvent: vi.fn((handler) => {
        listener = handler
        return unsubscribe
      }),
    }
    const bridge = createDesktopOverlayBridge({ catspeakDesktop: { overlay } })
    const handler = vi.fn()

    const off = bridge.onEvent(handler)
    listener({ type: "exit" })
    expect(handler).toHaveBeenCalledWith({ type: "exit" })

    off()
    off()
    expect(unsubscribe).toHaveBeenCalledTimes(1)
  })

  it("survives a handler that throws and a rejected IPC call", async () => {
    let listener = null
    const overlay = {
      isAvailable: true,
      start: vi.fn().mockRejectedValue(new Error("boom")),
      onEvent: vi.fn((handler) => {
        listener = handler
      }),
    }
    const bridge = createDesktopOverlayBridge({ catspeakDesktop: { overlay } })

    bridge.onEvent(() => {
      throw new Error("handler boom")
    })
    expect(() => listener({ type: "exit" })).not.toThrow()
    await expect(bridge.start({ displayId: "1" })).resolves.toEqual({
      ok: false,
      error: "FAILED",
    })
  })
})

describe("evaluateOverlayLifecycle", () => {
  const base = {
    bridgeAvailable: true,
    isPresenter: true,
    isFullDisplay: true,
    isShareActive: true,
    trackSid: TRACK,
    displayId: "2",
  }

  it("starts only for an eligible full-display local presenter share", () => {
    expect(evaluateOverlayLifecycle(base)).toBe("start")
    expect(evaluateOverlayLifecycle({ ...base, isPresenter: false })).toBe("idle")
    expect(evaluateOverlayLifecycle({ ...base, isFullDisplay: false })).toBe("idle")
    expect(evaluateOverlayLifecycle({ ...base, isShareActive: false })).toBe("idle")
    expect(evaluateOverlayLifecycle({ ...base, bridgeAvailable: false })).toBe("idle")
    expect(evaluateOverlayLifecycle({ ...base, displayId: null })).toBe("idle")
    expect(evaluateOverlayLifecycle({ ...base, trackSid: null })).toBe("idle")
  })

  it("keeps an overlay that is already on the current track", () => {
    expect(
      evaluateOverlayLifecycle({ ...base, overlayTrackSid: TRACK }),
    ).toBe("keep")
  })

  it("restarts when the share moves to another track", () => {
    expect(
      evaluateOverlayLifecycle({ ...base, overlayTrackSid: "TR_old" }),
    ).toBe("restart")
  })

  it("stops an active overlay as soon as eligibility is lost", () => {
    expect(
      evaluateOverlayLifecycle({
        ...base,
        isShareActive: false,
        overlayTrackSid: TRACK,
      }),
    ).toBe("stop")
    expect(
      evaluateOverlayLifecycle({
        ...base,
        isFullDisplay: false,
        overlayTrackSid: TRACK,
      }),
    ).toBe("stop")
  })

  it("honours a presenter exit until the track changes", () => {
    expect(
      evaluateOverlayLifecycle({
        ...base,
        overlayTrackSid: null,
        suppressedTrackSid: TRACK,
      }),
    ).toBe("idle")
    expect(
      evaluateOverlayLifecycle({
        ...base,
        overlayTrackSid: TRACK,
        suppressedTrackSid: TRACK,
      }),
    ).toBe("stop")
    expect(
      evaluateOverlayLifecycle({
        ...base,
        trackSid: "TR_new",
        suppressedTrackSid: TRACK,
      }),
    ).toBe("start")
  })

  it("maps mouse to mouse mode and every drawing tool to draw mode", () => {
    expect(overlayModeForTool("mouse")).toBe("mouse")
    expect(overlayModeForTool("pen")).toBe("draw")
    expect(overlayModeForTool("eraser")).toBe("draw")
  })

  it("hides every local in-app canvas only for a bridge-backed full-display share", () => {
    const base = {
      bridgeAvailable: true,
      isLocalPresenter: true,
      isFullDisplay: true,
      trackSid: TRACK,
    }

    expect(shouldHideInAppCanvas(base)).toBe(true)
    expect(shouldHideInAppCanvas({ ...base, isLocalPresenter: false })).toBe(false)
    expect(shouldHideInAppCanvas({ ...base, isFullDisplay: false })).toBe(false)
    expect(shouldHideInAppCanvas({ ...base, bridgeAvailable: false })).toBe(false)
    expect(shouldHideInAppCanvas({ ...base, trackSid: null })).toBe(false)
    expect(shouldHideInAppCanvas({ ...base, isMock: true })).toBe(false)
  })
})

describe("buildOverlayState", () => {
  it("carries items, lasers, tool state and permissions", () => {
    const state = buildOverlayState({
      items: [strokeItem()],
      lasers: [
        { authorName: "An", color: "#22c55e", trail: [{ x: 0.4, y: 0.5, ts: 1000 }] },
      ],
      tool: "highlighter",
      color: "#22c55e",
      width: 8,
      canAnnotate: true,
      presenterLocked: true,
      authorId: 42,
      authorName: "An",
    })

    expect(state.tool).toBe("highlighter")
    expect(state.color).toBe("#22c55e")
    expect(state.width).toBe(8)
    expect(state.canAnnotate).toBe(true)
    expect(state.presenterLocked).toBe(true)
    expect(state.mode).toBe("draw")
    expect(state.authorId).toBe("42")
    expect(state.items).toHaveLength(1)
    expect(state.items[0].pts).toEqual([
      [0.1, 0.2],
      [0.2, 0.3],
    ])
    expect(state.lasers[0].trail).toHaveLength(1)
  })

  it("falls back to safe defaults and caps the item list", () => {
    const items = Array.from({ length: 410 }, (_, index) =>
      strokeItem({ id: `stroke-${index}` }),
    )
    const state = buildOverlayState({
      items,
      tool: "nope",
      color: "red",
      width: 99,
      canAnnotate: "yes",
    })

    expect(state.tool).toBe("mouse")
    expect(state.color).toBe("#ef4444")
    expect(state.width).toBe(4)
    expect(state.canAnnotate).toBe(false)
    expect(state.mode).toBe("mouse")
    expect(state.items).toHaveLength(400)
    expect(state.items[0].id).toBe("stroke-10")
  })

  it("drops malformed lasers and trails", () => {
    const state = buildOverlayState({
      lasers: [
        { color: "#22c55e", trail: [{ x: 0.1, y: 0.2, ts: 1 }] },
        { color: "#22c55e", trail: [] },
        { color: "#22c55e", trail: [{ x: 5, y: 0.2, ts: 1 }] },
      ],
    })

    expect(state.lasers).toHaveLength(1)
  })
})

describe("translateOverlayEvent", () => {
  const context = {
    trackSid: TRACK,
    authorId: "42",
    authorName: "An",
    now: () => 5000,
  }

  it("turns stroke events into v1 packets stamped with the presenter identity", () => {
    const start = translateOverlayEvent(
      {
        type: "stroke-start",
        id: "s1",
        tool: "pen",
        color: "#ef4444",
        width: 4,
        pt: [0.1, 0.2],
      },
      context,
    )
    expect(start.packet).toEqual(
      buildStrokeStartPacket({
        trackSid: TRACK,
        id: "s1",
        tool: "pen",
        color: "#ef4444",
        width: 4,
        authorId: "42",
        authorName: "An",
        pt: [0.1, 0.2],
      }),
    )
    expect(start.packet.v).toBe(ANNOTATION_PROTOCOL_VERSION)

    const point = translateOverlayEvent(
      { type: "stroke-point", id: "s1", pts: [[0.3, 0.4]] },
      context,
    )
    expect(point.packet).toMatchObject({
      v: 1,
      t: "stroke-point",
      trackSid: TRACK,
      id: "s1",
      pts: [[0.3, 0.4]],
    })

    const end = translateOverlayEvent(
      { type: "stroke-end", item: strokeItem({ id: "s1" }) },
      context,
    )
    expect(end.packet).toMatchObject({
      t: "stroke-end",
      trackSid: TRACK,
    })
    expect(end.packet.item.authorId).toBe("42")
    expect(end.packet.item.authorName).toBe("An")
  })

  it("stamps shapes and text with the presenter identity", () => {
    const shape = translateOverlayEvent(
      {
        type: "shape-commit",
        item: {
          id: "sh1",
          kind: "shape",
          tool: "arrow",
          color: "#3b82f6",
          width: 4,
          x1: 0.1,
          y1: 0.1,
          x2: 0.6,
          y2: 0.4,
        },
      },
      context,
    )
    expect(shape.packet.t).toBe("shape-commit")
    expect(shape.packet.item.authorId).toBe("42")

    const text = translateOverlayEvent(
      {
        type: "text-commit",
        item: {
          id: "t1",
          kind: "text",
          color: "#eab308",
          fontSize: 24,
          x: 0.2,
          y: 0.2,
          text: "Hello",
        },
      },
      context,
    )
    expect(text.packet.t).toBe("text-commit")
    expect(text.packet.item.authorName).toBe("An")
  })

  it("translates laser, erase and control events", () => {
    const laser = translateOverlayEvent(
      { type: "laser-move", x: 0.4, y: 0.6, color: "#22c55e", ts: 1234 },
      context,
    )
    expect(laser.packet).toMatchObject({
      t: "laser-move",
      trackSid: TRACK,
      authorName: "An",
      color: "#22c55e",
      x: 0.4,
      y: 0.6,
      ts: 1234,
    })

    const erase = translateOverlayEvent(
      { type: "erase", ids: ["s1", "s2"] },
      context,
    )
    expect(erase.packet).toEqual({
      v: 1,
      t: "erase",
      trackSid: TRACK,
      ids: ["s1", "s2"],
    })

    expect(
      translateOverlayEvent({ type: "mode-change", mode: "mouse" }, context),
    ).toEqual({ control: { type: "mode-change", mode: "mouse" } })
    expect(
      translateOverlayEvent({ type: "tool-change", tool: "pen" }, context),
    ).toEqual({ control: { type: "tool-change", tool: "pen" } })
    expect(
      translateOverlayEvent({ type: "color-change", color: "#a855f7" }, context),
    ).toEqual({ control: { type: "color-change", color: "#a855f7" } })
    expect(
      translateOverlayEvent({ type: "width-change", width: 8 }, context),
    ).toEqual({ control: { type: "width-change", width: 8 } })
    expect(translateOverlayEvent({ type: "exit" }, context)).toEqual({
      control: { type: "exit" },
    })
  })

  it("rejects malformed events and events without a track", () => {
    expect(translateOverlayEvent(null, context)).toBeNull()
    expect(translateOverlayEvent({ type: "stroke-start" }, context)).toBeNull()
    expect(
      translateOverlayEvent(
        {
          type: "stroke-start",
          id: "s1",
          tool: "pen",
          color: "#ef4444",
          width: 4,
          pt: [2, 0],
        },
        context,
      ),
    ).toBeNull()
    expect(
      translateOverlayEvent({ type: "stroke-point", id: "s1", pts: [] }, context),
    ).toBeNull()
    expect(
      translateOverlayEvent({ type: "mode-change", mode: "paint" }, context),
    ).toBeNull()
    expect(
      translateOverlayEvent(
        { type: "stroke-point", id: "s1", pts: [[0.1, 0.1]] },
        { ...context, trackSid: null },
      ),
    ).toBeNull()
  })

  it("keeps the annotation topic untouched by the overlay adapter", () => {
    expect(ANNOTATION_TOPIC).toBe("screen-annotation")
  })

  it("produces packets that pass the v1 validator", () => {
    const events = [
      {
        type: "stroke-start",
        id: "s1",
        tool: "pen",
        color: "#ef4444",
        width: 4,
        pt: [0.1, 0.2],
      },
      { type: "stroke-point", id: "s1", pts: [[0.2, 0.3]] },
      { type: "stroke-end", item: strokeItem({ id: "s1" }) },
      {
        type: "shape-commit",
        item: {
          id: "sh1",
          kind: "shape",
          tool: "rect",
          color: "#3b82f6",
          width: 4,
          x1: 0.1,
          y1: 0.1,
          x2: 0.5,
          y2: 0.5,
        },
      },
      {
        type: "text-commit",
        item: {
          id: "t1",
          kind: "text",
          color: "#eab308",
          fontSize: 24,
          x: 0.2,
          y: 0.2,
          text: "Hello",
        },
      },
      { type: "laser-move", x: 0.4, y: 0.6, color: "#22c55e", ts: 1234 },
      { type: "erase", ids: ["s1"] },
    ]

    for (const event of events) {
      const translated = translateOverlayEvent(event, context)
      expect(translated?.packet).toBeTruthy()
      expect(validateAnnotationPacket(translated.packet)).toEqual(
        translated.packet,
      )
    }
  })
})
