// @vitest-environment happy-dom
import React, { act } from "react"
import { createRoot } from "react-dom/client"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

const lookupCalls = []
let mockLookupResult = null
const mockLookup = vi.fn((arg) => {
  lookupCalls.push(arg)
  return {
    unwrap: () => Promise.resolve(mockLookupResult),
  }
})
const mockReset = vi.fn()
const mockAddCard = vi.fn(() => ({
  unwrap: () => Promise.resolve({ restored: false }),
}))

vi.mock("react-router-dom", async (importOriginal) => ({
  ...(await importOriginal()),
  useNavigate: () => vi.fn(),
  useParams: () => ({ lang: "zh" }),
}))

vi.mock("@/shared/context/LanguageContext", () => ({
  useLanguage: () => ({ language: "zh" }),
}))

vi.mock("@/components/ui/toast", () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}))

vi.mock("../api/flashcardApi", () => ({
  useLazyLookupFlashcardWordQuery: () => [
    mockLookup,
    { data: mockLookupResult, isFetching: false, reset: mockReset },
  ],
  useAddFlashcardCardMutation: () => [mockAddCard, { isLoading: false }],
  useGetFlashcardFoldersQuery: () => ({ data: { items: [] } }),
}))

const changeInput = (input, val) => {
  const setNativeValue = Object.getOwnPropertyDescriptor(
    window.HTMLInputElement.prototype,
    "value",
  ).set
  setNativeValue.call(input, val)
  input.dispatchEvent(new Event("input", { bubbles: true }))
  input.dispatchEvent(new Event("change", { bubbles: true }))
}

describe("AddFlashcardPage - TC-FC-129 / TC-FC-010 lookup and pinyin meaning update", () => {
  let AddFlashcardPage
  let container
  let root

  beforeEach(async () => {
    vi.useFakeTimers()
    globalThis.IS_REACT_ACT_ENVIRONMENT = true
    lookupCalls.length = 0
    mockLookupResult = null
    const mod = await import("./AddFlashcardPage")
    AddFlashcardPage = mod.default
    container = document.createElement("div")
    document.body.appendChild(container)
    root = createRoot(container)
  })

  afterEach(() => {
    if (root) {
      act(() => {
        root.unmount()
      })
      root = null
    }
    if (container && container.parentNode) {
      container.parentNode.removeChild(container)
      container = null
    }
    vi.useRealTimers()
  })

  it("tra từ theo chữ Hán và tự điền pinyin + nghĩa chuẩn", async () => {
    mockLookupResult = {
      word: "行",
      pinyin: "xíng",
      meaning_vi: "đi, được, làm",
      hsk_level: 4,
      in_dictionary: true,
      in_notebook: false,
    }

    await act(async () => {
      root.render(<AddFlashcardPage />)
    })

    const inputs = container.querySelectorAll("input")
    const wordInput = inputs[0]
    const pinyinInput = inputs[1]
    const meaningInput = inputs[2]

    // Gõ chữ Hán '行'
    await act(async () => {
      changeInput(wordInput, "行")
    })

    // Chạy qua debounce 350ms
    await act(async () => {
      vi.advanceTimersByTime(400)
    })

    expect(lookupCalls.length).toBeGreaterThan(0)
    expect(lookupCalls[0]).toEqual({ word: "行" })
    expect(pinyinInput.value).toBe("xíng")
    expect(meaningInput.value).toBe("đi, được, làm")
  })

  it("cập nhật nghĩa chuẩn khi thay đổi Pinyin (TC-FC-129)", async () => {
    mockLookupResult = {
      word: "行",
      pinyin: "xíng",
      meaning_vi: "đi, được, làm",
      hsk_level: 4,
      in_dictionary: true,
      in_notebook: false,
    }

    await act(async () => {
      root.render(<AddFlashcardPage />)
    })

    const inputs = container.querySelectorAll("input")
    const wordInput = inputs[0]
    const pinyinInput = inputs[1]
    const meaningInput = inputs[2]

    // Gõ '行'
    await act(async () => {
      changeInput(wordInput, "行")
    })
    await act(async () => {
      vi.advanceTimersByTime(400)
    })

    expect(pinyinInput.value).toBe("xíng")
    expect(meaningInput.value).toBe("đi, được, làm")

    // Thay đổi pinyin sang 'háng' (nghĩa: 'hàng, ngành nghề')
    mockLookupResult = {
      word: "行",
      pinyin: "háng",
      meaning_vi: "hàng, ngành nghề",
      hsk_level: 4,
      in_dictionary: true,
      in_notebook: false,
    }

    await act(async () => {
      changeInput(pinyinInput, "háng")
    })

    await act(async () => {
      vi.advanceTimersByTime(400)
    })

    expect(lookupCalls).toContainEqual({ word: "行", pinyin: "háng" })
    expect(meaningInput.value).toBe("hàng, ngành nghề")
  })
})
