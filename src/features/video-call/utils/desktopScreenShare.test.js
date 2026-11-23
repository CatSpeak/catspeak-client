import { describe, expect, it, vi } from "vitest"

import {
  MAC_SCREEN_PERMISSION_URL,
  findScreenSource,
  groupScreenSources,
  isFullDisplaySource,
  isMacScreenPermissionRequired,
  loadDesktopScreenSources,
  normalizeScreenPermission,
  normalizeScreenSource,
  normalizeScreenSources,
  normalizeScreenSourcesResponse,
  screenShareSelectionMetadata,
  toSelectSourcePayload,
} from "./desktopScreenShare.js"

const screenSource = {
  id: "screen:1:0",
  name: "Display 1",
  type: "screen",
  displayId: "1",
  thumbnailDataUrl: "data:image/png;base64,screen",
  appIconDataUrl: "",
  isFullDisplay: true,
}

const windowSource = {
  id: "window:9:0",
  name: "Slides",
  type: "window",
  displayId: "",
  thumbnailDataUrl: "data:image/png;base64,window",
  appIconDataUrl: "data:image/png;base64,icon",
  isFullDisplay: false,
}

const macPermission = {
  platform: "darwin",
  status: "granted",
  granted: true,
  needsPermission: false,
  canOpenSettings: true,
  settingsUrl: MAC_SCREEN_PERMISSION_URL,
}

describe("normalizeScreenSource", () => {
  it("keeps a screen source and its display id", () => {
    expect(normalizeScreenSource({ ...screenSource, name: "  Display 1  " })).toEqual(
      screenSource,
    )
  })

  it("strips a display id from a window and never marks it as full display", () => {
    expect(
      normalizeScreenSource({ ...windowSource, displayId: "2", isFullDisplay: true }),
    ).toEqual(windowSource)
  })

  it("infers the type from the bridge source id", () => {
    expect(normalizeScreenSource({ ...screenSource, type: "window" }).type).toBe(
      "screen",
    )
    expect(normalizeScreenSource({ ...windowSource, type: "screen" }).type).toBe(
      "window",
    )
  })

  it("rejects malformed sources", () => {
    expect(normalizeScreenSource(null)).toBeNull()
    expect(normalizeScreenSource({})).toBeNull()
    expect(normalizeScreenSource({ id: "", name: "Empty" })).toBeNull()
    expect(normalizeScreenSource({ id: "camera:1", name: "Camera" })).toBeNull()
  })

  it("normalizes lists and drops malformed entries", () => {
    expect(normalizeScreenSources([screenSource, null, windowSource])).toEqual([
      screenSource,
      windowSource,
    ])
    expect(normalizeScreenSources("nope")).toEqual([])
  })
})

describe("normalizeScreenPermission", () => {
  it("passes a complete macOS permission through", () => {
    expect(normalizeScreenPermission(macPermission)).toEqual(macPermission)
  })

  it("derives needsPermission from a macOS status without flags", () => {
    expect(
      normalizeScreenPermission({ platform: "darwin", status: "not-determined" }),
    ).toEqual({
      platform: "darwin",
      status: "not-determined",
      granted: false,
      needsPermission: true,
      canOpenSettings: true,
      settingsUrl: MAC_SCREEN_PERMISSION_URL,
    })
  })

  it("treats Windows as already permitted", () => {
    expect(
      normalizeScreenPermission({ platform: "win32", status: "denied" }),
    ).toEqual({
      platform: "win32",
      status: "granted",
      granted: true,
      needsPermission: false,
      canOpenSettings: false,
      settingsUrl: "",
    })
  })

  it("falls back to a non-blocking permission when the bridge omits it", () => {
    expect(normalizeScreenPermission(null)).toEqual({
      platform: "",
      status: "unknown",
      granted: true,
      needsPermission: false,
      canOpenSettings: false,
      settingsUrl: "",
    })
  })
})

describe("isMacScreenPermissionRequired", () => {
  it("requires permission only on macOS when it is missing", () => {
    expect(isMacScreenPermissionRequired(normalizeScreenPermission(macPermission))).toBe(
      false,
    )
    expect(
      isMacScreenPermissionRequired(
        normalizeScreenPermission({ platform: "darwin", status: "denied" }),
      ),
    ).toBe(true)
    expect(
      isMacScreenPermissionRequired({
        platform: "win32",
        needsPermission: true,
      }),
    ).toBe(false)
    expect(isMacScreenPermissionRequired(null)).toBe(false)
  })
})

describe("groupScreenSources", () => {
  it("groups screens and windows while preserving order", () => {
    expect(groupScreenSources([windowSource, screenSource, windowSource])).toEqual({
      screens: [screenSource],
      windows: [windowSource, windowSource],
    })
  })

  it("handles empty input", () => {
    expect(groupScreenSources(null)).toEqual({ screens: [], windows: [] })
  })
})

describe("selection metadata", () => {
  it("finds a source by id", () => {
    expect(findScreenSource([screenSource, windowSource], "window:9:0")).toEqual(
      windowSource,
    )
    expect(findScreenSource([screenSource], "screen:404")).toBeNull()
    expect(findScreenSource(null, "screen:1:0")).toBeNull()
  })

  it("marks only screens as full display", () => {
    expect(isFullDisplaySource(screenSource)).toBe(true)
    expect(isFullDisplaySource(windowSource)).toBe(false)
    expect(isFullDisplaySource({ type: "screen", displayId: "" })).toBe(false)
    expect(isFullDisplaySource(null)).toBe(false)
  })

  it("returns the display metadata ticket 09 needs", () => {
    expect(screenShareSelectionMetadata(screenSource)).toEqual({
      displayId: "1",
      sourceId: "screen:1:0",
      isFullDisplay: true,
    })
    expect(screenShareSelectionMetadata(windowSource)).toEqual({
      displayId: null,
      sourceId: "window:9:0",
      isFullDisplay: false,
    })
    expect(screenShareSelectionMetadata(null)).toBeNull()
  })

  it("builds a selectScreenSource payload with audio on by default", () => {
    expect(toSelectSourcePayload(screenSource)).toEqual({
      sourceId: "screen:1:0",
      audio: true,
    })
    expect(toSelectSourcePayload(windowSource, { audio: false })).toEqual({
      sourceId: "window:9:0",
      audio: false,
    })
    expect(toSelectSourcePayload(null)).toBeNull()
  })
})

describe("normalizeScreenSourcesResponse", () => {
  it("accepts a successful bridge response", () => {
    expect(
      normalizeScreenSourcesResponse({
        ok: true,
        sources: [screenSource, null],
        permission: macPermission,
      }),
    ).toEqual({
      ok: true,
      sources: [screenSource],
      permission: macPermission,
      error: null,
    })
  })

  it("accepts a bare source array from older bridges", () => {
    expect(normalizeScreenSourcesResponse([screenSource])).toEqual({
      ok: true,
      sources: [screenSource],
      permission: null,
      error: null,
    })
  })

  it("propagates a bridge error", () => {
    expect(normalizeScreenSourcesResponse({ ok: false, error: "FORBIDDEN" })).toEqual({
      ok: false,
      sources: [],
      permission: null,
      error: "FORBIDDEN",
    })
  })

  it("normalizes a malformed response to a load failure", () => {
    expect(normalizeScreenSourcesResponse(null)).toEqual({
      ok: false,
      sources: [],
      permission: null,
      error: "SCREEN_SOURCES_FAILED",
    })
  })
})

describe("loadDesktopScreenSources", () => {
  it("loads sources and permission from the bridge", async () => {
    const bridge = {
      getScreenSources: vi.fn().mockResolvedValue({
        ok: true,
        sources: [screenSource],
        permission: macPermission,
      }),
      getScreenPermission: vi.fn(),
    }

    await expect(loadDesktopScreenSources(bridge)).resolves.toEqual({
      ok: true,
      sources: [screenSource],
      permission: macPermission,
      error: null,
    })
    expect(bridge.getScreenPermission).not.toHaveBeenCalled()
  })

  it("asks for permission separately when the source response omits it", async () => {
    const bridge = {
      getScreenSources: vi.fn().mockResolvedValue({ ok: true, sources: [screenSource] }),
      getScreenPermission: vi
        .fn()
        .mockResolvedValue({ ok: true, permission: macPermission }),
    }

    const result = await loadDesktopScreenSources(bridge)

    expect(result.permission).toEqual(macPermission)
    expect(bridge.getScreenPermission).toHaveBeenCalledTimes(1)
  })

  it("still returns sources when the permission call rejects", async () => {
    const bridge = {
      getScreenSources: vi.fn().mockResolvedValue({ ok: true, sources: [screenSource] }),
      getScreenPermission: vi.fn().mockRejectedValue(new Error("offline")),
    }

    const result = await loadDesktopScreenSources(bridge)

    expect(result.ok).toBe(true)
    expect(result.sources).toEqual([screenSource])
    expect(result.permission).toBeNull()
  })

  it("reports a missing bridge instead of throwing", async () => {
    await expect(loadDesktopScreenSources(undefined)).resolves.toEqual({
      ok: false,
      sources: [],
      permission: null,
      error: "BRIDGE_UNAVAILABLE",
    })
  })

  it("reports a rejecting bridge as a load failure", async () => {
    const bridge = {
      getScreenSources: vi.fn().mockRejectedValue(new Error("ipc closed")),
    }

    await expect(loadDesktopScreenSources(bridge)).resolves.toEqual({
      ok: false,
      sources: [],
      permission: null,
      error: "SCREEN_SOURCES_FAILED",
    })
  })
})
