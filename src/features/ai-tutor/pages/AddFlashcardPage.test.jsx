// @vitest-environment happy-dom
import React, { act } from "react"
import { createRoot } from "react-dom/client"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

const lookupCalls = []
let mockLookupResult = null
let mockLookupImpl = null
const mockLookup = vi.fn((arg) => {
  lookupCalls.push(arg)
  const res = mockLookupImpl ? mockLookupImpl(arg) : mockLookupResult
  mockLookupResult = res
  return {
    unwrap: () => Promise.resolve(res),
  }
})
const mockReset = vi.fn()
let mockAddCardImpl = null
const mockAddCard = vi.fn((...args) => {
  if (mockAddCardImpl) return mockAddCardImpl(...args)
  return {
    unwrap: () => Promise.resolve({ restored: false }),
  }
})

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

vi.mock("../components/flashcard/AudioButton", () => ({
  default: () => <button type="button">MockAudio</button>,
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
    mockLookupImpl = null
    mockAddCardImpl = null
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

  it("xoá lỗi trùng cũ khi đổi sang từ chữ Hán mới và tra lại từ mới (TC-FC-130)", async () => {
    // 1. Nhập 咖啡, submit bị lỗi FLASHCARD_CARD_EXISTS
    mockLookupResult = {
      word: "咖啡",
      pinyin: "kāfēi",
      meaning_vi: "cà phê",
      hsk_level: 3,
      in_dictionary: true,
      in_notebook: true,
    }
    mockAddCardImpl = vi.fn(() => ({
      unwrap: () => Promise.reject({ code: "FLASHCARD_CARD_EXISTS" }),
    }))

    await act(async () => {
      root.render(<AddFlashcardPage />)
    })

    const inputs = container.querySelectorAll("input")
    const wordInput = inputs[0]
    const form = container.querySelector("form")

    // Nhập '咖啡'
    await act(async () => {
      changeInput(wordInput, "咖啡")
    })
    await act(async () => {
      vi.advanceTimersByTime(400)
    })

    // Bấm 'Thêm vào sổ' (submit form)
    await act(async () => {
      form.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }))
    })

    // Hiện dòng lỗi đỏ dưới form
    expect(container.querySelector('[role="alert"]')?.textContent).toBe("Từ này đã có trong sổ của bạn.")

    // 2. Bôi đen ô Hán tự, nhập 道歉
    mockLookupResult = {
      word: "道歉",
      pinyin: "dàoqiàn",
      meaning_vi: "xin lỗi",
      hsk_level: 4,
      in_dictionary: true,
      in_notebook: false,
    }

    await act(async () => {
      changeInput(wordInput, "道歉")
    })

    // Dòng lỗi đỏ phải được xoá ngay khi đổi nội dung ô Hán tự
    expect(container.querySelector('[role="alert"]')).toBeNull()

    // Sau khi debounce chạy, từ mới được tra cứu lại
    await act(async () => {
      vi.advanceTimersByTime(400)
    })

    expect(lookupCalls).toContainEqual({ word: "道歉" })
    expect(container.querySelector('[role="alert"]')).toBeNull()
  })

  it("không hiện badge 'Đã có trong sổ' khi đã có 行 xíng nhưng nhập 行 + pinyin háng (TC-FC-130, TC-FC-010)", async () => {
    mockLookupImpl = (arg) => {
      if (arg?.pinyin === "háng") {
        return {
          word: "行",
          pinyin: "háng",
          meaning_vi: "hàng, ngành nghề",
          hsk_level: 4,
          in_dictionary: true,
          in_notebook: false,
        }
      }
      return {
        word: "行",
        pinyin: "xíng",
        meaning_vi: "đi, được, làm",
        hsk_level: 4,
        in_dictionary: true,
        in_notebook: true,
      }
    }

    await act(async () => {
      root.render(<AddFlashcardPage />)
    })

    const inputs = container.querySelectorAll("input")
    const wordInput = inputs[0]
    const pinyinInput = inputs[1]

    // 1. Nhập '行'
    await act(async () => {
      changeInput(wordInput, "行")
    })
    await act(async () => {
      vi.advanceTimersByTime(400)
    })

    // Đã có 行 xíng trong sổ -> hiện badge
    expect(container.textContent).toContain("Đã có trong sổ")
    expect(pinyinInput.value).toBe("xíng")

    // 2. Ngay khi người dùng sửa pinyin sang 'háng' (chưa hoặc đang tra cứu),
    // badge 'Đã có trong sổ' của âm xíng không được hiển thị cho âm háng
    await act(async () => {
      changeInput(pinyinInput, "háng")
    })

    expect(container.textContent).not.toContain("Đã có trong sổ")

    // Sau khi debounce chạy xong
    await act(async () => {
      vi.advanceTimersByTime(400)
    })

    expect(lookupCalls).toContainEqual({ word: "行", pinyin: "háng" })
    expect(container.textContent).not.toContain("Đã có trong sổ")
  })

  it("gõ chữ Hán '行' rồi gõ ngay pinyin 'háng' trước khi debounce chữ Hán hoàn tất vẫn không bị lỗi trùng (TC-FC-130)", async () => {
    mockLookupImpl = (arg) => {
      if (arg?.pinyin === "háng") {
        return {
          word: "行",
          pinyin: "háng",
          meaning_vi: "hàng, ngành nghề",
          hsk_level: 4,
          in_dictionary: true,
          in_notebook: false,
        }
      }
      return {
        word: "行",
        pinyin: "xíng",
        meaning_vi: "đi, được, làm",
        hsk_level: 4,
        in_dictionary: true,
        in_notebook: true,
      }
    }

    await act(async () => {
      root.render(<AddFlashcardPage />)
    })

    const inputs = container.querySelectorAll("input")
    const wordInput = inputs[0]
    const pinyinInput = inputs[1]

    // 1. Nhập '行'
    await act(async () => {
      changeInput(wordInput, "行")
    })
    // Chưa đợi debounce của chữ Hán chạy xong (chỉ 100ms)
    await act(async () => {
      vi.advanceTimersByTime(100)
    })

    // 2. Nhập ngay pinyin 'háng'
    await act(async () => {
      changeInput(pinyinInput, "háng")
    })

    // Đợi tất cả timer debounce chạy xong
    await act(async () => {
      vi.advanceTimersByTime(500)
    })

    // Kiểm tra: lookup với pinyin 'háng' PHẢI được gọi
    expect(lookupCalls).toContainEqual({ word: "行", pinyin: "háng" })
    expect(container.textContent).not.toContain("Đã có trong sổ")
  })

  it("disable nút 'Thêm vào sổ' và 'Lưu và thêm từ khác' khi từ đã có trong sổ (TC-FC-130)", async () => {
    mockLookupResult = {
      word: "咖啡",
      pinyin: "kāfēi",
      meaning_vi: "cà phê",
      hsk_level: 2,
      in_dictionary: true,
      in_notebook: true,
    }

    await act(async () => {
      root.render(<AddFlashcardPage />)
    })

    const wordInput = container.querySelectorAll("input")[0]
    const submitBtn = Array.from(container.querySelectorAll("button")).find((b) =>
      b.textContent.includes("Thêm vào sổ"),
    )
    const saveAndAddBtn = Array.from(container.querySelectorAll("button")).find((b) =>
      b.textContent.includes("Lưu và thêm từ khác"),
    )

    // Ban đầu chưa nhập từ -> form chưa submit được
    expect(submitBtn).toBeDefined()

    // 1. Nhập '咖啡' đã có trong sổ
    await act(async () => {
      changeInput(wordInput, "咖啡")
    })
    await act(async () => {
      vi.advanceTimersByTime(400)
    })

    // Hiện badge 'Đã có trong sổ'
    expect(container.textContent).toContain("Đã có trong sổ")

    // Nút "Thêm vào sổ" và "Lưu và thêm từ khác" phải bị disable
    expect(submitBtn.disabled).toBe(true)
    expect(saveAndAddBtn.disabled).toBe(true)

    // Form submit không được gọi API addCard khi đã biết trùng
    await act(async () => {
      const form = container.querySelector("form")
      form.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }))
    })
    expect(mockAddCard).not.toHaveBeenCalled()
    expect(container.querySelector('[role="alert"]')?.textContent).toBe(
      "Từ này đã có trong sổ của bạn.",
    )

    // Nút "Mở thẻ hiện có" hiển thị bên cạnh badge
    const openCardBtn = container.querySelector('[data-testid="open-existing-card-btn"]')
    expect(openCardBtn).not.toBeNull()
    expect(openCardBtn.textContent).toContain("Mở thẻ hiện có")

    // Bấm "Mở thẻ hiện có" -> mở preview modal xem chi tiết thẻ
    await act(async () => {
      openCardBtn.click()
    })
    expect(document.body.textContent).toContain("Chi tiết thẻ")
    expect(document.body.textContent).toContain("Chỉ đọc - không ảnh hưởng lịch ôn")

    // 2. Khi người dùng đổi sang từ chưa có trong sổ -> nút được enable lại
    mockLookupResult = {
      word: "你好",
      pinyin: "nǐhǎo",
      meaning_vi: "xin chào",
      hsk_level: 1,
      in_dictionary: true,
      in_notebook: false,
    }
    await act(async () => {
      changeInput(wordInput, "你好")
    })
    await act(async () => {
      vi.advanceTimersByTime(400)
    })

    expect(container.textContent).not.toContain("Đã có trong sổ")
    expect(submitBtn.disabled).toBe(false)
    expect(saveAndAddBtn.disabled).toBe(false)
  })
})
