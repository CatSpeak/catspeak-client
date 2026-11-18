import { describe, expect, it, vi } from "vitest"
import { renderToStaticMarkup } from "react-dom/server"
import React from "react"

vi.mock("../../flashcard/AudioButton", () => ({
  default: ({ audioPath, pinyin, label }) => (
    <button type="button" aria-label={label} data-testid="audio-btn" data-path={audioPath} data-pinyin={pinyin}>
      Audio
    </button>
  ),
}))

import FlashcardCardList from "./FlashcardCardList"
import FlashcardPreviewModal from "./FlashcardPreviewModal"
import CardBack from "../../flashcard/exercises/CardBack"

describe("TC-FC-092: fc05 xem thẻ chỉ đọc và câu ví dụ", () => {
  const sampleCards = [
    {
      card_id: 101,
      word: "道歉",
      pinyin: "dàoqiàn",
      meaning_vi: "xin lỗi",
      card_type: "meaning",
      example_sentence: "我真诚地向你道歉。",
      audio_url: "/v1/speaking/sample-audio?text=%E9%81%93%E6%AD%89&pinyin=d%C3%A0oqi%C3%A0n",
      hsk_level: 4,
    },
    {
      card_id: 102,
      word: "行",
      pinyin: "xíng",
      meaning_vi: "đi; được",
      card_type: "meaning",
      example_sentence: "这样行不行？",
      audio_url: "/v1/speaking/sample-audio?text=%E8%A1%8C&pinyin=x%C3%ADng",
      hsk_level: 4,
    },
  ]

  it("cho phép bấm vào dòng thẻ (vùng chữ Hán / nghĩa) để mở xem/lật thẻ ở chế độ chỉ đọc", () => {
    // TC-FC-092: Bấm vào dòng thẻ 道歉 (vùng chữ Hán / nghĩa) -> xem thẻ ở chế độ chỉ đọc.
    const html = renderToStaticMarkup(
      <FlashcardCardList items={sampleCards} />,
    )

    // Dòng thẻ phải có trigger button với testid và nhãn accessibility
    expect(html).toContain('data-testid="card-preview-trigger-101"')
    expect(html).toContain('role="button"')
    expect(html).toContain('tabindex="0"')
    expect(html).toContain('aria-label="Xem chi tiết thẻ 道歉"')
    expect(html).toContain("cursor-pointer")
  })

  it("ở chế độ chỉ đọc vẫn xem được thẻ, lật mặt trước/sau và nghe audio", () => {
    // TC-FC-092: Ở chế độ chỉ đọc vẫn xem được thẻ: lật mặt trước/sau, nghe audio, xem câu ví dụ.
    const previewHtml = renderToStaticMarkup(
      <FlashcardPreviewModal
        card={sampleCards[0]}
        isOpen={true}
        onClose={vi.fn()}
      />,
    )

    // Mặt trước có chữ Hán, Pinyin, nhãn chỉ đọc, nút audio và nút lật thẻ
    expect(previewHtml).toContain("Chi tiết thẻ")
    expect(previewHtml).toContain("Chỉ đọc - không ảnh hưởng lịch ôn")
    expect(previewHtml).toContain("道歉")
    expect(previewHtml).toContain("dàoqiàn")
    expect(previewHtml).toContain("Lật thẻ xem mặt sau")

    // Màn preview khi hiển thị trong FlashcardCardList với previewCard
    const listHtml = renderToStaticMarkup(
      <FlashcardCardList
        items={sampleCards}
        previewCard={sampleCards[0]}
      />,
    )
    expect(listHtml).toContain("Chi tiết thẻ")
    expect(listHtml).toContain("Chỉ đọc - không ảnh hưởng lịch ôn")
    expect(listHtml).toContain("Lật thẻ xem mặt sau")
  })

  it("mặt sau của thẻ chỉ đọc hiển thị câu ví dụ với từ được highlight", () => {
    // Kiểm tra trực tiếp mặt sau (CardBack) render câu ví dụ của 道歉
    const backHtml = renderToStaticMarkup(
      <CardBack card={sampleCards[0]} />,
    )

    expect(backHtml).toContain("我真诚地向你")
    expect(backHtml).toContain('<strong class="text-[#990011] dark:text-red-400">道歉</strong>')
    expect(backHtml).toContain("。")
  })
})
