import { renderToStaticMarkup } from "react-dom/server"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { formatDeckSlug } from "../utils/flashcardReview"

const getDeckCardsCalls = []
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
  useReportQueryNetwork: vi.fn(),
}))

vi.mock("../components/flashcards/library/useCardActions", () => ({
  default: () => ({ handlers: {}, ui: null }),
}))

vi.mock("../components/flashcards/library/FlashcardCardList", () => ({
  default: () => <div data-testid="card-list" />,
}))

vi.mock("../api/flashcardApi", () => ({
  isNetworkError: () => false,
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

  beforeEach(async () => {
    getDeckCardsCalls.length = 0
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
})
