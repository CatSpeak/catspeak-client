// @vitest-environment happy-dom
import React, { act } from "react"
import { createRoot } from "react-dom/client"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import QueuePage from "./QueuePage"

vi.mock("react-router-dom", async (importOriginal) => ({
  ...(await importOriginal()),
  useNavigate: () => vi.fn(),
  useLocation: () => ({ state: null }),
}))

vi.mock("@/shared/context/LanguageContext", () => ({
  useLanguage: () => ({
    t: {
      rooms: {
        queue: {
          waitingForPairing: "Đang tìm bạn",
          matchFound: "Đã ghép",
          error: "{{msg}}",
          connectingToQueue: "Đang kết nối",
        },
      },
    },
  }),
}))

vi.mock("@/features/queue", () => ({
  useQueueSignaling: () => ({
    isConnected: false,
    joinQueue: vi.fn(),
    leaveQueue: vi.fn(),
  }),
  QueueStatusCard: () => <div data-testid="queue-status-card" />,
}))

describe("ISS-53: QueuePage background adapts to dark mode", () => {
  let container
  let root

  beforeEach(() => {
    container = document.createElement("div")
    document.body.appendChild(container)
    root = createRoot(container)
    act(() => {
      root.render(<QueuePage />)
    })
  })

  afterEach(() => {
    act(() => {
      root.unmount()
    })
    container.remove()
    document.body.innerHTML = ""
  })

  it("swaps the pink gradient for dark surfaces", () => {
    const page = container.firstElementChild
    expect(page.className).toContain("dark:from-[#0F0F0F]")
    expect(page.className).toContain("dark:to-[#241014]")
    expect(page.className).toContain("dark:text-white")
  })
})
