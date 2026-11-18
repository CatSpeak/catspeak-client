// @vitest-environment happy-dom
import React, { act } from "react"
import { createRoot } from "react-dom/client"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import FlipCardExercise from "./FlipCardExercise"

vi.mock("../AudioButton", () => ({
  default: ({ audioPath, pinyin, label }) => (
    <button type="button" aria-label={label || "Nghe phát âm"} data-testid="audio-btn">
      Nghe
    </button>
  ),
}))

describe("TC-FC-035 / FR-FC-008: FlipCardExercise keeps audio button on back side", () => {
  let container
  let root

  beforeEach(() => {
    globalThis.IS_REACT_ACT_ENVIRONMENT = true
    container = document.createElement("div")
    document.body.appendChild(container)
    root = createRoot(container)
  })

  afterEach(() => {
    act(() => {
      root.unmount()
    })
    container.remove()
    document.body.innerHTML = ""
  })

  it("mặt sau thẻ lật vẫn giữ nút Nghe phát âm theo FR-FC-008", async () => {
    const card = {
      card_id: 1,
      word: "行",
      pinyin: "háng",
      meaning_vi: "hàng, ngành nghề",
      part_of_speech_vi: "danh từ",
      card_type: "meaning",
      audio_url: "/v1/speaking/sample-audio?text=%E8%A1%8C&pinyin=h%C3%A1ng&rate=normal",
    }

    await act(async () => {
      root.render(<FlipCardExercise card={card} onResult={vi.fn()} onNext={vi.fn()} />)
    })

    // Mặt trước: có nút Nghe
    const frontAudioBtn = container.querySelector('[data-testid="audio-btn"]')
    expect(frontAudioBtn).not.toBeNull()

    // Bấm Lật thẻ
    const flipBtn = container.querySelector("button:not([data-testid])")
    expect(flipBtn.textContent).toContain("Lật thẻ")
    await act(async () => {
      flipBtn.click()
    })

    // Hiện trạng lỗi: Mặt sau thẻ 行 háng không có nút Nghe
    // Kỳ vọng: Mặt sau giữ nút Nghe (theo FR-FC-008)
    const backAudioBtn = container.querySelector('[data-testid="audio-btn"]')
    expect(backAudioBtn).not.toBeNull()
  })
})
