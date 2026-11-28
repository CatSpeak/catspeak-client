// @vitest-environment happy-dom
import React, { act, useEffect } from "react"
import { createRoot } from "react-dom/client"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { useVocabularyNotebook } from "./useVocabularyNotebook"

const state = {
  words: [],
}

vi.mock("@/store/api/interactiveScriptApi", () => ({
  useGetVocabulariesQuery: () => ({
    data: { items: state.words },
    isFetching: false,
    refetch: vi.fn(),
  }),
  useDeleteVocabularyMutation: () => [vi.fn()],
}))

const notebookRef = { current: null }

const captureValue = (value) => {
  notebookRef.current = value
}

const Probe = ({ onValue }) => {
  const value = useVocabularyNotebook()
  useEffect(() => {
    onValue(value)
  }, [onValue, value])
  return null
}

let root = null
let container = null

const mount = () => {
  container = document.createElement("div")
  document.body.appendChild(container)
  root = createRoot(container)
  act(() => {
    root.render(<Probe onValue={captureValue} />)
  })
}

const unmount = () => {
  if (root) {
    act(() => root.unmount())
    root = null
  }
  if (container) {
    container.remove()
    container = null
  }
}

const buildWords = () =>
  Array.from({ length: 10 }).map((_, index) => ({
    id: index + 1,
    word: `word-${index + 1}`,
    meaning: `meaning-${index + 1}`,
    createdAt: new Date(2026, 0, index + 1).toISOString(),
  }))

beforeEach(() => {
  state.words = buildWords()
  notebookRef.current = null
  unmount()
})

describe("ISS-52: useVocabularyNotebook sorting and pagination", () => {
  it("sorts by word length ascending for sortBy='length'", () => {
    state.words = [
      { id: 1, word: "cat", meaning: "mèo", createdAt: "2026-01-01" },
      { id: 2, word: "elephant", meaning: "voi", createdAt: "2026-01-02" },
      { id: 3, word: "dog", meaning: "chó", createdAt: "2026-01-03" },
    ]
    mount()

    act(() => {
      notebookRef.current.setSortBy("length")
    })

    expect(notebookRef.current.sortBy).toBe("length")
    expect(notebookRef.current.words.map((word) => word.word)).toEqual([
      "cat",
      "dog",
      "elephant",
    ])
  })

  it("resets the page to 1 when the search filter changes", () => {
    mount()

    act(() => {
      notebookRef.current.setCurrentPage(2)
    })
    expect(notebookRef.current.currentPage).toBe(2)

    act(() => {
      notebookRef.current.setSearchQuery("word-1")
    })

    expect(notebookRef.current.currentPage).toBe(1)
    expect(notebookRef.current.searchQuery).toBe("word-1")
  })

  it("exposes all words and the filtered deck for the review modal", () => {
    mount()

    expect(notebookRef.current.allWords).toHaveLength(10)
    expect(notebookRef.current.filteredWords).toHaveLength(10)
    expect(notebookRef.current.allWordsCount).toBe(10)
  })
})
