import React from "react"
import { describe, expect, it } from "vitest"
import { renderToStaticMarkup } from "react-dom/server"
import FlashcardHeroBanner from "./FlashcardHeroBanner"

describe("TC-FC-024: FlashcardHeroBanner empty state wording and actions", () => {
  it("hiển thị đúng wording và nút khi sổ trống (totalCards = 0)", () => {
    const html = renderToStaticMarkup(
      <FlashcardHeroBanner
        totalCards={0}
        dueCount={0}
        overdueCount={0}
      />
    )

    // 1. Không hiển thị pill '0 quá hạn' khi sổ trống
    expect(html).not.toContain("0 quá hạn")

    // 2. Nút hành động phải là 'Đi luyện nói' thay vì 'Luyện nói với AI'
    expect(html).toContain("Đi luyện nói")
    expect(html).not.toContain("Luyện nói với AI")

    // 3. Wording empty state: 'Chưa có từ nào' và 'luyện nói với AI để thêm từ vào sổ'
    expect(html).toContain("Chưa có từ nào")
    expect(html).not.toContain("Chưa có từ nào trong sổ")
    expect(html).toContain("luyện nói với AI để thêm từ vào sổ")
    expect(html).not.toContain("luyện nói với AI để tạo thẻ đầu tiên")
  })

  it("vẫn hiển thị pill quá hạn khi sổ có thẻ và đã ôn xong hôm nay (isDone)", () => {
    const html = renderToStaticMarkup(
      <FlashcardHeroBanner
        totalCards={10}
        dueCount={0}
        overdueCount={0}
      />
    )

    expect(html).toContain("Đã ôn hết thẻ hôm nay")
    expect(html).toContain("0 quá hạn")
    expect(html).toContain("Ôn tập")
  })

  it("hiển thị đúng số thẻ cần ôn và số thẻ quá hạn khi có thẻ đến hạn (hasDue)", () => {
    const html = renderToStaticMarkup(
      <FlashcardHeroBanner
        totalCards={20}
        dueCount={5}
        overdueCount={2}
      />
    )

    expect(html).toContain("5 thẻ cần ôn hôm nay")
    expect(html).toContain("2 quá hạn")
    expect(html).toContain("Bắt đầu ôn")
    expect(html).toContain("Ôn tập")
  })
})
