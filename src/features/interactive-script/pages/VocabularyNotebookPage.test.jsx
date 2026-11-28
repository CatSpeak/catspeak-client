// @vitest-environment happy-dom
import React, { act } from "react"
import { createRoot } from "react-dom/client"
import { MemoryRouter } from "react-router-dom"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import VocabularyNotebookPage from "./VocabularyNotebookPage"

const mocks = vi.hoisted(() => ({
  playAudio: vi.fn(),
  words: [
    {
      id: 1,
      word: "alpha",
      meaning: "first letter",
      partOfSpeech: "noun",
      targetLanguage: "English",
    },
    {
      id: 2,
      word: "beta",
      meaning: "second letter",
      partOfSpeech: "noun",
      targetLanguage: "English",
    },
  ],
}))

vi.mock("../hooks/useVocabularyNotebook", () => ({
  useVocabularyNotebook: () => ({
    words: mocks.words,
    allWords: mocks.words,
    filteredWords: mocks.words,
    allWordsCount: mocks.words.length,
    searchQuery: "",
    setSearchQuery: vi.fn(),
    languageFilter: "all",
    setLanguageFilter: vi.fn(),
    scriptFilter: "all",
    setScriptFilter: vi.fn(),
    sortBy: "newest",
    setSortBy: vi.fn(),
    currentPage: 1,
    setCurrentPage: vi.fn(),
    totalPages: 1,
    availableScripts: [],
    deleteWord: vi.fn(),
    playAudio: mocks.playAudio,
    resetFilters: vi.fn(),
    isFetching: false,
  }),
}))

vi.mock("@/shared/context/LanguageContext", () => ({
  useLanguage: () => ({
    language: "vi",
    t: {
      nav: { home: "Trang chủ" },
      vocabularyNotebook: {
        title: "Sổ từ vựng",
        subtitle: "Ôn tập từ vựng",
        reviewNow: "Ôn tập ngay",
        wordCount: "{{count}} từ",
        reviewModal: {
          title: "Ôn tập từ vựng",
          subtitle: "Lật thẻ để ghi nhớ từ vựng đã lưu.",
          progress: "Thẻ {{current}}/{{total}}",
          flipHint: "Nhấn để xem nghĩa",
          flip: "Lật thẻ",
          shuffle: "Tráo thẻ",
          prev: "Thẻ trước",
          mastered: "Đã nhớ",
          reviewAgain: "Cần ôn lại",
          masteredCount: "Đã nhớ",
          reviewAgainCount: "Cần ôn lại",
          completedTitle: "Hoàn thành phiên ôn tập!",
          reviewAgainBtn: "Ôn lại từ chưa nhớ",
          restartBtn: "Ôn tập lại từ đầu",
          closeBtn: "Đóng",
        },
      },
    },
  }),
}))

vi.mock("@/shared/components/ui/navigation/Breadcrumb", () => ({
  default: () => null,
}))
vi.mock("@/shared/components/ui/PageTitle", () => ({
  default: ({ children }) => <h1>{children}</h1>,
}))
vi.mock("@/shared/components/ui/navigation/Pagination", () => ({
  default: () => null,
}))
vi.mock("../components/vocabulary-notebook/VocabularyNotebookFilters", () => ({
  VocabularyNotebookFilters: () => null,
}))
vi.mock("../components/vocabulary-notebook/VocabularyListCard", () => ({
  VocabularyListCard: () => null,
}))
vi.mock("../components/vocabulary-notebook/VocabularyGridCard", () => ({
  VocabularyGridCard: () => null,
}))
vi.mock("../components/vocabulary-notebook/VocabularyEmptyState", () => ({
  VocabularyEmptyState: () => null,
}))
vi.mock("../components/vocabulary-notebook/DeleteWordConfirmModal", () => ({
  DeleteWordConfirmModal: () => null,
}))

let root = null
let container = null

const mount = () => {
  container = document.createElement("div")
  document.body.appendChild(container)
  root = createRoot(container)
  act(() => {
    root.render(
      <MemoryRouter>
        <VocabularyNotebookPage />
      </MemoryRouter>,
    )
  })
}

const findButton = (matcher) =>
  Array.from(document.querySelectorAll("button")).find(matcher)

beforeEach(() => {
  localStorage.clear()
})

afterEach(() => {
  if (root) {
    act(() => root.unmount())
    root = null
  }
  if (container) {
    container.remove()
    container = null
  }
  document.body.innerHTML = ""
})

describe("ISS-52: vocabulary review modal", () => {
  it("no longer renders the dead 'Xem thêm 10 từ khác' button", () => {
    mount()

    expect(document.body.textContent).not.toContain("Xem thêm 10 từ khác")
  })

  it("opens the flashcard modal, flips a card and finishes the session", () => {
    mount()

    const reviewButton = findButton((button) =>
      button.textContent.includes("Ôn tập ngay"),
    )
    expect(reviewButton).toBeTruthy()

    act(() => {
      reviewButton.dispatchEvent(new MouseEvent("click", { bubbles: true }))
    })

    const flipButton = findButton((button) =>
      button.textContent.includes("Nhấn để xem nghĩa"),
    )
    expect(flipButton).toBeTruthy()

    act(() => {
      flipButton.dispatchEvent(new MouseEvent("click", { bubbles: true }))
    })

    const bodyText = document.body.textContent
    expect(
      bodyText.includes("first letter") || bodyText.includes("second letter"),
    ).toBe(true)

    for (let i = 0; i < 2; i += 1) {
      const masteredButton = findButton(
        (button) => button.textContent.trim() === "Đã nhớ",
      )
      expect(masteredButton).toBeTruthy()
      act(() => {
        masteredButton.dispatchEvent(new MouseEvent("click", { bubbles: true }))
      })
    }

    expect(document.body.textContent).toContain("Hoàn thành phiên ôn tập!")
  })
})
