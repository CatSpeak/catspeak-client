import { describe, expect, it } from "vitest"

import {
  HANDOFF_ERROR_KINDS,
  buildHandoffDeepLink,
  classifyHandoffError,
  getHandoffErrorMeta,
  isRetryableHandoffError,
  parseHandoffSearch,
  runHandoffExchangeOnce,
} from "./desktopHandoff.js"

describe("buildHandoffDeepLink", () => {
  it("uses the production scheme from the release payload", () => {
    expect(
      buildHandoffDeepLink({
        release: { protocolScheme: "catspeak" },
        roomId: "room_123",
        lang: "vi",
        code: "launch-code",
      }),
    ).toBe(
      "catspeak://join?roomId=room_123&lang=vi&code=launch-code",
    )
  })

  it("uses the staging scheme from the release payload", () => {
    expect(
      buildHandoffDeepLink({
        release: { protocolScheme: "catspeak-staging" },
        roomId: "room_456",
        lang: "en",
        code: "staging-code",
      }),
    ).toBe(
      "catspeak-staging://join?roomId=room_456&lang=en&code=staging-code",
    )
  })

  it("encodes the room id and keeps the documented parameter order", () => {
    expect(
      buildHandoffDeepLink({
        release: { protocolScheme: "catspeak" },
        roomId: "room 1",
        lang: "ja",
        code: "a b",
      }),
    ).toBe("catspeak://join?roomId=room+1&lang=ja&code=a+b")
  })
})

describe("parseHandoffSearch", () => {
  it("parses a complete handoff query", () => {
    expect(
      parseHandoffSearch("?code=abc123&roomId=room_1&lang=en"),
    ).toEqual({
      code: "abc123",
      roomId: "room_1",
      lang: "en",
      valid: true,
      error: null,
    })
  })

  it("accepts a query without the leading question mark", () => {
    expect(
      parseHandoffSearch("code=abc123&roomId=room-1&lang=zh"),
    ).toMatchObject({
      code: "abc123",
      roomId: "room-1",
      lang: "zh",
      valid: true,
    })
  })

  it("falls back to vi for missing or unsupported languages", () => {
    expect(
      parseHandoffSearch("?code=abc123&roomId=room_1&lang=fr").lang,
    ).toBe("vi")
    expect(parseHandoffSearch("?code=abc123&roomId=room_1").lang).toBe("vi")
  })

  it("reports a missing code", () => {
    expect(parseHandoffSearch("?roomId=room_1&lang=vi")).toMatchObject({
      valid: false,
      error: "missingCode",
      roomId: "room_1",
    })
  })

  it("reports a missing or malformed room id", () => {
    expect(parseHandoffSearch("?code=abc123&lang=vi")).toMatchObject({
      valid: false,
      error: "missingRoomId",
    })
    expect(
      parseHandoffSearch("?code=abc123&roomId=bad/room&lang=vi"),
    ).toMatchObject({
      valid: false,
      error: "invalidRoomId",
    })
    expect(
      parseHandoffSearch(
        `?code=abc123&roomId=${"a".repeat(65)}&lang=vi`,
      ),
    ).toMatchObject({
      valid: false,
      error: "invalidRoomId",
    })
  })

  it("handles an empty query string", () => {
    expect(parseHandoffSearch("")).toMatchObject({
      code: "",
      roomId: "",
      lang: "vi",
      valid: false,
      error: "missingCode",
    })
  })
})

describe("classifyHandoffError", () => {
  const apiError = (errorCode) => ({ status: 400, data: { errorCode } })

  it("maps the server launch-code error codes", () => {
    expect(
      classifyHandoffError(apiError("AUTH_DESKTOP_LAUNCH_CODE_INVALID")),
    ).toBe(HANDOFF_ERROR_KINDS.invalid)
    expect(
      classifyHandoffError(apiError("AUTH_DESKTOP_LAUNCH_CODE_EXPIRED")),
    ).toBe(HANDOFF_ERROR_KINDS.expired)
    expect(
      classifyHandoffError(apiError("AUTH_DESKTOP_LAUNCH_CODE_ALREADY_USED")),
    ).toBe(HANDOFF_ERROR_KINDS.used)
    expect(
      classifyHandoffError(apiError("AUTH_DESKTOP_LAUNCH_CODE_RATE_LIMITED")),
    ).toBe(HANDOFF_ERROR_KINDS.rateLimited)
  })

  it("maps HTTP status fallbacks and transport failures", () => {
    expect(classifyHandoffError({ status: 429, data: {} })).toBe(
      HANDOFF_ERROR_KINDS.rateLimited,
    )
    expect(classifyHandoffError({ status: 409, data: {} })).toBe(
      HANDOFF_ERROR_KINDS.used,
    )
    expect(classifyHandoffError({ status: "FETCH_ERROR" })).toBe(
      HANDOFF_ERROR_KINDS.network,
    )
    expect(classifyHandoffError({ status: "TIMEOUT_ERROR" })).toBe(
      HANDOFF_ERROR_KINDS.network,
    )
    expect(classifyHandoffError({ status: 500, data: {} })).toBe(
      HANDOFF_ERROR_KINDS.server,
    )
    expect(classifyHandoffError(undefined)).toBe(HANDOFF_ERROR_KINDS.unknown)
  })
})

describe("handoff error copy and retry state", () => {
  it("provides title and message keys for every error kind", () => {
    for (const kind of Object.values(HANDOFF_ERROR_KINDS)) {
      const meta = getHandoffErrorMeta(kind)
      expect(meta.titleKey).toMatch(/Title$/)
      expect(meta.messageKey).toMatch(/Message$/)
    }
  })

  it("only retries transient failures", () => {
    expect(isRetryableHandoffError(HANDOFF_ERROR_KINDS.network)).toBe(true)
    expect(isRetryableHandoffError(HANDOFF_ERROR_KINDS.rateLimited)).toBe(true)
    expect(isRetryableHandoffError(HANDOFF_ERROR_KINDS.server)).toBe(true)
    expect(isRetryableHandoffError(HANDOFF_ERROR_KINDS.unknown)).toBe(true)
    expect(isRetryableHandoffError(HANDOFF_ERROR_KINDS.invalid)).toBe(false)
    expect(isRetryableHandoffError(HANDOFF_ERROR_KINDS.expired)).toBe(false)
    expect(isRetryableHandoffError(HANDOFF_ERROR_KINDS.used)).toBe(false)
  })
})

describe("runHandoffExchangeOnce", () => {
  it("shares one in-flight exchange for the same code", async () => {
    let calls = 0
    let resolveFirst
    const first = runHandoffExchangeOnce("code-1", () => {
      calls += 1
      return new Promise((resolve) => {
        resolveFirst = resolve
      })
    })
    const second = runHandoffExchangeOnce("code-1", () => {
      calls += 1
      return Promise.resolve("second")
    })

    resolveFirst("first")

    await expect(first).resolves.toBe("first")
    await expect(second).resolves.toBe("first")
    expect(calls).toBe(1)
  })

  it("allows a retry after the in-flight exchange settles", async () => {
    let calls = 0
    const factory = () => {
      calls += 1
      return Promise.resolve("ok")
    }

    await runHandoffExchangeOnce("code-2", factory)
    await runHandoffExchangeOnce("code-2", factory)

    expect(calls).toBe(2)
  })

  it("runs different codes independently", async () => {
    let calls = 0
    const factory = () => {
      calls += 1
      return Promise.resolve("ok")
    }

    await Promise.all([
      runHandoffExchangeOnce("code-a", factory),
      runHandoffExchangeOnce("code-b", factory),
    ])

    expect(calls).toBe(2)
  })
})
