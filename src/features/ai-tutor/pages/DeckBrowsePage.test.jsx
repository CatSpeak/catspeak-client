// @vitest-environment happy-dom
import React, { act } from "react"
import { createRoot } from "react-dom/client"
import { renderToStaticMarkup } from "react-dom/server"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { formatDeckSlug } from "../utils/flashcardReview"

const getDeckCardsCalls = []
let mockIsOnline = true
let mockCardsQuery = {
  data: undefined,
  isLoading: true,
  isFetching: true,
  isError: false,
  error: null,
  refetch: vi.fn(),
}
let mockDecksQuery = {
  data: undefined,
  isLoading: true,
}
let mockFoldersQuery = {
  data: undefined,
}
let mockParams = { lang: "zh", deckId: "hsk-4" }

vi.mock("react-router-dom", async (importOriginal) => ({
  ...(await importOriginal()),
  useNavigate: () => vi.fn(),
  useParams: () => mockParams,
}))

vi.mock("@/shared/context/LanguageContext", () => ({
  useLanguage: () => ({ language: "zh" }),
}))

vi.mock("../hooks/useOnlineStatus", () => ({
  default: () => mockIsOnline,
  useReportQueryNetwork: vi.fn(),
}))

vi.mock("../components/flashcards/library/useCardActions", () => ({
  default: () => ({ handlers: {}, ui: null }),
}))

vi.mock("../components/flashcards/library/FlashcardCardList", () => ({
  default: () => <div data-testid="card-list" />,
}))

vi.mock("../api/flashcardApi", () => ({
  isNetworkError: (err) => err?.status === "FETCH_ERROR" || err?.status === "TIMEOUT_ERROR",
  useGetFlashcardDecksQuery: () => mockDecksQuery,
  useGetFlashcardFoldersQuery: () => mockFoldersQuery,
  useGetDeckCardsQuery: (args, options) => {
    if (options?.skip) {
      return { data: undefined, isLoading: false }
    }
    getDeckCardsCalls.push(args)
    if (args?.limit === 1) {
      return { data: { items: [], total: 42 }, isLoading: false }
    }
    return mockCardsQuery
  },
}))

describe("DeckBrowsePage - bug repro and regression verification", () => {
  let DeckBrowsePage
  let container
  let root

  beforeEach(async () => {
    globalThis.IS_REACT_ACT_ENVIRONMENT = true
    getDeckCardsCalls.length = 0
    mockIsOnline = true
    mockParams = { lang: "zh", deckId: "hsk-4" }
    mockCardsQuery = {
      data: undefined,
      isLoading: true,
      isFetching: true,
      isError: false,
      error: null,
      refetch: vi.fn(),
    }
    mockDecksQuery = {
      data: undefined,
      isLoading: true,
    }
    mockFoldersQuery = {
      data: undefined,
    }
    const mod = await import("./DeckBrowsePage")
    DeckBrowsePage = mod.default
  })

  afterEach(() => {
    if (root) {
      act(() => {
        root.unmount()
      })
      root = null
    }
    if (container) {
      container.remove()
      container = null
    }
    document.body.innerHTML = ""
  })

  it("does not show '0 thẻ' when loading and displays skeleton for count", () => {
    const html = renderToStaticMarkup(<DeckBrowsePage />)

    // User bug report: "Khi đang tải vẫn hiện '0 thẻ'"
    // Expected: "khi đang tải không hiển thị số '0 thẻ' (dùng skeleton cho số đếm)"
    expect(html).not.toContain("0 thẻ")
    expect(html).toContain("animate-pulse")
  })

  it("does not show raw slug 'Bộ thẻ: hsk-4' in title while decks are loading", () => {
    const html = renderToStaticMarkup(<DeckBrowsePage />)

    // User bug report: "tiêu đề hiển thị slug thô 'Bộ thẻ: hsk-4'"
    expect(html).not.toContain("Bộ thẻ: hsk-4")
    expect(html).toContain("Bộ thẻ: HSK 4")
  })

  it("does not call useGetDeckCardsQuery twice when no filter is active", () => {
    renderToStaticMarkup(<DeckBrowsePage />)

    // User bug report: "API cards bị gọi 2 lần"
    // When search is empty and status is null, cardsQuery already fetches the deck.
    // Duplicate query with limit: 1 should NOT be called.
    const callsForDeck = getDeckCardsCalls.filter((c) => c?.deckId === "hsk-4")
    expect(callsForDeck).toHaveLength(1)
  })

  it("displays card count correctly once loaded", () => {
    mockCardsQuery = {
      data: {
        items: [
          { card_id: 1, word: "你好" },
          { card_id: 2, word: "谢谢" },
          { card_id: 3, word: "再见" },
        ],
        total: 3,
      },
      isLoading: false,
      isFetching: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    }
    mockDecksQuery = {
      data: [{ id: "hsk-4", name: "HSK 4", total_cards: 3, category: "system" }],
      isLoading: false,
    }

    const html = renderToStaticMarkup(<DeckBrowsePage />)
    expect(html).toContain("3 thẻ")
    expect(html).toContain("Bộ thẻ: HSK 4")
    expect(html).not.toContain("animate-pulse")
  })

  it("formatDeckSlug correctly formats known slugs", () => {
    expect(formatDeckSlug("hsk-1")).toBe("HSK 1")
    expect(formatDeckSlug("hsk-4")).toBe("HSK 4")
    expect(formatDeckSlug("hsk-6")).toBe("HSK 6")
    expect(formatDeckSlug("non-hsk")).toBe("Ngoài HSK")
    expect(formatDeckSlug("recent-wrong")).toBe("Từ sai gần đây")
    expect(formatDeckSlug("all")).toBe("Toàn bộ sổ")
  })

  it("shows error state with retry button instead of '0 thẻ' and 'Deck chưa có từ nào' when offline request fails (TC-FC-100)", async () => {
    mockIsOnline = false
    mockParams = { lang: "zh", deckId: "hsk-2" }
    mockCardsQuery = {
      data: undefined,
      isLoading: false,
      isFetching: false,
      isError: true,
      error: { status: "FETCH_ERROR" },
      refetch: vi.fn(),
    }
    mockDecksQuery = {
      data: undefined,
      isLoading: false,
    }

    container = document.createElement("div")
    document.body.appendChild(container)
    root = createRoot(container)

    await act(async () => {
      root.render(<DeckBrowsePage />)
    })

    const text = document.body.textContent || ""

    // User bug report:
    // "Offline mở HSK 2 (2 thẻ) vẫn hiện '0 thẻ' + 'Deck chưa có từ nào'"
    // Kỳ vọng:
    // "Hiển thị trạng thái lỗi/placeholder 'Không tải được dữ liệu' + nút thử lại (hoặc dữ liệu cache)"
    expect(text).not.toContain("Deck chưa có từ nào")
    expect(text).not.toContain("0 thẻ")
    expect(text).toMatch(/Không tải được|Bạn đang offline|Chưa tải được/)
    expect(text).toContain("Thử lại")
  })

  it("auto-refetches when network reconnects (isOnline transitions to true) (TC-FC-100)", async () => {
    mockIsOnline = false
    mockParams = { lang: "zh", deckId: "hsk-2" }
    mockCardsQuery = {
      data: undefined,
      isLoading: false,
      isFetching: false,
      isError: true,
      error: { status: "FETCH_ERROR" },
      refetch: vi.fn(),
    }
    mockDecksQuery = {
      data: undefined,
      isLoading: false,
    }

    container = document.createElement("div")
    document.body.appendChild(container)
    root = createRoot(container)

    await act(async () => {
      root.render(<DeckBrowsePage />)
    })

    expect(mockCardsQuery.refetch).not.toHaveBeenCalled()

    // Simulate coming back online
    mockIsOnline = true
    await act(async () => {
      root.render(<DeckBrowsePage />)
    })

    expect(mockCardsQuery.refetch).toHaveBeenCalled()
  })
})
