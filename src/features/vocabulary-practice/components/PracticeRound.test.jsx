// @vitest-environment happy-dom
import React, { act } from "react"
import { createRoot } from "react-dom/client"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import PracticeRound from "./PracticeRound"

const submit = vi.fn(() => "review-id")
vi.mock("../hooks/usePracticeSync", () => ({
  default: ({ enabled }) => ({
    submit: enabled ? submit : () => null,
    schedules: { "review-id": { due_at: new Date(Date.now() + 3 * 86400000).toISOString() } },
    pendingCount: 0,
    isOnline: true,
  }),
}))
vi.mock("../hooks/useSpeak", () => ({ default: () => ({ speak: vi.fn(), status: "idle", available: true }) }))
vi.mock("@/features/ai-tutor/components/flashcard/AudioButton", () => ({ default: () => null }))

const CARDS = [
  { card_id: 1, word: "你好", pinyin: "nǐ hǎo", meaning_vi: "xin chào", example_sentence: "你好，老师。" },
  { card_id: 2, word: "谢谢", pinyin: "xièxie", meaning_vi: "cảm ơn", example_sentence: "谢谢你。" },
]

let container
let root

const render = (ui) => act(() => root.render(ui))
const type = (input, value) =>
  act(() => {
    const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set
    setter.call(input, value)
    input.dispatchEvent(new Event("input", { bubbles: true }))
  })
const key = (target, k) =>
  act(() => {
    target.dispatchEvent(new KeyboardEvent("keydown", { key: k, bubbles: true }))
  })
const button = (text) => [...container.querySelectorAll("button")].find((b) => b.textContent.includes(text))
const click = (el) => act(() => el.click())

beforeEach(() => {
  globalThis.IS_REACT_ACT_ENVIRONMENT = true
  submit.mockClear()
  container = document.createElement("div")
  document.body.appendChild(container)
  root = createRoot(container)
})

afterEach(() => {
  act(() => root.unmount())
  container.remove()
  vi.useRealTimers()
})

describe("PracticeRound (QA-S1: bốn chế độ, nhập liệu, chuyển câu)", () => {
  it("Gõ từ: nhận pinyin số, chấm, gửi nhãn FSRS kèm thời gian/gợi ý rồi sang thẻ sau", async () => {
    await render(<PracticeRound mode="word" items={CARDS} fsrsEnabled onExit={() => {}} onAgain={() => {}} />)
    expect(container.textContent).toContain("xin chào")

    const input = container.querySelector("input")
    await type(input, "ni3 hao3")
    await key(input, "Enter")

    expect(container.textContent).toContain("Chính xác")
    expect(submit).toHaveBeenCalledTimes(1)
    const sent = submit.mock.calls[0][0]
    expect(sent).toMatchObject({ cardId: 1, mode: "word", isCorrect: true, hintsUsed: 0 })
    expect([3, 4]).toContain(sent.rating)
    expect(sent.elapsedMs).toBeGreaterThanOrEqual(0)
    expect(container.textContent).toMatch(/Ôn lại sau/)

    await click(button("Tiếp tục"))
    expect(container.textContent).toContain("cảm ơn")
    expect(container.textContent).toContain("Thẻ 2/2")
  })

  it("Gõ từ: dùng gợi ý -> Hard; Enter hai lần không nhảy cóc thẻ", async () => {
    await render(<PracticeRound mode="word" items={CARDS} fsrsEnabled onExit={() => {}} onAgain={() => {}} />)
    await click(button("Gợi ý"))
    expect(container.textContent).toContain("nǐ hǎo")
    const input = container.querySelector("input")
    await type(input, "你好")
    await key(input, "Enter")
    expect(submit.mock.calls[0][0].rating).toBe(2)
    const next = button("Tiếp tục")
    await act(() => {
      next.click()
      next.click() // bấm đúp: không được bỏ qua thẻ 2
    })
    expect(container.textContent).toContain("Thẻ 2/2")
  })

  it("Nghe và điền: xem đáp án = Again; hết thẻ thì ra màn tổng kết", async () => {
    await render(<PracticeRound mode="listen" items={CARDS.slice(0, 1)} fsrsEnabled onExit={() => {}} onAgain={() => {}} />)
    expect(container.textContent).toContain("＿＿，老师。")
    await click(button("Xem đáp án"))
    expect(submit.mock.calls[0][0]).toMatchObject({ rating: 1, isCorrect: false, mode: "listen" })
    await click(button("Tiếp tục"))
    expect(container.textContent).toContain("Xong lượt ôn")
    expect(container.textContent).toContain("0/1")
  })

  it("Flashcard: Space lật, phím 1-4 chấm và tự sang thẻ", async () => {
    await render(<PracticeRound mode="flashcard" items={CARDS} fsrsEnabled onExit={() => {}} onAgain={() => {}} />)
    await key(document.body, " ")
    expect(container.textContent).toContain("xin chào")
    await key(document.body, "4")
    expect(submit.mock.calls[0][0]).toMatchObject({ cardId: 1, rating: 4, mode: "flashcard" })
    expect(container.textContent).toContain("Thẻ 2/2")
    expect(container.textContent).toMatch(/你好 ·.*Ôn lại sau/)
  })

  it("Gõ câu: gõ đúng hết thì tự chuyển, không gửi nhãn FSRS", async () => {
    vi.useFakeTimers()
    await render(<PracticeRound mode="sentence" items={CARDS} fsrsEnabled onExit={() => {}} onAgain={() => {}} />)
    const input = container.querySelector("input")
    await type(input, "你好老师")
    expect(container.textContent).toContain("Chính xác")
    await act(() => vi.advanceTimersByTime(800))
    expect(container.textContent).toContain("Thẻ 2/2")
    expect(submit).not.toHaveBeenCalled()
  })

  it("Tắt flag FSRS: vẫn ôn được, không gửi gì, báo cho học viên", async () => {
    await render(<PracticeRound mode="word" items={CARDS} fsrsEnabled={false} onExit={() => {}} onAgain={() => {}} />)
    expect(container.textContent).toContain("chưa bật")
    const input = container.querySelector("input")
    await type(input, "你好")
    await key(input, "Enter")
    expect(submit).not.toHaveBeenCalled()
  })
})
