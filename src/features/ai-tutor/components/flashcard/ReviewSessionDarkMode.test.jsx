// @vitest-environment happy-dom
import React, { act } from "react"
import { createRoot } from "react-dom/client"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import ReviewSession from "./ReviewSession"

vi.mock("react-router-dom", async (importOriginal) => ({
  ...(await importOriginal()),
  useBlocker: () => ({ state: "unblocked", proceed: vi.fn(), reset: vi.fn() }),
}))

const mocks = vi.hoisted(() => ({
  request: null,
  loadSession: vi.fn(),
  startSession: vi.fn(),
}))

vi.mock("../../api/flashcardReviewApi", () => ({
  useLazyGetFlashcardSessionQuery: () => [mocks.loadSession],
  useStartFlashcardSessionMutation: () => [mocks.startSession],
  flashcardErrorCode: () => undefined,
}))

vi.mock("../../hooks/useFlashcardSync", () => ({
  default: () => ({
    isOnline: false,
    pendingCount: 0,
    isRetrying: false,
    submit: vi.fn(),
  }),
}))

const resolveWith = (data) => {
  mocks.request = { unwrap: () => Promise.resolve(data) }
}

const rejectWith = (error) => {
  mocks.request = { unwrap: () => Promise.reject(error) }
}

const headingFor = (container, text) =>
  [...container.querySelectorAll("p")].find((node) =>
    node.textContent.includes(text),
  )

describe("ISS-57: ReviewSession state screens are readable in dark mode", () => {
  let container
  let root

  beforeEach(() => {
    globalThis.IS_REACT_ACT_ENVIRONMENT = true
    mocks.startSession.mockImplementation(() => mocks.request)
    container = document.createElement("div")
    document.body.appendChild(container)
    root = createRoot(container)
  })

  afterEach(() => {
    act(() => {
      root.unmount()
    })
    container.remove()
    document.body.innerHTML = ""
    mocks.request = null
  })

  it("adds a white heading to the offline error state", async () => {
    rejectWith({ status: "FETCH_ERROR" })

    await act(async () => {
      root.render(<ReviewSession mode="due" />)
    })

    const heading = headingFor(container, "Chưa tải được thẻ vì đang mất mạng")
    expect(heading).toBeTruthy()
    expect(heading.className).toContain("dark:text-white")
  })

  it("adds a white heading to the empty state", async () => {
    resolveWith({ session_id: "s-empty", mode: "due", total_cards: 0, cards: [] })

    await act(async () => {
      root.render(<ReviewSession mode="due" />)
    })

    const heading = headingFor(container, "Hôm nay bạn đã ôn hết thẻ rồi!")
    expect(heading).toBeTruthy()
    expect(heading.className).toContain("dark:text-white")
  })

  it("adds a white heading to the completed state", async () => {
    resolveWith({ session_id: "s-done", mode: "due", total_cards: 1, cards: [] })

    await act(async () => {
      root.render(<ReviewSession mode="due" />)
    })

    const heading = headingFor(container, "Bạn đã ôn xong mẻ thẻ này.")
    expect(heading).toBeTruthy()
    expect(heading.className).toContain("dark:text-white")
  })
})
