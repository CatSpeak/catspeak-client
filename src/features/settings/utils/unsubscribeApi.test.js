// @vitest-environment happy-dom
import { afterEach, describe, expect, it, vi } from "vitest"
import {
  resolveCoreApiBase,
  unsubscribeEmailNotifications,
} from "./unsubscribeApi"

describe("unsubscribeApi", () => {
  const originalFetch = globalThis.fetch

  afterEach(() => {
    globalThis.fetch = originalFetch
  })

  it("resolves default core API base to /api when staging VITE_API_URL is unset", () => {
    expect(resolveCoreApiBase()).toBe("/api")
  })

  it("posts email and HMAC token to /api/auth/unsubscribe", async () => {
    const fetchMock = vi.fn(
      async () =>
        new Response(JSON.stringify({ success: true }), { status: 200 }),
    )
    globalThis.fetch = fetchMock

    await unsubscribeEmailNotifications({
      email: "user@example.com",
      token: "hmac_tok+1",
    })

    expect(fetchMock).toHaveBeenCalledTimes(1)
    const [url, init] = fetchMock.mock.calls[0]
    expect(url).toBe(
      "/api/auth/unsubscribe?email=user%40example.com&token=hmac_tok%2B1",
    )
    expect(init.method).toBe("POST")
    expect(init.headers).toEqual({})
  })

  it("attaches Authorization header when authToken is supplied and throws on 401", async () => {
    const fetchMock = vi.fn(
      async () =>
        new Response(
          JSON.stringify({ message: "Invalid or missing unsubscribe token." }),
          { status: 401 },
        ),
    )
    globalThis.fetch = fetchMock

    await expect(
      unsubscribeEmailNotifications({
        email: "user@example.com",
        authToken: "jwt-123",
      }),
    ).rejects.toMatchObject({
      status: 401,
      message: "Invalid or missing unsubscribe token.",
    })

    expect(fetchMock.mock.calls[0][1].headers.Authorization).toBe(
      "Bearer jwt-123",
    )
  })
})
