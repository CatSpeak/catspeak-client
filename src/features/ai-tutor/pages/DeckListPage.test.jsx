// @vitest-environment happy-dom
import React from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { beforeEach, describe, expect, it, vi } from "vitest"
import DeckListPage from "./DeckListPage"

let mockFoldersQuery = {
  data: undefined,
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
  useGetFlashcardDecksQuery: () => ({ data: [], isLoading: false }),
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
})
