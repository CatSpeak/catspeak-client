import fs from "fs"
import path from "path"
import vm from "vm"
import { fileURLToPath } from "url"
import { describe, expect, it, vi } from "vitest"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const SW_PATH = path.resolve(__dirname, "../../../public/flashcard-sw.js")

function loadFlashcardServiceWorker() {
  const listeners = new Map()
  const putMock = vi.fn(async () => {})
  const fetchMock = vi.fn(async () => ({
    ok: true,
    clone: () => ({ ok: true }),
  }))

  const selfMock = {
    location: { origin: "https://catspeak.edu.vn" },
    skipWaiting: vi.fn(),
    clients: { claim: vi.fn(async () => {}) },
    addEventListener: (event, fn) => listeners.set(event, fn),
  }

  const context = {
    self: selfMock,
    URL,
    Promise,
    caches: {
      open: vi.fn(async () => ({
        put: putMock,
        match: vi.fn(async () => null),
      })),
      keys: vi.fn(async () => []),
      delete: vi.fn(async () => true),
    },
    fetch: fetchMock,
  }

  const code = fs.readFileSync(SW_PATH, "utf8")
  vm.runInNewContext(code, context)

  return { listeners, putMock, fetchMock }
}

describe("flashcard-sw message origin & URL validation", () => {
  it("ignores postMessage events from untrusted origins", async () => {
    const { listeners, fetchMock, putMock } = loadFlashcardServiceWorker()
    const onMessage = listeners.get("message")
    const waitUntilMock = vi.fn()

    onMessage({
      origin: "https://evil.example",
      data: {
        type: "flashcard-cache",
        urls: ["/audio/hello.mp3"],
        shellUrl: "/flashcards/review",
      },
      waitUntil: waitUntilMock,
    })

    expect(waitUntilMock).not.toHaveBeenCalled()
    expect(fetchMock).not.toHaveBeenCalled()
    expect(putMock).not.toHaveBeenCalled()
  })

  it("caches valid same-origin paths while rejecting cross-origin or traversal URLs", async () => {
    const { listeners, fetchMock } = loadFlashcardServiceWorker()
    const onMessage = listeners.get("message")
    let pendingPromise = null

    onMessage({
      origin: "https://catspeak.edu.vn",
      data: {
        type: "flashcard-cache",
        urls: [
          "/audio/word1.mp3",
          "https://evil.example/steal.mp3",
          "//evil.example/proto.mp3",
          "/audio/../secret.mp3",
        ],
        shellUrl: "https://evil.example/phish",
      },
      waitUntil: (p) => {
        pendingPromise = p
      },
    })

    await pendingPromise
    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(fetchMock).toHaveBeenCalledWith("/audio/word1.mp3", {
      mode: "cors",
      credentials: "omit",
    })
  })
})
