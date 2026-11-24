// @vitest-environment happy-dom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { store } from "@/store"
import { setCredentials } from "@/store/slices/authSlice"
import { askQuestionStream } from "./ragClient"

describe("ragClient SSE parsing & auth retry", () => {
  beforeEach(() => {
    localStorage.clear()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it("normalizes CRLF SSE events, flushes final done frame at EOF, and refreshes after 401", async () => {
    store.dispatch(
      setCredentials({
        user: { accountId: 7 },
        token: "old-jwt",
        refreshToken: "old-refresh",
      }),
    )

    const encoder = new TextEncoder()
    const stream = new ReadableStream({
      start(controller) {
        controller.enqueue(
          encoder.encode(
            'event: delta\r\ndata: {"text":"Hello "}\r\n\r\nevent: done\r\ndata: {"answer":"Hello world"}',
          ),
        )
        controller.close()
      },
    })

    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(new Response(null, { status: 401 }))
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({ token: "new-jwt", refreshToken: "new-refresh" }),
          { status: 200, headers: { "Content-Type": "application/json" } },
        ),
      )
      .mockResolvedValueOnce(
        new Response(stream, {
          status: 200,
          headers: { "Content-Type": "text/event-stream" },
        }),
      )

    vi.stubGlobal("fetch", fetchMock)

    const deltas = []
    const result = await askQuestionStream({
      question: "Hi",
      history: [],
      caller: { role: "student", tier: "Free" },
      onDelta: (d) => deltas.push(d),
    })

    expect(deltas).toEqual(["Hello "])
    expect(result).toEqual({ answer: "Hello world" })
    expect(fetchMock).toHaveBeenCalledTimes(3)
    expect(fetchMock.mock.calls[2][1].headers.Authorization).toBe(
      "Bearer new-jwt",
    )
  })
})
