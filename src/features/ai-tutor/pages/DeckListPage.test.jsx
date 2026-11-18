// @vitest-environment happy-dom
import React from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { beforeEach, describe, expect, it, vi } from "vitest"
import DeckListPage from "./DeckListPage"

let mockFoldersQuery = {
  data: undefined,
  isLoading: false,
}

let mockDecksQuery = {
  data: [],
  isLoading: false,
}

vi.mock("react-router-dom", async (importOriginal) => ({
  ...(await importOriginal()),
  useNavigate: () => vi.fn(),
  useParams: () => ({ lang: "zh" }),
  useSearchParams: () => [new URLSearchParams(), vi.fn()],
}))

vi.mock("@/shared/context/LanguageContext", () => ({
  useLanguage: () => ({ language: "zh" }),
}))

vi.mock("../api/flashcardApi", () => ({
  useGetFlashcardDecksQuery: () => mockDecksQuery,
  useGetFlashcardFoldersQuery: () => mockFoldersQuery,
  useCreateFlashcardFolderMutation: () => [vi.fn(), { isLoading: false }],
  useRenameFlashcardFolderMutation: () => [vi.fn(), { isLoading: false }],
  useDeleteFlashcardFolderMutation: () => [vi.fn(), { isLoading: false }],
}))

describe("DeckListPage: folder limits and plan badge honesty (TC-FC-131, TC-FC-132)", () => {
  it("does not render '(3/3 - gói Free)' badge when user has Pro plan (max_folders is null)", () => {
    mockFoldersQuery = {
      data: {
        items: [
          { id: 1, name: "Q", card_count: 0 },
          { id: 2, name: "B", card_count: 0 },
          { id: 3, name: "C", card_count: 0 },
        ],
        plan: "pro",
        max_folders: null,
        can_create: true,
      },
      isLoading: false,
    }

    const html = renderToStaticMarkup(<DeckListPage />)

    // Pro account with 3 folders must not be labeled as Free
    expect(html).not.toContain("gói Free")
    expect(html).not.toContain("(3/3 - gói Free)")
    expect(html).toContain("Thư mục của bạn")
  })

  it("renders '(3/3 - gói Free)' badge when user is on Free plan", () => {
    mockFoldersQuery = {
      data: {
        items: [
          { id: 1, name: "Q", card_count: 0 },
          { id: 2, name: "B", card_count: 0 },
          { id: 3, name: "C", card_count: 0 },
        ],
        plan: "free",
        max_folders: 3,
        can_create: false,
      },
      isLoading: false,
    }

    const html = renderToStaticMarkup(<DeckListPage />)

    expect(html).toContain("(3/3 - gói Free)")
  })

  describe("System decks sections (FR-FC-015, BR-FC-005, TC-FC-086)", () => {
    it("renders 'Theo chủ đề' section even when user has no topic decks (kể cả khi rỗng)", () => {
      mockFoldersQuery = {
        data: { items: [], plan: "free", max_folders: 3, can_create: true },
        isLoading: false,
      }
      mockDecksQuery = {
        data: [
          { id: "hsk-1", name: "HSK 1", category: "system", total_cards: 0, due_count: 0 },
          { id: "hsk-2", name: "HSK 2", category: "system", total_cards: 2, due_count: 0 },
          { id: "hsk-3", name: "HSK 3", category: "system", total_cards: 0, due_count: 0 },
          { id: "hsk-4", name: "HSK 4", category: "system", total_cards: 2, due_count: 0 },
          { id: "hsk-5", name: "HSK 5", category: "system", total_cards: 0, due_count: 0 },
          { id: "hsk-6", name: "HSK 6", category: "system", total_cards: 0, due_count: 0 },
          { id: "non-hsk", name: "Ngoài HSK", category: "system", total_cards: 0, due_count: 0 },
          { id: "recent-wrong", name: "Từ sai gần đây", category: "system", total_cards: 0, due_count: 0 },
        ],
        isLoading: false,
      }

      const html = renderToStaticMarkup(<DeckListPage />)

      // Must render both system deck groups: 'Theo trình độ HSK' and 'Theo chủ đề'
      expect(html).toContain("Theo trình độ HSK")
      expect(html).toContain("Theo chủ đề")
    })

    it("renders topic deck rows under 'Theo chủ đề' when user has topic decks", () => {
      mockFoldersQuery = {
        data: { items: [], plan: "free", max_folders: 3, can_create: true },
        isLoading: false,
      }
      mockDecksQuery = {
        data: [
          { id: "hsk-1", name: "HSK 1", category: "system", total_cards: 0, due_count: 0 },
          { id: "topic-travel", name: "Du lịch", category: "topic", total_cards: 5, due_count: 2 },
        ],
        isLoading: false,
      }

      const html = renderToStaticMarkup(<DeckListPage />)

      expect(html).toContain("Theo chủ đề")
      expect(html).toContain("Du lịch")
      expect(html).toContain("5 thẻ")
      expect(html).toContain("2 đến hạn")
    })
  })
})
